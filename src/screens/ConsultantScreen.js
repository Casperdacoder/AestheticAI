import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { Screen, Toast, Button, colors, Card } from '../components/UI';
import { Ionicons } from '@expo/vector-icons';

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
    details: 'Prefers light colors and modern theme.',
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

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatSubmittedAt(timestamp) {
  if (!timestamp) {
    return 'Awaiting schedule';
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return 'Awaiting schedule';
  }

  const month = MONTH_LABELS[date.getMonth()] || '';
  const day = date.getDate();
  const year = date.getFullYear();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const hours = date.getHours();
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;

  return `${month} ${day}, ${year} - ${hour12}:${minutes} ${period}`;
}


export default function ConsultantScreen({ navigation }) {
  const [isDesigner, setIsDesigner] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const resolveRole = async () => {
      try {
        const uid = auth.currentUser?.uid;
        const cachedRole = uid ? await getCachedUserRole(uid) : null;
        if (isMounted) {
          setIsDesigner((cachedRole || 'user') === 'designer');
          setRoleChecked(true);
        }
      } catch (error) {
        if (isMounted) {
          setIsDesigner(false);
          setRoleChecked(true);
        }
      }
    };
    resolveRole();
    return () => {
      isMounted = false;
    };
  }, []);

  const [bookings, setBookings] = useState([]);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const [isRequestModalVisible, setRequestModalVisible] = useState(false);
  const [consultRequest, setConsultRequest] = useState({ name: '', email: '', project: '', details: '' });
  const [activeTab, setActiveTab] = useState('All');
  const [toast, setToast] = useState(null);
  const [requestToast, setRequestToast] = useState(null);
  const [savingRequest, setSavingRequest] = useState(false);
  const [modalState, setModalState] = useState({ visible: false, action: null, booking: null, loading: false });

  useEffect(() => {
    if (!isDesigner) {
      setBookings([]);
      setUsingFallbackData(false);
      return;
    }

    let fallbackInjected = false;
    let unsubscribe = () => {};

    try {
      unsubscribe = listenToConsultations(
        (items) => {
          setUsingFallbackData(false);
          setBookings(items);
        },
        (error) => {
          console.warn('Failed to load consultations', error);
          if (fallbackInjected) {
            return;
          }
          fallbackInjected = true;
          setUsingFallbackData(true);
          setBookings(INITIAL_BOOKINGS);
          setToast({ message: 'Showing sample consultations while offline.', variant: 'warning' });
          setTimeout(() => setToast(null), 2600);
        }
      );
    } catch (error) {
      console.warn('Failed to subscribe to consultations', error);
      fallbackInjected = true;
      setUsingFallbackData(true);
      setBookings(INITIAL_BOOKINGS);
      setToast({ message: 'Showing sample consultations while offline.', variant: 'warning' });
      setTimeout(() => setToast(null), 2600);
    }

    return () => {
      fallbackInjected = true;
      unsubscribe();
    };
  }, [isDesigner]);

  const filteredBookings = useMemo(() => {
    if (activeTab === 'All') return bookings;
    return bookings.filter((item) => item.status === activeTab);
  }, [bookings, activeTab]);

  const isModalUpdating = modalState.loading;

  const openModal = (action, booking) => setModalState({ visible: true, action, booking, loading: false });
  const closeModal = () => setModalState({ visible: false, action: null, booking: null, loading: false });

  const updateBookingStatus = (id, status, extra = {}) => {
    setBookings((current) =>
      current.map((booking) => (booking.id === id ? { ...booking, status, ...extra } : booking))
    );
  };

  const handleConsultPress = () => {
    setConsultRequest({ name: '', email: '', project: '', details: '' });
    setRequestToast(null);
    setRequestModalVisible(true);
  };

  const handleRequestChange = (field, value) => {
    setConsultRequest((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitConsultRequest = async () => {
    if (!consultRequest.name || !consultRequest.email || !consultRequest.project) {
      setRequestToast({ message: 'Please complete the required fields.', variant: 'warning' });
      setTimeout(() => setRequestToast(null), 1800);
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
      setRequestToast(null);
      setToast({ message: 'Consultation request sent!', variant: 'success' });
      setTimeout(() => setToast(null), 2200);
    } catch (error) {
      console.warn('Failed to create consultation request', error);
      setRequestToast({ message: 'Could not send request. Please try again.', variant: 'danger' });
      setTimeout(() => setRequestToast(null), 2400);
    } finally {
      setSavingRequest(false);
    }
  };

  const handleModalConfirm = async () => {
    const { booking, action } = modalState;
    if (!booking || !action) {
      return;
    }

    const nextStatus = action === 'accept' ? 'Approved' : action === 'reject' ? 'Rejected' : null;
    if (!nextStatus) {
      closeModal();
      return;
    }

    const consultantId = auth.currentUser?.uid || null;
    if (!consultantId) {
      setToast({ message: 'You need to be signed in to manage consultations.', variant: 'danger' });
      setTimeout(() => setToast(null), 2400);
      closeModal();
      return;
    }

    const clientName = booking.clientName || booking.client || 'Client';

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
          clientName,
          consultantName: auth.currentUser?.displayName || 'Consultant'
        });

        chatId = chat.id;
        metadata.consultantId = consultantId;
        metadata.chatId = chatId;
      }

      await updateConsultationStatus(booking.id, nextStatus, metadata);

      const statePatch = chatId ? { chatId } : {};
      updateBookingStatus(booking.id, nextStatus, statePatch);

      const toastConfig =
        nextStatus === 'Approved'
          ? { message: 'Booking accepted! You can now chat with your client.', variant: 'success' }
          : { message: 'You have successfully rejected the booking request.', variant: 'danger' };
      setToast(toastConfig);
      closeModal();
      setTimeout(() => setToast(null), 2200);

      if (nextStatus === 'Approved' && chatId) {
        navigation.navigate('Chat', {
          chatId,
          consultationId: booking.id,
          participantName: clientName
        });
      }
    } catch (error) {
      console.warn('Failed to update consultation status', error);
      setModalState((prev) => ({ ...prev, loading: false }));
      const message =
        nextStatus === 'Approved'
          ? 'Failed to accept booking. Please try again.'
          : 'Failed to update booking. Please try again.';
      setToast({ message, variant: 'danger' });
      setTimeout(() => setToast(null), 2400);
    }
  };

  

  const consultRequestModal = (
    <Modal transparent visible={isRequestModalVisible} animationType="fade" onRequestClose={() => { if (!savingRequest) { setRequestModalVisible(false); } }}>
      <TouchableWithoutFeedback onPress={savingRequest ? undefined : () => setRequestModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.modalCard, styles.requestCard]}>
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
                  placeholder="Share goals, constraints, vibe..."
                  placeholderTextColor={colors.mutedAlt}
                  style={[styles.modalInput, styles.modalTextarea]}
                  multiline
                />
              </View>
              <View style={styles.modalActions}>
                  <Button
                    title={isModalUpdating ? 'Updating...' : modalState.action === 'accept' ? 'Accept' : 'Reject'}
                    onPress={handleModalConfirm}
                    variant={modalState.action === 'accept' ? 'primary' : 'outline'}
                    style={modalState.action === 'accept' ? null : styles.rejectButton}
                    textStyle={modalState.action === 'accept' ? null : styles.rejectText}
                    disabled={isModalUpdating}
                  />
                  <Button title="Cancel" onPress={closeModal} variant="outline" disabled={isModalUpdating} />
                </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const handleOpenChat = (booking) => {
    if (!booking?.chatId) {
      setToast({ message: 'Chat is not ready yet. Please try again in a moment.', variant: 'info' });
      setTimeout(() => setToast(null), 1800);
      return;
    }

    const name = booking.clientName || booking.client || 'Client';
    navigation.navigate('Chat', {
      chatId: booking.chatId,
      consultationId: booking.id,
      participantName: name
    });
  };

  if (!isDesigner) {
    return (
      <Screen inset={false} style={styles.viewerScreen}>
        {toast ? (
          <Toast visible text={toast.message} onClose={() => setToast(null)} variant={toast.variant} />
        ) : null}
        {requestToast ? (
          <Toast visible text={requestToast.message} onClose={() => setRequestToast(null)} variant={requestToast.variant} />
        ) : null}

        <View style={styles.viewerIntro}>
          <Text style={styles.viewerTitle}>Consult with a designer</Text>
          <Text style={styles.viewerSubtitle}>Share your project goals and we will connect you with a specialist.</Text>
        </View>

        <Card style={styles.viewerCard}>
          <View style={styles.viewerRow}>
            <View style={styles.viewerIconWrap}>
              <Ionicons name="chatbubbles-outline" size={22} color={colors.primaryText} />
            </View>
            <View style={styles.viewerCopy}>
              <Text style={styles.viewerCardTitle}>Personalised design guidance</Text>
              <Text style={styles.viewerCardSubtitle}>Describe your space, style, and timeline. A consultant will reach out with tailored recommendations.</Text>
            </View>
          </View>
          <Button title="Request a consultation" onPress={handleConsultPress} />
        </Card>

        {consultRequestModal}
      </Screen>
    );
  }
  return (
    <Screen inset={false} style={styles.screen}>
      {toast ? (
        <Toast visible text={toast.message} onClose={() => setToast(null)} variant={toast.variant} />
      ) : null}
      {requestToast ? (
        <Toast visible text={requestToast.message} onClose={() => setRequestToast(null)} variant={requestToast.variant} />
      ) : null}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroWelcome}>Welcome Username!</Text>
              <Text style={styles.heroStatus}>Verified</Text>
            </View>
            <View style={styles.heroIconWrap}>
              <Ionicons name="notifications-outline" size={22} color={colors.primaryText} />
            </View>
          </View>
          <View style={styles.heroActions}>
            <Button
              title="Manage Schedule"
              variant="outline"
              style={styles.heroButton}
              textStyle={styles.heroButtonText}
              onPress={() => {
                setToast({ message: 'Navigate to schedule planner...', variant: 'info' });
                setTimeout(() => setToast(null), 1600);
              }}
            />
            <Button
              title="Request Consultation"
              style={styles.heroButton}
              textStyle={styles.heroButtonText}
              onPress={handleConsultPress}
            />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Bookings</Text>
          <View style={styles.tabRow}>
            {BOOKING_TABS.map((tab) => {
              const selected = tab === activeTab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabChip, selected && styles.tabChipActive]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, selected && styles.tabTextActive]}>{tab}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {usingFallbackData ? (
          <Text style={styles.fallbackNotice}>Showing sample consultations while we reconnect.</Text>
        ) : null}

        <View style={styles.bookingList}>

          {filteredBookings.length === 0 ? (
            <Text style={styles.emptyState}>No bookings yet under "{activeTab}".</Text>
          ) : (
            filteredBookings.map((booking) => {
              const badgeTheme = STATUS_BADGE_STYLE[booking.status] || STATUS_BADGE_STYLE.Pending;
              const clientName = booking.clientName || booking.client || 'Client request';
              const projectName = booking.project || 'Project to be defined';
              const submittedText = booking.createdAt
                ? 'Submitted ' + formatSubmittedAt(booking.createdAt)
                : 'Awaiting schedule';
              const contactEmail = booking.clientEmail || booking.email || null;
              const requestDetails = booking.details || booking.notes || '';
              const showPendingActions = booking.status === 'Pending';
              const showChatAction = booking.status === 'Approved' || booking.status === 'Completed';
              const chatReady = Boolean(booking.chatId);
              const chatButtonTitle = chatReady ? 'Open chat' : 'Preparing chat...';

              return (
                <Card key={booking.id} style={styles.bookingCard}>
                  <View style={styles.bookingRow}>
                    <Ionicons name="person-circle-outline" size={48} color={colors.primary} />
                    <View style={styles.bookingDetails}>
                      <Text style={styles.bookingClient}>{clientName}</Text>
                      <Text style={styles.bookingMeta}>{projectName}</Text>
                      <Text style={styles.bookingMeta}>{submittedText}</Text>
                      {contactEmail ? <Text style={styles.bookingMeta}>{contactEmail}</Text> : null}
                      {requestDetails ? <Text style={styles.bookingNotes}>{requestDetails}</Text> : null}
                    </View>
                    <View style={[styles.badge, badgeTheme]}>
                      <Text style={styles.badgeText}>{booking.status}</Text>
                    </View>
                  </View>
                  {showPendingActions || showChatAction ? (
                    <View style={styles.bookingActions}>
                      {showPendingActions ? (
                        <>
                          <Button
                            title="Reject"
                            variant="outline"
                            style={[styles.actionButton, styles.rejectButton]}
                            textStyle={styles.rejectText}
                            onPress={() => openModal('reject', booking)}
                          />
                          <Button
                            title="Accept"
                            style={styles.actionButton}
                            onPress={() => openModal('accept', booking)}
                          />
                        </>
                      ) : null}
                      {showChatAction ? (
                        <Button
                          title={chatButtonTitle}
                          style={styles.actionButton}
                          onPress={() => handleOpenChat(booking)}
                          disabled={!chatReady}
                          variant={chatReady ? 'primary' : 'outline'}
                        />
                      ) : null}
                    </View>
                  ) : null}
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal transparent visible={modalState.visible} animationType="fade" onRequestClose={() => { if (!isModalUpdating) { closeModal(); } }}>
        <TouchableWithoutFeedback onPress={isModalUpdating ? undefined : closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <Ionicons name="close" size={22} color={colors.subtleText} style={styles.modalClose} onPress={isModalUpdating ? undefined : closeModal} />
                <Text style={styles.modalTitle}>
                  {modalState.action === 'accept'
                    ? 'Are you sure you want to accept this booking?'
                    : 'Are you sure you want to reject this booking?'}
                </Text>
                <View style={styles.modalActions}>
                  <Button
                    title={isModalUpdating ? 'Updating...' : modalState.action === 'accept' ? 'Accept' : 'Reject'}
                    onPress={handleModalConfirm}
                    variant={modalState.action === 'accept' ? 'primary' : 'outline'}
                    style={modalState.action === 'accept' ? null : styles.rejectButton}
                    textStyle={modalState.action === 'accept' ? null : styles.rejectText}
                    disabled={isModalUpdating}
                  />
                  <Button
                    title="Cancel"
                    onPress={closeModal}
                    variant="outline"
                    disabled={isModalUpdating}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {consultRequestModal}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 24,
    paddingTop: 56
  },
  scroll: {
    paddingBottom: 140
  },
  viewerScreen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 48,
    gap: 24
  },
  viewerIntro: {
    gap: 6
  },
  viewerTitle: {
    color: colors.primaryText,
    fontSize: 24,
    fontWeight: '700'
  },
  viewerSubtitle: {
    color: colors.mutedAlt,
    lineHeight: 20,
    fontSize: 14
  },
  viewerCard: {
    gap: 18,
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.outline
  },
  viewerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 18
  },
  viewerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center'
  },
  viewerCopy: {
    flex: 1,
    gap: 6
  },
  viewerCardTitle: {
    color: colors.primaryText,
    fontWeight: '700',
    fontSize: 16
  },
  viewerCardSubtitle: {
    color: colors.subtleText,
    lineHeight: 20
  },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 24,
    gap: 18
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  heroWelcome: {
    color: colors.primaryText,
    fontSize: 22,
    fontWeight: '700'
  },
  heroStatus: {
    color: '#7CE577',
    marginTop: 6,
    fontWeight: '600'
  },
  heroIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  lockedScreen: {
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32
  },
  lockedCard: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 28,
    gap: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outline
  },
  lockedIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center'
  },
  lockedTitle: {
    color: colors.primaryText,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center'
  },
  lockedMessage: {
    color: colors.mutedAlt,
    textAlign: 'center',
    lineHeight: 20
  },
  heroActions: {
    flexDirection: 'row',
    gap: 12
  },
  heroButton: {
    flex: 1,
    borderColor: colors.primaryText
  },
  heroButtonText: {
    color: colors.primaryText
  },
  sectionHeader: {
    marginTop: 28,
    gap: 12
  },
  sectionTitle: {
    color: colors.subtleText,
    fontWeight: '700',
    fontSize: 18
  },
  fallbackNotice: {
    color: colors.mutedAlt,
    fontSize: 12,
    marginTop: 8,
    marginBottom: 8
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.outline
  },
  tabChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  tabText: {
    color: colors.subtleText,
    fontWeight: '600'
  },
  tabTextActive: {
    color: colors.primaryText
  },
  bookingList: {
    marginTop: 20,
    gap: 18
  },
  bookingCard: {
    gap: 18
  },
  bookingRow: {
    flexDirection: 'row',
    gap: 16
  },
  bookingActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16
  },
  actionButton: {
    flex: 1,
    minWidth: 140
  },
  bookingDetails: {
    flex: 1,
    gap: 4
  },
  bookingClient: {
    color: colors.primaryText,
    fontWeight: '700',
    fontSize: 16
  },
  bookingMeta: {
    color: colors.subtleText,
    fontSize: 14
  },
  bookingNotes: {
    color: colors.subtleText,
    fontSize: 13,
    marginTop: 4
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700'
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12
  },
  actionButton: {
    flex: 1
  },
  rejectButton: {
    borderColor: colors.danger
  },
  rejectText: {
    color: colors.danger
  },
  emptyState: {
    color: colors.mutedAlt,
    textAlign: 'center',
    paddingVertical: 24
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalCard: {
    width: '82%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    gap: 18,
    borderWidth: 1,
    borderColor: colors.outline
  },
  requestCard: {
    width: '88%',
    paddingBottom: 32
  },
  inputGroup: {
    gap: 8
  },
  inputLabel: {
    color: colors.subtleText,
    fontWeight: '600'
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.primaryText,
    backgroundColor: colors.surfaceAlt
  },
  modalTextarea: {
    minHeight: 96,
    textAlignVertical: 'top'
  },
  modalClose: {
    alignSelf: 'flex-end'
  },
  modalTitle: {
    color: colors.subtleText,
    fontSize: 16,
    fontWeight: '700'
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12
  }
});
































































