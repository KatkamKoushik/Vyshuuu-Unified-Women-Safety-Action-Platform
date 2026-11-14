import { AuthorityEntry } from '../domain/authorityRegistry.js';

export const DRAFTSMAN_DISCLAIMER: string;

export interface EvidenceItemInput {
  name: string;
  type: string;
  sizeBytes?: number;
  capturedAt?: string;
  digestHex?: string;
  buffer?: Buffer | Uint8Array | string;
}

export interface ProcessedEvidenceItem {
  index: number;
  name: string;
  type: string;
  sizeBytes: number;
  capturedAt: string;
  digestHex: string;
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  purpose: string;
  exampleAnswer: string;
}

export interface AttachmentValidationResult {
  isValid: boolean;
  warnings: string[];
  acceptedFormats: string[];
}

export interface ClipboardPill {
  key: string;
  label: string;
  value: string;
}

export interface PortalHandoffPayload {
  targetUrl: string;
  submissionMode: 'ASSISTED_PORTAL_HANDOFF' | 'AUTHORIZED_EMAIL' | 'DIRECT_HOTLINE';
  clipboardPills: ClipboardPill[];
  attachmentValidation: AttachmentValidationResult;
}

export interface GrievanceDraftResult {
  disclaimer: string;
  authority: {
    code: string;
    name: string;
    portalUrl: string;
    submissionMode: string;
    resolutionWindowDays: number | null;
    emergencyHelpline: string | null;
  };
  subjectLine: string;
  statutoryCitation: string;
  formalDocument: string;
  evidenceDigest: ProcessedEvidenceItem[];
  portalHandoff: PortalHandoffPayload;
}

export interface GrievanceDraftInput {
  complainantName?: string;
  studentId?: string;
  institutionName: string;
  hostelOrLocation: string;
  category: string;
  incidentDate: string;
  rawNarrative: string;
  priorSteps?: string;
  impact?: string;
  reliefRequested?: string;
  evidenceItems?: EvidenceItemInput[];
  clarificationAnswers?: Array<{ question: string; answer: string }>;
}

export function calculateEvidenceSha256(data: string | Buffer | Uint8Array): string;

export function generateClarifyingQuestions(category: string, statement?: string): ClarifyingQuestion[];

export function validateAuthorityAttachments(authorityCode: string, attachments?: Array<{ name: string; type?: string; sizeBytes?: number }>): AttachmentValidationResult;

export function composeFormalGrievance(input: GrievanceDraftInput): GrievanceDraftResult;

