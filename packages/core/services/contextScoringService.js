/**
 * Route Context Coverage Scoring Service
 * 
 * Computes transparent, explainable Route Information Coverage (0-100%)
 * based strictly on mapped geospatial data availability (OSM amenities and street imagery).
 * 
 * WALKING CONDITIONS SEPARATION:
 * - Natural daylight and astronomical solar conditions are tracked as WALKING CONDITIONS.
 * - Daylight conditions do NOT inflate or deflate the data coverage score, ensuring
 *   mathematical consistency regardless of what time of day a route is queried.
 * 
 * STRICT HONESTY RULES:
 * - NEVER labeled as "safety score" or "danger score"
 * - Discloses what is known, what is estimated, and what is missing
 * - Unknown data is not treated as safe or unsafe
 */

export const CONTEXT_SCORE_NAME = 'Route Information Coverage';
export const CONTEXT_SCORE_DISCLAIMER = 
  'Measures mapped information density (OSM amenities and street-level imagery). Astronomical daylight and walking conditions are reported separately and do not alter data coverage. Does NOT measure, infer, or guarantee personal safety.';

/**
 * @typedef {Object} ContextScoringInput
 * @property {number} distanceMeters - Walking route distance in meters
 * @property {Array<{ category: string }>} [amenities] - Mapped amenities along corridor
 * @property {{ state: string; elevationDeg: number }} [solar] - Astronomical twilight result
 * @property {{ available: boolean; capturedAt?: string; coverageRatio?: number; sampledCount?: number; availableCount?: number; scope?: string }} [imagery] - Street imagery result
 * 
 * @typedef {Object} WalkingConditions
 * @property {string} daylightState - 'DAYLIGHT' | 'CIVIL_TWILIGHT' | 'NAUTICAL_TWILIGHT' | 'ASTRONOMICAL_TWILIGHT' | 'NIGHT'
 * @property {number} solarElevationDeg - Solar elevation in degrees
 * @property {number} daylightScore - 0 to 30 rating of natural light condition
 * @property {string} conditionLabel - Human-readable daylight condition
 * @property {string} advisory - Environmental lighting notice
 * 
 * @typedef {Object} ContextScoreBreakdown
 * @property {number} amenityScore - 0 to 50 (Mapped infrastructure density)
 * @property {number} imageryScore - 0 to 50 (Street-level imagery availability)
 * @property {number} daylightScore - 0 to 30 (Walking condition metric, reported separately)
 * @property {number} informationCoverageScore - 0 to 100 (Pure data availability)
 * @property {number} totalScore - 0 to 100 (Alias for informationCoverageScore)
 * @property {string} ratingLabel - 'Comprehensive' | 'Moderate' | 'Sparse'
 * @property {string} scoreName
 * @property {string} disclaimer
 * @property {number} amenitiesCount
 * @property {number} amenityDensityPer100m
 * @property {string} daylightState
 * @property {number} solarElevationDeg
 * @property {boolean} hasStreetImagery
 * @property {string | null} imageryCaptureDate
 * @property {string} imageryScope - 'route_corridor_sampled' | 'origin_only'
 * @property {string} imageryLabel - Explainable imagery description
 * @property {WalkingConditions} walkingConditions - Environmental factors separate from data coverage
 * @property {string[]} missingDataNotices
 */

/**
 * Calculates Route Information Coverage score from available mapped data,
 * keeping walking conditions (daylight) mathematically separate.
 * 
 * @param {ContextScoringInput} input
 * @returns {ContextScoreBreakdown}
 */
