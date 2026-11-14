import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import type { RouteAlternativeAnalysis } from '@walking-companion/core';

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
        <Text style={styles.sectionTitle}>ALTERNATIVE ROUTES & INTELLIGENCE</Text>
        {alternativesAnalysis && alternativesAnalysis.length > 1 && (
          <TouchableOpacity
            onPress={() => setShowTradeOffs(!showTradeOffs)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.toggleTradeOffs}>
              {showTradeOffs ? 'Hide Trade-offs ▲' : 'Compare Trade-offs ▼'}
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
            ? (analysis.isRecommended ? `⭐ Recommended • ${analysis.badgeLabel}` : `Alternative • ${analysis.badgeLabel}`)
            : `Route ${index + 1} • Alternative`;

          return (
            <TouchableOpacity
              key={route.id}
              style={[
                styles.routeCard,
                isRec && !isSelected && styles.recommendedRouteCard,
                isSelected && styles.selectedRouteCard,
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
                    isRec && styles.recommendedBadgeText,
                    isSelected && styles.selectedBadgeText,
                  ]}
                  numberOfLines={1}
                >
                  {badgeText}
                </Text>
              </View>

              <View style={styles.metricsRow}>
                <Text style={styles.durationBig}>{route.durationFormatted}</Text>
                <Text style={styles.distanceSmall}>({route.distanceFormatted})</Text>
              </View>

              {analysis ? (
                <View style={styles.intelRow}>
                  <Text style={styles.intelText}>
                    🛣️ {analysis.majorRoadPercent}% Main
                  </Text>
                  <Text style={styles.intelText}>
                    🏪 {analysis.openVenuesCount} Open
                  </Text>
                </View>
              ) : (
                <Text style={styles.turnsDetail}>{route.turnsCount} turn maneuvers</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Intelligence Trade-Off Comparison Box */}
      {showTradeOffs && alternativesAnalysis && alternativesAnalysis.length > 1 && (
        <View style={styles.tradeOffContainer}>
          <View style={styles.tradeOffHeader}>
            <Text style={styles.tradeOffTitle}>⚖️ Route Intelligence Trade-Offs</Text>
            {recommendedRoute && (
              <Text style={styles.recommendedNote}>
                {recommendedRoute.recommendationReason}
              </Text>
            )}
          </View>

          {alternativesAnalysis.map((alt) => (
            <View key={alt.routeId} style={styles.tradeOffItem}>
              <View style={styles.tradeOffRouteTitleRow}>
                <Text style={[styles.tradeOffRouteName, alt.isRecommended && styles.recommendedAccent]}>
                  Route {alt.routeIndex + 1}: {alt.badgeLabel} ({alt.durationFormatted})
                </Text>
                <Text style={styles.coveragePill}>
                  {alt.contextScore?.totalScore ?? 0}% Coverage
                </Text>
              </View>
              <Text style={styles.tradeOffDesc}>
                {alt.tradeOffSummary}
              </Text>
            </View>
          ))}

          <Text style={styles.groundTruthDisclosure}>
            ⚠️ Verification disclosure: Storefront hours and street features are crowd-sourced from OpenStreetMap and may be unverified on the ground.
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
    color: '#94A3B8',
    letterSpacing: 0.6,
  },
  toggleTradeOffs: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '600',
  },
  cardScroll: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  routeCard: {
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    minWidth: 175,
    minHeight: 80,
    justifyContent: 'center',
  },
  recommendedRouteCard: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: '#14232C',
  },
  selectedRouteCard: {
    borderColor: '#38BDF8',
    backgroundColor: '#131C2E',
  },
  cardBadge: {
    marginBottom: 4,
  },
  cardBadgeText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recommendedBadgeText: {
    color: '#10B981',
  },
  selectedBadgeText: {
    color: '#38BDF8',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  durationBig: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginRight: 6,
  },
  distanceSmall: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
  },
  intelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  intelText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  turnsDetail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },
  tradeOffContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tradeOffHeader: {
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  tradeOffTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  recommendedNote: {
    fontSize: 11,
    color: '#10B981',
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
    color: '#E2E8F0',
  },
  recommendedAccent: {
    color: '#38BDF8',
  },
  coveragePill: {
    fontSize: 10,
    color: '#94A3B8',
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  tradeOffDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },
  groundTruthDisclosure: {
    fontSize: 10,
    color: '#F59E0B',
    marginTop: 4,
    fontStyle: 'italic',
    lineHeight: 14,
  },
});

