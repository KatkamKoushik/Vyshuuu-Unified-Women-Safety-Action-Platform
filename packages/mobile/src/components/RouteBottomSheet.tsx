import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import type { ContextScoreBreakdown } from '../../../core/services/contextScoringService';
import { useTheme } from '../theme/ThemeContext';
import { AppIcon } from './common/AppIcon';
import { RouteActionsBar } from './RouteActionsBar';
import { ContextScoreCard } from './ContextScoreCard';
import { RouteImageryPanel } from './RouteImageryPanel';
import { RouteComparisonCards } from './RouteComparisonCards';
import { RouteManeuversList } from './RouteManeuversList';
import { RouteEvidenceDrawer } from './RouteEvidenceDrawer';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SNAP_PEEK = 110;
const SNAP_MID = Math.min(380, SCREEN_HEIGHT * 0.45);
const SNAP_FULL = Math.min(640, SCREEN_HEIGHT * 0.82);

interface RouteBottomSheetProps {
  routingResult: any;
  activeRoute: any;
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
  contextScore: ContextScoreBreakdown | null;
  daylightEstimate: any;
  imageryResult: any;
  isLoadingImagery: boolean;
  showImagery: boolean;
  onToggleImagery: () => void;
  onCloseImagery: () => void;
  onStartWalking: () => void;
  onSaveRoute: () => void;
  onOpenPrivacy: () => void;
  statusMessage: string | null;
  onRetry: () => void;
  routeIntelligence?: any;
  alternativesAnalysis?: any;
}