export function calculateContextCoverage(input) {
  const {
    distanceMeters = 0,
    amenities = [],
    solar = { state: 'UNKNOWN', elevationDeg: 0 },
    imagery = { available: false },
  } = input || {};

  const missingDataNotices = [];

  // 1. Mapped Amenity Density Component (0 - 50 points of data availability)
  let amenityScore = 0;
  let amenityDensityPer100m = 0;
  const amenitiesCount = Array.isArray(amenities) ? amenities.length : 0;

  if (distanceMeters > 0 && amenitiesCount > 0) {
    amenityDensityPer100m = Number(((amenitiesCount / distanceMeters) * 100).toFixed(2));
    // Benchmark: 4+ amenities per 100m = full 50 points (12.5 pts per unit density)
    amenityScore = Math.min(50, Math.round(amenityDensityPer100m * 12.5));
  } else {
    missingDataNotices.push('No mapped amenities recorded along this corridor in OpenStreetMap.');
  }

  // 2. Street-level Imagery Component (0 - 50 points of data availability)
  let imageryScore = 0;
  const hasStreetImagery = Boolean(
    imagery && (imagery.available || (typeof imagery.coverageRatio === 'number' && imagery.coverageRatio > 0))
  );
  const imageryCaptureDate = imagery?.capturedAt || null;

  const imageryCoverageRatio = typeof imagery?.coverageRatio === 'number'
    ? Math.max(0, Math.min(1, imagery.coverageRatio))
    : (hasStreetImagery ? 1 : 0);

  const imageryScope = imagery?.scope || (imagery?.sampledCount ? 'route_corridor_sampled' : 'origin_only');
  const imageryLabel = imageryScope === 'route_corridor_sampled'
    ? `Route Corridor Imagery (${imagery?.availableCount ?? (hasStreetImagery ? 1 : 0)}/${imagery?.sampledCount ?? 1} sampled waypoints)`
    : 'Imagery near starting point';

  if (hasStreetImagery) {
    imageryScore = Math.round(imageryCoverageRatio * 50);
  } else {
    missingDataNotices.push('No street-level imagery coverage found for this corridor.');
  }

  // 3. Pure Information Coverage Score (0 - 100%) - data availability only
  const informationCoverageScore = Math.min(100, Math.max(0, amenityScore + imageryScore));
  const totalScore = informationCoverageScore; // Alias for backward compatibility

  let ratingLabel = 'Sparse';
  if (informationCoverageScore >= 70) {
    ratingLabel = 'Comprehensive';
  } else if (informationCoverageScore >= 35) {
    ratingLabel = 'Moderate';
  }

  // 4. Walking Conditions / Environmental Factor (Separated from Data Coverage)
  const solarState = solar.state || 'UNKNOWN';
  const solarElevationDeg = typeof solar.elevationDeg === 'number' ? solar.elevationDeg : 0;
  let daylightScore = 3;
  let conditionLabel = 'Night Conditions';
  let conditionAdvisory = 'Night conditions: natural daylight is absent; walking visibility relies on local street lighting.';

  switch (solarState) {
    case 'DAYLIGHT':
      daylightScore = 30;
      conditionLabel = 'Natural Daylight';
      conditionAdvisory = 'Natural daylight present: high environmental ambient visibility.';
      break;
    case 'CIVIL_TWILIGHT':
      daylightScore = 21;
      conditionLabel = 'Civil Twilight';
      conditionAdvisory = 'Civil twilight: ambient light dimming; street lighting recommended.';
      break;
    case 'NAUTICAL_TWILIGHT':
      daylightScore = 12;
      conditionLabel = 'Nautical Twilight';
      conditionAdvisory = 'Nautical twilight: low ambient light; artificial lighting required.';
      break;
    case 'ASTRONOMICAL_TWILIGHT':
      daylightScore = 6;
      conditionLabel = 'Astronomical Twilight';
      conditionAdvisory = 'Astronomical twilight: near-total darkness without local lamps.';
      break;
    case 'NIGHT':
    default:
      daylightScore = 3;
      conditionLabel = 'Astronomical Night';
      conditionAdvisory = 'Night conditions: natural daylight is absent; relies on local street infrastructure.';
      break;
  }

  const walkingConditions = {
    daylightState: solarState,
    solarElevationDeg,
    daylightScore,
    conditionLabel,
    advisory: conditionAdvisory,
  };

  return {
    amenityScore,
    imageryScore,
    daylightScore,
    informationCoverageScore,
    totalScore,
    ratingLabel,
    scoreName: CONTEXT_SCORE_NAME,
    disclaimer: CONTEXT_SCORE_DISCLAIMER,
    amenitiesCount,
    amenityDensityPer100m,
    daylightState: solarState,
    solarElevationDeg,
    hasStreetImagery,
    imageryCaptureDate,
    imageryScope,
    imageryLabel,
    walkingConditions,
    missingDataNotices,
  };
}
