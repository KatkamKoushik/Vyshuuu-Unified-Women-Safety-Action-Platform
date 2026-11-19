import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ContextScoreBreakdown } from '@walking-companion/core';
import { useTheme } from '../theme/ThemeContext';
import { AppIcon } from './common/AppIcon';

interface ContextScoreCardProps {
  score: ContextScoreBreakdown;
}

export const ContextScoreCard: React.FC<ContextScoreCardProps> = ({ score }) => {
  const { theme } = useTheme();

  const getBadgeColor = (label: string) => {
    switch (label) {
      case 'Comprehensive':
        return theme.success;
      case 'Moderate':
        return theme.warning;
      case 'Sparse':
      default:
        return theme.textMuted;
    }
  };

  const badgeColor = getBadgeColor(score.ratingLabel);
  const walkingCond = score.walkingConditions;
  const daylightColor =
    score.daylightState === 'DAYLIGHT'
      ? theme.warning
      : score.daylightState.includes('TWILIGHT')
      ? '#F97316'
      : theme.primary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.text }]}>
            {score.scoreName || 'Route Information Coverage'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {score.amenitiesCount} mapped facilities • {score.imageryScope === 'route_corridor_sampled' ? 'Corridor Sampled' : 'Near Origin'}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{score.totalScore}%</Text>
          <Text style={styles.badgeLabel}>{score.ratingLabel}</Text>
        </View>
      </View>

      {/* Section 1: Objective Data Availability (0-100%) */}
      <View style={[styles.sectionHeader, { borderBottomColor: theme.borderLight }]}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>MAPPED DATA AVAILABILITY</Text>
        <Text style={[styles.sectionSub, { color: theme.textMuted }]}>Invariant across day/night</Text>
      </View>

      <View style={styles.metricsContainer}>
        {/* Amenity Density */}
        <View style={styles.metricRow}>
          <View style={styles.metricLabelRow}>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Mapped OSM Infrastructure</Text>
            <Text style={[styles.metricValue, { color: theme.textMuted }]}>
              {score.amenityScore}/50 pts ({score.amenityDensityPer100m}/100m)
            </Text>
          </View>
          <View style={[styles.progressBarBackground, { backgroundColor: theme.surface }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${(score.amenityScore / 50) * 100}%`, backgroundColor: theme.primary },
              ]}
            />
          </View>
        </View>

        {/* Street Imagery */}
        <View style={styles.metricRow}>
          <View style={styles.metricLabelRow}>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
              {score.imageryLabel || 'Street-Level Imagery'}
            </Text>
            <Text style={[styles.metricValue, { color: theme.textMuted }]}>
              {score.hasStreetImagery ? `${score.imageryScore}/50 pts (Panoramax)` : '0/50 pts (No coverage)'}
            </Text>
          </View>
          <View style={[styles.progressBarBackground, { backgroundColor: theme.surface }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${(score.imageryScore / 50) * 100}%`, backgroundColor: theme.accent },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Section 2: Real-Time Walking Conditions */}
      <View
        style={[
          styles.conditionsBox,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.conditionsHeader}>
          <Text style={[styles.conditionsTitle, { color: theme.textSecondary }]}>REAL-TIME WALKING CONDITIONS</Text>
          <View style={[styles.conditionPill, { backgroundColor: daylightColor + '1A', borderColor: daylightColor }]}>
            <Text style={[styles.conditionPillText, { color: daylightColor }]}>
              {walkingCond?.conditionLabel || score.daylightState}
            </Text>
          </View>
        </View>
        <Text style={[styles.conditionsElevation, { color: theme.textSecondary }]}>
          Astronomical solar elevation: {score.solarElevationDeg > 0 ? `+${score.solarElevationDeg.toFixed(1)}°` : `${score.solarElevationDeg.toFixed(1)}°`} (NOAA solar algorithm)
        </Text>
        <Text style={[styles.conditionsAdvisory, { color: theme.textMuted }]}>
          {walkingCond?.advisory || 'Walking conditions evaluate environmental ambient light independently from mapped data coverage.'}
        </Text>
      </View>

      {/* Missing Data Notices */}
      {score.missingDataNotices.length > 0 && (
        <View style={[styles.missingContainer, { backgroundColor: theme.warningLight, borderColor: theme.warning }]}>
          {score.missingDataNotices.map((notice, index) => (
            <Text key={index} style={[styles.missingText, { color: theme.warning }]}>
              [NOTE] {notice}
            </Text>
          ))}
        </View>
      )}

      {/* Honest Disclaimers */}
      <View style={[styles.disclaimerContainer, { borderTopColor: theme.borderLight }]}>
        <Text style={[styles.disclaimerText, { color: theme.textMuted }]}>{score.disclaimer}</Text>
        <Text style={[styles.groundTruthNotice, { color: theme.warning }]}>
          [NOTICE] Ground verification: Crowd-sourced OpenStreetMap features and opening hours may be outdated or unverified on the ground.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    marginVertical: 8,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 64,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  badgeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sectionSub: {
    fontSize: 10,
  },
  metricsContainer: {
    marginVertical: 4,
  },
  metricRow: {
    marginBottom: 10,
  },
  metricLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  conditionsBox: {
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
  },
  conditionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  conditionsTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  conditionPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  conditionPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  conditionsElevation: {
    fontSize: 11,
    marginBottom: 4,
  },
  conditionsAdvisory: {
    fontSize: 11,
    lineHeight: 15,
  },
  missingContainer: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  missingText: {
    fontSize: 11,
    lineHeight: 16,
  },
  disclaimerContainer: {
    borderTopWidth: 1,
    paddingTop: 8,
  },
  disclaimerText: {
    fontSize: 10,
    fontStyle: 'italic',
    lineHeight: 14,
  },
  groundTruthNotice: {
    fontSize: 10,
    marginTop: 4,
    lineHeight: 14,
  },
});
