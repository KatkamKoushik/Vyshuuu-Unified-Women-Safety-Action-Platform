import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  buildTemporalIncidentGraph,
  auditDigitalExposure,
  calculateIncidentHash,
  PROTECT_DISCLAIMER,
  STALKLEDGER_DISCLAIMER,
  IncidentRecord,
} from '@walking-companion/core';
import { dynamicExposureAudit } from '../services/geminiClient.js';

interface AnalyzeRequestBody {
  incidents: IncidentRecord[];
  options?: {
    timezoneOffsetMinutes?: number;
  };
}

interface ExposureRequestBody {
  textContent: string;
}

export async function registerProtectRoutes(fastify: FastifyInstance) {
  // Analyze cross-platform incident sequence
  const analyzeHandler = async (request: FastifyRequest<{ Body: AnalyzeRequestBody }>, reply: FastifyReply) => {
    const { incidents, options } = request.body || {};

    if (!Array.isArray(incidents)) {
      return reply.status(400).send({
        ok: false,
        error: 'incidents must be an array of incident records',
        code: 'INVALID_INPUT',
      });
    }

    if (incidents.length > 500) {
      return reply.status(400).send({
        ok: false,
        error: 'incidents array exceeds maximum threshold of 500 entries',
        code: 'PAYLOAD_TOO_LARGE',
      });
    }

    // Ensure every incident has a cryptographic SHA-256 hash
    const hashedIncidents = incidents.map((inc) => ({
      ...inc,
      hash: inc.hash || calculateIncidentHash(inc),
    }));

    const graph = buildTemporalIncidentGraph(hashedIncidents, options);

    return reply.send({
      ok: true,
      summary: graph,
      incidentsCount: hashedIncidents.length,
      disclaimer: PROTECT_DISCLAIMER,
    });
  };
  fastify.post('/api/v1/protect/analyze', analyzeHandler);
  fastify.post('/api/v1/stalkledger/analyze', analyzeHandler);

  // Voluntary digital exposure audit
  const auditHandler = async (request: FastifyRequest<{ Body: ExposureRequestBody }>, reply: FastifyReply) => {
    const { textContent } = request.body || {};

    if (typeof textContent !== 'string') {
      return reply.status(400).send({
        ok: false,
        error: 'textContent must be a string',
        code: 'INVALID_INPUT',
      });
    }

    if (textContent.length > 10000) {
      return reply.status(400).send({
        ok: false,
        error: 'textContent exceeds maximum limit of 10000 characters',
        code: 'PAYLOAD_TOO_LARGE',
      });
    }

    // Connect live Gemini exposure audit when GEMINI_API_KEY is present, with deterministic fallback
    const dynamicAudit = await dynamicExposureAudit(textContent, process.env.GEMINI_API_KEY);

    return reply.send({
      ok: true,
      audit: {
        overallRisk: dynamicAudit.overallRisk,
        adviceSummary: dynamicAudit.adviceSummary,
        findings: dynamicAudit.findings,
        isAiGenerated: dynamicAudit.isAiGenerated,
        engine: dynamicAudit.isAiGenerated ? 'gemini-2.5-flash' : 'deterministic-fallback',
      },
      disclaimer: PROTECT_DISCLAIMER,
    });
  };
  fastify.post('/api/v1/protect/audit-exposure', auditHandler);
  fastify.post('/api/v1/stalkledger/audit-exposure', auditHandler);
}

export const registerStalkRoutes = registerProtectRoutes;

