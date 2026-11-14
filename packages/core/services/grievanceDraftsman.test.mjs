import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEvidenceSha256,
  generateClarifyingQuestions,
  validateAuthorityAttachments,
  composeFormalGrievance,
  DRAFTSMAN_DISCLAIMER,
} from './grievanceDraftsman.js';

describe('grievanceDraftsman', () => {
  describe('calculateEvidenceSha256', () => {
    it('produces known standard SHA-256 hexadecimal hash', () => {
      // standard test vector: "hello world"
      const digest = calculateEvidenceSha256('hello world');
      assert.equal(digest, 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9');
    });

    it('handles Buffer input and produces 64-character hex string', () => {
      const buf = Buffer.from('medical_prescription_rat_bite_2026');
      const digest = calculateEvidenceSha256(buf);
      assert.equal(digest.length, 64);
      assert.match(digest, /^[0-9a-f]{64}$/);
    });

    it('throws error when data is null or undefined', () => {
      assert.throws(() => calculateEvidenceSha256(null), /cannot be null/);
      assert.throws(() => calculateEvidenceSha256(undefined), /cannot be null/);
    });

    it('guarantees tamper evidence: 1-byte alteration completely changes hash', () => {
      const d1 = calculateEvidenceSha256('Room 204 Rat Bite Report');
      const d2 = calculateEvidenceSha256('Room 204 Rat Bite Report.');
      assert.notEqual(d1, d2);
    });
  });

  describe('generateClarifyingQuestions', () => {
    it('generates 3 targeted questions for hostel sanitation and rat bite scenarios', () => {
      const questions = generateClarifyingQuestions('HOSTEL_SANITATION', 'rat bite in hostel room');
      assert.equal(questions.length, 3);
      assert.equal(questions[0].id, 'q_dates_timeline');
      assert.equal(questions[1].id, 'q_prior_memos');
      assert.equal(questions[2].id, 'q_medical_or_hazard');
      assert.ok(questions[0].purpose.length > 10);
    });

    it('generates 3 targeted questions for mess food contamination', () => {
      const questions = generateClarifyingQuestions('MESS_FOOD', 'found insects in food');
      assert.equal(questions.length, 3);
      assert.equal(questions[0].id, 'q_meal_and_time');
      assert.equal(questions[1].id, 'q_vendor_or_caterer');
    });

    it('generates 3 targeted questions for cyberstalking', () => {
      const questions = generateClarifyingQuestions('CYBERSTALKING', 'unwanted messages on instagram');
      assert.equal(questions.length, 3);
      assert.equal(questions[0].id, 'q_platform_handles');
      assert.equal(questions[1].id, 'q_persistence_and_blocks');
    });
  });

  describe('validateAuthorityAttachments', () => {
    it('flags PDF attachments as invalid for FSSAI FoSCoS portal which strictly takes images', () => {
      const files = [
        { name: 'contaminated_food.jpg', sizeBytes: 1024 * 500 },
        { name: 'doctor_note.pdf', sizeBytes: 1024 * 300 },
      ];
      const res = validateAuthorityAttachments('FSSAI_FOSCOS', files);
      assert.equal(res.isValid, false);
      assert.equal(res.warnings.length, 1);
      assert.match(res.warnings[0], /doctor_note\.pdf.*NOT accepted by FSSAI/);
    });

    it('approves PDF and JPG for UGC e-Samadhaan portal', () => {
      const files = [
        { name: 'warden_memo_copy.pdf', sizeBytes: 1024 * 500 },
        { name: 'room_photos.jpg', sizeBytes: 1024 * 1200 },
      ];
      const res = validateAuthorityAttachments('UGC_SAMADHAAN', files);
      assert.equal(res.isValid, true);
      assert.equal(res.warnings.length, 0);
    });

    it('detects files exceeding portal maximum MB threshold', () => {
      const files = [
        { name: 'huge_video.mp4', sizeBytes: 50 * 1024 * 1024 }, // 50MB
      ];
      const res = validateAuthorityAttachments('UGC_SAMADHAAN', files);
      assert.equal(res.isValid, false);
      assert.ok(res.warnings.some((w) => w.includes('exceeds the maximum limit')));
    });
  });

  describe('composeFormalGrievance', () => {
    it('composes a comprehensive representation bundle for the hostel rat-bite case study', () => {
      const caseInput = {
        complainantName: 'Aarohi S.',
        studentId: 'STU-2024-ENG-082',
        institutionName: 'Apex National Engineering University',
        hostelOrLocation: 'Ganga Girls Hostel, Room 204',
        category: 'HOSTEL_SANITATION',
        incidentDate: '12th November 2026, 02:30 AM',
        rawNarrative:
          'While asleep, a large rodent entered through the broken window mesh and bit my right foot. ' +
          'I woke up bleeding and had to seek emergency anti-rabies and tetanus shots at the District Hospital. ' +
          'Multiple students have reported rat infestations in the hostel corridors for past 3 weeks without response.',
        priorSteps:
          'Written complaints submitted to Hostel Warden on 28th October and 5th November 2026. No pest control was deployed.',
        impact:
          'Physical injury requiring hospital emergency treatment, acute infection risk, psychological distress, and inability to sleep safely.',
        reliefRequested:
          'Immediate professional pest fumigation, replacement of wire mesh on windows, sanitization of food waste disposal, and reimbursement of medical expenses.',
        evidenceItems: [
          {
            name: 'hospital_emergency_slip.jpg',
            type: 'image/jpeg',
            sizeBytes: 840000,
            capturedAt: '2026-11-12T04:15:00Z',
            buffer: Buffer.from('SIMULATED_HOSPITAL_PRESCRIPTION_DATA'),
          },
          {
            name: 'broken_window_mesh.jpg',
            type: 'image/jpeg',
            sizeBytes: 1250000,
            capturedAt: '2026-11-12T08:00:00Z',
            buffer: Buffer.from('SIMULATED_PHOTO_OF_BROKEN_WINDOW_MESH'),
          },
        ],
      };

      const result = composeFormalGrievance(caseInput);

      // Verify Disclaimers and Integrity
      assert.equal(result.disclaimer, DRAFTSMAN_DISCLAIMER);
      assert.equal(result.authority.code, 'UGC_SAMADHAAN');
      assert.equal(result.authority.resolutionWindowDays, 20);
      assert.match(result.statutoryCitation, /University Grants Commission.*Regulations, 2023/);

      // Verify Document Structure
      assert.match(result.formalDocument, /# FORMAL REPRESENTATION/);
      assert.match(result.formalDocument, /SECTION 1: STATEMENT OF FACTUAL CHRONOLOGY/);
      assert.match(result.formalDocument, /SECTION 2: PRIOR INTERNAL REPORTING/);
      assert.match(result.formalDocument, /SECTION 3: LEGAL & STATUTORY FRAMEWORK/);
      assert.match(result.formalDocument, /SECTION 4: SPECIFIC RELIEF SOUGHT/);
      assert.match(result.formalDocument, /SECTION 5: ANNEXURES & CRYPTOGRAPHIC EVIDENCE DIGEST/);

      // Verify SHA-256 Evidence Table
      assert.equal(result.evidenceDigest.length, 2);
      assert.equal(result.evidenceDigest[0].name, 'hospital_emergency_slip.jpg');
      assert.equal(result.evidenceDigest[0].digestHex.length, 64);
      assert.match(result.formalDocument, new RegExp(result.evidenceDigest[0].digestHex));

      // Verify Portal Handoff Payload
      assert.ok(result.portalHandoff);
      assert.equal(result.portalHandoff.targetUrl, 'https://samadhaan.ugc.ac.in/');
      assert.equal(result.portalHandoff.submissionMode, 'ASSISTED_PORTAL_HANDOFF');
      assert.equal(result.portalHandoff.attachmentValidation.isValid, true);

      // Verify Clipboard Pills
      const pillKeys = result.portalHandoff.clipboardPills.map((p) => p.key);
      assert.ok(pillKeys.includes('subject'));
      assert.ok(pillKeys.includes('grievance_description'));
      assert.ok(pillKeys.includes('relief_sought'));
    });

    it('rejects input with missing mandatory fields', () => {
      assert.throws(
        () =>
          composeFormalGrievance({
            institutionName: '',
            hostelOrLocation: 'Room 101',
            rawNarrative: 'Something happened',
            category: 'HOSTEL_SANITATION',
            incidentDate: '2026-11-12',
          }),
        /mandatory for grievance composition/
      );
    });
  });
});

