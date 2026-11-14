import { useState, useEffect } from 'react';
import {
  estimateDaylightState,
  SolarEstimate,
} from '../../../core/services/twilightService';
import {
  calculateContextCoverage,
  ContextScoreBreakdown,
} from '../../../core/services/contextScoringService';
import {
  computeRouteIntelligence,
  rankAndCompareRouteAlternatives,
  RouteIntelligenceReport,
  RouteAlternativeAnalysis,
  SPEED_PRESETS,
} from '../../../core/services/routeIntelligenceService';
import {
  getAmenitiesAlongRoute,
  RouteAmenitySummary,
} from '../services/amenityAdapter';
import type { LocationPoint } from '../services/geocodingService';
import type { RouteImageryResult } from '../services/imageryAdapter';

export interface UseRouteContextReturn {
  daylightEstimate: SolarEstimate | null;
  amenitySummary: RouteAmenitySummary | null;
  contextScore: ContextScoreBreakdown | null;
  routeIntelligence: RouteIntelligenceReport | null;
  alternativesAnalysis: RouteAlternativeAnalysis[] | null;
}

export function useRouteContext(
  activeRoute: any,
  origin: LocationPoint | null,
  imageryResult: RouteImageryResult | null,
  allRoutes?: any[]
): UseRouteContextReturn {
  const [amenitySummary, setAmenitySummary] = useState<RouteAmenitySummary | null>(null);
  const [contextScore, setContextScore] = useState<ContextScoreBreakdown | null>(null);
  const [routeIntelligence, setRouteIntelligence] = useState<RouteIntelligenceReport | null>(null);
  const [alternativesAnalysis, setAlternativesAnalysis] = useState<RouteAlternativeAnalysis[] | null>(null);

  const daylightEstimate: SolarEstimate | null = origin
    ? estimateDaylightState(origin.latitude, origin.longitude)
    : null;

  useEffect(() => {
    let active = true;

    const candidateRoutes = Array.isArray(allRoutes) && allRoutes.length > 0
      ? allRoutes
      : (activeRoute ? [activeRoute] : []);

    if (candidateRoutes.length > 0 && candidateRoutes[0]?.geometry?.coordinates) {
      // 1. Fetch amenities for all candidate routes concurrently
      Promise.all(
        candidateRoutes.map(async (route) => {
          if (!route?.geometry?.coordinates) return { routeId: route.id, amenities: null };
          const am = await getAmenitiesAlongRoute(route.geometry.coordinates);
          return { routeId: route.id, amenities: am };
        })
      ).then((amenitiesList) => {
        if (!active) return;

        const amenitiesMap: Record<string, any[]> = {};
        let activeSummary: RouteAmenitySummary | null = null;

        for (const item of amenitiesList) {
          if (item.amenities) {
            amenitiesMap[item.routeId] = item.amenities.features || [];
            if (item.routeId === activeRoute?.id) {
              activeSummary = item.amenities;
            }
          }
        }

        if (!activeSummary && amenitiesList.length > 0 && amenitiesList[0].amenities) {
          activeSummary = amenitiesList[0].amenities;
        }

        setAmenitySummary(activeSummary);

        // 2. Rank and compare all alternatives using the intelligence engine
        const analysis = rankAndCompareRouteAlternatives({
          routes: candidateRoutes,
          amenitiesByRoute: amenitiesMap,
          options: {
            walkingSpeedMs: SPEED_PRESETS.standard,
            departureTime: new Date().toISOString(),
            solar: {
              state: daylightEstimate?.solarState || 'UNKNOWN',
              elevationDeg: daylightEstimate?.solarElevationDeg || 0,
            },
            imagery: {
              available: imageryResult?.hasImagery || false,
              capturedAt: imageryResult?.images?.[0]?.captureDate || undefined,
              coverageRatio: imageryResult?.coverageRatio,
              sampledCount: imageryResult?.sampledCount,
              availableCount: imageryResult?.availableCount,
              scope: imageryResult?.scope,
            },
          },
        });

        setAlternativesAnalysis(analysis);

        // 3. Resolve context metrics for the active selected route
        const activeAnalysis = analysis.find((a) => a.routeId === activeRoute?.id) || analysis[0];
        if (activeAnalysis) {
          setContextScore(activeAnalysis.contextScore);
          setRouteIntelligence(activeAnalysis.intelligence);
        }
      });
    } else {
      setAmenitySummary(null);
      setContextScore(null);
      setRouteIntelligence(null);
      setAlternativesAnalysis(null);
    }

    return () => {
      active = false;
    };
  }, [
    activeRoute?.id,
    activeRoute?.distanceMeters,
    activeRoute?.durationSeconds,
    allRoutes?.length,
    daylightEstimate?.solarState,
    daylightEstimate?.solarElevationDeg,
    imageryResult?.hasImagery,
    imageryResult?.coverageRatio,
    imageryResult?.sampledCount,
    imageryResult?.images,
  ]);

  return {
    daylightEstimate,
    amenitySummary,
    contextScore,
    routeIntelligence,
    alternativesAnalysis,
  };
}
