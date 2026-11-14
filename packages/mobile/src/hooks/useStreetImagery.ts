import { useState, useEffect, useCallback } from 'react';
import {
  activeImageryProvider,
  RouteImageryResult,
  RouteImagerySamplePoint,
  PanoramaxImage,
} from '../services/imageryAdapter';
import type { LocationPoint } from '../services/geocodingService';

export interface UseStreetImageryReturn {
  imageryResult: RouteImageryResult | null;
  isLoadingImagery: boolean;
  showImagery: boolean;
  setShowImagery: (show: boolean) => void;
  checkStreetImagery: () => Promise<void>;
}

export function useStreetImagery(
  origin: LocationPoint | null,
  activeRoute?: any
): UseStreetImageryReturn {
  const [imageryResult, setImageryResult] = useState<RouteImageryResult | null>(null);
  const [isLoadingImagery, setIsLoadingImagery] = useState(false);
  const [showImagery, setShowImagery] = useState(false);

  // Helper to sample coordinates along route corridor or origin
  const fetchCorridorImagery = useCallback(async (
    orig: LocationPoint | null,
    route: any
  ): Promise<RouteImageryResult | null> => {
    if (!orig && !route) return null;

    const coords = route?.geometry?.coordinates;

    // Case 1: Route polyline available -> Sample along corridor (origin, midpoint, destination)
    if (Array.isArray(coords) && coords.length >= 2) {
      const sampleDefs = [
        { label: 'Origin Area', coord: coords[0] },
        { label: 'Corridor Midpoint', coord: coords[Math.floor(coords.length / 2)] },
        { label: 'Destination Area', coord: coords[coords.length - 1] },
      ];

      // Add a 4th sample point if route is longer than 1500m
      if (route.distanceMeters > 1500 && coords.length >= 4) {
        sampleDefs.splice(2, 0, {
          label: 'Corridor Segment (75%)',
          coord: coords[Math.floor(coords.length * 0.75)],
        });
      }

      const sampleResults: RouteImagerySamplePoint[] = await Promise.all(
        sampleDefs.map(async (sd) => {
          const lon = sd.coord[0];
          const lat = sd.coord[1];
          try {
            const res = await activeImageryProvider.searchNearby(lat, lon, { radiusM: 100, limit: 1 });
            return {
              label: sd.label,
              lat,
              lon,
              hasImagery: res.hasImagery,
              image: res.images?.[0],
            };
          } catch {
            return {
              label: sd.label,
              lat,
              lon,
              hasImagery: false,
            };
          }
        })
      );

      const availableCount = sampleResults.filter((s) => s.hasImagery).length;
      const sampledCount = sampleResults.length;
      const coverageRatio = sampledCount > 0 ? availableCount / sampledCount : 0;
      const collectedImages = sampleResults
        .map((s) => s.image)
        .filter((img): img is PanoramaxImage => Boolean(img));

      return {
        ok: true,
        hasImagery: availableCount > 0,
        images: collectedImages,
        status: availableCount > 0 ? 'FOUND' : 'NO_IMAGERY_FOUND',
        coverageRatio,
        sampledCount,
        availableCount,
        scope: 'route_corridor_sampled',
        label: `Route Corridor Imagery (${availableCount}/${sampledCount} sampled points)`,
        sampledPoints: sampleResults,
      };
    }

    // Case 2: Origin only (no active route yet) -> Honest disclosure: "Imagery near starting point"
    if (orig) {
      try {
        const res = await activeImageryProvider.searchNearby(orig.latitude, orig.longitude, {
          radiusM: 100,
          limit: 3,
        });
        return {
          ...res,
          coverageRatio: res.hasImagery ? 1 : 0,
          sampledCount: 1,
          availableCount: res.hasImagery ? 1 : 0,
          scope: 'origin_only',
          label: 'Imagery near starting point (100m radius)',
          sampledPoints: [
            {
              label: 'Starting Location',
              lat: orig.latitude,
              lon: orig.longitude,
              hasImagery: res.hasImagery,
              image: res.images?.[0],
            },
          ],
        };
      } catch {
        return null;
      }
    }

    return null;
  }, []);

  // Background fetch whenever origin or activeRoute changes
  useEffect(() => {
    let active = true;

    fetchCorridorImagery(origin, activeRoute).then((res) => {
      if (active) setImageryResult(res);
    });

    return () => {
      active = false;
    };
  }, [
    origin?.latitude,
    origin?.longitude,
    activeRoute?.id,
    activeRoute?.distanceMeters,
    fetchCorridorImagery,
  ]);

  const checkStreetImagery = async () => {
    setIsLoadingImagery(true);
    setShowImagery(true);
    const res = await fetchCorridorImagery(origin, activeRoute);
    setIsLoadingImagery(false);
    setImageryResult(res);
  };

  return {
    imageryResult,
    isLoadingImagery,
    showImagery,
    setShowImagery,
    checkStreetImagery,
  };
}
