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
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, Button, Toast, colors } from '../components/UI';
import { auth } from '../services/firebase';
import { createConsultationRequest } from '../services/consultations';

export default function ConsultantScreen() {
  const [consultRequest, setConsultRequest] = useState({ name: '', email: '', project: '', details: '' });
  const [savingRequest, setSavingRequest] = useState(false);
  const [toast, setToast] = useState(null);
  const [isRequestModalVisible, setRequestModalVisible] = useState(false);
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((message, variant = 'info', duration = 2200) => {
    setToast({ message, variant });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, duration);
  }, []);

  const handleRequestChange = (field, value) => {
    setConsultRequest((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitConsultRequest = async () => {
    if (savingRequest) return;

    if (!consultRequest.name.trim() || !consultRequest.email.trim() || !consultRequest.project.trim()) {
      showToast('Please complete the required fields.', 'warning');
      return;
    }

    const payload = {
      clientName: consultRequest.name.trim(),
      clientEmail: consultRequest.email.trim(),
      project: consultRequest.project.trim(),
      details: consultRequest.details.trim(),
      userId: auth.currentUser?.uid || null,
      status: 'Pending',
      createdAt: Date.now()
    };

    setSavingRequest(true);
    try {
      await createConsultationRequest(payload);
      setConsultRequest({ name: '', email: '', project: '', details: '' });
      setRequestModalVisible(false);
      showToast('Consultation request sent!', 'success');
    } catch (error) {
      console.warn('Failed to create consultation request', error);
      showToast('Could not send request. Please try again.', 'danger');
    } finally {
      setSavingRequest(false);
    }
  };

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
        <Button title="Request a consultation" onPress={() => setRequestModalVisible(true)} />
      </Card>

      <Modal
        transparent
        animationType="fade"
        visible={isRequestModalVisible}
        onRequestClose={() => !savingRequest && setRequestModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => !savingRequest && setRequestModalVisible(false)}>
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
                    placeholder="Share goals, constraints, vibe..."
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
                    onPress={() => setRequestModalVisible(false)}
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  viewerScreen: { flex: 1, backgroundColor: colors.background, padding: 20 },
  viewerIntro: { marginBottom: 20 },
  viewerTitle: { fontSize: 22, fontWeight: '700', color: colors.primaryText, marginBottom: 8 },
  viewerSubtitle: { fontSize: 14, color: colors.secondaryText },
  viewerCard: { padding: 15, borderRadius: 12, marginBottom: 20 },
  viewerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  viewerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  viewerCopy: { flex: 1 },
  viewerCardTitle: { fontSize: 16, fontWeight: '600', color: colors.primaryText, marginBottom: 4 },
  viewerCardSubtitle: { fontSize: 13, color: colors.secondaryText },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '90%', backgroundColor: colors.card, borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15, color: colors.primaryText },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 12, color: colors.secondaryText, marginBottom: 4 },
  modalInput: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.primaryText,
    fontSize: 14
  },
  modalTextarea: { height: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalButton: { flex: 1, marginHorizontal: 4 }
});
