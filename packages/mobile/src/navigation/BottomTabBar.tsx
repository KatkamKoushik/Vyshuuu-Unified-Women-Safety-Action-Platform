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

  const tabs: { key: ActiveTab; label: string; tag: string; badge?: string }[] = [
    {
      key: 'explore',
      label: t.moveTab || 'Move',
      tag: 'NAV',
      badge: hasActiveRoute ? 'ACTIVE' : undefined,
    },
    { key: 'protect', label: t.protectTab || 'Protect', tag: 'SHIELD' },
    { key: 'act', label: t.actTab || 'Act', tag: 'LEGAL' },
    { key: 'saved', label: t.vaultTab || 'Vault', tag: 'VAULT' },
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

          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                isActive && {
                  backgroundColor: theme.isDark ? 'rgba(56, 189, 248, 0.12)' : theme.surface,
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
                <Text
                  style={[
                    styles.tabTag,
                    { color: isActive ? theme.primary : theme.textMuted },
                  ]}
                >
                  [{tab.tag}]
                </Text>
                {tab.badge && (
                  <View style={[styles.tabBadge, { backgroundColor: theme.primary }]}>
                    <Text style={styles.tabBadgeText}>{tab.badge}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? theme.primary : theme.textMuted },
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
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    paddingHorizontal: 8,
    zIndex: 99,
  },
  tabBarInner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    minWidth: 64,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tabLabelActive: {
    fontWeight: '800',
  },
  tabBadge: {
    position: 'absolute',
    top: -6,
    right: -24,
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
    marginTop: 2,
  },
});
