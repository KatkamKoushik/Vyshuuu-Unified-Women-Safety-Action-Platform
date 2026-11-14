export declare const CONTEXT_SCORE_NAME: string;
export declare const CONTEXT_SCORE_DISCLAIMER: string;

export interface ContextScoringInput {
  distanceMeters?: number;
  amenities?: Array<{ category: string; [key: string]: any }>;
  solar?: { state: string; elevationDeg: number };
  imagery?: {
    available: boolean;
    capturedAt?: string;
    coverageRatio?: number;
    sampledCount?: number;
    availableCount?: number;
    scope?: 'route_corridor_sampled' | 'origin_only';
  };
}

export interface WalkingConditions {
  daylightState: string;
  solarElevationDeg: number;
  daylightScore: number;
  conditionLabel: string;
  advisory: string;
}

export interface ContextScoreBreakdown {
  amenityScore: number;
  imageryScore: number;
  daylightScore: number;
  informationCoverageScore: number;
  totalScore: number;
  ratingLabel: 'Comprehensive' | 'Moderate' | 'Sparse';
  scoreName: string;
  disclaimer: string;
  amenitiesCount: number;
  amenityDensityPer100m: number;
  daylightState: string;
  solarElevationDeg: number;
  hasStreetImagery: boolean;
  imageryCaptureDate: string | null;
  imageryScope?: 'route_corridor_sampled' | 'origin_only';
  imageryLabel?: string;
  walkingConditions?: WalkingConditions;
  missingDataNotices: string[];
}

export declare function calculateContextCoverage(
  input?: ContextScoringInput
): ContextScoreBreakdown;

