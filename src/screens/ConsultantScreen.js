import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, Button, Toast, colors } from '../components/UI';
import { auth } from '../services/firebase';
import { getCachedUserRole } from '../services/userCache';
import { createConsultationRequest, listenToConsultations, updateConsultationStatus } from '../services/consultations';
import { ensureConsultationChat } from '../services/chat';

const BOOKING_TABS = ['All', 'Pending', 'Approved', 'Rejected', 'Completed'];

const INITIAL_BOOKINGS = [
  {
    id: 'sample-1',
    clientName: 'Maria Santos',
    clientEmail: 'maria.santos@example.com',
    project: 'Living Room Redesign',
    details: 'Prefers light colors and a modern theme.',
    status: 'Pending',
    createdAt: new Date('2025-09-27T14:00:00Z').getTime()
  },
  {
    id: 'sample-2',
    clientName: 'Juan Dela Cruz',
    clientEmail: 'juan.delacruz@example.com',
    project: 'Minimalist Bedroom',
    details: 'Focus on storage without clutter.',
    status: 'Approved',
    createdAt: new Date('2025-09-29T10:00:00Z').getTime()
  }
];

const STATUS_BADGE_STYLE = {
  Pending: { color: '#3A7D44', backgroundColor: 'rgba(58,125,68,0.12)' },
  Approved: { color: '#1B5B5A', backgroundColor: 'rgba(27,91,90,0.12)' },
  Rejected: { color: '#B9383A', backgroundColor: 'rgba(185,56,58,0.12)' },
  Completed: { color: '#353535', backgroundColor: 'rgba(53,53,53,0.12)' }
};

const FALLBACK_TOAST_DURATION = 2600;

function formatSubmittedAt(timestamp) {
  if (!timestamp) {
    return 'Awaiting schedule';
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return 'Awaiting schedule';
  }

  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const hours = date.getHours();
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;

  return `${month} ${day}, ${year} · ${hour12}:${minutes} ${period}`;
}

function getStatusBadgeStyle(status) {
  return STATUS_BADGE_STYLE[status] || {
    color: colors.subtleText,
    backgroundColor: 'rgba(15,62,72,0.12)'
  };
}

function getClientName(booking) {
  return booking?.clientName || booking?.client || 'Client';
}

