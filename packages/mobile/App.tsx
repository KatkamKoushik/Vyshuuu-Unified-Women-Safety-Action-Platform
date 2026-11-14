import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { useWalkingRoute } from './src/hooks/useWalkingRoute';
import { useStreetImagery } from './src/hooks/useStreetImagery';
import { useRouteContext } from './src/hooks/useRouteContext';
import { saveJourney } from './src/services/storageService';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { NavigateScreen } from './src/screens/NavigateScreen';
import { SavedJourneysScreen } from './src/screens/SavedJourneysScreen';
import { ProtectScreen } from './src/screens/ProtectScreen';
import { ActScreen } from './src/screens/ActScreen';
import { BottomTabBar, ActiveTab } from './src/navigation/BottomTabBar';
import { SettingsModal } from './src/components/SettingsModal';
import { QuickExitBar } from './src/components/common/QuickExitBar';
import { CalculatorDisguiseModal } from './src/components/common/CalculatorDisguiseModal';
import { NavigatorModal } from './src/components/common/NavigatorModal';
import { EmergencySosModal } from './src/components/common/EmergencySosModal';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';

function MainAppContent() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<ActiveTab>('explore');
  const [showSettings, setShowSettings] = useState(false);
  const [showDisguise, setShowDisguise] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const [showSos, setShowSos] = useState(false);

  // Cross-module preloaded payload state
  const [protectInitialText, setProtectInitialText] = useState<string | undefined>(undefined);
  const [actInitialStatement, setActInitialStatement] = useState<string | undefined>(undefined);

  const {
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
    handleSelectSavedJourney,
  } = useWalkingRoute();

  const {
    imageryResult,
    isLoadingImagery,
    showImagery,
    setShowImagery,
    checkStreetImagery,
  } = useStreetImagery(origin, activeRoute);

  const {
    daylightEstimate,
    amenitySummary,
    contextScore,
    routeIntelligence,
    alternativesAnalysis,
  } = useRouteContext(activeRoute, origin, imageryResult, routingResult?.routes);

  // Save active route to local SQLite
  const handleSaveRoute = async () => {
    if (!activeRoute || !origin || !destination) {
      Alert.alert('Cannot Save', 'No active route to save.');
      return;
    }

    try {
      await saveJourney({
        id: `journey_${Date.now()}`,
        title: `${origin.title} to ${destination.title}`,
        origin_name: origin.title,
        origin_lat: origin.latitude,
        origin_lon: origin.longitude,
        dest_name: destination.title,
        dest_lat: destination.latitude,
        dest_lon: destination.longitude,
        distance_m: activeRoute.distanceMeters,
        duration_s: activeRoute.durationSeconds,
        context_score: contextScore?.totalScore || 0,
        is_favorite: 0,
      });
      Alert.alert(
        'Corridor Saved',
        'This walking route is saved to your local on-device SQLite database.'
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save route locally.');
    }
  };

  const handleNavigatorNavigate = (tab: 'move' | 'protect' | 'act', payload?: any) => {
    if (tab === 'move') {
      setActiveTab('explore');
    } else if (tab === 'protect') {
      if (payload?.initialText) setProtectInitialText(payload.initialText);
      setActiveTab('protect');
    } else if (tab === 'act') {
      if (payload?.initialStatement) setActInitialStatement(payload.initialStatement);
      setActiveTab('act');
    }
  };

  // Real-time off-route dynamic re-routing from current GPS position
  const handleRecalculateFromGps = async (lat: number, lon: number) => {
    if (!destination) return;
    const currentPoint = {
      title: 'Current Position',
      subtitle: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      latitude: lat,
      longitude: lon,
    };
    setOrigin(currentPoint);
    await computeRoutes();
  };

  return (
    <SafeAreaView style={[styles.rootContainer, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />

      {/* Quick Exit, Brand & Emergency Bar */}
      <QuickExitBar
        onToggleDisguise={() => setShowDisguise(true)}
        onOpenNavigator={() => setShowNavigator(true)}
        onOpenSos={() => setShowSos(true)}
      />

      {/* Screen Body Router */}
      <View style={[styles.screenContainer, { backgroundColor: theme.bg }]}>
        {activeTab === 'explore' && (
          <ExploreScreen
            origin={origin}
            destination={destination}
            setOrigin={setOrigin}
            setDestination={setDestination}
            searchTarget={searchTarget}
            setSearchTarget={setSearchTarget}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            routingResult={routingResult}
            selectedRouteId={selectedRouteId}
            setSelectedRouteId={setSelectedRouteId}
            activeRoute={activeRoute}
            isLoadingRoutes={isLoadingRoutes}
            statusMessage={statusMessage}
            userLocation={userLocation}
            computeRoutes={computeRoutes}
            handleUseGps={handleUseGps}
            imageryResult={imageryResult}
            isLoadingImagery={isLoadingImagery}
            showImagery={showImagery}
            setShowImagery={setShowImagery}
            checkStreetImagery={checkStreetImagery}
            contextScore={contextScore}
            daylightEstimate={daylightEstimate}
            amenitySummary={amenitySummary}
            routeIntelligence={routeIntelligence}
            alternativesAnalysis={alternativesAnalysis}
            onStartWalking={() => setActiveTab('navigate')}
            onSaveRoute={handleSaveRoute}
            onOpenPrivacy={() => setShowSettings(true)}
          />
        )}

        {activeTab === 'navigate' && (
          <NavigateScreen
            activeRoute={activeRoute}
            originTitle={origin?.title}
            destTitle={destination?.title}
            contextScore={contextScore}
            daylightEstimate={daylightEstimate}
            onExitNavigate={() => setActiveTab('explore')}
            onOpenExplore={() => setActiveTab('explore')}
            onRecalculateRoute={handleRecalculateFromGps}
            onOpenSos={() => setShowSos(true)}
          />
        )}

        {activeTab === 'protect' && (
          <ProtectScreen
            initialText={protectInitialText}
            onOpenPrivacy={() => setShowSettings(true)}
          />
        )}

        {activeTab === 'act' && (
          <ActScreen
            initialStatement={actInitialStatement}
            onOpenPrivacy={() => setShowSettings(true)}
          />
        )}

        {activeTab === 'saved' && (
          <SavedJourneysScreen
            onSelectJourney={(saved) => {
              handleSelectSavedJourney(saved);
              setActiveTab('explore');
            }}
            onOpenPrivacySettings={() => setShowSettings(true)}
          />
        )}
      </View>

      {/* Persistent Bottom Tab Bar with Safe Area Clearance */}
      <BottomTabBar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        hasActiveRoute={Boolean(activeRoute)}
      />

      {/* 1-Tap Calculator Disguise Screen Modal */}
      <CalculatorDisguiseModal
        visible={showDisguise}
        onDismiss={() => setShowDisguise(false)}
      />

      {/* Emergency SOS Hub Modal with Live GPS Broadcast */}
      <EmergencySosModal
        visible={showSos}
        onDismiss={() => setShowSos(false)}
        onOpenDisguise={() => setShowDisguise(true)}
        currentGps={userLocation}
      />

      {/* AI Safety Navigator Modal */}
      <NavigatorModal
        visible={showNavigator}
        onClose={() => setShowNavigator(false)}
        onNavigateToTab={handleNavigatorNavigate}
      />

      {/* Settings & Explainable Scoring Modal */}
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <MainAppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
  },
  screenContainer: {
    flex: 1,
  },
});
