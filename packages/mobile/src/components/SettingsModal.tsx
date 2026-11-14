import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
  TextInput,
  Platform,
} from 'react-native';
import {
  hardWipeAllData,
  getSecuritySetting,
  setSecuritySetting,
} from '../services/storageService';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onDataWiped?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onDataWiped,
}) => {
  const [stealthPin, setStealthPinState] = useState('112=');
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');

  useEffect(() => {
    if (visible) {
      getSecuritySetting('stealth_pin', '112=').then((pin) => {
        setStealthPinState(pin || '112=');
      });
      setIsEditingPin(false);
    }
  }, [visible]);

  const handleSaveStealthPin = async () => {
    const trimmed = newPinInput.trim();
    if (!trimmed || trimmed.length < 2) {
      Alert.alert('Invalid PIN', 'Please enter at least 2 digits/characters for your stealth unlock sequence.');
      return;
    }
    const finalPin = trimmed.endsWith('=') ? trimmed : `${trimmed}=`;
    try {
      await setSecuritySetting('stealth_pin', finalPin);
      setStealthPinState(finalPin);
      setIsEditingPin(false);
      setNewPinInput('');
      Alert.alert('Stealth PIN Updated', `Enter "${finalPin}" in calculator to unlock.`);
    } catch {
      Alert.alert('Error', 'Could not save stealth PIN setting.');
    }
  };

  const handleHardWipe = () => {
    Alert.alert(
      'Permanent 1-Tap Hard Wipe',
      'Are you sure you want to delete all saved corridors, search history, emergency contacts, contemporaneous incident records, and grievance cases? This permanently resets your on-device SQLite database and runs VACUUM.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Permanently Wipe All Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await hardWipeAllData();
              Alert.alert('Data Wiped', 'All on-device data has been securely purged.');
              if (onDataWiped) onDataWiped();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to wipe local storage.');
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>⚙️ Settings & Privacy</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* Privacy & Zero Telemetry Notice */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛡️ Privacy Model</Text>
            <Text style={styles.bodyText}>
              This application has zero advertising trackers, zero user identification SDKs, and zero telemetry analytics.
              All journey records and favorites remain exclusively inside your device's local SQLite database.
            </Text>
          </View>

          {/* Data Flow Inventory */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌐 Data Flow Inventory</Text>
            <Text style={styles.inventoryIntro}>
              When you perform actions, specific minimal queries leave your device:
            </Text>

            <View style={styles.inventoryItem}>
              <Text style={styles.itemTitle}>1. Walking Route Calculations</Text>
              <Text style={styles.itemRecipient}>Recipient: routing.openstreetmap.de (OSRM Foot)</Text>
              <Text style={styles.itemData}>Data sent: Origin and destination coordinates.</Text>
            </View>

            <View style={styles.inventoryItem}>
              <Text style={styles.itemTitle}>2. Destination Search & Geocoding</Text>
              <Text style={styles.itemRecipient}>Recipient: photon.komoot.io (Photon) / vyshuuu Gateway</Text>
              <Text style={styles.itemData}>Data sent: Text search query with geographic focus; fair-use typeahead API.</Text>
            </View>

            <View style={styles.inventoryItem}>
              <Text style={styles.itemTitle}>3. Route Amenity Corridor Queries</Text>
              <Text style={styles.itemRecipient}>Recipient: overpass-api.de (OSM Overpass)</Text>
              <Text style={styles.itemData}>Data sent: Bounding box enclosing the route polyline.</Text>
            </View>

            <View style={styles.inventoryItem}>
              <Text style={styles.itemTitle}>4. Street-level Imagery Queries</Text>
              <Text style={styles.itemRecipient}>Recipient: api.panoramax.xyz / panoramax.ign.fr</Text>
              <Text style={styles.itemData}>Data sent: Bounding box for STAC photo metadata.</Text>
            </View>
          </View>

          {/* Security & Stealth Disguise Controls */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔒 Stealth & Disguise Security</Text>
            <Text style={styles.bodyText}>
              When you activate Quick Disguise, vyshuuu displays an authentic calculator. Only entering your secret sequence unlocks the app.
            </Text>

            <View style={styles.pinConfigRow}>
              <View>
                <Text style={styles.pinConfigLabel}>Current Unlock Sequence:</Text>
                <Text style={styles.pinConfigValue}>{stealthPin}</Text>
              </View>

              <TouchableOpacity
                style={styles.changePinBtn}
                onPress={() => {
                  setNewPinInput(stealthPin.replace('=', ''));
                  setIsEditingPin(!isEditingPin);
                }}
              >
                <Text style={styles.changePinBtnText}>
                  {isEditingPin ? 'Cancel' : 'Change PIN'}
                </Text>
              </TouchableOpacity>
            </View>

            {isEditingPin && (
              <View style={styles.pinEditBox}>
                <Text style={styles.pinEditHelp}>
                  Enter new sequence (e.g. 112, 2026, 789). Tapping '=' after these digits unlocks the app.
                </Text>
                <View style={styles.pinInputRow}>
                  <TextInput
                    style={styles.pinInput}
                    value={newPinInput}
                    onChangeText={setNewPinInput}
                    placeholder="e.g. 2026"
                    placeholderTextColor="#64748B"
                    keyboardType="number-pad"
                    maxLength={8}
                  />
                  <TouchableOpacity
                    style={styles.savePinBtn}
                    onPress={handleSaveStealthPin}
                  >
                    <Text style={styles.savePinBtnText}>Save PIN</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Attribution & Legal Notices */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📜 Attribution & Licenses</Text>
            <Text style={styles.bodyText}>• OpenStreetMap data © OpenStreetMap contributors (ODbL)</Text>
            <Text style={styles.bodyText}>• Basemap cartography © OpenStreetMap contributors</Text>
            <Text style={styles.bodyText}>• Street photos © Panoramax contributors (CC-BY-SA 4.0)</Text>
            <Text style={styles.bodyText}>• Solar position algorithms based on NOAA GML equations</Text>
            <Text style={styles.bodyText}>• Map rendering via MapLibre GL Native</Text>
          </View>

          {/* Data Management Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🗑️ Data Management</Text>
            <TouchableOpacity style={styles.wipeButton} onPress={handleHardWipe}>
              <Text style={styles.wipeButtonText}>Clear All Local Journey History</Text>
            </TouchableOpacity>
            <Text style={styles.wipeSubtext}>
              Immediately deletes all saved journeys, favorite routes, and search cache from on-device SQLite.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: (StatusBar.currentHeight || 28) + 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  closeButton: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  closeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#38BDF8',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
    marginBottom: 4,
  },
  inventoryIntro: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 10,
  },
  inventoryItem: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  itemRecipient: {
    fontSize: 11,
    color: '#38BDF8',
    marginTop: 2,
  },
  itemData: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  pinConfigRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  pinConfigLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  pinConfigValue: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  changePinBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  changePinBtnText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  pinEditBox: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  pinEditHelp: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
  },
  pinInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pinInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  savePinBtn: {
    backgroundColor: '#38BDF8',
    borderRadius: 6,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savePinBtnText: {
    color: '#090D16',
    fontSize: 12,
    fontWeight: '800',
  },
  wipeButton: {
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  wipeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  wipeSubtext: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
  },
});