export default function ConsultantScreen({ navigation }) {
  const [isDesigner, setIsDesigner] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [toast, setToast] = useState(null);
  const [modalState, setModalState] = useState({ visible: false, action: null, booking: null, loading: false });
  const [isRequestModalVisible, setRequestModalVisible] = useState(false);
  const [consultRequest, setConsultRequest] = useState({ name: '', email: '', project: '', details: '' });
  const [savingRequest, setSavingRequest] = useState(false);
  const [loading, setLoading] = useState(false);

  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((message, variant = 'info', duration = 2200) => {
    setToast({ message, variant });
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, duration);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const applyRole = async (user) => {
      try {
        if (!user) {
          if (mounted) {
            setIsDesigner(false);
            setRoleChecked(true);
          }
          return;
        }
        const cachedRole = await getCachedUserRole(user.uid);
        if (mounted) {
          setIsDesigner((cachedRole || 'user') === 'designer');
          setRoleChecked(true);
        }
      } catch (error) {
        console.warn('Failed to resolve user role', error);
        if (mounted) {
          setIsDesigner(false);
          setRoleChecked(true);
        }
      }
    };

    if (typeof auth.onAuthStateChanged === 'function') {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        applyRole(user);
      });
      return () => {
        mounted = false;
        unsubscribe();
      };
    }

    applyRole(auth.currentUser || null);

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isDesigner) {
      setBookings([]);
      setUsingFallbackData(false);
      setLoading(false);
      return;
    }

    let fallbackInjected = false;
    let unsubscribe = () => {};
    setLoading(true);

    const injectFallback = () => {
      if (fallbackInjected) {
        return;
      }
      fallbackInjected = true;
      setUsingFallbackData(true);
      setBookings(INITIAL_BOOKINGS);
      setLoading(false);
      showToast('Showing sample consultations while offline.', 'warning', FALLBACK_TOAST_DURATION);
    };

    try {
      unsubscribe = listenToConsultations(
        (items) => {
          setBookings(items);
          setUsingFallbackData(false);
          setLoading(false);
        },
        (error) => {
          console.warn('Failed to load consultations', error);
          injectFallback();
        }
      );
    } catch (error) {
      console.warn('Failed to subscribe to consultations', error);
      injectFallback();
    }

    return () => {
      fallbackInjected = true;
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [isDesigner, showToast]);

  const filteredBookings = useMemo(() => {
    if (activeTab === 'All') {
      return bookings;
    }
    return bookings.filter((item) => item.status === activeTab);
  }, [activeTab, bookings]);

  const closeDecisionModal = () => {
    setModalState({ visible: false, action: null, booking: null, loading: false });
  };

  const closeRequestModal = () => {
    if (!savingRequest) {
      setRequestModalVisible(false);
    }
  };

  const handleDecisionPress = (action, booking) => {
    setModalState({ visible: true, action, booking, loading: false });
  };

  const handleConsultPress = () => {
    setConsultRequest({ name: '', email: '', project: '', details: '' });
    setRequestModalVisible(true);
  };

  const handleRequestChange = (field, value) => {
    setConsultRequest((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitConsultRequest = async () => {
    if (savingRequest) {
      return;
    }

    if (!consultRequest.name.trim() || !consultRequest.email.trim() || !consultRequest.project.trim()) {
      showToast('Please complete the required fields.', 'warning', 1800);
      return;
    }

    const payload = {
      clientName: consultRequest.name.trim(),
      clientEmail: consultRequest.email.trim(),
      project: consultRequest.project.trim(),
      details: consultRequest.details.trim(),
      userId: auth.currentUser?.uid || null
    };

    setSavingRequest(true);
    try {
      await createConsultationRequest(payload);
      setConsultRequest({ name: '', email: '', project: '', details: '' });
      setRequestModalVisible(false);
      showToast('Consultation request sent!', 'success');
    } catch (error) {
      console.warn('Failed to create consultation request', error);
      showToast('Could not send request. Please try again.', 'danger', 2400);
    } finally {
      setSavingRequest(false);
    }
  };

  const handleModalConfirm = async () => {
    const { booking, action } = modalState;
    if (!booking || !action) {
      closeDecisionModal();
      return;
    }

    const nextStatus = action === 'accept' ? 'Approved' : action === 'reject' ? 'Rejected' : null;
    if (!nextStatus) {
      closeDecisionModal();
      return;
    }

    const consultantId = auth.currentUser?.uid || null;
    if (!consultantId) {
      showToast('You need to be signed in to manage consultations.', 'danger', 2400);
      closeDecisionModal();
      return;
    }

    setModalState((prev) => ({ ...prev, loading: true }));

    try {
      const metadata = { statusUpdatedBy: consultantId };
      let chatId = booking.chatId || null;

      if (nextStatus === 'Approved') {
        if (!booking.userId) {
          throw new Error('Consultation request is missing the requester account.');
        }

        const chat = await ensureConsultationChat({
          consultationId: booking.id,
          userId: booking.userId,
          consultantId,
          clientName: getClientName(booking),
          consultantName: auth.currentUser?.displayName || 'Consultant'
        });

        chatId = chat.id;
        metadata.consultantId = consultantId;
        metadata.chatId = chatId;
      }

      await updateConsultationStatus(booking.id, nextStatus, metadata);

      setBookings((current) =>
        current.map((item) =>
          item.id === booking.id ? { ...item, status: nextStatus, chatId } : item
        )
      );

      showToast(
        nextStatus === 'Approved'
          ? 'Booking accepted! You can now chat with your client.'
          : 'You have rejected the booking request.',
        nextStatus === 'Approved' ? 'success' : 'danger'
      );

      closeDecisionModal();

      if (nextStatus === 'Approved' && chatId) {
        navigation.navigate('Chat', {
          chatId,
          consultationId: booking.id,
          participantName: getClientName(booking)
        });
      }
    } catch (error) {
      console.warn('Failed to update consultation status', error);
      setModalState((prev) => ({ ...prev, loading: false }));
      showToast('Failed to update the booking. Please try again.', 'danger', 2400);
    }
  };

  const handleOpenChat = (booking) => {
    if (!booking?.chatId) {
      showToast('Chat is not ready yet. Please try again shortly.', 'info', 2200);
      return;
    }

    navigation.navigate('Chat', {
      chatId: booking.chatId,
      consultationId: booking.id,
      participantName: getClientName(booking)
    });
  };

  const renderBooking = (booking) => {
    const badgeStyle = getStatusBadgeStyle(booking.status);
    const canRespond = booking.status === 'Pending';
    const details = booking.details?.trim() ? booking.details.trim() : 'No additional notes yet.';
    const timestampLabel = formatSubmittedAt(booking.createdAt);

    return (
      <Card key={booking.id} style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <View style={styles.bookingMeta}>
            <Text style={styles.bookingClient}>{getClientName(booking)}</Text>
            <Text style={styles.bookingProject}>{booking.project || 'Project details pending'}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: badgeStyle.backgroundColor }]}>
            <Text style={[styles.badgeText, { color: badgeStyle.color }]}>{booking.status || 'Pending'}</Text>
          </View>
        </View>
        <Text style={styles.bookingDetails}>{details}</Text>
        <Text style={styles.bookingTimestamp}>{timestampLabel}</Text>
        <View style={styles.actionsRow}>
          <Button
            title="Open Chat"
            variant="outline"
            onPress={() => handleOpenChat(booking)}
            style={styles.actionButton}
            disabled={!booking.chatId}
          />
          {canRespond ? (
            <>
              <Button
                title="Accept"
                onPress={() => handleDecisionPress('accept', booking)}
                style={styles.primaryAction}
              />
              <Button
                title="Reject"
                variant="outline"
                onPress={() => handleDecisionPress('reject', booking)}
                style={[styles.actionButton, styles.rejectButton]}
                textStyle={styles.rejectText}
              />
            </>
          ) : null}
        </View>
      </Card>
    );
  };

  const renderDecisionModal = (
    <Modal
      transparent
      animationType="fade"
      visible={modalState.visible}
      onRequestClose={() => {
        if (!modalState.loading) {
          closeDecisionModal();
        }
      }}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          if (!modalState.loading) {
            closeDecisionModal();
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {modalState.action === 'accept' ? 'Accept consultation' : 'Reject consultation'}
              </Text>
              <Text style={styles.modalMessage}>
                {modalState.action === 'accept'
                  ? 'Accepting will notify the client and open a chat room so you can coordinate the next steps.'
                  : 'Rejecting will let the client know you are unavailable for this request.'}
              </Text>
              <View style={styles.modalActions}>
                <Button
                  title={
                    modalState.loading
                      ? 'Processing...'
                      : modalState.action === 'accept'
                        ? 'Accept'
                        : 'Reject'
                  }
                  onPress={handleModalConfirm}
                  style={styles.modalButton}
                  variant={modalState.action === 'reject' ? 'outline' : 'primary'}
                  textStyle={modalState.action === 'reject' ? styles.rejectText : null}
                  disabled={modalState.loading}
                />
                <Button
                  title="Cancel"
                  onPress={closeDecisionModal}
                  variant="outline"
                  style={styles.modalButton}
                  disabled={modalState.loading}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderRequestModal = (
    <Modal
      transparent
      animationType="fade"
      visible={isRequestModalVisible}
      onRequestClose={closeRequestModal}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          if (!savingRequest) {
            closeRequestModal();
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Consultation Request</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Your name*</Text>
                <TextInput
                  value={consultRequest.name}
                  onChangeText={(value) => handleRequestChange('name', value)}
                  placeholder="Jane Doe"
                  placeholderTextColor={colors.mutedAlt}
                  style={styles.modalInput}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email*</Text>
                <TextInput
                  value={consultRequest.email}
                  onChangeText={(value) => handleRequestChange('email', value)}
                  placeholder="hello@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={colors.mutedAlt}
                  style={styles.modalInput}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Project focus*</Text>
                <TextInput
                  value={consultRequest.project}
                  onChangeText={(value) => handleRequestChange('project', value)}
                  placeholder="Kitchen renovation, cozy living room..."
                  placeholderTextColor={colors.mutedAlt}
                  style={styles.modalInput}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>What would you like help with?</Text>
                <TextInput
                  value={consultRequest.details}
                  onChangeText={(value) => handleRequestChange('details', value)}
                  placeholder='Share goals, constraints, vibe...'
                  placeholderTextColor={colors.mutedAlt}
                  style={[styles.modalInput, styles.modalTextarea]}
                  multiline
                />
              </View>
              <View style={styles.modalActions}>
                <Button
                  title={savingRequest ? 'Sending...' : 'Send request'}
                  onPress={handleSubmitConsultRequest}
                  style={styles.modalButton}
                  disabled={savingRequest}
                />
                <Button
                  title="Cancel"
                  onPress={closeRequestModal}
                  variant="outline"
                  style={styles.modalButton}
                  disabled={savingRequest}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  if (!roleChecked) {
    return (
      <Screen inset={false} style={styles.loadingScreen}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Preparing your workspace...</Text>
      </Screen>
    );
  }

  if (!isDesigner) {
    return (
      <Screen inset={false} style={styles.viewerScreen}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        {toast ? <Toast visible text={toast.message} onClose={() => setToast(null)} variant={toast.variant} /> : null}

        <View style={styles.viewerIntro}>
          <Text style={styles.viewerTitle}>Consult with a designer</Text>
          <Text style={styles.viewerSubtitle}>
            Share your project goals and we will connect you with a specialist who can guide you through the process.
          </Text>
        </View>

        <Card style={styles.viewerCard}>
          <View style={styles.viewerRow}>
            <View style={styles.viewerIconWrap}>
              <Ionicons name="chatbubbles-outline" size={22} color={colors.primaryText} />
            </View>
            <View style={styles.viewerCopy}>
              <Text style={styles.viewerCardTitle}>Personalised design guidance</Text>
              <Text style={styles.viewerCardSubtitle}>
                Describe your space, style, and timeline. A consultant will reach out with tailored recommendations.
              </Text>
            </View>
          </View>
          <Button title="Request a consultation" onPress={handleConsultPress} />
        </Card>

        {renderRequestModal}
      </Screen>
    );
  }

  return (
    <Screen inset={false} style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.surface} />
      {toast ? <Toast visible text={toast.message} onClose={() => setToast(null)} variant={toast.variant} /> : null}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Consultation Studio</Text>
          <Text style={styles.heroSubtitle}>
            Review incoming requests, respond to clients, and keep every project on track.
          </Text>
          {usingFallbackData ? (
            <Text style={styles.fallbackNotice}>Showing sample consultations while we reconnect.</Text>
          ) : null}

          <View style={styles.tabRow}>
            {BOOKING_TABS.map((tab) => {
              const active = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabChip, active && styles.tabChipActive]}
                  onPress={() => setActiveTab(tab)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.tabChipText, active && styles.tabChipTextActive]}>{tab}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.bookingList}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingHint}>Loading consultations...</Text>
            </View>
          ) : filteredBookings.length === 0 ? (
            <View style={styles.listEmpty}>
              <Ionicons name="calendar-outline" size={22} color={colors.mutedAlt} />
              <Text style={styles.listEmptyText}>No consultations in this state yet.</Text>
            </View>
          ) : (
            filteredBookings.map((booking) => renderBooking(booking))
          )}
        </View>
      </ScrollView>

      {renderDecisionModal}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    paddingBottom: 32
  },
  hero: {
    backgroundColor: colors.surface,
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: 12
  },
  heroTitle: {
    color: colors.primaryText,
    fontSize: 24,
    fontWeight: '700'
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    lineHeight: 20
  },
  fallbackNotice: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 12
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8
  },
  tabChip: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)'
  },
  tabChipActive: {
    backgroundColor: colors.primaryText,
    borderColor: colors.primaryText
  },
  tabChipText: {
    color: colors.primaryText,
    fontWeight: '600',
    fontSize: 13
  },
  tabChipTextActive: {
    color: colors.surface
  },
  bookingList: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 18
  },
  bookingCard: {
    gap: 16
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  bookingMeta: {
    maxWidth: '70%',
    gap: 4
  },
  bookingClient: {
    color: colors.subtleText,
    fontSize: 16,
    fontWeight: '700'
  },
  bookingProject: {
    color: colors.mutedAlt,
    fontSize: 14
  },
  badge: {
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 10
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  bookingDetails: {
    color: colors.subtleText,
    fontSize: 14,
    lineHeight: 20
  },
  bookingTimestamp: {
    color: colors.mutedAlt,
    fontSize: 12
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  actionButton: {
    flexGrow: 1,
    minWidth: 120
  },
  primaryAction: {
    flexGrow: 1,
    minWidth: 120
  },
  rejectButton: {
    borderColor: colors.danger
  },
  rejectText: {
    color: colors.danger
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12
  },
  loadingHint: {
    color: colors.mutedAlt,
    fontSize: 13
  },
  listEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12
  },
  listEmptyText: {
    color: colors.mutedAlt,
    fontSize: 14
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  modalCard: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: colors.solid,
    padding: 24,
    gap: 18
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.subtleText
  },
  modalMessage: {
    color: colors.mutedAlt,
    fontSize: 14,
    lineHeight: 20
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12
  },
  modalButton: {
    flex: 1
  },
  modalInput: {
    backgroundColor: '#F4F6F6',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.outline,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.subtleText
  },
  modalTextarea: {
    minHeight: 96,
    textAlignVertical: 'top'
  },
  inputGroup: {
    gap: 8
  },
  inputLabel: {
    color: colors.subtleText,
    fontSize: 13,
    fontWeight: '600'
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12
  },
  loadingText: {
    color: colors.mutedAlt,
    fontSize: 13
  },
  viewerScreen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    gap: 24
  },
  viewerIntro: {
    gap: 10
  },
  viewerTitle: {
    color: colors.subtleText,
    fontSize: 26,
    fontWeight: '700'
  },
  viewerSubtitle: {
    color: colors.mutedAlt,
    fontSize: 15,
    lineHeight: 22
  },
  viewerCard: {
    gap: 20
  },
  viewerRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center'
  },
  viewerIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center'
  },
  viewerCardTitle: {
    color: colors.primaryText,
    fontSize: 17,
    fontWeight: '700'
  },
  viewerCardSubtitle: {
    color: colors.primaryText,
    opacity: 0.78,
    fontSize: 14,
    lineHeight: 20
  },
  viewerCopy: {
    flex: 1,
    gap: 6
  }
});
