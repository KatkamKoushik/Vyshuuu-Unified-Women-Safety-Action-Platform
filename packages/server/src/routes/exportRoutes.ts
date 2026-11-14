import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'node:crypto';
import { DRAFTSMAN_DISCLAIMER, PROTECT_DISCLAIMER, STALKLEDGER_DISCLAIMER } from '@walking-companion/core';

interface GrievanceExportBody {
  complainantName?: string;
  subjectLine: string;
  formalDocument: string;
  authorityCode: string;
  evidenceDigest?: Array<{
    name: string;
    capturedAt: string;
    digestHex: string;
  }>;
}

interface IncidentExportBody {
  incidents: Array<{
    id: string;
    timestamp: string;
    platform: string;
    senderHandle: string;
    messageContent: string;
    hash?: string;
  }>;
  patterns?: any[];
}
type StalkLedgerExportBody = IncidentExportBody;

export async function registerExportRoutes(fastify: FastifyInstance) {
  // Export Formal Grievance Package
  fastify.post(
    '/api/v1/export/grievance-package',
    async (request: FastifyRequest<{ Body: GrievanceExportBody }>, reply: FastifyReply) => {
      const { subjectLine, formalDocument, authorityCode, evidenceDigest = [] } = request.body || {};

      if (!formalDocument || !subjectLine) {
        return reply.status(400).send({
          ok: false,
          error: 'formalDocument and subjectLine are required for export',
          code: 'INVALID_INPUT',
        });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `vyshuuu_grievance_${authorityCode || 'STATUTORY'}_${timestamp}.md`;

      const manifestChecksum = crypto
        .createHash('sha256')
        .update(formalDocument, 'utf8')
        .digest('hex');

      const fileHeader =
        `<!-- VYSHUUU FORMAL GRIEVANCE EXPORT BUNDLE -->\n` +
        `<!-- Generated: ${new Date().toISOString()} -->\n` +
        `<!-- SHA-256 Package Integrity: ${manifestChecksum} -->\n` +
        `<!-- Disclaimer: ${DRAFTSMAN_DISCLAIMER} -->\n\n`;

      const fullContent = fileHeader + formalDocument;

      return reply.send({
        ok: true,
        filename,
        mimeType: 'text/markdown',
        fileContent: fullContent,
        packageChecksum: manifestChecksum,
        evidenceCount: evidenceDigest.length,
        disclaimer: DRAFTSMAN_DISCLAIMER,
      });
    }
  );

  // Export Incident Timeline Manifest
  const exportHandler = async (request: FastifyRequest<{ Body: StalkLedgerExportBody }>, reply: FastifyReply) => {
    const { incidents, patterns = [] } = request.body || {};

    if (!Array.isArray(incidents)) {
      return reply.status(400).send({
        ok: false,
        error: 'incidents array is required for timeline export',
        code: 'INVALID_INPUT',
      });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `vyshuuu_incident_manifest_${timestamp}.json`;

    const manifestPayload = {
      exportVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      disclaimer: PROTECT_DISCLAIMER,
      incidentsCount: incidents.length,
      incidents,
      detectedPatterns: patterns,
    };

    const manifestJson = JSON.stringify(manifestPayload, null, 2);
    const manifestChecksum = crypto
      .createHash('sha256')
      .update(manifestJson, 'utf8')
      .digest('hex');

    return reply.send({
      ok: true,
      filename,
      mimeType: 'application/json',
      fileContent: manifestJson,
      manifestChecksum,
      disclaimer: PROTECT_DISCLAIMER,
    });
  };

  fastify.post('/api/v1/export/incident-timeline', exportHandler);
  fastify.post('/api/v1/export/stalkledger-timeline', exportHandler);
}

