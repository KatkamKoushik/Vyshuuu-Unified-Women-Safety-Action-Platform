import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { GATEWAY_BASE_URL } from '../../services/routingAdapter';

interface NavigatorModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: 'move' | 'protect' | 'act', payload?: any) => void;
}

export const NavigatorModal: React.FC<NavigatorModalProps> = ({
  visible,
  onClose,
  onNavigateToTab,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    isEmergency?: boolean;
    intent?: string;
    title?: string;
    guidance?: string;
    actionPill?: { label: string; targetScreen: string; initialPayload?: any };
  } | null>(null);

  const suggestedPrompts = [
    'Rats in hostel room bit my foot; warden ignored complaint',
    'Someone created fake Instagram account sending me unwanted DMs',
    'Find best lit walking corridor to library at night',
    'Emergency: someone is following me right now',
  ];

  const handleTriage = async (customQuery?: string) => {
    const q = (customQuery || query).trim();
    if (!q) return;

    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${GATEWAY_BASE_URL}/api/v1/navigator/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        // Fallback local heuristic triage if backend unreachable
        fallbackLocalTriage(q);
      }
    } catch {
      fallbackLocalTriage(q);
    } finally {
      setIsLoading(false);
    }
  };

  const fallbackLocalTriage = (q: string) => {
    const lower = q.toLowerCase();
    if (lower.includes('follow') || lower.includes('danger') || lower.includes('emergency')) {
      setResult({
        isEmergency: true,
        intent: 'EMERGENCY',
        title: 'Immediate Safety Alert',
        guidance: 'Dial 112 directly. Move towards a well-lit, populated commercial shop immediately.',
        actionPill: { label: 'Dial 112 Helpline', targetScreen: 'DIALER' },
      });
    } else if (lower.includes('rat') || lower.includes('hostel') || lower.includes('warden') || lower.includes('food')) {
      setResult({
        isEmergency: false,
        intent: 'ACT',
        title: 'Act — Statutory Grievance Navigator',
        guidance: 'UGC e-Samadhaan enforces a statutory 20-working-day redressal window for hostel living conditions.',
        actionPill: { label: 'Open Grievance Wizard', targetScreen: 'ActScreen', initialPayload: { initialStatement: q } },
      });
    } else if (lower.includes('instagram') || lower.includes('whatsapp') || lower.includes('stalk') || lower.includes('dm')) {
      setResult({
        isEmergency: false,
        intent: 'PROTECT',
        title: 'Protect — Incident Evidence Vault',
        guidance: 'Preserve cross-platform electronic messages with cryptographic SHA-256 integrity verification.',
        actionPill: { label: 'Open Incident Vault', targetScreen: 'ProtectScreen', initialPayload: { initialText: q } },
      });
    } else {
      setResult({
        isEmergency: false,
        intent: 'MOVE',
        title: 'Move — Route Intelligence',
        guidance: 'Evaluate walking paths with open venues, daylight estimates, and street-level imagery.',
        actionPill: { label: 'Explore Route Corridors', targetScreen: 'MoveScreen' },
      });
    }
  };

  const handleActionClick = () => {
    if (!result) return;
    if (result.isEmergency) {
      Linking.openURL('tel:112');
      return;
    }
    if (result.intent === 'ACT') {
      onNavigateToTab('act', result.actionPill?.initialPayload);
    } else if (result.intent === 'PROTECT') {
      onNavigateToTab('protect', result.actionPill?.initialPayload);
    } else {
      onNavigateToTab('move');
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>AI Safety Navigator</Text>
            <Text style={styles.headerSubtitle}>Cross-module guidance & triage</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Input Box */}
          <View style={styles.searchBox}>
            <TextInput
              style={styles.input}
              placeholder="What situation or problem are you facing?"
              placeholderTextColor="#64748B"
              value={query}
              onChangeText={setQuery}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.submitBtn, !query.trim() && styles.submitBtnDisabled]}
              onPress={() => handleTriage()}
              disabled={!query.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>Ask Navigator →</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Example Chips */}
          <Text style={styles.sectionLabel}>OR SELECT A SITUATION TO EVALUATE:</Text>
          <View style={styles.chipsRow}>
            {suggestedPrompts.map((prompt, i) => (
              <TouchableOpacity
                key={i}
                style={styles.chip}
                onPress={() => {
                  setQuery(prompt);
                  handleTriage(prompt);
                }}
              >
                <Text style={styles.chipText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Result Card */}
          {result && (
            <View
              style={[
                styles.resultCard,
                result.isEmergency && styles.resultCardEmergency,
              ]}
            >
              <View style={styles.resultBadgeRow}>
                <View
                  style={[
                    styles.intentBadge,
                    result.isEmergency && styles.intentBadgeEmergency,
                  ]}
                >
                  <Text style={styles.intentBadgeText}>
                    {result.isEmergency ? '🚨 EMERGENCY PRIORITY' : `PILLAR: ${result.intent}`}
                  </Text>
                </View>
              </View>

              <Text style={styles.resultTitle}>{result.title}</Text>
              <Text style={styles.resultGuidance}>{result.guidance}</Text>

              {result.actionPill && (
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    result.isEmergency && styles.actionBtnEmergency,
                  ]}
                  onPress={handleActionClick}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnText}>
                    {result.actionPill.label} →
                  </Text>
                </TouchableOpacity>
              )}

              <Text style={styles.disclaimerText}>
                vyshuuu is an informational decision-support assistant. Does not provide legal advice or guarantee physical safety.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchBox: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 16,
  },
  input: {
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#38BDF8',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    backgroundColor: '#334155',
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#090D16',
    fontWeight: '700',
    fontSize: 13,
  },
  sectionLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chipsRow: {
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  chipText: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
  },
  resultCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    marginTop: 8,
  },
  resultCardEmergency: {
    backgroundColor: '#2A0812',
    borderColor: '#E11D48',
  },
  resultBadgeRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  intentBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  intentBadgeEmergency: {
    backgroundColor: 'rgba(225, 29, 72, 0.25)',
  },
  intentBadgeText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
  },
  resultTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  resultGuidance: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  actionBtn: {
    backgroundColor: '#38BDF8',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionBtnEmergency: {
    backgroundColor: '#E11D48',
  },
  actionBtnText: {
    color: '#090D16',
    fontWeight: '700',
    fontSize: 14,
  },
  disclaimerText: {
    color: '#64748B',
    fontSize: 10,
    lineHeight: 14,
    fontStyle: 'italic',
  },
});

