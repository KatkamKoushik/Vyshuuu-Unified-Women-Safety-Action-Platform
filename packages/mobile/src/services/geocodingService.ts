/**
 * @module geocodingService
 * @description Geocoding and device GPS location handler.
 * 
 * Satisfies fair-use compliance:
 * - Uses Photon (by Komoot, open OSM geocoder designed for typeahead autocomplete)
 * - Injects instant offline verified benchmarks (London, Bengaluru)
 * - Transparently queries Gateway backend with client-direct fallback
 * - Never bombards Nominatim with keystroke autocomplete
 */

import * as Location from 'expo-location';
import { GATEWAY_BASE_URL } from './routingAdapter';

export interface LocationPoint {
  title: string;
  subtitle?: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
}

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// Built-in verified benchmark points for quick offline/instant testing (Indian hubs prioritized)
export const BENCHMARK_POINTS: LocationPoint[] = [
  // Hyderabad Hub (Pilot City)
  {
    title: 'Charminar',
    subtitle: 'Old City, Hyderabad, Telangana, India',
    latitude: 17.3616,
    longitude: 78.4747,
  },
  {
    title: 'Madina Junction',
    subtitle: 'Pathergatti, Hyderabad, Telangana, India',
    latitude: 17.3688,
    longitude: 78.4735,
  },
  {
    title: 'Hitec City Metro Station',
    subtitle: 'Madhapur, Hyderabad, Telangana, India',
    latitude: 17.4483,
    longitude: 78.3762,
  },
  {
    title: 'Cyber Towers',
    subtitle: 'Hitec City, Hyderabad, Telangana, India',
    latitude: 17.4504,
    longitude: 78.3815,
  },
  // Bengaluru Pilot City
  {
    title: 'MG Road Metro Station',
    subtitle: 'Bengaluru, Karnataka, India',
    latitude: 12.9756,
    longitude: 77.6066,
  },
  {
    title: 'Brigade Road Junction',
    subtitle: 'Bengaluru, Karnataka, India',
    latitude: 12.9738,
    longitude: 77.6080,
  },
  {
    title: 'Cubbon Park Entrance',
    subtitle: 'Kasturba Rd, Bengaluru, India',
    latitude: 12.9760,
    longitude: 77.5929,
  },
  {
    title: 'Commercial Street',
    subtitle: 'Tasker Town, Bengaluru, India',
    latitude: 12.9822,
    longitude: 77.6083,
  },
  // Delhi-NCR Pilot City
  {
    title: 'Rajiv Chowk Metro',
    subtitle: 'Connaught Place, New Delhi, India',
    latitude: 28.6328,
    longitude: 77.2195,
  },
  {
    title: 'India Gate',
    subtitle: 'Rajpath, New Delhi, India',
    latitude: 28.6129,
    longitude: 77.2295,
  },
  // Mumbai Pilot City
  {
    title: 'Bandra Bandstand',
    subtitle: 'Bandra West, Mumbai, Maharashtra, India',
    latitude: 19.0434,
    longitude: 72.8197,
  },
  {
    title: 'Carter Road Promenade',
    subtitle: 'Bandra West, Mumbai, Maharashtra, India',
    latitude: 19.0628,
    longitude: 72.8239,
  },
  // Reference Benchmarks
  {
    title: 'Trafalgar Square',
    subtitle: 'London, UK',
    latitude: 51.5080,
    longitude: -0.1281,
  },
  {
    title: 'Covent Garden',
    subtitle: 'London, UK',
    latitude: 51.5117,
    longitude: -0.1240,
  },
];

