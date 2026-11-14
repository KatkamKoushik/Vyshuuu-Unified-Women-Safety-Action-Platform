import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  matchAuthorityForGrievance,
  generateClarifyingQuestions,
  composeFormalGrievance,
  validateAuthorityAttachments,
  VERIFIED_AUTHORITIES,
  DRAFTSMAN_DISCLAIMER,
} from '@walking-companion/core';
import { dynamicGrievanceAnalysis } from '../services/geminiClient.js';

interface IntakeRequestBody {
  category: string;
  statement: string;
  institutionName?: string;
  priorReportIgnored?: boolean;
}

interface ComposeRequestBody {
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
  evidenceItems?: Array<{
    name: string;
    type: string;
    sizeBytes?: number;
    capturedAt?: string;
    digestHex?: string;
  }>;
}

export async function registerActRoutes(fastify: FastifyInstance) {
  // Directory of verified statutory authorities
  const authoritiesHandler = async (_req: FastifyRequest, reply: FastifyReply) => {
    return reply.header('Cache-Control', 'public, max-age=3600').send({
      ok: true,
      authorities: VERIFIED_AUTHORITIES,
      disclaimer: DRAFTSMAN_DISCLAIMER,
    });
  };
  fastify.get('/api/v1/act/authorities', authoritiesHandler);
  fastify.get('/api/v1/herproof/authorities', authoritiesHandler);

  // Case intake & triage
  const intakeHandler = async (request: FastifyRequest<{ Body: IntakeRequestBody }>, reply: FastifyReply) => {
    const { category, statement, institutionName, priorReportIgnored } = request.body || {};

    if (!category || typeof category !== 'string' || !statement || typeof statement !== 'string') {
      return reply.status(400).send({
        ok: false,
        error: 'category and statement are required string fields',
        code: 'INVALID_INPUT',
      });
    }

    if (statement.length > 10000) {
      return reply.status(400).send({
        ok: false,
        error: 'statement exceeds maximum character limit of 10000',
        code: 'PAYLOAD_TOO_LARGE',
      });
    }

    // Connect live Gemini analysis when GEMINI_API_KEY is present, with deterministic fallback
    const dynamicAnalysis = await dynamicGrievanceAnalysis(statement, undefined, process.env.GEMINI_API_KEY);

    const authorityMatch = matchAuthorityForGrievance({
      category: dynamicAnalysis.category || category,
      statement,
      priorReportIgnored: Boolean(priorReportIgnored),
    });

    const clarifyingQuestions = dynamicAnalysis.clarifyingQuestions && dynamicAnalysis.clarifyingQuestions.length > 0
      ? dynamicAnalysis.clarifyingQuestions
      : generateClarifyingQuestions(category, statement);

    return reply.send({
      ok: true,
      category: dynamicAnalysis.category || category,
      institutionName: institutionName || null,
      authorityMatch,
      clarifyingQuestions,
      aiAnalysis: {
        isAiGenerated: dynamicAnalysis.isAiGenerated,
        engine: dynamicAnalysis.isAiGenerated ? 'gemini-2.5-flash' : 'deterministic-fallback',
        reason: dynamicAnalysis.reason,
      },
      disclaimer: DRAFTSMAN_DISCLAIMER,
    });
  };
  fastify.post('/api/v1/act/cases/intake', intakeHandler);
  fastify.post('/api/v1/herproof/cases/intake', intakeHandler);

  // Formal legal draft composition & assisted portal handoff
  const composeHandler = async (request: FastifyRequest<{ Body: ComposeRequestBody }>, reply: FastifyReply) => {
    const body = request.body || {};
    const {
      complainantName,
      studentId,
      institutionName,
      hostelOrLocation,
      category,
      incidentDate,
      rawNarrative,
      priorSteps,
      impact,
      reliefRequested,
      evidenceItems,
      clarificationAnswers,
    } = body as any;

    if (!institutionName || !hostelOrLocation || !rawNarrative || !category || !incidentDate) {
      return reply.status(400).send({
        ok: false,
        error: 'institutionName, hostelOrLocation, rawNarrative, category, and incidentDate are mandatory fields',
        code: 'MISSING_REQUIRED_FIELDS',
      });
    }

    try {
      const grievanceResult = composeFormalGrievance({
        complainantName,
        studentId,
        institutionName,
        hostelOrLocation,
        category,
        incidentDate,
        rawNarrative,
        priorSteps,
        impact,
        reliefRequested,
        evidenceItems,
        clarificationAnswers,
      });

      return reply.send({
        ok: true,
        case: grievanceResult,
      });
    } catch (err: any) {
      return reply.status(400).send({
        ok: false,
        error: err.message || 'Failed to compose formal grievance',
        code: 'COMPOSITION_FAILED',
      });
    }
  };
  fastify.post('/api/v1/act/cases/compose', composeHandler);
  fastify.post('/api/v1/herproof/cases/compose', composeHandler);
}

export const registerHerproofRoutes = registerActRoutes;

