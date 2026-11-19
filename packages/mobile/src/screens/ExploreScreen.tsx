import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MapComponent } from '../components/MapComponent';
import { RouteBottomSheet } from '../components/RouteBottomSheet';
import { SearchModal } from '../components/SearchModal';
import { useTheme } from '../theme/ThemeContext';
import { AppIcon } from '../components/common/AppIcon';
import type { LocationPoint } from '../services/geocodingService';
import type { ContextScoreBreakdown } from '../../../core/services/contextScoringService';

interface ExploreScreenProps {
  origin: LocationPoint | null;
  destination: LocationPoint | null;
  setOrigin: (coord: LocationPoint | null) => void;
  setDestination: (coord: LocationPoint | null) => void;
  searchTarget: 'origin' | 'destination';
  setSearchTarget: (target: 'origin' | 'destination') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: LocationPoint[];
  routingResult: any;
  selectedRouteId: string | null;
  setSelectedRouteId: (id: string) => void;
  activeRoute: any;
  isLoadingRoutes: boolean;
  statusMessage: string | null;
  userLocation?: { latitude: number; longitude: number } | null;
  computeRoutes: (opts?: any) => Promise<void>;
  handleUseGps: () => Promise<void>;
  imageryResult: any;
  isLoadingImagery: boolean;
  showImagery: boolean;
  setShowImagery: (show: boolean) => void;
  checkStreetImagery: () => Promise<void>;
  contextScore: ContextScoreBreakdown | null;
  daylightEstimate: any;
  amenitySummary: any;
  routeIntelligence?: any;
  alternativesAnalysis?: any;
  onStartWalking: () => void;
  onSaveRoute: () => void;
  onOpenPrivacy: () => void;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  origin,
  destination,
  setOrigin,
  setDestination,
  searchTarget,
  setSearchTarget,
  searchQuery,
  setSearchQuery,
  searchResults,
  routingResult,
  selectedRouteId,
  setSelectedRouteId,
  activeRoute,
  isLoadingRoutes,
  statusMessage,
  userLocation,
  computeRoutes,
  handleUseGps,
  imageryResult,
  isLoadingImagery,
  showImagery,
  setShowImagery,
  checkStreetImagery,
  contextScore,
  daylightEstimate,
  amenitySummary,
  routeIntelligence,
  alternativesAnalysis,
  onStartWalking,
  onSaveRoute,
  onOpenPrivacy,
}) => {
  const { theme } = useTheme();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAmenitiesOnMap, setShowAmenitiesOnMap] = useState(true);
  const [showPhotosOnMap, setShowPhotosOnMap] = useState(true);

  const mapRoutes = (routingResult?.routes || []).map((r: any) => ({
    id: r.id,
    coordinates: r.geometry.coordinates,
    isSelected: r.id === (selectedRouteId || routingResult?.routes[0]?.id),
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Edge-to-Edge Map View */}
      <View style={styles.mapContainer}>
        <MapComponent
          origin={origin ? { latitude: origin.latitude, longitude: origin.longitude } : null}
          destination={destination ? { latitude: destination.latitude, longitude: destination.longitude } : null}
          routes={mapRoutes}
          amenities={showAmenitiesOnMap ? amenitySummary?.features : undefined}
          streetPhotos={showPhotosOnMap ? imageryResult?.images : undefined}
          userLocation={userLocation}
          onSelectRoute={(id: string) => setSelectedRouteId(id)}
        />

        {/* Loading Indicator Overlay */}
        {isLoadingRoutes && (
          <View
            style={[
              styles.loadingOverlay,
              {
                backgroundColor: theme.isDark
                  ? 'rgba(9, 13, 22, 0.75)'
                  : 'rgba(255, 255, 255, 0.85)',
              },
            ]}
          >
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.text }]}>
              Calculating walking routes...
            </Text>
          </View>
        )}
      </View>

      {/* Floating Top Capsule (Theme aware) */}
      <View style={styles.topCapsuleWrapper}>
        <TouchableOpacity
          style={[
            styles.topCapsule,
            {
              backgroundColor: theme.isDark ? theme.card : '#FFFFFF',
              borderColor: theme.border,
              shadowColor: theme.isDark ? '#000000' : '#64748B',
            },
          ]}
          activeOpacity={0.85}
          onPress={() => setShowSearchModal(true)}
          accessibilityRole="button"
          accessibilityLabel="Open route search"
        >
          <View style={styles.capsuleRouteCol}>
            <View style={styles.capsuleRow}>
              <View style={[styles.dot, { backgroundColor: theme.primary }]} />
              <Text
                style={[styles.capsuleText, { color: theme.text }]}
                numberOfLines={1}
              >
                {origin ? origin.title : 'Choose start point'}
              </Text>
            </View>
            <View
              style={[
                styles.capsuleDivider,
                { backgroundColor: theme.borderLight },
              ]}
            />
            <View style={styles.capsuleRow}>
              <View style={[styles.dot, { backgroundColor: theme.success }]} />
              <Text
                style={[
                  styles.capsuleText,
                  { color: destination ? theme.text : theme.textMuted },
                ]}
                numberOfLines={1}
              >
                {destination ? destination.title : 'Where to?'}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.searchButtonCircle,
              { backgroundColor: theme.primary },
            ]}
          >
            <AppIcon name="search" size={18} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Floating Quick Action Buttons (Right Margin Thumb Zone) */}
      <View style={styles.floatingControls}>
        {/* Recenter GPS */}
        <TouchableOpacity
          style={[
            styles.fabBtn,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              shadowColor: theme.isDark ? '#000000' : '#64748B',
            },
          ]}
          onPress={handleUseGps}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Recenter on current GPS location"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppIcon name="target" size={20} color={theme.text} />
        </TouchableOpacity>

        {/* Toggle Amenity Markers */}
        <TouchableOpacity
          style={[
            styles.fabBtn,
            {
              backgroundColor: showAmenitiesOnMap
                ? theme.isDark
                  ? 'rgba(2, 132, 199, 0.25)'
                  : theme.primaryLight
                : theme.card,
              borderColor: showAmenitiesOnMap ? theme.primary : theme.border,
              shadowColor: theme.isDark ? '#000000' : '#64748B',
            },
          ]}
          onPress={() => setShowAmenitiesOnMap(!showAmenitiesOnMap)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Toggle amenity points on map"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppIcon
            name="venue"
            size={20}
            color={showAmenitiesOnMap ? theme.primary : theme.textSecondary}
          />
        </TouchableOpacity>

        {/* Toggle Street Photos */}
        <TouchableOpacity
          style={[
            styles.fabBtn,
            {
              backgroundColor: showPhotosOnMap
                ? theme.isDark
                  ? 'rgba(2, 132, 199, 0.25)'
                  : theme.primaryLight
                : theme.card,
              borderColor: showPhotosOnMap ? theme.primary : theme.border,
              shadowColor: theme.isDark ? '#000000' : '#64748B',
            },
          ]}
          onPress={() => {
            setShowPhotosOnMap(!showPhotosOnMap);
            if (!imageryResult) checkStreetImagery();
          }}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Toggle street photos on map"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppIcon
            name="camera"
            size={20}
            color={showPhotosOnMap ? theme.primary : theme.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Interactive Bottom Sheet (Route alternatives & context) */}
      <RouteBottomSheet
        routingResult={routingResult}
        activeRoute={activeRoute}
        selectedRouteId={selectedRouteId}
        onSelectRoute={setSelectedRouteId}
        contextScore={contextScore}
        daylightEstimate={daylightEstimate}
        imageryResult={imageryResult}
        isLoadingImagery={isLoadingImagery}
        showImagery={showImagery}
        onToggleImagery={checkStreetImagery}
        onCloseImagery={() => setShowImagery(false)}
        onStartWalking={onStartWalking}
        onSaveRoute={onSaveRoute}
        onOpenPrivacy={onOpenPrivacy}
        statusMessage={statusMessage}
        onRetry={() => computeRoutes()}
        routeIntelligence={routeIntelligence}
        alternativesAnalysis={alternativesAnalysis}
      />

      {/* Full-Screen Search Modal */}
      <SearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        searchTarget={searchTarget}
        setSearchTarget={setSearchTarget}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        onSelectResult={(item) => {
          if (searchTarget === 'origin') {
            setOrigin(item);
            setSearchTarget('destination');
          } else {
            setDestination(item);
          }
          setSearchQuery('');
        }}
        onUseGps={handleUseGps}
        onSelectPreset={(o, d) => {
          setOrigin(o);
          setDestination(d);
        }}
        origin={origin}
        destination={destination}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  mapContainer: {
    ...StyleSheet.absoluteFill,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 10,
    fontWeight: '600',
  },
  topCapsuleWrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 48 : 20,
    left: 16,
    right: 16,
    zIndex: 80,
  },
  topCapsule: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  capsuleRouteCol: {
    flex: 1,
    gap: 4,
  },
  capsuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  capsuleText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  capsuleDivider: {
    height: 1,
    marginLeft: 16,
    marginVertical: 2,
  },
  searchButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  floatingControls: {
    position: 'absolute',
    right: 16,
    top: Platform.OS === 'ios' ? 140 : 112,
    zIndex: 80,
    gap: 12,
  },
  fabBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },
});
