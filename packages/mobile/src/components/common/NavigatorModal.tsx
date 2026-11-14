import React, { useState, useRef, useEffect } from 'react';
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
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  engine?: string;
  actionPill?: {
    label: string;
    targetScreen: string;
    initialPayload?: any;
    phone?: string;
  };
}

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
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      role: 'assistant',
      text: 'I am your ResQ AI Safety Assistant. I can help you evaluate well-lit walking corridors (Move), preserve electronic harassment evidence with SHA-256 byte digests (Protect), or draft statutory grievances under UGC and PoSH mandates (Act). How can I assist you?',
      engine: 'gemini-2.5-flash',
    },
  ]);

  const scrollRef = useRef<any>(null);

  const suggestedPrompts = [
    'Find well-lit walking corridor to library',
    'Rats in hostel room; warden ignored complaint',
    'Fake Instagram account sending unwanted DMs',
    'Emergency: someone is following me right now',
  ];

  useEffect(() => {
    if (visible) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    }
  }, [visible, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const historyPayload = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.text,
      }));

      const res = await fetch(`${GATEWAY_BASE_URL}/api/v1/navigator/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyPayload }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          id: `a_${Date.now()}`,
          role: 'assistant',
          text: data.reply || 'Guidance received.',
          engine: data.engine || (data.isAiGenerated ? 'gemini-2.5-flash' : 'local-rules'),
          actionPill: data.actionPill,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        fallbackHeuristicReply(text);
      }
    } catch {
      fallbackHeuristicReply(text);
    } finally {
      setIsLoading(false);
    }
  };

  const fallbackHeuristicReply = (q: string) => {
    const lower = q.toLowerCase();
    let reply = 'I can help guide you across ResQ tools.';
    let pill: any;

    if (lower.includes('follow') || lower.includes('danger') || lower.includes('emergency') || lower.includes('sos')) {
      reply = 'Emergency Alert: Dial 112 immediately. Move towards a well-lit, populated commercial shop or safe haven.';
      pill = { label: 'Call 112 Helpline', targetScreen: 'DIALER', phone: '112' };
    } else if (lower.includes('rat') || lower.includes('hostel') || lower.includes('warden') || lower.includes('food')) {
      reply = 'Under UGC e-Samadhaan regulations, universities must address basic living and hygiene grievances within 20 working days. Let us draft a formal petition.';
      pill = { label: 'Open Grievance Draftsman (Act)', targetScreen: 'ActScreen', initialPayload: { initialStatement: q } };
    } else if (lower.includes('instagram') || lower.includes('whatsapp') || lower.includes('stalk') || lower.includes('dm')) {
      reply = 'Preserve cross-platform electronic messages with cryptographic SHA-256 byte verification for official cybercrime reporting.';
      pill = { label: 'Open Incident Vault (Protect)', targetScreen: 'ProtectScreen', initialPayload: { initialText: q } };
    } else {
      reply = 'ResQ evaluates street lighting density, open commercial amenities, and solar daylight for safe pedestrian navigation.';
      pill = { label: 'Explore Safe Route (Move)', targetScreen: 'ExploreScreen' };
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `a_${Date.now()}`,
        role: 'assistant',
        text: reply,
        engine: 'local-rules',
        actionPill: pill,
      },
    ]);
  };

  const handleActionPill = (pill: NonNullable<ChatMessage['actionPill']>) => {
    if (pill.targetScreen === 'DIALER' || pill.phone) {
      Linking.openURL('tel:112').catch(() => {});
      return;
    }
    if (pill.targetScreen === 'ActScreen') {
      onClose();
      onNavigateToTab('act', pill.initialPayload);
    } else if (pill.targetScreen === 'ProtectScreen') {
      onClose();
      onNavigateToTab('protect', pill.initialPayload);
    } else {
      onClose();
      onNavigateToTab('move', pill.initialPayload);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <View>
            <View style={styles.titleRow}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>AI Safety Assistant</Text>
              <View style={[styles.modelBadge, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}>
                <Text style={[styles.modelBadgeText, { color: theme.primary }]}>GEMINI 2.5 FLASH</Text>
              </View>
            </View>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Generative decision-support, legal triage and safety advice
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={[styles.closeBtnText, { color: theme.text }]}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Chat Thread */}
        <ScrollView
          ref={scrollRef}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((m) => (
            <View
              key={m.id}
              style={[
                styles.messageRow,
                m.role === 'user' ? styles.userMessageRow : styles.assistantMessageRow,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  m.role === 'user'
                    ? [styles.userBubble, { backgroundColor: theme.primary }]
                    : [styles.assistantBubble, { backgroundColor: theme.card, borderColor: theme.border }],
                ]}
              >
                {m.role === 'assistant' && (
                  <View style={styles.assistantHeaderRow}>
                    <Text style={[styles.assistantLabel, { color: theme.primary }]}>
                      RESQ AI ASSISTANT
                    </Text>
                    {m.engine && (
                      <Text style={[styles.engineText, { color: theme.textMuted }]}>
                        [{m.engine.toUpperCase()}]
                      </Text>
                    )}
                  </View>
                )}
                <Text
                  style={[
                    styles.messageText,
                    m.role === 'user' ? styles.userMessageText : [styles.assistantMessageText, { color: theme.text }],
                  ]}
                >
                  {m.text}
                </Text>

                {/* Interactive Action Pill */}
                {m.actionPill && (
                  <TouchableOpacity
                    style={[styles.actionPillBtn, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}
                    onPress={() => handleActionPill(m.actionPill!)}
                  >
                    <Text style={[styles.actionPillText, { color: theme.primary }]}>
                      {m.actionPill.label} &gt;
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {isLoading && (
            <View style={styles.assistantMessageRow}>
              <View style={[styles.messageBubble, styles.assistantBubble, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={theme.primary} />
                  <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                    Analyzing guidance with Gemini...
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Suggested Prompts */}
        <View style={[styles.promptsContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <Text style={[styles.promptsHeader, { color: theme.textMuted }]}>QUICK SCENARIOS:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promptsScroll}>
            {suggestedPrompts.map((p, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.promptChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => handleSendMessage(p)}
              >
                <Text style={[styles.promptChipText, { color: theme.textSecondary }]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View style={[styles.inputBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="Ask safety assistant or describe incident..."
            placeholderTextColor={theme.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSendMessage()}
            returnKeyType="send"
            multiline={false}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: inputText.trim() ? theme.primary : theme.surface },
            ]}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
          >
            <Text
              style={[
                styles.sendButtonText,
                { color: inputText.trim() ? '#FFFFFF' : theme.textMuted },
              ]}
            >
              Send
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modelBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  modelBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chatScroll: {
    flex: 1,
  },
  chatScrollContent: {
    padding: 16,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  assistantMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    borderBottomRightRadius: 2,
  },
  assistantBubble: {
    borderWidth: 1,
    borderBottomLeftRadius: 2,
  },
  assistantHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  assistantLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  engineText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  assistantMessageText: {},
  actionPillBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  actionPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
  },
  promptsContainer: {
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  promptsHeader: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  promptsScroll: {
    flexDirection: 'row',
  },
  promptChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  promptChipText: {
    fontSize: 11,
  },
  inputBar: {
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendButton: {
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