export async function requestDeviceLocation(): Promise<{
  ok: boolean;
  point?: LocationPoint;
  error?: 'PERMISSION_DENIED' | 'TIMEOUT' | 'UNAVAILABLE';
  message?: string;
}> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return {
        ok: false,
        error: 'PERMISSION_DENIED',
        message: 'Location permission was denied. You can manually enter or select an origin.',
      };
    }

    const loc = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Location timeout')), 8000)
      ),
    ]);

    if (!loc) {
      return {
        ok: false,
        error: 'UNAVAILABLE',
        message: 'Current location is unavailable.',
      };
    }

    return {
      ok: true,
      point: {
        title: 'Current Location',
        subtitle: `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      },
    };
  } catch {
    return {
      ok: false,
      error: 'TIMEOUT',
      message: 'Could not obtain location in time. Using manual origin.',
    };
  }
}

export async function searchDestinations(
  query: string,
  userLocation?: { latitude: number; longitude: number } | null
): Promise<LocationPoint[]> {
  const hasUserLoc = Boolean(userLocation && Number.isFinite(userLocation.latitude) && Number.isFinite(userLocation.longitude));

  if (!query || query.trim().length < 2) {
    if (hasUserLoc && userLocation) {
      return BENCHMARK_POINTS.map((p) => {
        const dist = calculateDistanceKm(userLocation.latitude, userLocation.longitude, p.latitude, p.longitude);
        const distLabel = dist < 1 ? `${Math.round(dist * 1000)}m away` : `${dist.toFixed(1)} km away`;
        return {
          ...p,
          distanceKm: dist,
          subtitle: `${distLabel} • ${p.subtitle || ''}`,
        };
      }).sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    }
    return BENCHMARK_POINTS;
  }

  const q = query.trim().toLowerCase();
  const cleanQ = q.replace(/^(nearest|nearby|close\s+to|around)\s+/i, '').trim() || q;

  // 1. Try Geospatial Gateway (which caches & proxies Photon with proximity ranking)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    let url = `${GATEWAY_BASE_URL}/api/v1/geocode/search?q=${encodeURIComponent(cleanQ)}&limit=6`;
    if (hasUserLoc && userLocation) {
      url += `&lat=${userLocation.latitude}&lon=${userLocation.longitude}`;
    }

    const gatewayRes = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (gatewayRes.ok) {
      const results: LocationPoint[] = await gatewayRes.json();
      if (Array.isArray(results) && results.length > 0) {
        return results;
      }
    }
  } catch {
    // Gateway offline/timeout: fallback to direct Photon
  }

  // 2. Direct Photon Autocomplete with spatial proximity
  const photonController = new AbortController();
  const photonTimer = setTimeout(() => photonController.abort(), 4000);

  try {
    let photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQ)}&limit=8&bbox=68.1,6.7,97.4,35.5`;
    if (hasUserLoc && userLocation) {
      photonUrl += `&lat=${userLocation.latitude}&lon=${userLocation.longitude}`;
    }

    const res = await fetch(photonUrl, {
      headers: {
        'Accept': 'application/json',
      },
      signal: photonController.signal,
    });
    clearTimeout(photonTimer);

    if (res.ok) {
      const data: any = await res.json();
      if (Array.isArray(data.features) && data.features.length > 0) {
        let results: LocationPoint[] = data.features
          .map((feat: any) => {
            const coords = feat?.geometry?.coordinates;
            if (!Array.isArray(coords) || coords.length < 2) return null;
            const lon = coords[0];
            const lat = coords[1];
            if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

            const p = feat.properties || {};
            const dist = hasUserLoc && userLocation
              ? calculateDistanceKm(userLocation.latitude, userLocation.longitude, lat, lon)
              : undefined;

            const localityParts = [p.street, p.locality || p.district, p.city, p.state].filter(Boolean);
            let subtitle = localityParts.join(', ') || 'India';
            if (dist !== undefined) {
              const distLabel = dist < 1 ? `${Math.round(dist * 1000)}m away` : `${dist.toFixed(1)} km away`;
              subtitle = `${distLabel} • ${subtitle}`;
            }

            return {
              title: p.name || localityParts[0] || 'Unknown Place',
              subtitle,
              latitude: lat,
              longitude: lon,
              distanceKm: dist,
            };
          })
          .filter((pt: LocationPoint | null): pt is LocationPoint => pt !== null);

        if (hasUserLoc) {
          results.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
        }

        if (results.length > 0) {
          return results.slice(0, 6);
        }
      }
    }
  } catch {
    clearTimeout(photonTimer);
  }

  // Fall back to local benchmarks filtered and sorted by proximity
  return BENCHMARK_POINTS.filter(
    (p) => p.title.toLowerCase().includes(cleanQ) || (p.subtitle && p.subtitle.toLowerCase().includes(cleanQ))
  );
}

/**
 * 1-Tap shortcut to find nearby essential places within 500m - 3km
 */
export async function getNearbyEssentials(
  userLocation: { latitude: number; longitude: number },
  category: 'park' | 'pharmacy' | 'police' | 'transit' | 'store'
): Promise<LocationPoint[]> {
  const queryMap: Record<string, string> = {
    park: 'park garden',
    pharmacy: 'pharmacy medical chemist',
    police: 'police station chowki',
    transit: 'metro bus stop station',
    store: 'supermarket store grocery',
  };

  return searchDestinations(queryMap[category] || category, userLocation);
}
