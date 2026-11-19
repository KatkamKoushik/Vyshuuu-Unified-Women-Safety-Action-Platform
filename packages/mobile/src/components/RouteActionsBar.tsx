import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { AppIcon } from './common/AppIcon';

interface RouteActionsBarProps {
  onStartWalking: () => void;
  onSaveRoute: () => void;
  onTogglePhotos: () => void;
  onOpenPrivacy: () => void;
  showManeuvers: boolean;
  onToggleManeuvers: () => void;
}

export function RouteActionsBar({
  onStartWalking,
  onSaveRoute,
  onTogglePhotos,
  onOpenPrivacy,
  showManeuvers,
  onToggleManeuvers,
}: RouteActionsBarProps) {
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.actionButtonsRow}
    >
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]}
        onPress={onStartWalking}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Start Walking Mode"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <AppIcon name="walk" size={16} color="#FFFFFF" />
        <Text style={[styles.actionBtnText, { color: '#FFFFFF', fontWeight: '800' }]}>
          Walk
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.actionBtn,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
        onPress={onSaveRoute}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Save Route to Local SQLite"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <AppIcon name="star" size={16} color={theme.warning} />
        <Text style={[styles.actionBtnText, { color: theme.text }]}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.actionBtn,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
        onPress={onTogglePhotos}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Check Panoramax Street Photos"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <AppIcon name="camera" size={16} color={theme.textSecondary} />
        <Text style={[styles.actionBtnText, { color: theme.text }]}>Photos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.actionBtn,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
        onPress={onOpenPrivacy}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Open Privacy and Data Flow Settings"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <AppIcon name="settings" size={16} color={theme.textSecondary} />
        <Text style={[styles.actionBtnText, { color: theme.text }]}>Privacy</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.actionBtn,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
        onPress={onToggleManeuvers}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Toggle Turn by Turn Steps"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <AppIcon name="nav" size={14} color={theme.primary} />
        <Text style={[styles.actionBtnText, { color: theme.primary, fontWeight: '700' }]}>
          {showManeuvers ? 'Hide Steps' : 'Steps'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 46,
    justifyContent: 'center',
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
