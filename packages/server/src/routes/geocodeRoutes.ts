import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { defaultCache } from '../cache/cacheService.js';

interface GeocodeQuery {
  q?: string;
  limit?: string;
  lat?: string;
  lon?: string;
}

export interface GeocodeLocation {
  title: string;
  subtitle: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
}

/**
 * Calculates Haversine distance in kilometers between two GPS points
 */
function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Built-in benchmark locations for fast instant lookup (Indian hubs prioritized)
export const BENCHMARK_LOCATIONS: GeocodeLocation[] = [
  // Hyderabad Hub
  {
    title: 'Charminar, Hyderabad',
    subtitle: 'Old City, Hyderabad, Telangana, India',
    latitude: 17.3616,
    longitude: 78.4747,
  },
  {
    title: 'Hitec City Metro Station, Hyderabad',
    subtitle: 'Madhapur, Hyderabad, Telangana, India',
    latitude: 17.4483,
    longitude: 78.3762,
  },
  {
    title: 'Cyber Towers, Hyderabad',
    subtitle: 'Hitec City, Hyderabad, Telangana, India',
    latitude: 17.4504,
    longitude: 78.3815,
  },
  // Bengaluru Hub
  {
    title: 'MG Road Metro Station, Bengaluru',
    subtitle: 'Mahatma Gandhi Road, Bengaluru, Karnataka, India',
    latitude: 12.9756,
    longitude: 77.6066,
  },
  {
    title: 'Brigade Road, Bengaluru',
    subtitle: 'Shanthala Nagar, Ashok Nagar, Bengaluru, Karnataka, India',
    latitude: 12.9733,
    longitude: 77.6074,
  },
  {
    title: 'Cubbon Park, Bengaluru',
    subtitle: 'Kasturba Road, Sampangi Rama Nagara, Bengaluru, Karnataka, India',
    latitude: 12.9763,
    longitude: 77.5929,
  },
  // Delhi Hub
  {
    title: 'Rajiv Chowk Metro, Delhi',
    subtitle: 'Connaught Place, New Delhi, Delhi, India',
    latitude: 28.6328,
    longitude: 77.2195,
  },
  {
    title: 'India Gate, Delhi',
    subtitle: 'Rajpath, New Delhi, Delhi, India',
    latitude: 28.6129,
    longitude: 77.2295,
  },
  // Reference Benchmarks
  {
    title: 'Trafalgar Square, London',
    subtitle: 'City of Westminster, Greater London, England',
    latitude: 51.5080,
    longitude: -0.1281,
  },
  {
    title: 'Covent Garden, London',
    subtitle: 'London, Greater London, England',
    latitude: 51.5120,
    longitude: -0.1240,
  },
  {
    title: 'Piccadilly Circus, London',
    subtitle: 'Westminster, Greater London, England',
    latitude: 51.5101,
    longitude: -0.1340,
  },
  {
    title: 'Leicester Square, London',
    subtitle: 'Westminster, Greater London, England',
    latitude: 51.5113,
    longitude: -0.1283,
  },
];

export async function registerGeocodeRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/api/v1/geocode/search',
    async (
      request: FastifyRequest<{ Querystring: GeocodeQuery }>,
      reply: FastifyReply
    ) => {
      let query = (request.query.q || '').trim();
      const limit = Math.min(10, Math.max(1, parseInt(request.query.limit || '5', 10)));
      const userLat = request.query.lat ? parseFloat(request.query.lat) : NaN;
      const userLon = request.query.lon ? parseFloat(request.query.lon) : NaN;
      const hasUserLocation = Number.isFinite(userLat) && Number.isFinite(userLon);

      // Strip control chars, null bytes, and non-printable characters (anti-SSRF / anti-injection)
      query = query.replace(/[\x00-\x1F\x7F]/g, '');

      if (!query || query.length < 2) {
        return [];
      }

      // Cap query length to prevent memory/regex attacks
      if (query.length > 120) {
        query = query.slice(0, 120);
      }

      // Strip conversational prefixes so "nearest park" searches for "park" with spatial proximity
      const cleanQuery = query.replace(/^(nearest|nearby|close\s+to|around)\s+/i, '').trim() || query;

      const locKey = hasUserLocation ? `:${userLat.toFixed(2)},${userLon.toFixed(2)}` : '';
      const cacheKey = `geocode:${cleanQuery.toLowerCase()}:${limit}${locKey}`;
      const cached = await defaultCache.get(cacheKey);
      if (cached) {
        reply.header('X-Cache-Status', 'HIT');
        return cached;
      }

      // 1. Query Photon OSM Geocoder with proximity biasing
      const photonController = new AbortController();
      const photonTimer = setTimeout(() => photonController.abort(), 4000);

      try {
        let photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&limit=${limit * 2}&bbox=68.1,6.7,97.4,35.5`;
        if (hasUserLocation) {
          photonUrl += `&lat=${userLat}&lon=${userLon}`;
        }

        const res = await fetch(photonUrl, {
          headers: {
            'User-Agent': 'ResQGeospatialGateway/1.0',
            'Accept': 'application/json',
          },
          signal: photonController.signal,
        });

        clearTimeout(photonTimer);

        if (res.ok) {
          const data: any = await res.json();
          if (Array.isArray(data.features) && data.features.length > 0) {
            let results: GeocodeLocation[] = data.features
              .map((feat: any) => {
                const coords = feat?.geometry?.coordinates;
                if (!Array.isArray(coords) || coords.length < 2) return null;
                const lon = coords[0];
                const lat = coords[1];
                if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

                const p = feat.properties || {};
                const distKm = hasUserLocation ? calculateHaversineKm(userLat, userLon, lat, lon) : undefined;
                
                const localityParts = [p.street, p.locality || p.district, p.city, p.state].filter(Boolean);
                let subtitle = localityParts.join(', ') || 'India';
                if (distKm !== undefined) {
                  const distLabel = distKm < 1 ? `${Math.round(distKm * 1000)}m away` : `${distKm.toFixed(1)} km away`;
                  subtitle = `${distLabel} • ${subtitle}`;
                }

                return {
                  title: p.name || localityParts[0] || 'Unknown Place',
                  subtitle,
                  latitude: lat,
                  longitude: lon,
                  distanceKm: distKm,
                };
              })
              .filter((loc: GeocodeLocation | null): loc is GeocodeLocation => loc !== null);

            // Sort by proximity to user if user coordinates provided
            if (hasUserLocation) {
              results.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
            }

            results = results.slice(0, limit);

            if (results.length > 0) {
              await defaultCache.set(cacheKey, results, 86400); // 24h
              reply.header('X-Cache-Status', 'MISS');
              return results;
            }
          }
        }
      } catch {
        clearTimeout(photonTimer);
      }

      // Check benchmark locations as fallback if Photon fails
      const lowerQ = cleanQuery.toLowerCase();
      const matches = BENCHMARK_LOCATIONS.filter(
        (loc) =>
          loc.title.toLowerCase().includes(lowerQ) ||
          loc.subtitle.toLowerCase().includes(lowerQ)
      );

      if (matches.length > 0) {
        const results = matches.slice(0, limit);
        await defaultCache.set(cacheKey, results, 86400); // 24h
        reply.header('X-Cache-Status', 'MISS');
        return results;
      }

      // Note: Deliberately do NOT fallback to public Nominatim for autocomplete (OSMF Fair Use Policy).
      // Public Nominatim prohibits keystroke autocomplete and enforces a strict 1 req/s maximum.
      return [];
    }
  );
}
