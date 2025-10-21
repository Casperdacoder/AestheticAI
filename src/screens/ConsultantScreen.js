import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Button, Card, Toast, colors } from '../components/UI';
import { auth } from '../services/firebase';
import { getCachedUserRole } from '../services/userCache';
import {
  createConsultationRequest,
  listenToConsultations,
  updateConsultationStatus,
} from '../services/consultations';
import { ensureConsultationChat } from '../services/chat';

const STATUS_TABS = ['All', 'Pending', 'Approved', 'Completed', 'Rejected'];

const STATUS_BADGES = {
  Pending: { color: '#3A7D44', backgroundColor: 'rgba(58,125,68,0.12)' },
  Approved: { color: '#1B5B5A', backgroundColor: 'rgba(27,91,90,0.12)' },
  Completed: { color: '#353535', backgroundColor: 'rgba(53,53,53,0.12)' },
  Rejected: { color: '#B9383A', backgroundColor: 'rgba(185,56,58,0.12)' },
};

export default function ConsultantScreen({ navigation }) {
  const [currentUserId, setCurrentUserId] = useState(auth.currentUser?.uid || null);
  const [isDesigner, setIsDesigner] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [requestForm, setRequestForm] = useState({ name: '', email: '', project: '', details: '' });
  const [savingRequest, setSavingRequest] = useState(false);

  useEffect(() => {
    if (typeof auth.onAuthStateChanged !== 'function') {
      return undefined;
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      const uid = user?.uid || null;
      setCurrentUserId(uid);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const resolveRole = async () => {
      try {
        if (!currentUserId) {
          if (isMounted) {
            setIsDesigner(false);
            setRoleChecked(true);
          }
          return;
        }

        const role = await getCachedUserRole(currentUserId);
        if (isMounted) {
          setIsDesigner((role || 'user') === 'designer');
          setRoleChecked(true);
        }
      } catch (error) {
        console.warn('Failed to resolve user role', error);
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
  }, [currentUserId]);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToConsultations(
      (items) => {
        setConsultations(items);
        setLoading(false);
      },
      (error) => {
        console.warn('Failed to subscribe to consultations', error);
        setConsultations([]);
        setLoading(false);
        setToast({ message: 'Unable to load consultations.', variant: 'danger' });
        setTimeout(() => setToast(null), 2400);
      }
    );

    return unsubscribe;
  }, []);

  const visibleConsultations = useMemo(() => {
    let items = consultations;
    if (!isDesigner && currentUserId) {
      items = items.filter((item) => item.userId === currentUserId || item.clientId === currentUserId);
    }
    if (activeTab !== 'All') {
      items = items.filter((item) => (item.status || 'Pending') === activeTab);
    }
    return items;
  }, [consultations, activeTab, isDesigner, currentUserId]);

  const heroSubtitle = useMemo(() => {
    if (!roleChecked) {
      return 'Checking your workspace…';
    }
    return isDesigner
      ? 'Manage consultation requests and keep clients up to date.'
      : 'Request a consultation and track the status of your project.';
  }, [isDesigner, roleChecked]);

  const handleStatusChange = async (booking, status) => {
    if (!booking?.id) {
      return;
    }
    try {
      await updateConsultationStatus(booking.id, status, {
        statusUpdatedBy: currentUserId || null,
      });
      setToast({ message: `Marked as ${status}.`, variant: 'success' });
    } catch (error) {
      console.warn('Failed to update consultation', error);
      setToast({ message: 'Unable to update status. Try again.', variant: 'danger' });
    } finally {
      setTimeout(() => setToast(null), 2200);
    }
  };

  const handleOpenChat = async (booking) => {
    if (!booking?.id) {
      return;
    }
    const consultantId = booking.consultantId || (isDesigner ? currentUserId : booking.designerId);
    const clientId = booking.userId || booking.clientId;

    if (!consultantId || !clientId) {
      setToast({ message: 'Chat is unavailable for this consultation yet.', variant: 'warning' });
      setTimeout(() => setToast(null), 2200);
      return;
    }

    try {
      const chat = await ensureConsultationChat({
        consultationId: booking.id,
        userId: clientId,
        consultantId,
        clientName: booking.clientName || booking.name || 'Client',
        consultantName: booking.consultantName || 'Consultant',
      });

      navigation.navigate('Chat', {
        chatId: chat.id,
        participantName: isDesigner ? booking.clientName || 'Client' : booking.consultantName || 'Consultant',
        consultationId: booking.id,
      });
    } catch (error) {
      console.warn('Failed to open consultation chat', error);
      setToast({ message: 'Unable to open chat right now.', variant: 'danger' });
      setTimeout(() => setToast(null), 2200);
    }
  };

  const handleSubmitRequest = async () => {
    const { name, email, project, details } = requestForm;
    if (!name.trim() || !email.trim() || !project.trim()) {
      setToast({ message: 'Fill in all required fields to submit.', variant: 'warning' });
      setTimeout(() => setToast(null), 2200);
      return;
    }

    setSavingRequest(true);
    try {
      await createConsultationRequest({
        clientName: name.trim(),
        clientEmail: email.trim(),
        project: project.trim(),
        details: details.trim(),
        userId: currentUserId || null,
        status: 'Pending',
      });
      setRequestForm({ name: '', email: '', project: '', details: '' });
      setRequestModalVisible(false);
      setToast({ message: 'Consultation requested!', variant: 'success' });
    } catch (error) {
      console.warn('Failed to create consultation request', error);
      setToast({ message: 'Unable to submit request. Try again.', variant: 'danger' });
    } finally {
      setSavingRequest(false);
      setTimeout(() => setToast(null), 2200);
    }
  };

  const renderBooking = (booking) => {
    const status = booking.status || 'Pending';
    const badgeStyles = STATUS_BADGES[status] || {
      color: colors.subtleText,
      backgroundColor: 'rgba(15,62,72,0.12)',
    };

    return (
      <Card key={booking.id} style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <View style={styles.bookingTitleBlock}>
            <Text style={styles.bookingTitle}>{booking.project || 'Untitled project'}</Text>
            <Text style={styles.bookingSubtitle}>
              {booking.clientName || booking.name || 'Client'} · {booking.clientEmail || 'No email provided'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: badgeStyles.backgroundColor }]}>
            <Text style={[styles.statusBadgeText, { color: badgeStyles.color }]}>{status}</Text>
          </View>
        </View>

        {booking.details ? <Text style={styles.bookingDetails}>{booking.details}</Text> : null}
        <Text style={styles.bookingMeta}>Submitted {formatSubmittedAt(booking.createdAt)}</Text>

        <View style={styles.bookingActions}>
          <Button title="Open Chat" variant="secondary" onPress={() => handleOpenChat(booking)} />
          {isDesigner ? (
            <View style={styles.actionRow}>
              {status !== 'Approved' ? (
                <Button title="Approve" onPress={() => handleStatusChange(booking, 'Approved')} />
              ) : null}
              {status !== 'Completed' ? (
                <Button title="Complete" variant="outline" onPress={() => handleStatusChange(booking, 'Completed')} />
              ) : null}
              {status !== 'Rejected' ? (
                <Button title="Reject" variant="ghost" onPress={() => handleStatusChange(booking, 'Rejected')} />
              ) : null}
            </View>
          ) : null}
        </View>
      </Card>
    );
  };

  return (
    <Screen inset={false} style={styles.screen}>
      {toast ? (
        <Toast visible text={toast.message} onClose={() => setToast(null)} variant={toast.variant} />
      ) : null}

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Consultations</Text>
        <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
        {!isDesigner ? (
          <Button title="Request a consultation" onPress={() => setRequestModalVisible(true)} />
        ) : null}
      </View>

      <View style={styles.tabsRow}>
        {STATUS_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabChip, activeTab === tab && styles.tabChipActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabChipText, activeTab === tab && styles.tabChipTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loaderText}>Loading consultations…</Text>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={visibleConsultations.length === 0 ? styles.emptyScroll : styles.listScroll}
        showsVerticalScrollIndicator={false}
      >
        {visibleConsultations.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={28} color={colors.mutedAlt} />
            <Text style={styles.emptyText}>No consultations in this state yet.</Text>
          </View>
        ) : (
          visibleConsultations.map(renderBooking)
        )}
      </ScrollView>

      <Modal
        visible={requestModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRequestModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request a consultation</Text>
              <TouchableOpacity onPress={() => setRequestModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <TextInput
                style={styles.modalInput}
                placeholder="Your name"
                placeholderTextColor={colors.muted}
                value={requestForm.name}
                onChangeText={(value) => setRequestForm((prev) => ({ ...prev, name: value }))}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Email address"
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={requestForm.email}
                onChangeText={(value) => setRequestForm((prev) => ({ ...prev, email: value }))}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Project title"
                placeholderTextColor={colors.muted}
                value={requestForm.project}
                onChangeText={(value) => setRequestForm((prev) => ({ ...prev, project: value }))}
              />
              <TextInput
                style={[styles.modalInput, styles.modalTextarea]}
                placeholder="Share details about the space, goals, and budget."
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={4}
                value={requestForm.details}
                onChangeText={(value) => setRequestForm((prev) => ({ ...prev, details: value }))}
              />
            </View>

            <Button
              title={savingRequest ? 'Submitting…' : 'Submit request'}
              onPress={handleSubmitRequest}
              disabled={savingRequest}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function formatSubmittedAt(timestamp) {
  if (!timestamp) {
    return 'Awaiting schedule';
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return 'Awaiting schedule';
  }
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#0F2E32',
    gap: 12,
  },
  heroTitle: {
    color: colors.primaryText,
    fontSize: 26,
    fontWeight: '700',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 14,
    lineHeight: 20,
  },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 24,
    paddingBottom: 16,
    marginTop: -12,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  tabChipActive: {
    backgroundColor: colors.primary,
  },
  tabChipText: {
    color: colors.subtleText,
    fontWeight: '600',
    fontSize: 13,
  },
  tabChipTextActive: {
    color: colors.primaryText,
  },
  loader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  loaderText: {
    color: colors.mutedAlt,
    fontSize: 13,
  },
  listScroll: {
    paddingHorizontal: 24,
    paddingBottom: 120,
    gap: 16,
  },
  emptyScroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    color: colors.mutedAlt,
    fontSize: 14,
    textAlign: 'center',
  },
  bookingCard: {
    gap: 14,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  bookingTitleBlock: {
    flex: 1,
    gap: 4,
  },
  bookingTitle: {
    color: colors.primaryText,
    fontSize: 18,
    fontWeight: '700',
  },
  bookingSubtitle: {
    color: colors.mutedAlt,
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  bookingDetails: {
    color: colors.subtleText,
    fontSize: 14,
    lineHeight: 20,
  },
  bookingMeta: {
    color: colors.mutedAlt,
    fontSize: 12,
  },
  bookingActions: {
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.solid,
    borderRadius: 24,
    padding: 24,
    gap: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: colors.subtleText,
    fontSize: 20,
    fontWeight: '700',
  },
  modalBody: {
    gap: 12,
  },
  modalInput: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.outline,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.subtleText,
    backgroundColor: colors.solid,
  },
  modalTextarea: {
    height: 120,
    textAlignVertical: 'top',
  },
});
