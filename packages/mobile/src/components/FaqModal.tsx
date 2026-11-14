import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface FaqModalProps {
  visible: boolean;
  onClose: () => void;
}

export const FaqModal: React.FC<FaqModalProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const faqs = [
    {
      q: 'How does the pedestrian walking route safety score work?',
      a: 'ResQ evaluates pedestrian routes using three independent mathematical layers: 1) Natural ambient solar daylight calculated using astronomical NOAA math; 2) Mapped OpenStreetMap physical lighting and illuminated pedestrian paths; 3) Proximity to verified 24/7 commercial stores and emergency amenities along the corridor.',
    },
    {
      q: 'Why does the app prioritize short walking routes under 5 km?',
      a: 'Pedestrian navigation is calibrated for realistic walking journeys between 500 meters and 5 km. For longer intercity trips, the app advises taking verified public transit or cabs rather than multi-hour walking treks.',
    },
    {
      q: 'How does evidence cryptographic integrity hashing work?',
      a: 'When you attach photographs or documents, ResQ computes a NIST FIPS 180-4 compliant SHA-256 hash across the actual file bytes. Any alteration of even a single byte changes the cryptographic digest, providing proof of digital evidence authenticity.',
    },
    {
      q: 'What is the UGC e-Samadhaan 20-working-day mandate?',
      a: 'Under University Grants Commission (Grievance Redressal of Students) Regulations, universities have a binding legal obligation to resolve student representations regarding hostel living conditions, mess hygiene, and academic safety within 20 working days.',
    },
    {
      q: 'How does the Quick Disguise stealth mode protect me?',
      a: 'Tapping Quick Disguise immediately switches the application to an authentic, fully functional calculator. The app screen cannot be exited without entering your secret sequence (default 112=), shielding your private reports from snooping.',
    },
    {
      q: 'Is my data uploaded to any central cloud or server?',
      a: 'No. ResQ operates on strict zero-telemetry principles. All your route history, recorded incidents, and draft petitions are stored exclusively on your device in protected local storage.',
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>Frequently Asked Questions</Text>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={onClose}
          >
            <Text style={[styles.doneBtnText, { color: theme.text }]}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {faqs.map((f, idx) => (
            <View key={idx} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.question, { color: theme.text }]}>{f.q}</Text>
              <Text style={[styles.answer, { color: theme.textSecondary }]}>{f.a}</Text>
            </View>
          ))}
        </ScrollView>
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
  title: {
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
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  question: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 20,
  },
  answer: {
    fontSize: 13,
    lineHeight: 19,
  },
});

