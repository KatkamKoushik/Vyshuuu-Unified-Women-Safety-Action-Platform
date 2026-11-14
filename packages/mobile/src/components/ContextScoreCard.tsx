import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ContextScoreBreakdown } from '@walking-companion/core';

interface ContextScoreCardProps {
  score: ContextScoreBreakdown;
}

export const ContextScoreCard: React.FC<ContextScoreCardProps> = ({ score }) => {
  const getBadgeColor = (label: string) => {
    switch (label) {
      case 'Comprehensive':
        return '#10B981'; // emerald
      case 'Moderate':
        return '#F59E0B'; // amber
      case 'Sparse':
      default:
        return '#64748B'; // slate
    }
  };

  const badgeColor = getBadgeColor(score.ratingLabel);
  const walkingCond = score.walkingConditions;
  const daylightColor =
    score.daylightState === 'DAYLIGHT'
      ? '#FBBF24'
      : score.daylightState.includes('TWILIGHT')
      ? '#F97316'
      : '#818CF8';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{score.scoreName || 'Route Information Coverage'}</Text>
          <Text style={styles.subtitle}>
            {score.amenitiesCount} mapped facilities • {score.imageryScope === 'route_corridor_sampled' ? 'Corridor Sampled' : 'Near Origin'}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{score.totalScore}%</Text>
          <Text style={styles.badgeLabel}>{score.ratingLabel}</Text>
        </View>
      </View>

      {/* Section 1: Objective Data Availability (0-100%) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>MAPPED DATA AVAILABILITY</Text>
        <Text style={styles.sectionSub}>Invariant across day/night</Text>
      </View>

      <View style={styles.metricsContainer}>
        {/* Amenity Density */}
        <View style={styles.metricRow}>
          <View style={styles.metricLabelRow}>
            <Text style={styles.metricLabel}>Mapped OSM Infrastructure</Text>
            <Text style={styles.metricValue}>{score.amenityScore}/50 pts ({score.amenityDensityPer100m}/100m)</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${(score.amenityScore / 50) * 100}%`, backgroundColor: '#38BDF8' }]} />
          </View>
        </View>

        {/* Street Imagery */}
        <View style={styles.metricRow}>
          <View style={styles.metricLabelRow}>
            <Text style={styles.metricLabel}>{score.imageryLabel || 'Street-Level Imagery'}</Text>
            <Text style={styles.metricValue}>
              {score.hasStreetImagery ? `${score.imageryScore}/50 pts (Panoramax)` : '0/50 pts (No coverage)'}
            </Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${(score.imageryScore / 50) * 100}%`, backgroundColor: '#A78BFA' }]} />
          </View>
        </View>
      </View>

      {/* Section 2: Real-Time Walking Conditions (Reported separately) */}
      <View style={styles.conditionsBox}>
        <View style={styles.conditionsHeader}>
          <Text style={styles.conditionsTitle}>REAL-TIME WALKING CONDITIONS</Text>
          <View style={[styles.conditionPill, { backgroundColor: daylightColor + '22', borderColor: daylightColor }]}>
            <Text style={[styles.conditionPillText, { color: daylightColor }]}>
              {walkingCond?.conditionLabel || score.daylightState}
            </Text>
          </View>
        </View>
        <Text style={styles.conditionsElevation}>
          Astronomical solar elevation: {score.solarElevationDeg > 0 ? `+${score.solarElevationDeg.toFixed(1)}°` : `${score.solarElevationDeg.toFixed(1)}°`} (NOAA solar algorithm)
        </Text>
        <Text style={styles.conditionsAdvisory}>
          {walkingCond?.advisory || 'Walking conditions evaluate environmental ambient light independently from mapped data coverage.'}
        </Text>
      </View>

      {/* Missing Data / Gaps Notices */}
      {score.missingDataNotices.length > 0 && (
        <View style={styles.missingContainer}>
          {score.missingDataNotices.map((notice, index) => (
            <Text key={index} style={styles.missingText}>ℹ️ {notice}</Text>
          ))}
        </View>
      )}

      {/* Mandatory Honest Disclaimers */}
      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>{score.disclaimer}</Text>
        <Text style={styles.groundTruthNotice}>
          ⚠️ Ground verification notice: Crowd-sourced OpenStreetMap features and opening hours may be outdated or unverified on the ground.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
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
    color: '#F8FAFC',
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
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#38BDF8',
  },
  sectionSub: {
    fontSize: 10,
    color: '#64748B',
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
    color: '#CBD5E1',
  },
  metricValue: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#090D16',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  conditionsBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
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
    color: '#94A3B8',
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
    color: '#CBD5E1',
    marginBottom: 4,
  },
  conditionsAdvisory: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },
  missingContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  missingText: {
    fontSize: 11,
    color: '#F59E0B',
    lineHeight: 16,
  },
  disclaimerContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 8,
  },
  disclaimerText: {
    fontSize: 10,
    color: '#64748B',
    fontStyle: 'italic',
    lineHeight: 14,
  },
  groundTruthNotice: {
    fontSize: 10,
    color: '#F59E0B',
    marginTop: 4,
    lineHeight: 14,
  },
});

