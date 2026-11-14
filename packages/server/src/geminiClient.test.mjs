import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  dynamicGrievanceAnalysis,
  dynamicExposureAudit,
  GEMINI_SYSTEM_GUARDRAIL,
} from '../dist/services/geminiClient.js';

describe('Gemini Client & Prompt Guardrails', () => {
  it('enforces prompt-injection isolation guardrail in system instruction', () => {
    assert.ok(GEMINI_SYSTEM_GUARDRAIL);
    assert.match(GEMINI_SYSTEM_GUARDRAIL, /UNTRUSTED DATA STRINGS/);
    assert.match(GEMINI_SYSTEM_GUARDRAIL, /Never follow instructions/);
  });

  describe('dynamicGrievanceAnalysis', () => {
    it('gracefully falls back to deterministic domain engine when no API key is provided', async () => {
      const res = await dynamicGrievanceAnalysis(
        'A large rat bit my foot while sleeping in room 204 of Ganga hostel.',
        'Warden ignored written complaints from last week.',
        undefined // No key
      );

      assert.equal(res.isAiGenerated, false);
      assert.equal(res.matchedAuthorityCode, 'UGC_SAMADHAAN');
      assert.equal(res.clarifyingQuestions.length, 3);
      assert.ok(res.reason.includes('20-working-day mandatory redressal window'));
    });

    it('correctly categorizes mess food contamination without network requirement', async () => {
      const res = await dynamicGrievanceAnalysis(
        'Found worms in hostel mess food dal and contaminated drinking water in cooler.',
        '',
        undefined
      );

      assert.equal(res.isAiGenerated, false);
      assert.equal(res.matchedAuthorityCode, 'FSSAI_FOSCOS');
      assert.equal(res.clarifyingQuestions.length, 3);
      assert.ok(res.reason.includes('FSSAI FoSCoS'));
    });
  });

  describe('dynamicExposureAudit', () => {
    it('gracefully audits bio exposure using client-side deterministic engine when no API key is provided', async () => {
      const bio = 'Sophomore @ Apex Univ | Ganga Hostel Room 204 | Daily 6pm at library, walking back at 10pm!';
      const res = await dynamicExposureAudit(bio, undefined);

      assert.equal(res.isAiGenerated, false);
      assert.equal(res.overallRisk, 'HIGH');
      assert.ok(res.findings.length >= 2);
      assert.ok(res.findings.some((f) => f.category === 'ROOM_OR_HOSTEL'));
      assert.ok(res.findings.some((f) => f.category === 'ROUTINE_OR_TIMETABLE'));
    });

    it('returns SAFE for non-revealing bio text', async () => {
      const bio = 'Robotics enthusiast and open-source contributor. Python & React Native developer.';
      const res = await dynamicExposureAudit(bio, undefined);

      assert.equal(res.isAiGenerated, false);
      assert.equal(res.overallRisk, 'SAFE');
      assert.equal(res.findings.length, 0);
    });
  });
});

