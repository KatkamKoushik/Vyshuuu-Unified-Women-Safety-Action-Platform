import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BENCHMARK_POINTS,
  LocationPoint,
  requestDeviceLocation,
  searchDestinations,
  calculateDistanceKm,
} from '../services/geocodingService';
import { activeRoutingProvider } from '../services/routingAdapter';
import type { ClientRouteResult } from '../../../core/providers/routing/clientRoutingService';
import type { SavedJourney } from '../services/storageService';

export interface UseWalkingRouteReturn {
  origin: LocationPoint | null;
  destination: LocationPoint | null;
  setOrigin: (point: LocationPoint | null) => void;
  setDestination: (point: LocationPoint | null) => void;
  searchTarget: 'origin' | 'destination';
  setSearchTarget: (target: 'origin' | 'destination') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: LocationPoint[];
  isSearching: boolean;
  routingResult: ClientRouteResult | null;
  selectedRouteId: string | null;
  setSelectedRouteId: (id: string | null) => void;
  activeRoute: any;
  isLoadingRoutes: boolean;
  statusMessage: string | null;
  userLocation: { latitude: number; longitude: number } | null;
  computeRoutes: (options?: { timeoutMs?: number; overrideOrigin?: LocationPoint }) => Promise<void>;
  handleUseGps: () => Promise<void>;
  handleSelectSavedJourney: (saved: SavedJourney) => void;
}

export function useWalkingRoute(): UseWalkingRouteReturn {
  const [origin, setOrigin] = useState<LocationPoint | null>(BENCHMARK_POINTS[0]); // Hyderabad Pilot Hub (Charminar)
  const [destination, setDestination] = useState<LocationPoint | null>(BENCHMARK_POINTS[1]); // Hyderabad (Madina Junction - 1.2km)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [searchTarget, setSearchTarget] = useState<'origin' | 'destination'>('destination');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationPoint[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Auto-acquire real device GPS on initial mount in India
  useEffect(() => {
    let isMounted = true;
    requestDeviceLocation()
      .then((res) => {
        if (isMounted && res.ok && res.point) {
          const userPt = res.point;
          setUserLocation({ latitude: userPt.latitude, longitude: userPt.longitude });
          setOrigin(userPt);

          // If current default destination is too far (> 5 km) from device GPS, require explicit user selection
          setDestination((prevDest) => {
            if (!prevDest) return prevDest;
            const dist = calculateDistanceKm(userPt.latitude, userPt.longitude, prevDest.latitude, prevDest.longitude);
            if (dist > 5) {
              return null;
            }
            return prevDest;
          });
        }
      })
      .catch(() => {
        // Retain Indian benchmark origin fallback
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Routing State
  const [routingResult, setRoutingResult] = useState<ClientRouteResult | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const routeRequestSeq = useRef(0);

  // Trigger geocoding search with 250ms debounce and proximity biasing
  useEffect(() => {
    let active = true;
    if (searchQuery.trim().length > 1) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        searchDestinations(searchQuery, userLocation).then((results) => {
          if (active) {
            setSearchResults(results);
            setIsSearching(false);
          }
        });
      }, 250);

      return () => {
        active = false;
        clearTimeout(timer);
      };
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
    return () => {
      active = false;
    };
  }, [searchQuery, userLocation]);

  // Request pedestrian routes whenever origin & destination are set
  const computeRoutes = useCallback(
    async (options?: { timeoutMs?: number; overrideOrigin?: LocationPoint }) => {
      const seq = ++routeRequestSeq.current;
      const effectiveOrigin = options?.overrideOrigin || origin;

      if (!effectiveOrigin || !destination) {
        setStatusMessage('Please select both a start point and destination.');
        return;
      }

      // Pedestrian sanity validation: prevent calculating 100+ km impossible walks
      const distanceKm = calculateDistanceKm(
        effectiveOrigin.latitude,
        effectiveOrigin.longitude,
        destination.latitude,
        destination.longitude
      );

      if (distanceKm > 15) {
        setIsLoadingRoutes(false);
        setRoutingResult(null);
        setStatusMessage(
          `Destination is ${distanceKm.toFixed(0)} km away. Walking companion is designed for short pedestrian trips under 5 km (maximum route distance 15 km). Please select a nearby destination or use public transit.`
        );
        return;
      }

      setIsLoadingRoutes(true);
      setStatusMessage(null);
      setRoutingResult(null);

      const result = await activeRoutingProvider.getWalkingRoutes(
        { latitude: effectiveOrigin.latitude, longitude: effectiveOrigin.longitude },
        { latitude: destination.latitude, longitude: destination.longitude },
        options
      );

      // Discard stale in-flight responses
      if (seq !== routeRequestSeq.current) return;

      setIsLoadingRoutes(false);
      setRoutingResult(result);

      if (result.ok && result.routes.length > 0) {
        setSelectedRouteId(result.routes[0].id);
        if (distanceKm > 5) {
          setStatusMessage(`Notice: Long walk (${distanceKm.toFixed(1)} km). Typical walking journeys are under 5 km.`);
        }
      } else if (result.status === 'NO_ROUTE_FOUND') {
        setStatusMessage('No pedestrian walking route found between these locations.');
      } else {
        setStatusMessage(result.message || 'Unable to calculate route.');
      }
    },
    [origin, destination]
  );

  // Initial calculation on mount / coordinate change
  useEffect(() => {
    computeRoutes();
  }, [origin?.latitude, origin?.longitude, destination?.latitude, destination?.longitude, computeRoutes]);

  // Active route reference
  const activeRoute = routingResult?.routes.find((r) => r.id === selectedRouteId) || routingResult?.routes[0];

  // GPS Current Location Handler
  const handleUseGps = async () => {
    setIsLoadingRoutes(true);
    setStatusMessage('Acquiring current GPS location...');
    const res = await requestDeviceLocation();
    setIsLoadingRoutes(false);

    if (res.ok && res.point) {
      setUserLocation({ latitude: res.point.latitude, longitude: res.point.longitude });
      setOrigin(res.point);
      setStatusMessage(null);
    } else {
      setStatusMessage(res.message || 'Could not access GPS.');
    }
  };

  // Select Saved Journey
  const handleSelectSavedJourney = (saved: SavedJourney) => {
    setOrigin({
      title: saved.origin_name,
      subtitle: 'Saved Location',
      latitude: saved.origin_lat,
      longitude: saved.origin_lon,
    });
    setDestination({
      title: saved.dest_name,
      subtitle: 'Saved Location',
      latitude: saved.dest_lat,
      longitude: saved.dest_lon,
    });
  };

  return {
    origin,
    destination,
    setOrigin,
    setDestination,
    searchTarget,
    setSearchTarget,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
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
  };
}
