import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { useTheme } from '../../theme/ThemeContext';
import { AppIcon } from './AppIcon';
import {
  getEmergencyContacts,
  saveEmergencyContact,
  deleteEmergencyContact,
  EmergencyContact,
} from '../../services/storageService';

interface EmergencySosModalProps {
  visible: boolean;
  onDismiss: () => void;
  onOpenDisguise?: () => void;
  currentGps?: { latitude: number; longitude: number } | null;
}

export const EmergencySosModal: React.FC<EmergencySosModalProps> = ({
  visible,
  onDismiss,
  onOpenDisguise,
  currentGps,
}) => {
  const { theme } = useTheme();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);

  // Add Contact Form State
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelationship, setNewRelationship] = useState('Friend');

  // SOS Trigger State
  const [isSendingSos, setIsSendingSos] = useState(false);

  // Load contacts from on-device SQLite
  const loadContacts = useCallback(async () => {
    try {
      setIsLoadingContacts(true);
      const list = await getEmergencyContacts();
      setContacts(list || []);
    } catch {
      Alert.alert('Contacts Notice', 'Failed to read emergency contacts from SQLite.');
    } finally {
      setIsLoadingContacts(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadContacts();
      setIsAddingContact(false);
    }
  }, [visible, loadContacts]);

  // Handle adding new contact
  const handleSaveContact = async () => {
    const cleanPhone = newPhone.trim();
    const cleanName = newName.trim();

    if (!cleanName || !cleanPhone) {
      Alert.alert('Required Fields', 'Please enter both a contact name and phone number.');
      return;
    }

    try {
      await saveEmergencyContact({
        id: `contact_${Date.now()}`,
        name: cleanName,
        phone_number: cleanPhone,
        relationship: newRelationship.trim() || 'Trusted Contact',
      });
      setNewName('');
      setNewPhone('');
      setIsAddingContact(false);
      await loadContacts();
    } catch {
      Alert.alert('Save Failed', 'Could not save emergency contact to local storage.');
    }
  };

  // Handle deleting contact
  const handleDeleteContact = (contact: EmergencyContact) => {
    Alert.alert(
      'Remove Contact',
      `Remove ${contact.name} (${contact.phone_number}) from trusted emergency contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEmergencyContact(contact.id);
              await loadContacts();
            } catch {
              Alert.alert('Delete Failed', 'Could not delete contact from local storage.');
            }
          },
        },
      ]
    );
  };

  // Speed Dial Handler
  const handleDialNumber = (number: string, title: string) => {
    Alert.alert(
      `Call ${title} (${number})`,
      `This will open your phone dialer to call ${number}. ResQ never places calls silently.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Call ${number}`,
          style: 'destructive',
          onPress: () => {
            Linking.openURL(`tel:${number}`).catch(() => {
              Alert.alert('Dialer Error', `Could not open device phone dialer for ${number}.`);
            });
          },
        },
      ]
    );
  };

  // Broadcast SOS with Live GPS coordinates
  const handleBroadcastSos = async () => {
    setIsSendingSos(true);
    try {
      let lat = currentGps?.latitude;
      let lon = currentGps?.longitude;
      let accuracy: number | null = null;

      // If no GPS supplied, attempt high-accuracy GPS fix on demand
      if (!lat || !lon) {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const pos = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
            });
            lat = pos.coords.latitude;
            lon = pos.coords.longitude;
            accuracy = pos.coords.accuracy;
          }
        } catch {
          // Continue with whatever location data is available
        }
      }

      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      let locationText = '';
      if (lat && lon) {
        const accText = accuracy ? ` (±${Math.round(accuracy)}m)` : '';
        locationText = `My current live location: https://maps.google.com/?q=${lat},${lon}${accText}`;
      } else {
        locationText = `Location: GPS unavailable at time of dispatch.`;
      }

      const sosMessage = `[EMERGENCY SOS from ResQ]: I need immediate assistance.\n${locationText}\nSent at: ${timestamp}`;

      if (contacts.length === 0) {
        Alert.alert(
          'No Emergency Contacts Configured',
          `You have not added any emergency contacts yet. Would you like to call National Emergency 112 instead?`,
          [
            { text: 'Add Contact', onPress: () => setIsAddingContact(true) },
            {
              text: 'Call 112 Now',
              style: 'destructive',
              onPress: () => Linking.openURL('tel:112'),
            },
          ]
        );
        return;
      }

      // Group recipient phone numbers
      const phoneNumbers = contacts.map((c) => c.phone_number).join(Platform.OS === 'ios' ? ',' : ';');
      const smsUrl = `sms:${phoneNumbers}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(sosMessage)}`;

      const supported = await Linking.canOpenURL(smsUrl).catch(() => false);
      if (supported) {
        await Linking.openURL(smsUrl);
      } else {
        // Fallback: try opening plain sms:
        await Linking.openURL(`sms:${phoneNumbers}`).catch(() => {
          Alert.alert('SMS Dispatch Error', 'Could not open device SMS app.');
        });
      }
    } catch {
      Alert.alert('SOS Error', 'An error occurred while preparing emergency dispatch.');
    } finally {
      setIsSendingSos(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onDismiss}>
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        {/* Safety Header */}
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <View style={styles.headerTitleRow}>
            <AppIcon name="alert" size={20} color={theme.danger} />
            <View>
              <Text style={[styles.headerTitle, { color: theme.text }]}>Emergency SOS Hub</Text>
              <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Real-time dispatch & statutory helplines</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Close Emergency Hub"
          >
            <Text style={[styles.closeBtnText, { color: theme.textSecondary }]}>Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Real-time Panic SOS Card */}
          <View style={[styles.panicCard, { backgroundColor: theme.dangerLight, borderColor: theme.danger }]}>
            <View style={styles.panicBadgeRow}>
              <View style={[styles.pulseDot, { backgroundColor: theme.danger }]} />
              <Text style={[styles.panicBadgeText, { color: theme.danger }]}>EMERGENCY SMS COMPOSER</Text>
            </View>

            <Text style={[styles.panicHeading, { color: theme.text }]}>Draft Live GPS SOS to Trusted Contacts</Text>
            <Text style={[styles.panicSubtext, { color: theme.textSecondary }]}>
              Pre-fills an emergency SMS with your live Google Maps coordinates and GPS accuracy radius for all trusted contacts.
              Android and iOS security sandboxes require you to tap 'Send' in your Messages app.
            </Text>

            <TouchableOpacity
              style={[styles.panicButton, { backgroundColor: theme.danger }]}
              onPress={handleBroadcastSos}
              disabled={isSendingSos}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Open SMS composer with live coordinates for trusted contacts"
            >
              {isSendingSos ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <View style={styles.panicBtnInner}>
                  <AppIcon name="email" size={16} color="#FFFFFF" />
                  <Text style={styles.panicBtnText}>OPEN SOS IN MESSAGES APP</Text>
                </View>
              )}
            </TouchableOpacity>

            {currentGps && (
              <View style={styles.gpsIndicatorRow}>
                <Text style={[styles.gpsIndicatorText, { color: theme.textMuted }]}>
                  GPS Fix Active: {currentGps.latitude.toFixed(5)}, {currentGps.longitude.toFixed(5)}
                </Text>
              </View>
            )}
          </View>

          {/* Quick Disguise Button */}
          {onOpenDisguise && (
            <TouchableOpacity
              style={[styles.disguiseQuickBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => {
                onDismiss();
                onOpenDisguise();
              }}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Immediately hide app with calculator disguise"
            >
              <AppIcon name="lock" size={18} color={theme.text} />
              <View style={styles.disguiseQuickTextWrap}>
                <Text style={[styles.disguiseQuickTitle, { color: theme.text }]}>Disguise as Calculator</Text>
                <Text style={[styles.disguiseQuickSubtitle, { color: theme.textSecondary }]}>
                  Instant stealth screen disguise if you feel watched
                </Text>
              </View>
              <Text style={[styles.disguiseQuickArrow, { color: theme.textMuted }]}>→</Text>
            </TouchableOpacity>
          )}

          {/* Speed Dial Helplines */}
          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>India Statutory Helplines (Direct Speed Dial)</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Official government 24x7 emergency response services
            </Text>

            <View style={styles.helplineGrid}>
              <TouchableOpacity
                style={[styles.helplineBtn, styles.helpline112]}
                onPress={() => handleDialNumber('112', 'National Emergency')}
                activeOpacity={0.8}
              >
                <View style={styles.helplineTop}>
                  <Text style={styles.helplineNumber}>112</Text>
                  <Text style={styles.helplineBadge}>NATIONAL</Text>
                </View>
                <Text style={styles.helplineLabel}>Emergency Response (Police/Ambulance/Fire)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.helplineBtn, styles.helpline1091]}
                onPress={() => handleDialNumber('1091', 'Women Helpline')}
                activeOpacity={0.8}
              >
                <View style={styles.helplineTop}>
                  <Text style={styles.helplineNumber}>1091</Text>
                  <Text style={styles.helplineBadge}>POLICE</Text>
                </View>
                <Text style={styles.helplineLabel}>Women Helpline (24x7 Police Rapid Transit)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.helplineBtn, styles.helpline181]}
                onPress={() => handleDialNumber('181', 'Women in Distress')}
                activeOpacity={0.8}
              >
                <View style={styles.helplineTop}>
                  <Text style={styles.helplineNumber}>181</Text>
                  <Text style={styles.helplineBadge}>WCD</Text>
                </View>
                <Text style={styles.helplineLabel}>Women in Distress (One Stop Crisis Support)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.helplineBtn, styles.helpline1090]}
                onPress={() => handleDialNumber('1090', 'Women Power Line')}
                activeOpacity={0.8}
              >
                <View style={styles.helplineTop}>
                  <Text style={styles.helplineNumber}>1090</Text>
                  <Text style={styles.helplineBadge}>ANTI-STALK</Text>
                </View>
                <Text style={styles.helplineLabel}>Women Power Line (Cyberstalking & Harassment)</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Trusted Contacts Section */}
          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.contactsHeaderRow}>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Trusted Emergency Contacts</Text>
                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                  {contacts.length} contact{contacts.length === 1 ? '' : 's'} saved on-device
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.addContactBtn, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}
                onPress={() => setIsAddingContact(!isAddingContact)}
                activeOpacity={0.8}
              >
                <Text style={[styles.addContactBtnText, { color: theme.primary }]}>
                  {isAddingContact ? 'Cancel' : '+ Add Contact'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Add Contact Form */}
            {isAddingContact && (
              <View style={[styles.addForm, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.formHeading, { color: theme.text }]}>Add New Trusted Contact</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                  placeholder="Full Name (e.g. Amma, Sister, Roommate)"
                  placeholderTextColor={theme.textMuted}
                  value={newName}
                  onChangeText={setNewName}
                />
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                  placeholder="Phone Number (e.g. +91 98765 43210)"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="phone-pad"
                  value={newPhone}
                  onChangeText={setNewPhone}
                />
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                  placeholder="Relationship (e.g. Mother, Sister, Friend, Security)"
                  placeholderTextColor={theme.textMuted}
                  value={newRelationship}
                  onChangeText={setNewRelationship}
                />
                <TouchableOpacity
                  style={[styles.saveContactBtn, { backgroundColor: theme.primary }]}
                  onPress={handleSaveContact}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.saveContactBtnText, { color: '#FFFFFF' }]}>Save to Device Vault</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Contacts List */}
            {isLoadingContacts ? (
              <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 16 }} />
            ) : contacts.length === 0 ? (
              <View style={styles.emptyContacts}>
                <AppIcon name="shield" size={24} color={theme.textMuted} />
                <Text style={[styles.emptyContactsText, { color: theme.text }]}>No Emergency Contacts Added</Text>
                <Text style={[styles.emptyContactsSubtext, { color: theme.textSecondary }]}>
                  Add family members, roommates, or trusted friends so you can broadcast your live GPS in 1 tap during emergencies.
                </Text>
              </View>
            ) : (
              <View style={styles.contactsList}>
                {contacts.map((c) => (
                  <View key={c.id} style={[styles.contactItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.contactInfo}>
                      <Text style={[styles.contactName, { color: theme.text }]}>{c.name}</Text>
                      <Text style={[styles.contactPhone, { color: theme.textSecondary }]}>{c.phone_number}</Text>
                      <View style={[styles.contactRelBadge, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.contactRelText, { color: theme.primary }]}>{c.relationship}</Text>
                      </View>
                    </View>

                    <View style={styles.contactActions}>
                      <TouchableOpacity
                        style={[styles.contactCallBtn, { backgroundColor: theme.primary }]}
                        onPress={() => Linking.openURL(`tel:${c.phone_number}`)}
                        accessibilityLabel={`Call ${c.name}`}
                      >
                        <AppIcon name="phone" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.contactDeleteBtn, { backgroundColor: theme.dangerLight }]}
                        onPress={() => handleDeleteContact(c)}
                        accessibilityLabel={`Delete ${c.name}`}
                      >
                        <AppIcon name="trash" size={14} color={theme.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0B1120',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  panicCard: {
    backgroundColor: 'rgba(225, 29, 72, 0.12)',
    borderWidth: 1.5,
    borderColor: '#E11D48',
    borderRadius: 16,
    padding: 18,
    gap: 10,
  },
  panicBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E11D48',
  },
  panicBadgeText: {
    color: '#FDA4AF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  panicHeading: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },
  panicSubtext: {
    color: '#FECDD3',
    fontSize: 12,
    lineHeight: 18,
  },
  panicButton: {
    backgroundColor: '#E11D48',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#E11D48',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  panicBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  panicBtnIcon: {
    fontSize: 16,
  },
  panicBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  gpsIndicatorRow: {
    marginTop: 4,
    alignItems: 'center',
  },
  gpsIndicatorText: {
    color: '#94A3B8',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  disguiseQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  disguiseQuickIcon: {
    fontSize: 22,
  },
  disguiseQuickTextWrap: {
    flex: 1,
  },
  disguiseQuickTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  disguiseQuickSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  disguiseQuickArrow: {
    color: '#64748B',
    fontSize: 16,
  },
  sectionCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  helplineGrid: {
    gap: 10,
  },
  helplineBtn: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  helpline112: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  helpline1091: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  helpline181: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  helpline1090: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  helplineTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  helplineNumber: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  helplineBadge: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  helplineLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  contactsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addContactBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  addContactBtnText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  addForm: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  formHeading: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#F8FAFC',
    fontSize: 13,
  },
  saveContactBtn: {
    backgroundColor: '#38BDF8',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  saveContactBtnText: {
    color: '#090D16',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyContacts: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    gap: 6,
  },
  emptyContactsIcon: {
    fontSize: 28,
  },
  emptyContactsText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContactsSubtext: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  contactsList: {
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  contactInfo: {
    flex: 1,
    gap: 2,
  },
  contactName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  contactPhone: {
    color: '#38BDF8',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  contactRelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  contactRelText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '600',
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactCallBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  contactCallIcon: {
    fontSize: 14,
  },
  contactDeleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  contactDeleteIcon: {
    fontSize: 14,
  },
});

