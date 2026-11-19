import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import type { RouteAlternativeAnalysis } from '@walking-companion/core';
import { useTheme } from '../theme/ThemeContext';
import { AppIcon } from './common/AppIcon';

interface RouteComparisonCardsProps {
  routes: any[];
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string) => void;
  alternativesAnalysis?: RouteAlternativeAnalysis[] | null;
}

export function RouteComparisonCards({
  routes,
  selectedRouteId,
  onSelectRoute,
  alternativesAnalysis,
}: RouteComparisonCardsProps) {
  const { theme } = useTheme();

  if (!routes || routes.length === 0) return null;

  const [showTradeOffs, setShowTradeOffs] = useState(true);

  // Map analysis by route ID
  const analysisMap = useMemo(() => {
    const map = new Map<string, RouteAlternativeAnalysis>();
    if (alternativesAnalysis) {
      for (const a of alternativesAnalysis) {
        map.set(a.routeId, a);
      }
    }
    return map;
  }, [alternativesAnalysis]);

  const recommendedRoute = alternativesAnalysis?.find((a) => a.isRecommended);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
          ALTERNATIVE ROUTES & INTELLIGENCE
        </Text>
        {alternativesAnalysis && alternativesAnalysis.length > 1 && (
          <TouchableOpacity
            onPress={() => setShowTradeOffs(!showTradeOffs)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.toggleTradeOffs, { color: theme.primary }]}>
              {showTradeOffs ? 'Hide Trade-offs' : 'Compare Trade-offs'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
        {routes.map((route: any, index: number) => {
          const isSelected = route.id === (selectedRouteId || routes[0]?.id);
          const analysis = analysisMap.get(route.id);
          const isRec = analysis ? analysis.isRecommended : false;
          const badgeText = analysis
            ? (analysis.isRecommended ? `RECOMMENDED • ${analysis.badgeLabel}` : `ALT • ${analysis.badgeLabel}`)
            : `ROUTE ${index + 1} • ALT`;

          return (
            <TouchableOpacity
              key={route.id}
              style={[
                styles.routeCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
                isRec && !isSelected && {
                  borderColor: theme.success,
                  backgroundColor: theme.isDark ? '#14232C' : theme.successLight,
                },
                isSelected && {
                  borderColor: theme.primary,
                  backgroundColor: theme.isDark ? '#131C2E' : theme.primaryLight,
                },
              ]}
              onPress={() => onSelectRoute(route.id)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Select Route ${index + 1}`}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <View style={styles.cardBadge}>
                <Text
                  style={[
                    styles.cardBadgeText,
                    { color: theme.textMuted },
                    isRec && { color: theme.success },
                    isSelected && { color: theme.primary },
                  ]}
                  numberOfLines={1}
                >
                  {badgeText}
                </Text>
              </View>

              <View style={styles.metricsRow}>
                <Text style={[styles.durationBig, { color: theme.text }]}>{route.durationFormatted}</Text>
                <Text style={[styles.distanceSmall, { color: theme.textSecondary }]}>({route.distanceFormatted})</Text>
              </View>

              {analysis ? (
                <View style={[styles.intelRow, { borderTopColor: theme.borderLight }]}>
                  <Text style={[styles.intelText, { color: theme.textSecondary }]}>
                    Main Roads: {analysis.majorRoadPercent}%
                  </Text>
                  <Text style={[styles.intelText, { color: theme.textSecondary }]}>
                    Open: {analysis.openVenuesCount}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.turnsDetail, { color: theme.textMuted }]}>{route.turnsCount} turn maneuvers</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Intelligence Trade-Off Comparison Box */}
      {showTradeOffs && alternativesAnalysis && alternativesAnalysis.length > 1 && (
        <View
          style={[
            styles.tradeOffContainer,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={[styles.tradeOffHeader, { borderBottomColor: theme.borderLight }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <AppIcon name="legal" size={14} color={theme.primary} />
              <Text style={[styles.tradeOffTitle, { color: theme.text }]}>Route Intelligence Trade-Offs</Text>
            </View>
            {recommendedRoute && (
              <Text style={[styles.recommendedNote, { color: theme.success }]}>
                {recommendedRoute.recommendationReason}
              </Text>
            )}
          </View>

          {alternativesAnalysis.map((alt) => (
            <View key={alt.routeId} style={styles.tradeOffItem}>
              <View style={styles.tradeOffRouteTitleRow}>
                <Text
                  style={[
                    styles.tradeOffRouteName,
                    { color: theme.text },
                    alt.isRecommended && { color: theme.primary },
                  ]}
                >
                  Route {alt.routeIndex + 1}: {alt.badgeLabel} ({alt.durationFormatted})
                </Text>
                <Text
                  style={[
                    styles.coveragePill,
                    {
                      color: theme.textSecondary,
                      backgroundColor: theme.card,
                    },
                  ]}
                >
                  {alt.contextScore?.totalScore ?? 0}% Coverage
                </Text>
              </View>
              <Text style={[styles.tradeOffDesc, { color: theme.textSecondary }]}>
                {alt.tradeOffSummary}
              </Text>
            </View>
          ))}

          <Text style={[styles.groundTruthDisclosure, { color: theme.warning }]}>
            [NOTICE] Verification disclosure: Storefront hours and street features are crowd-sourced from OpenStreetMap and may be unverified on the ground.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  toggleTradeOffs: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardScroll: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  routeCard: {
    padding: 12,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 1.5,
    minWidth: 175,
    minHeight: 80,
    justifyContent: 'center',
  },
  cardBadge: {
    marginBottom: 4,
  },
  cardBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  durationBig: {
    fontSize: 18,
    fontWeight: '800',
    marginRight: 6,
  },
  distanceSmall: {
    fontSize: 12,
    fontWeight: '500',
  },
  intelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
  },
  intelText: {
    fontSize: 11,
    fontWeight: '500',
  },
  turnsDetail: {
    fontSize: 11,
    marginTop: 3,
  },
  tradeOffContainer: {
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
  },
  tradeOffHeader: {
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
  },
  tradeOffTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  recommendedNote: {
    fontSize: 11,
    fontWeight: '600',
  },
  tradeOffItem: {
    marginBottom: 8,
  },
  tradeOffRouteTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  tradeOffRouteName: {
    fontSize: 11,
    fontWeight: '700',
  },
  coveragePill: {
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  tradeOffDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  groundTruthDisclosure: {
    fontSize: 10,
    marginTop: 4,
    lineHeight: 14,
  },
});
