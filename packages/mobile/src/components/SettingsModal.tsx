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
import { useTheme, THEMES, ThemeType } from '../theme/ThemeContext';
import { useLanguage, LanguageCode } from '../context/LanguageContext';
import { FaqModal } from './FaqModal';
import { SupportModal } from './SupportModal';

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
  const { theme, themeType, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [stealthPin, setStealthPinState] = useState('112=');
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [showFaq, setShowFaq] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

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

  const themeOptions: Array<{ type: ThemeType; label: string; desc: string }> = [
    { type: 'white', label: 'White (Light)', desc: 'Clean, high-contrast light theme' },
    { type: 'black', label: 'OLED Black', desc: 'Pure black for OLED battery efficiency' },
    { type: 'navy', label: 'Midnight Navy', desc: 'Deep ocean dark mode' },
    { type: 'grey', label: 'Slate Grey', desc: 'Neutral balanced charcoal' },
  ];

  const languageOptions: Array<{ code: LanguageCode; label: string; sub: string }> = [
    { code: 'en', label: 'English', sub: 'Standard' },
    { code: 'te', label: 'తెలుగు (Telugu)', sub: 'ఆంధ్రప్రదేశ్ / తెలంగాణ' },
    { code: 'hi', label: 'हिन्दी (Hindi)', sub: 'भारत' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />

        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Settings & Privacy</Text>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={onClose}
          >
            <Text style={[styles.doneBtnText, { color: theme.text }]}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Theme Section */}
          <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Display Theme</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Select your preferred visual theme across the application.
            </Text>
            <View style={styles.optionsGrid}>
              {themeOptions.map((opt) => {
                const isSelected = themeType === opt.type;
                return (
                  <TouchableOpacity
                    key={opt.type}
                    style={[
                      styles.themeCard,
                      {
                        backgroundColor: theme.surface,
                        borderColor: isSelected ? theme.primary : theme.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                    onPress={() => setTheme(opt.type)}
                  >
                    <View style={styles.themeRadioRow}>
                      <Text style={[styles.themeLabel, { color: theme.text, fontWeight: isSelected ? '700' : '500' }]}>
                        {opt.label}
                      </Text>
                      {isSelected && (
                        <View style={[styles.activePill, { backgroundColor: theme.primary }]}>
                          <Text style={styles.activePillText}>ACTIVE</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.themeDesc, { color: theme.textMuted }]}>{opt.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Language Section */}
          <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Language / భాష / भाषा</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Change user interface display language.
            </Text>
            <View style={styles.optionsGrid}>
              {languageOptions.map((opt) => {
                const isSelected = language === opt.code;
                return (
                  <TouchableOpacity
                    key={opt.code}
                    style={[
                      styles.langCard,
                      {
                        backgroundColor: theme.surface,
                        borderColor: isSelected ? theme.primary : theme.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                    onPress={() => setLanguage(opt.code)}
                  >
                    <View style={styles.themeRadioRow}>
                      <Text style={[styles.themeLabel, { color: theme.text, fontWeight: isSelected ? '700' : '500' }]}>
                        {opt.label}
                      </Text>
                      {isSelected && (
                        <View style={[styles.activePill, { backgroundColor: theme.primary }]}>
                          <Text style={styles.activePillText}>SELECTED</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.themeDesc, { color: theme.textMuted }]}>{opt.sub}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Knowledge & Support Links */}
          <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Help & Emergency Support</Text>
            <TouchableOpacity
              style={[styles.menuRow, { borderBottomColor: theme.border }]}
              onPress={() => setShowFaq(true)}
            >
              <View>
                <Text style={[styles.menuRowTitle, { color: theme.text }]}>Frequently Asked Questions</Text>
                <Text style={[styles.menuRowSubtitle, { color: theme.textMuted }]}>
                  How routing, evidence hashing, and statutory rights work
                </Text>
              </View>
              <Text style={[styles.menuChevron, { color: theme.primary }]}>&gt;</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => setShowSupport(true)}
            >
              <View>
                <Text style={[styles.menuRowTitle, { color: theme.danger }]}>Support & Official Helplines</Text>
                <Text style={[styles.menuRowSubtitle, { color: theme.textMuted }]}>
                  112, 1091 Women Helpline, 1930 Cybercrime, and NCW
                </Text>
              </View>
              <Text style={[styles.menuChevron, { color: theme.danger }]}>&gt;</Text>
            </TouchableOpacity>
          </View>

          {/* Stealth Disguise Sequence Configuration */}
          <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Stealth Disguise Security</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              When Quick Disguise is triggered, ResQ displays an authentic calculator. Only entering your secret unlock sequence exits stealth mode.
            </Text>

            <View style={styles.pinConfigRow}>
              <View>
                <Text style={[styles.pinConfigLabel, { color: theme.textMuted }]}>Current Unlock Sequence:</Text>
                <Text style={[styles.pinConfigValue, { color: theme.primary }]}>{stealthPin}</Text>
              </View>
              <TouchableOpacity
                style={[styles.changePinBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => setIsEditingPin(!isEditingPin)}
              >
                <Text style={[styles.changePinBtnText, { color: theme.text }]}>
                  {isEditingPin ? 'Cancel' : 'Change'}
                </Text>
              </TouchableOpacity>
            </View>

            {isEditingPin && (
              <View style={[styles.editPinBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <TextInput
                  style={[styles.pinInput, { color: theme.text, borderColor: theme.border }]}
                  placeholder="e.g. 112 or 2026"
                  placeholderTextColor={theme.textMuted}
                  value={newPinInput}
                  onChangeText={setNewPinInput}
                  keyboardType="numbers-and-punctuation"
                  maxLength={8}
                />
                <TouchableOpacity
                  style={[styles.savePinBtn, { backgroundColor: theme.primary }]}
                  onPress={handleSaveStealthPin}
                >
                  <Text style={styles.savePinBtnText}>Save Sequence</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Emergency Panic Wipe */}
          <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.danger }]}>
            <Text style={[styles.sectionTitle, { color: theme.danger }]}>Permanent 1-Tap Hard Wipe</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Immediately purges all saved corridors, search logs, incident records, and statutory drafts with SQLite VACUUM.
            </Text>
            <TouchableOpacity
              style={[styles.hardWipeBtn, { backgroundColor: theme.danger }]}
              onPress={handleHardWipe}
            >
              <Text style={styles.hardWipeBtnText}>Permanently Wipe All Data</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <FaqModal visible={showFaq} onClose={() => setShowFaq(false)} />
        <SupportModal visible={showSupport} onClose={() => setShowSupport(false)} />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  doneBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  section: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  optionsGrid: {
    gap: 8,
  },
  themeCard: {
    borderRadius: 10,
    padding: 12,
  },
  langCard: {
    borderRadius: 10,
    padding: 12,
  },
  themeRadioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  themeLabel: {
    fontSize: 14,
  },
  activePill: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  activePillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  themeDesc: {
    fontSize: 11,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  menuRowTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuRowSubtitle: {
    fontSize: 11,
  },
  menuChevron: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 8,
  },
  pinConfigRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  pinConfigLabel: {
    fontSize: 11,
  },
  pinConfigValue: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  changePinBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  changePinBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  editPinBox: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  pinInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
  },
  savePinBtn: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  savePinBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  hardWipeBtn: {
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  hardWipeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
