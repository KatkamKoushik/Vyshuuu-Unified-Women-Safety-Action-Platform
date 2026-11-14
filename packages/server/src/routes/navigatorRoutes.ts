import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

interface TriageRequestBody {
  query: string;
  currentLocation?: {
    lat: number;
    lon: number;
  };
}

export const NAVIGATOR_DISCLAIMER =
  'vyshuuu is an informational decision-support assistant. In life-threatening emergencies, ' +
  'always contact official emergency services (112) or campus security immediately.';

export async function registerNavigatorRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/api/v1/navigator/triage',
    async (request: FastifyRequest<{ Body: TriageRequestBody }>, reply: FastifyReply) => {
      const { query } = request.body || {};

      if (!query || typeof query !== 'string') {
        return reply.status(400).send({
          ok: false,
          error: 'query is required as a non-empty string',
          code: 'INVALID_INPUT',
        });
      }

      if (query.length > 2000) {
        return reply.status(400).send({
          ok: false,
          error: 'query exceeds maximum length of 2000 characters',
          code: 'PAYLOAD_TOO_LARGE',
        });
      }

      const q = query.toLowerCase();

      // 1. Emergency Safety Filter
      const emergencyRegex = /\b(danger|follow(?:ing\s*me)?|attacks?|attacked|knif(?:e|es)|threatened|help\s*me\s*now|immediate\s*help|save\s*me|sos|emergency)\b/i;
      const isEmergency = emergencyRegex.test(q);

      if (isEmergency) {
        return reply.send({
          ok: true,
          isEmergency: true,
          intent: 'EMERGENCY',
          emergencyDialCode: '112',
          title: 'Immediate Safety Priority',
          guidance:
            'If you feel in immediate danger, dial 112 (National Emergency Support System) directly. ' +
            'Move toward the nearest well-lit public store or commercial venue with staff immediately.',
          actionPill: {
            label: 'Call 112 Helpline',
            targetScreen: 'DIALER',
            phone: '112',
          },
          disclaimer: NAVIGATOR_DISCLAIMER,
        });
      }

      // 2. Protect & Timeline Matching (Protect)
      // Check online harassment / cyberstalking before physical grievance
      const protectRegex = /\b(instagram|whatsapp|telegram|messages?|harass(?:ment)?|stalk(?:ing|er)?|fake\s*account|dms?|unwanted|block(?:ed)?|exposure|bio|audit|leak)\b/i;
      if (protectRegex.test(q)) {
        return reply.send({
          ok: true,
          isEmergency: false,
          intent: 'PROTECT',
          title: 'Protect — Incident Evidence Vault',
          guidance:
            'I can help you document cross-platform messages in a private tamper-evident timeline with cryptographic SHA-256 hashes, or audit your bio for accidental personal exposure.',
          actionPill: {
            label: 'Open Protect Vault',
            targetScreen: 'ProtectScreen',
            initialPayload: { initialText: query },
          },
          disclaimer: NAVIGATOR_DISCLAIMER,
        });
      }

      // 3. Action Grievance Matching (Act)
      const actRegex = /\b(hostels?|wardens?|rats?|bites?|food|mess\b|poison(?:ing)?|sanitation|complaints?|ugc|samadhaan|fssai|icc|posh|ragging|rooms?)\b/i;
      if (actRegex.test(q)) {
        return reply.send({
          ok: true,
          isEmergency: false,
          intent: 'ACT',
          title: 'Act — Statutory Grievance Assistant',
          guidance:
            'I can help you build an evidence-backed formal grievance, identify the correct statutory authority (e.g. UGC e-Samadhaan or FSSAI FoSCoS), and prepare assisted portal handoffs.',
          actionPill: {
            label: 'Open Act Assistant',
            targetScreen: 'ActScreen',
            initialPayload: { initialStatement: query },
          },
          disclaimer: NAVIGATOR_DISCLAIMER,
        });
      }

      // 4. Default: Move Route Intelligence (Move)
      return reply.send({
        ok: true,
        isEmergency: false,
        intent: 'MOVE',
        title: 'Move — Route Intelligence',
        guidance:
          'I can help you evaluate walking corridors with mapped amenities, daylight estimates, and street-level imagery comparisons.',
        actionPill: {
          label: 'Explore Walking Routes',
          targetScreen: 'MoveScreen',
        },
        disclaimer: NAVIGATOR_DISCLAIMER,
      });
    }
  );
}
