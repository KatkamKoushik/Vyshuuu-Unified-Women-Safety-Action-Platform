export const PROTECT_DISCLAIMER: string;
export const STALKLEDGER_DISCLAIMER: string;

export interface IncidentRecord {
  id: string;
  timestamp: string;
  platform: string;
  senderHandle: string;
  messageContent: string;
  wasBlockedPrior?: boolean;
  evidenceReference?: string;
  hash?: string;
}

export type PatternType =
  | 'ESCALATING_FREQUENCY'
  | 'CROSS_PLATFORM_CONVERGENCE'
  | 'BLOCK_EVASION'
  | 'OFF_HOURS_CONTACT'
  | 'LOCATION_AWARENESS';

export interface DetectedPattern {
  patternId: string;
  type: PatternType;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  factualBasis: string;
  relatedIncidentIds: string[];
}

export interface TemporalGraphResult {
  patterns: DetectedPattern[];
  timelineSpanDays: number;
  uniqueSendersCount: number;
  platformsCovered: string[];
}

export type ExposureCategory =
  | 'ROOM_OR_HOSTEL'
  | 'ROUTINE_OR_TIMETABLE'
  | 'PHONE_OR_CONTACT'
  | 'EXACT_GEOLOCATION';

export interface ExposureFinding {
  findingId: string;
  category: ExposureCategory;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  matchedSnippet: string;
  riskExplanation: string;
  remediationTip: string;
}

export interface ExposureAuditResult {
  findings: ExposureFinding[];
  overallRisk: 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';
  adviceSummary: string;
}

export function calculateIncidentHash(incident: Partial<IncidentRecord>): string;

export function buildTemporalIncidentGraph(
  incidents?: IncidentRecord[],
  options?: { timezoneOffsetMinutes?: number }
): TemporalGraphResult;

export function auditDigitalExposure(textContent?: string): ExposureAuditResult;