export const RouteBottomSheet: React.FC<RouteBottomSheetProps> = ({
  routingResult,
  activeRoute,
  selectedRouteId,
  onSelectRoute,
  contextScore,
  daylightEstimate,
  imageryResult,
  isLoadingImagery,
  showImagery,
  onToggleImagery,
  onCloseImagery,
  onStartWalking,
  onSaveRoute,
  onOpenPrivacy,
  statusMessage,
  onRetry,
  routeIntelligence,
  alternativesAnalysis,
}) => {
  const { theme } = useTheme();
  const [currentSnap, setCurrentSnap] = useState<'peek' | 'mid' | 'full'>('mid');
  const [showManeuvers, setShowManeuvers] = useState(false);

  const sheetHeight = useRef(new Animated.Value(SNAP_MID)).current;

  const animateTo = (targetHeight: number, snap: 'peek' | 'mid' | 'full') => {
    Animated.spring(sheetHeight, {
      toValue: targetHeight,
      damping: 20,
      stiffness: 150,
      mass: 0.8,
      useNativeDriver: false,
    }).start();
    setCurrentSnap(snap);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 10,
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < -50) {
          // Dragged up
          if (currentSnap === 'peek') animateTo(SNAP_MID, 'mid');
          else animateTo(SNAP_FULL, 'full');
        } else if (gesture.dy > 50) {
          // Dragged down
          if (currentSnap === 'full') animateTo(SNAP_MID, 'mid');
          else animateTo(SNAP_PEEK, 'peek');
        }
      },
    })
  ).current;

  if (!routingResult && !statusMessage) {
    return null;
  }

  const formatDistance = (m: number) => {
    if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
    return `${Math.round(m)} m`;
  };

  const formatDuration = (s: number) => {
    const min = Math.ceil(s / 60);
    return `${min} min`;
  };

  const isDaylight = daylightEstimate?.solarState === 'DAYLIGHT' || daylightEstimate?.solarState === 'CIVIL_TWILIGHT';
  const solarStateLabel =
    daylightEstimate?.solarState === 'DAYLIGHT'
      ? 'Natural Daylight'
      : daylightEstimate?.solarState === 'CIVIL_TWILIGHT'
      ? 'Civil Twilight'
      : daylightEstimate?.solarState === 'NAUTICAL_TWILIGHT'
      ? 'Nautical Twilight'
      : 'Astronomical Night';

  return (
    <Animated.View
      style={[
        styles.sheetContainer,
        {
          height: sheetHeight,
          backgroundColor: theme.bg,
          borderTopColor: theme.border,
          shadowColor: theme.isDark ? '#000000' : '#64748B',
        },
      ]}
    >
      {/* Draggable Top Handle */}
      <View {...panResponder.panHandlers} style={styles.handleZone}>
        <View style={[styles.handleBar, { backgroundColor: theme.borderLight }]} />
      </View>

      {/* Status / Error Banner */}
      {statusMessage && (
        <View style={[styles.errorBanner, { backgroundColor: theme.dangerLight, borderColor: theme.danger }]}>
          <Text style={[styles.errorText, { color: theme.danger }]}>{statusMessage}</Text>
          {(statusMessage.includes('rate-limited') || statusMessage.includes('timeout')) && (
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: theme.danger }]}
              onPress={onRetry}
              accessibilityRole="button"
              accessibilityLabel="Retry route calculation"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Peek Summary Bar */}
      {activeRoute && (
        <View style={[styles.peekHeader, { borderBottomColor: theme.borderLight }]}>
          <View style={styles.metricGroup}>
            <Text style={[styles.durationValue, { color: theme.text }]}>
              {formatDuration(activeRoute.durationSeconds)}
            </Text>
            <Text style={[styles.distanceSmall, { color: theme.textSecondary }]}>
              {formatDistance(activeRoute.distanceMeters)}
            </Text>
            {contextScore && (
              <View
                style={[
                  styles.scorePill,
                  {
                    backgroundColor:
                      contextScore.totalScore >= 70
                        ? theme.successLight
                        : contextScore.totalScore >= 35
                        ? theme.warningLight
                        : theme.dangerLight,
                    borderColor:
                      contextScore.totalScore >= 70
                        ? theme.success
                        : contextScore.totalScore >= 35
                        ? theme.warning
                        : theme.danger,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.scorePillText,
                    {
                      color:
                        contextScore.totalScore >= 70
                          ? theme.success
                          : contextScore.totalScore >= 35
                          ? theme.warning
                          : theme.danger,
                    },
                  ]}
                >
                  {contextScore.totalScore}% Coverage
                </Text>
              </View>
            )}
          </View>

          {/* Quick Start Walking Button */}
          <TouchableOpacity
            style={[styles.startWalkingCTA, { backgroundColor: theme.primary }]}
            onPress={onStartWalking}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Start pedestrian walking guidance"
            hitSlop={{ top: 4, bottom: 4, left: 8, right: 8 }}
          >
            <Text style={styles.startWalkingCTAText}>Start Walk</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Scrollable Sheet Body for Mid / Full States */}
      <ScrollView
        style={styles.scrollBody}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Daylight / Solar Chip */}
        {daylightEstimate && (
          <View style={[styles.solarChip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <AppIcon name={isDaylight ? 'sun' : 'moon'} size={14} color={isDaylight ? theme.warning : theme.primary} />
            <Text style={[styles.solarText, { color: theme.textSecondary }]}>
              {solarStateLabel} ({daylightEstimate.solarElevationDeg > 0 ? `+${daylightEstimate.solarElevationDeg}°` : `${daylightEstimate.solarElevationDeg}°`}) • NOAA Math
            </Text>
          </View>
        )}

        {/* Action Buttons Row */}
        <RouteActionsBar
          onStartWalking={onStartWalking}
          onSaveRoute={onSaveRoute}
          onTogglePhotos={onToggleImagery}
          onOpenPrivacy={onOpenPrivacy}
          showManeuvers={showManeuvers}
          onToggleManeuvers={() => setShowManeuvers(!showManeuvers)}
        />

        {/* Context Coverage Breakdown Card */}
        {contextScore && <ContextScoreCard score={contextScore} />}

        {/* Why This Route Evidence Drawer */}
        {routeIntelligence && (
          <RouteEvidenceDrawer intelligence={routeIntelligence} />
        )}

        {/* Panoramax Street Photos Strip */}
        {showImagery && (
          <RouteImageryPanel
            isLoading={isLoadingImagery}
            result={imageryResult}
            onClose={onCloseImagery}
          />
        )}

        {/* Route Alternative Comparison Cards */}
        {routingResult?.routes?.length > 1 && (
          <RouteComparisonCards
            routes={routingResult.routes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={onSelectRoute}
            alternativesAnalysis={alternativesAnalysis}
          />
        )}

        {/* Step-by-Step Maneuver Instructions */}
        {showManeuvers && activeRoute && (
          <RouteManeuversList steps={activeRoute.steps} />
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
    zIndex: 90,
  },
  handleZone: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
  },
  peekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  metricGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  durationValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  distanceSmall: {
    fontSize: 15,
    fontWeight: '500',
  },
  scorePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  scorePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  startWalkingCTA: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    minHeight: 44,
    minWidth: 105,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startWalkingCTAText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  errorBanner: {
    borderWidth: 1,
    padding: 10,
    marginHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    fontSize: 12,
    flex: 1,
  },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minHeight: 36,
    justifyContent: 'center',
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  solarChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  solarText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
