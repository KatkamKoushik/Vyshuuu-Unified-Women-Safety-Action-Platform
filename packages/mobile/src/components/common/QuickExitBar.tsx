import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';

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
    <View style={styles.container}>
      {/* Brand & Navigator Button */}
      <View style={styles.brandRow}>
        <View style={styles.identityGroup}>
          <Text style={styles.brandTitle}>vyshuuu</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>VERIFIED</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.navigatorButton}
          onPress={onOpenNavigator}
          activeOpacity={0.7}
          accessibilityLabel="Open AI Safety Navigator"
        >
          <Text style={styles.navigatorIcon}>✨</Text>
          <Text style={styles.navigatorLabel}>Ask Navigator</Text>
        </TouchableOpacity>
      </View>

      {/* Safety Actions: Quick Disguise & 112 Direct Dial */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.disguiseButton}
          onPress={onToggleDisguise}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Disguise screen with calculator"
        >
          <Text style={styles.disguiseIcon}>🧮</Text>
          <Text style={styles.disguiseLabel}>Quick Disguise</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sosButton}
          onPress={handleEmergencyCall}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Dial 112 Emergency line"
        >
          <Text style={styles.sosIcon}>🚨</Text>
          <Text style={styles.sosLabel}>112 SOS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0B1120',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
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
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  badge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  badgeText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  navigatorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(129, 140, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  navigatorIcon: {
    fontSize: 12,
  },
  navigatorLabel: {
    color: '#A5B4FC',
    fontSize: 12,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  disguiseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  disguiseIcon: {
    fontSize: 14,
  },
  disguiseLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E11D48',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  sosIcon: {
    fontSize: 14,
  },
  sosLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

