import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import type { RouteIntelligenceReport } from '../../../core/services/routeIntelligenceService';
import { useTheme } from '../theme/ThemeContext';
import { AppIcon } from './common/AppIcon';

interface RouteEvidenceDrawerProps {
  intelligence: RouteIntelligenceReport | null;
}

export const RouteEvidenceDrawer: React.FC<RouteEvidenceDrawerProps> = ({
  intelligence,
}) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'venues' | 'roads' | 'support' | 'audit'>('venues');

  if (!intelligence) return null;

  const { venueIntelligence, roadShare, supportIntelligence, reproducibility } = intelligence;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
    >
      {/* Drawer Toggle Header Button */}
      <TouchableOpacity
        style={styles.toggleHeader}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Toggle Why This Route Evidence Drawer"
      >
        <View style={styles.headerLeft}>
          <AppIcon name="search" size={18} color={theme.primary} />
          <View>
            <Text style={[styles.drawerTitle, { color: theme.text }]}>Why This Route? (Evidence Drawer)</Text>
            <Text style={[styles.drawerSubtitle, { color: theme.textSecondary }]}>
              Open hours at arrival • Road mix • Longest gap • Verified audit
            </Text>
          </View>
        </View>
        <Text style={[styles.chevron, { color: theme.textMuted }]}>{isExpanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Expanded Body */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Sub Navigation Segmented Control */}
          <View style={[styles.subTabBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TouchableOpacity
              style={[
                styles.subTabItem,
                activeSubTab === 'venues' && {
                  backgroundColor: theme.card,
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => setActiveSubTab('venues')}
            >
              <Text
                style={[
                  styles.subTabText,
                  { color: theme.textMuted },
                  activeSubTab === 'venues' && { color: theme.primary, fontWeight: '700' },
                ]}
              >
                Venues ({venueIntelligence.totalVenuesCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.subTabItem,
                activeSubTab === 'roads' && {
                  backgroundColor: theme.card,
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => setActiveSubTab('roads')}
            >
              <Text
                style={[
                  styles.subTabText,
                  { color: theme.textMuted },
                  activeSubTab === 'roads' && { color: theme.primary, fontWeight: '700' },
                ]}
              >
                Road Mix
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.subTabItem,
                activeSubTab === 'support' && {
                  backgroundColor: theme.card,
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => setActiveSubTab('support')}
            >
              <Text
                style={[
                  styles.subTabText,
                  { color: theme.textMuted },
                  activeSubTab === 'support' && { color: theme.primary, fontWeight: '700' },
                ]}
              >
                Verified ({supportIntelligence.verifiedPointsCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.subTabItem,
                activeSubTab === 'audit' && {
                  backgroundColor: theme.card,
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => setActiveSubTab('audit')}
            >
              <Text
                style={[
                  styles.subTabText,
                  { color: theme.textMuted },
                  activeSubTab === 'audit' && { color: theme.primary, fontWeight: '700' },
                ]}
              >
                Audit
              </Text>
            </TouchableOpacity>
          </View>

          {/* SubTab 1: Venues & Opening Hours Intelligence */}
          {activeSubTab === 'venues' && (
            <View style={styles.tabPane}>
              {/* Summary KPIs */}
              <View style={styles.kpiRow}>
                <View style={[styles.kpiBox, { borderColor: theme.success, backgroundColor: theme.surface }]}>
                  <Text style={[styles.kpiVal, { color: theme.success }]}>{venueIntelligence.openCount}</Text>
                  <Text style={[styles.kpiLbl, { color: theme.textSecondary }]}>Listed Open</Text>
                </View>
                <View style={[styles.kpiBox, { borderColor: theme.danger, backgroundColor: theme.surface }]}>
                  <Text style={[styles.kpiVal, { color: theme.danger }]}>{venueIntelligence.closedCount}</Text>
                  <Text style={[styles.kpiLbl, { color: theme.textSecondary }]}>Listed Closed</Text>
                </View>
                <View style={[styles.kpiBox, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                  <Text style={[styles.kpiVal, { color: theme.textMuted }]}>{venueIntelligence.unknownCount}</Text>
                  <Text style={[styles.kpiLbl, { color: theme.textSecondary }]}>Hours Unknown</Text>
                </View>
              </View>

              {/* Continuity / Gap Metric */}
              <View style={[styles.gapNoticeBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.gapTitle, { color: theme.textSecondary }]}>
                  Longest Mapped-Venue Gap: <Text style={{ color: theme.text, fontWeight: '800' }}>{venueIntelligence.longestGapMeters} m</Text>
                </Text>
                <Text style={[styles.gapDesc, { color: theme.textMuted }]}>
                  Average venue spacing is ~{venueIntelligence.averageGapMeters}m along this corridor.
                </Text>
              </View>

              {/* Detailed Venues List */}
              <View style={styles.venueList}>
                {venueIntelligence.venues.length === 0 ? (
                  <Text style={[styles.emptyNotice, { color: theme.textMuted }]}>
                    No commercial venues or facilities mapped along this corridor.
                  </Text>
                ) : (
                  venueIntelligence.venues.slice(0, 5).map((v, i) => (
                    <View key={v.id || i} style={[styles.venueRow, { borderBottomColor: theme.borderLight }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.venueName, { color: theme.text }]} numberOfLines={1}>{v.name}</Text>
                        <Text style={[styles.venueMeta, { color: theme.textSecondary }]}>
                          +{v.alongRouteDistanceMeters}m along route • ETA {new Date(v.estimatedPassingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              v.openingStatus === 'OPEN'
                                ? theme.successLight
                                : v.openingStatus === 'CLOSED'
                                ? theme.dangerLight
                                : theme.surface,
                            borderColor:
                              v.openingStatus === 'OPEN'
                                ? theme.success
                                : v.openingStatus === 'CLOSED'
                                ? theme.danger
                                : theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            {
                              color:
                                v.openingStatus === 'OPEN'
                                  ? theme.success
                                  : v.openingStatus === 'CLOSED'
                                  ? theme.danger
                                  : theme.textMuted,
                            },
                          ]}
                        >
                          {v.openingStatus}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>

              <Text style={[styles.strictRuleNote, { color: theme.warning }]}>
                [RULE] NightWise Rule: Venues with missing or old opening hours are never treated as open.
              </Text>
              <Text style={[styles.disclaimerText, { color: theme.textMuted }]}>
                {venueIntelligence.disclaimer || 'OpenStreetMap opening hours are crowd-sourced and may be outdated, seasonal, or unverified on the ground.'}
              </Text>
            </View>
          )}

          {/* SubTab 2: Major-Road Share Breakdown */}
          {activeSubTab === 'roads' && (
            <View style={styles.tabPane}>
              <View style={[styles.roadBarContainer, { backgroundColor: theme.surface }]}>
                <View style={[styles.roadBarSegment, { width: `${roadShare.majorRoadPercent}%`, backgroundColor: theme.primary }]} />
                <View style={[styles.roadBarSegment, { width: `${roadShare.footwayPercent}%`, backgroundColor: theme.success }]} />
                <View style={[styles.roadBarSegment, { width: `${roadShare.localRoadPercent}%`, backgroundColor: theme.warning }]} />
                <View style={[styles.roadBarSegment, { width: `${roadShare.otherPercent}%`, backgroundColor: theme.textMuted }]} />
              </View>

              <View style={styles.roadLegendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: theme.primary }]} />
                  <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                    Major Roads: {roadShare.majorRoadPercent}% ({roadShare.majorDistanceMeters}m)
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: theme.success }]} />
                  <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                    Dedicated Footways: {roadShare.footwayPercent}% ({roadShare.footwayDistanceMeters}m)
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: theme.warning }]} />
                  <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                    Local Streets: {roadShare.localRoadPercent}% ({roadShare.localDistanceMeters}m)
                  </Text>
                </View>
              </View>

              <Text style={[styles.disclaimerText, { color: theme.textMuted }]}>{roadShare.disclaimer}</Text>
            </View>
          )}

          {/* SubTab 3: Verified Support Registry */}
          {activeSubTab === 'support' && (
            <View style={styles.tabPane}>
              {supportIntelligence.supportPoints.length === 0 ? (
                <Text style={[styles.emptyNotice, { color: theme.textMuted }]}>
                  No government-verified support centres or 24/7 public desks within 250m of this corridor. Ordinary OSM nodes remain marked as unverified.
                </Text>
              ) : (
                supportIntelligence.supportPoints.map((sp) => (
                  <View key={sp.id} style={[styles.supportCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.supportHeader}>
                      <Text style={[styles.supportName, { color: theme.text }]}>{sp.name}</Text>
                      <View style={[styles.verifiedTag, { backgroundColor: theme.successLight }]}>
                        <Text style={[styles.verifiedTagText, { color: theme.success }]}>Confirmed Access</Text>
                      </View>
                    </View>
                    <Text style={[styles.supportDetail, { color: theme.textSecondary }]}>Hours: {sp.operatingHours}</Text>
                    <Text style={[styles.supportDetail, { color: theme.textSecondary }]}>Source: {sp.verificationSource}</Text>
                    <Text style={[styles.supportDetail, { color: theme.textSecondary }]}>Expires: {new Date(sp.expiresAt).toLocaleDateString()}</Text>
                    {sp.evidenceUrl ? (
                      <TouchableOpacity
                        onPress={() => Linking.openURL(sp.evidenceUrl)}
                        accessibilityRole="link"
                      >
                        <Text style={[styles.evidenceLink, { color: theme.primary }]}>View Verification Document ↗</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ))
              )}
              <Text style={[styles.disclaimerText, { color: theme.textMuted }]}>{supportIntelligence.disclaimer}</Text>
            </View>
          )}

          {/* SubTab 4: Reproducibility & Audit Versions */}
          {activeSubTab === 'audit' && (
            <View style={styles.tabPane}>
              <View style={[styles.auditRow, { borderBottomColor: theme.borderLight }]}>
                <Text style={[styles.auditLabel, { color: theme.textSecondary }]}>Scorer Version:</Text>
                <Text style={[styles.auditValue, { color: theme.text }]}>{reproducibility.scorer_version}</Text>
              </View>
              <View style={[styles.auditRow, { borderBottomColor: theme.borderLight }]}>
                <Text style={[styles.auditLabel, { color: theme.textSecondary }]}>OSM Hours Parser:</Text>
                <Text style={[styles.auditValue, { color: theme.text }]}>{reproducibility.opening_hours_parser_version}</Text>
              </View>
              <View style={[styles.auditRow, { borderBottomColor: theme.borderLight }]}>
                <Text style={[styles.auditLabel, { color: theme.textSecondary }]}>Graph Version:</Text>
                <Text style={[styles.auditValue, { color: theme.text }]}>{reproducibility.graph_version}</Text>
              </View>
              <View style={[styles.auditRow, { borderBottomColor: theme.borderLight }]}>
                <Text style={[styles.auditLabel, { color: theme.textSecondary }]}>Walking Speed Assumed:</Text>
                <Text style={[styles.auditValue, { color: theme.text }]}>{reproducibility.walking_speed_ms} m/s</Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    marginVertical: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  drawerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  drawerSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  chevron: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  expandedContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  subTabBar: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
    marginBottom: 12,
    borderWidth: 1,
  },
  subTabItem: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  subTabText: {
    fontSize: 10,
    fontWeight: '600',
  },
  tabPane: {
    gap: 10,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
  },
  kpiBox: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  kpiVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  kpiLbl: {
    fontSize: 10,
    marginTop: 2,
  },
  gapNoticeBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  gapTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  gapDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  venueList: {
    marginVertical: 4,
  },
  venueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  venueName: {
    fontSize: 13,
    fontWeight: '600',
  },
  venueMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  strictRuleNote: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  disclaimerText: {
    fontSize: 10,
    fontStyle: 'italic',
    lineHeight: 14,
  },
  roadBarContainer: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 6,
  },
  roadBarSegment: {
    height: '100%',
  },
  roadLegendRow: {
    gap: 6,
    marginVertical: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
  },
  supportCard: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    gap: 3,
  },
  supportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  supportName: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  verifiedTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  supportDetail: {
    fontSize: 11,
  },
  evidenceLink: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  auditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  auditLabel: {
    fontSize: 12,
  },
  auditValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyNotice: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
});
