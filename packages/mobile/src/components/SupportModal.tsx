import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface SupportModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const handleDial = (number: string, label: string) => {
    Alert.alert(
      `Call ${label}`,
      `Do you want to dial ${number} now?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dial Now',
          style: 'default',
          onPress: () => {
            Linking.openURL(`tel:${number}`).catch(() => {
              Alert.alert('Dialer Notice', `Could not open device dialer for ${number}.`);
            });
          },
        },
      ]
    );
  };

  const handleOpenLink = (url: string, title: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Browser Notice', `Could not open ${title} URL.`);
    });
  };

  const emergencyContacts = [
    {
      title: 'National Emergency Response Support System',
      code: '112',
      description: 'Unified pan-India emergency number for Police, Fire, and Ambulance services.',
      actionType: 'call',
    },
    {
      title: 'Women Helpline (All India)',
      code: '1091',
      description: '24/7 dedicated helpline for women in distress, harassment, or physical danger.',
      actionType: 'call',
    },
    {
      title: 'National Cyber Crime Reporting Helpline',
      code: '1930',
      description: 'Immediate reporting of cyberstalking, online financial fraud, and non-consensual imagery.',
      actionType: 'call',
    },
    {
      title: 'National Commission for Women (NCW)',
      code: '7827170170',
      description: 'Dedicated 24/7 helpline for women facing violence, abuse, or institutional denial.',
      actionType: 'call',
    },
  ];

  const statutoryPortals = [
    {
      title: 'UGC e-Samadhaan Portal',
      url: 'https://samadhaan.ugc.ac.in',
      description: 'Official statutory grievance portal for university and college student disputes.',
    },
    {
      title: 'National Cyber Crime Reporting Portal',
      url: 'https://cybercrime.gov.in',
      description: 'Official Ministry of Home Affairs portal for cybercrime, harassment, and stalking complaints.',
    },
    {
      title: 'National Anti-Ragging Helpline Portal',
      url: 'https://www.antiragging.in',
      description: 'Zero-tolerance anti-ragging complaints with mandatory 24-hour university notice.',
    },
    {
      title: 'FSSAI FoSCoS Food Safety Complaints',
      url: 'https://foscos.fssai.gov.in',
      description: 'Statutory food safety regulator for college messes and commercial eateries.',
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>Support & Official Helplines</Text>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={onClose}
          >
            <Text style={[styles.doneBtnText, { color: theme.text }]}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Emergency Helplines Section */}
          <Text style={[styles.sectionTitle, { color: theme.danger }]}>24/7 EMERGENCY HELPLINES</Text>
          {emergencyContacts.map((c, idx) => (
            <View key={idx} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{c.title}</Text>
                <TouchableOpacity
                  style={[styles.callBtn, { backgroundColor: theme.danger }]}
                  onPress={() => handleDial(c.code, c.title)}
                >
                  <Text style={styles.callBtnText}>Call {c.code}</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>{c.description}</Text>
            </View>
          ))}

          {/* Statutory Portals Section */}
          <Text style={[styles.sectionTitle, { color: theme.primary, marginTop: 12 }]}>
            OFFICIAL STATUTORY PORTALS
          </Text>
          {statutoryPortals.map((p, idx) => (
            <View key={idx} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{p.title}</Text>
                <TouchableOpacity
                  style={[styles.portalBtn, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}
                  onPress={() => handleOpenLink(p.url, p.title)}
                >
                  <Text style={[styles.portalBtnText, { color: theme.primary }]}>Open Portal &gt;</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>{p.description}</Text>
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
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  callBtn: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  portalBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  portalBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
});

