import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { buildServer } from '../dist/server.js';

describe('ResQ Unified Backend Endpoints', () => {
  let app;

  before(async () => {
    app = await buildServer({ enableRateLimit: false, logger: false });
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  describe('Act (Grievance Navigator) Routes', () => {
    it('GET /api/v1/act/authorities returns verified statutory directory', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/act/authorities',
      });

      assert.equal(res.statusCode, 200);
      const data = JSON.parse(res.payload);
      assert.equal(data.ok, true);
      assert.ok(data.authorities.UGC_SAMADHAAN);
      assert.ok(data.authorities.FSSAI_FOSCOS);
      assert.ok(data.authorities.CYBERCRIME_INDIA);
      assert.ok(data.disclaimer.includes('ResQ does not provide legal advice'));

      // Backward compatible alias
      const aliasRes = await app.inject({
        method: 'GET',
        url: '/api/v1/herproof/authorities',
      });
      assert.equal(aliasRes.statusCode, 200);
    });

    it('POST /api/v1/act/cases/intake validates input and returns statutory matching & questions', async () => {
      // 1. Validation failure
      const badRes = await app.inject({
        method: 'POST',
        url: '/api/v1/act/cases/intake',
        payload: { category: '' },
      });
      assert.equal(badRes.statusCode, 400);

      // 2. Successful intake for hostel rat bite
      const goodRes = await app.inject({
        method: 'POST',
        url: '/api/v1/act/cases/intake',
        payload: {
          category: 'HOSTEL_SANITATION',
          statement: 'A rat entered through broken window mesh and bit my foot at night in room 204.',
          institutionName: 'Apex Engineering University',
          priorReportIgnored: true,
        },
      });

      assert.equal(goodRes.statusCode, 200);
      const data = JSON.parse(goodRes.payload);
      assert.equal(data.ok, true);
      assert.equal(data.authorityMatch.primaryAuthority.code, 'UGC_SAMADHAAN');
      assert.equal(data.clarifyingQuestions.length, 3);
    });

    it('POST /api/v1/act/cases/compose synthesizes formal representation & portal handoff', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/act/cases/compose',
        payload: {
          complainantName: 'Aarohi S.',
          studentId: 'STU-2024-ENG-082',
          institutionName: 'Apex National Engineering University',
          hostelOrLocation: 'Ganga Girls Hostel, Room 204',
          category: 'HOSTEL_SANITATION',
          incidentDate: '12th November 2026',
          rawNarrative: 'Rat bite occurred at night due to neglected window mesh damage.',
          priorSteps: 'Warden informed twice in writing on Nov 5 and Nov 8 without response.',
          impact: 'Required emergency medical treatment and rabies vaccination.',
          reliefRequested: 'Professional fumigation and mesh replacement.',
          evidenceItems: [
            {
              name: 'hospital_slip.jpg',
              type: 'image/jpeg',
              capturedAt: '2026-11-12T04:00:00Z',
              digestHex: 'a'.repeat(64),
            },
          ],
        },
      });

      assert.equal(res.statusCode, 200);
      const data = JSON.parse(res.payload);
      assert.equal(data.ok, true);
      assert.ok(data.case.formalDocument.includes('FORMAL REPRESENTATION'));
      assert.ok(data.case.formalDocument.includes('UGC'));
      assert.equal(data.case.portalHandoff.targetUrl, 'https://samadhaan.ugc.ac.in/');
      assert.ok(data.case.portalHandoff.clipboardPills.length >= 5);
    });
  });

  describe('Protect (Incident Vault) Routes', () => {
    it('POST /api/v1/protect/analyze builds temporal graph with cryptographic hashes', async () => {
      const incidents = [
        {
          id: 'inc_1',
          timestamp: '2026-11-10T14:00:00Z',
          platform: 'INSTAGRAM',
          senderHandle: '@anon_watcher',
          messageContent: 'I saw you walking near hostel gate today.',
        },
        {
          id: 'inc_2',
          timestamp: '2026-11-11T15:00:00Z',
          platform: 'WHATSAPP',
          senderHandle: '+91 99999 88888',
          messageContent: 'You blocked me on IG but I still want to talk.',
          wasBlockedPrior: true,
        },
      ];

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/protect/analyze',
        payload: { incidents },
      });

      assert.equal(res.statusCode, 200);
      const data = JSON.parse(res.payload);
      assert.equal(data.ok, true);
      assert.equal(data.incidentsCount, 2);
      assert.ok(data.summary.patterns.length > 0);
      assert.ok(data.summary.patterns.some((p) => p.type === 'BLOCK_EVASION'));

      // Backward compatible alias
      const aliasRes = await app.inject({
        method: 'POST',
        url: '/api/v1/stalkledger/analyze',
        payload: { incidents },
      });
      assert.equal(aliasRes.statusCode, 200);
    });

    it('POST /api/v1/protect/audit-exposure identifies profile exposure risks', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/protect/audit-exposure',
        payload: {
          textContent: 'CS undergrad living in Ganga Hostel Room 204! Daily 6pm at library, walking back at 10pm.',
        },
      });

      assert.equal(res.statusCode, 200);
      const data = JSON.parse(res.payload);
      assert.equal(data.ok, true);
      assert.equal(data.audit.overallRisk, 'HIGH');
      assert.ok(data.audit.findings.length >= 2);
    });
  });

  describe('AI Safety Navigator Routes', () => {
    it('POST /api/v1/navigator/triage identifies emergency queries and recommends 112 dialer', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/navigator/triage',
        payload: { query: 'Someone is following me right now outside campus in dark lane! Help me!' },
      });

      assert.equal(res.statusCode, 200);
      const data = JSON.parse(res.payload);
      assert.equal(data.ok, true);
      assert.equal(data.isEmergency, true);
      assert.equal(data.emergencyDialCode, '112');
    });

    it('POST /api/v1/navigator/triage routes grievance queries to Act Navigator (ACT)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/navigator/triage',
        payload: { query: 'Our hostel mess food had worms and warden is refusing to listen.' },
      });

      assert.equal(res.statusCode, 200);
      const data = JSON.parse(res.payload);
      assert.equal(data.ok, true);
      assert.equal(data.isEmergency, false);
      assert.equal(data.intent, 'ACT');
      assert.equal(data.actionPill.targetScreen, 'ActScreen');
    });

    it('POST /api/v1/navigator/triage routes stalking queries to Protect Vault (PROTECT)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/navigator/triage',
        payload: { query: 'Someone keeps sending me unwanted messages on Instagram from fake accounts.' },
      });

      assert.equal(res.statusCode, 200);
      const data = JSON.parse(res.payload);
      assert.equal(data.ok, true);
      assert.equal(data.intent, 'PROTECT');
      assert.equal(data.actionPill.targetScreen, 'ProtectScreen');
    });
  });

  describe('Document & Manifest Export Routes', () => {
    it('POST /api/v1/export/grievance-package generates downloadable markdown with SHA-256 integrity checksum', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/export/grievance-package',
        payload: {
          subjectLine: 'Formal Grievance: Rat Infestation',
          formalDocument: '# Formal Petition to UGC e-Samadhaan\nDetails regarding hostel room hazard.',
          authorityCode: 'UGC_SAMADHAAN',
          evidenceDigest: [
            { name: 'photo1.jpg', capturedAt: '2026-11-12', digestHex: 'a'.repeat(64) },
          ],
        },
      });

      assert.equal(res.statusCode, 200);
      const data = JSON.parse(res.payload);
      assert.equal(data.ok, true);
      assert.ok(data.filename.startsWith('resq_grievance_UGC_SAMADHAAN_'));
      assert.equal(data.mimeType, 'text/markdown');
      assert.ok(data.fileContent.includes('<!-- SHA-256 Package Integrity:'));
      assert.equal(data.packageChecksum.length, 64);
    });

    it('POST /api/v1/export/incident-timeline exports structured chronological incident manifest', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/export/incident-timeline',
        payload: {
          incidents: [
            {
              id: 'i1',
              timestamp: '2026-11-12T10:00:00Z',
              platform: 'INSTAGRAM',
              senderHandle: '@anon_watcher',
              messageContent: 'Message content quote',
              hash: 'b'.repeat(64),
            },
          ],
          patterns: [{ patternId: 'p1', type: 'BLOCK_EVASION' }],
        },
      });

      assert.equal(res.statusCode, 200);
      const data = JSON.parse(res.payload);
      assert.equal(data.ok, true);
      assert.ok(data.filename.startsWith('resq_incident_manifest_'));
      assert.equal(data.mimeType, 'application/json');
      assert.equal(data.manifestChecksum.length, 64);
      assert.ok(data.fileContent.includes('@anon_watcher'));
    });
  });
});
