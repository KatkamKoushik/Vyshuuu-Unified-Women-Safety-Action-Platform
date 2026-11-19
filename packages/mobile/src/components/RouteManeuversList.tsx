import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface RouteManeuversListProps {
  steps: any[];
}

function getManeuverGlyph(type?: string, modifier?: string) {
  const text = `${type || ''} ${modifier || ''}`.toLowerCase();
  if (text.includes('left')) return '↰';
  if (text.includes('right')) return '↱';
  if (text.includes('uturn')) return '↶';
  if (text.includes('arrive') || text.includes('destination')) return '●';
  if (text.includes('depart') || text.includes('start')) return '↑';
  return '↑';
}

export function RouteManeuversList({ steps }: RouteManeuversListProps) {
  const { theme } = useTheme();

  if (!steps || steps.length === 0) return null;

  return (
    <View style={styles.maneuversList}>
      <Text style={[styles.maneuversHeading, { color: theme.text }]}>Directions for Selected Route</Text>
      {steps.map((step: any, idx: number) => {
        const glyph = getManeuverGlyph(step.maneuverType, step.maneuverModifier);
        return (
          <View
            key={idx}
            style={[
              styles.maneuverRow,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: theme.isDark ? 'rgba(56, 189, 248, 0.12)' : theme.primaryLight,
                },
              ]}
            >
              <Text style={[styles.maneuverGlyph, { color: theme.primary }]}>{glyph}</Text>
            </View>
            <View style={styles.stepBody}>
              <Text style={[styles.stepInstruction, { color: theme.text }]}>{step.instruction}</Text>
              <Text style={[styles.stepSub, { color: theme.textSecondary }]}>
                {step.distanceMeters > 0 ? `${step.distanceMeters} m` : 'Destination reached'}
                {step.roadName ? ` • ${step.roadName}` : ''}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  maneuversList: {
    marginTop: 10,
  },
  maneuversHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  maneuverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  maneuverGlyph: {
    fontSize: 16,
    fontWeight: '700',
  },
  stepBody: {
    flex: 1,
  },
  stepInstruction: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  stepSub: {
    fontSize: 11,
    marginTop: 2,
  },
});
