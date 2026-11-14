import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface QuickExitBarProps {
  onToggleDisguise: () => void;
  onOpenNavigator: () => void;
  onOpenSos?: () => void;
}

export const QuickExitBar: React.FC<QuickExitBarProps> = ({
  onToggleDisguise,
  onOpenNavigator,
  onOpenSos,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const handleEmergencyCall = () => {
    if (onOpenSos) {
      onOpenSos();
      return;
    }
    Alert.alert(
      'Emergency Call 112',
      'This will place an immediate phone call to India National Emergency Response Support System (112).',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call 112 Now',
          style: 'destructive',
          onPress: () => {
            Linking.openURL('tel:112').catch(() => {
              Alert.alert('Dialer Error', 'Could not open device dialer for 112.');
            });
          },
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.bg,
          borderBottomColor: theme.border,
        },
      ]}
    >
      {/* Brand & Navigator Button */}
      <View style={styles.brandRow}>
        <View style={styles.identityGroup}>
          <Text style={[styles.brandTitle, { color: theme.text }]}>
            {t.appName || 'ResQ'}
          </Text>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: theme.isDark ? 'rgba(56, 189, 248, 0.15)' : theme.primaryLight,
                borderColor: theme.isDark ? 'rgba(56, 189, 248, 0.3)' : theme.borderLight,
              },
            ]}
          >
            <Text style={[styles.badgeText, { color: theme.primary }]}>
              {t.verifiedBadge || 'VERIFIED'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.navigatorButton,
            {
              backgroundColor: theme.isDark ? 'rgba(129, 140, 248, 0.15)' : theme.surface,
              borderColor: theme.isDark ? 'rgba(129, 140, 248, 0.3)' : theme.border,
            },
          ]}
          onPress={onOpenNavigator}
          activeOpacity={0.7}
          accessibilityLabel="Open AI Safety Assistant"
        >
          <Text style={[styles.navigatorLabel, { color: theme.primary }]}>
            {t.askAssistant || 'AI Assistant'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Safety Actions: Quick Disguise & 112 Direct Dial */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[
            styles.disguiseButton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
          onPress={onToggleDisguise}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Disguise screen with calculator"
        >
          <Text style={[styles.disguiseLabel, { color: theme.textSecondary }]}>
            {t.quickDisguise || 'Quick Disguise'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sosButton, { backgroundColor: theme.danger }]}
          onPress={handleEmergencyCall}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Dial 112 Emergency line"
        >
          <Text style={styles.sosLabel}>{t.sosButton || '112 SOS'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    zIndex: 90,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  identityGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  navigatorButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  navigatorLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  disguiseButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  disguiseLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  sosButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sosLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
