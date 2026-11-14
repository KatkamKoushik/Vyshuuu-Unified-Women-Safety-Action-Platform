export interface AuthorityEntry {
  code: string;
  name: string;
  portalUrl: string;
  jurisdiction: string;
  resolutionWindowDays: number | null;
  acceptedCategories: string[];
  submissionMode: 'ASSISTED_PORTAL_HANDOFF' | 'AUTHORIZED_EMAIL' | 'DIRECT_HOTLINE';
  requiredFields: string[];
  allowedAttachments: {
    formats: string[];
    maxSizeMb: number;
    note: string;
  };
  emergencyHelpline: string | null;
  lastVerified: string;
}

export declare const VERIFIED_AUTHORITIES: Record<string, AuthorityEntry>;

export interface AuthorityMatchResult {
  primaryAuthority: AuthorityEntry;
  secondaryAuthority: AuthorityEntry;
  routingReason: string;
  escalationAdvice: string;
  requiredDocuments: string[];
}

export declare function matchAuthorityForGrievance(params: {
  category: string;
  statement?: string;
  priorReportIgnored?: boolean;
}): AuthorityMatchResult;

