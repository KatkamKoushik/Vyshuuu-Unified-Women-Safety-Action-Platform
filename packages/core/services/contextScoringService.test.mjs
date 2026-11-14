import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateContextCoverage,
  CONTEXT_SCORE_NAME,
  CONTEXT_SCORE_DISCLAIMER,
} from './contextScoringService.js';

describe('contextScoringService', () => {
  it('calculates comprehensive coverage when amenities and imagery exist', () => {
    const input = {
      distanceMeters: 500,
      amenities: [
        { category: 'transit' },
        { category: 'transit' },
        { category: 'emergency' },
        { category: 'services' },
        { category: 'services' },
        { category: 'lighting' },
        { category: 'lighting' },
        { category: 'lighting' },
        { category: 'lighting' },
        { category: 'lighting' },
      ],
      solar: { state: 'DAYLIGHT', elevationDeg: 35.5 },
      imagery: { available: true, capturedAt: '2025-11-14T10:00:00Z' },
    };

    const res = calculateContextCoverage(input);
    assert.equal(res.scoreName, CONTEXT_SCORE_NAME);
    assert.equal(res.disclaimer, CONTEXT_SCORE_DISCLAIMER);
    assert.equal(res.amenitiesCount, 10);
    assert.equal(res.amenityDensityPer100m, 2.0); // 10 / 500 * 100 = 2.0
    assert.equal(res.amenityScore, 25); // 2.0 * 12.5 = 25 (out of 50)
    assert.equal(res.imageryScore, 50); // full 50 points
    assert.equal(res.totalScore, 75); // 25 + 50 = 75
    assert.equal(res.informationCoverageScore, 75);
    assert.equal(res.ratingLabel, 'Comprehensive');
    assert.equal(res.hasStreetImagery, true);
    assert.equal(res.walkingConditions.daylightState, 'DAYLIGHT');
    assert.equal(res.walkingConditions.daylightScore, 30);
    assert.equal(res.missingDataNotices.length, 0);
  });

  it('guarantees coverage score is mathematically identical at noon and midnight for identical data', () => {
    const baseInput = {
      distanceMeters: 500,
      amenities: [
        { category: 'transit' },
        { category: 'services' },
        { category: 'lighting' },
        { category: 'lighting' },
      ],
      imagery: { available: true },
    };

    const noonResult = calculateContextCoverage({
      ...baseInput,
      solar: { state: 'DAYLIGHT', elevationDeg: 48.2 },
    });

    const midnightResult = calculateContextCoverage({
      ...baseInput,
      solar: { state: 'NIGHT', elevationDeg: -32.5 },
    });

    // Coverage must be mathematically invariant to time of day
    assert.equal(noonResult.totalScore, midnightResult.totalScore);
    assert.equal(noonResult.informationCoverageScore, midnightResult.informationCoverageScore);
    assert.equal(noonResult.amenityScore, midnightResult.amenityScore);
    assert.equal(noonResult.imageryScore, midnightResult.imageryScore);

    // Walking conditions correctly separate environmental light
    assert.equal(noonResult.walkingConditions.conditionLabel, 'Natural Daylight');
    assert.equal(midnightResult.walkingConditions.conditionLabel, 'Astronomical Night');
    assert.notEqual(noonResult.walkingConditions.daylightScore, midnightResult.walkingConditions.daylightScore);
  });

  it('calculates sparse coverage and surfaces honest missing data notices', () => {
    const input = {
      distanceMeters: 1000,
      amenities: [],
      solar: { state: 'NIGHT', elevationDeg: -25.0 },
      imagery: { available: false },
    };

    const res = calculateContextCoverage(input);
    assert.equal(res.amenityScore, 0);
    assert.equal(res.imageryScore, 0);
    assert.equal(res.totalScore, 0);
    assert.equal(res.ratingLabel, 'Sparse');
    assert.equal(res.hasStreetImagery, false);
    assert.ok(res.missingDataNotices.length >= 2);
    assert.match(res.missingDataNotices[0], /No mapped amenities/i);
    assert.match(res.missingDataNotices[1], /No street-level imagery/i);
  });

  it('supports sampled multi-point route imagery ratio', () => {
    const input = {
      distanceMeters: 800,
      amenities: [{ category: 'lighting' }],
      solar: { state: 'CIVIL_TWILIGHT', elevationDeg: -2.0 },
      imagery: {
        available: true,
        coverageRatio: 2 / 3, // 2 of 3 points sampled
        sampledCount: 3,
        availableCount: 2,
        scope: 'route_corridor_sampled',
      },
    };

    const res = calculateContextCoverage(input);
    assert.equal(res.imageryScope, 'route_corridor_sampled');
    assert.match(res.imageryLabel, /2\/3 sampled waypoints/);
    assert.equal(res.imageryScore, 33); // Math.round((2/3) * 50) = 33
  });

  it('handles empty or null input without throwing', () => {
    const res = calculateContextCoverage(null);
    assert.ok(res);
    assert.equal(res.totalScore, 0);
    assert.equal(res.ratingLabel, 'Sparse');
    assert.equal(res.amenitiesCount, 0);
    assert.equal(res.scoreName, 'Route Information Coverage');
  });

  it('strictly excludes the word safety from scoreName and warns in disclaimer', () => {
    const res = calculateContextCoverage({});
    assert.ok(!res.scoreName.toLowerCase().includes('safety'));
    assert.match(res.disclaimer, /Does not measure, infer, or guarantee personal safety/i);
  });
});

