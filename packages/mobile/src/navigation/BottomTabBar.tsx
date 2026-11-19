import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { AppIcon, IconName } from '../components/common/AppIcon';

export type ActiveTab = 'explore' | 'navigate' | 'protect' | 'act' | 'saved';

interface BottomTabBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  hasActiveRoute: boolean;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  hasActiveRoute,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const tabs: { key: ActiveTab; label: string; icon: IconName; badge?: string }[] = [
    {
      key: 'explore',
      label: t.moveTab || 'Move',
      icon: 'compass',
      badge: hasActiveRoute ? 'LIVE' : undefined,
    },
    { key: 'protect', label: t.protectTab || 'Protect', icon: 'shield' },
    { key: 'act', label: t.actTab || 'Act', icon: 'legal' },
    { key: 'saved', label: t.vaultTab || 'Vault', icon: 'vault' },
  ];

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          backgroundColor: theme.bg,
          borderTopColor: theme.border,
        },
      ]}
    >
      <View style={styles.tabBarInner}>
        {tabs.map((tab) => {
          const isActive =
            activeTab === tab.key || (tab.key === 'explore' && activeTab === 'navigate');

          const iconColor = isActive ? theme.primary : theme.textMuted;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                isActive && {
                  backgroundColor: theme.isDark
                    ? 'rgba(56, 189, 248, 0.12)'
                    : theme.surface,
                },
              ]}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityLabel={`${tab.label} tab`}
              accessibilityState={{ selected: isActive }}
              hitSlop={{ top: 8, bottom: 8, left: 10, right: 10 }}
            >
              <View style={styles.iconWrapper}>
                <AppIcon name={tab.icon} size={20} color={iconColor} />
                {tab.badge && (
                  <View style={[styles.tabBadge, { backgroundColor: theme.primary }]}>
                    <Text style={styles.tabBadgeText}>{tab.badge}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: iconColor },
                  isActive && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
              {isActive && (
                <View
                  style={[styles.activeIndicatorDot, { backgroundColor: theme.primary }]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    paddingHorizontal: 12,
    zIndex: 99,
  },
  tabBarInner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    minWidth: 70,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 22,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
    letterSpacing: -0.2,
  },
  tabLabelActive: {
    fontWeight: '800',
  },
  tabBadge: {
    position: 'absolute',
    top: -5,
    right: -20,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  activeIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
});
