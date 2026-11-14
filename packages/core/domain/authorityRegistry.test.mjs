import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  VERIFIED_AUTHORITIES,
  matchAuthorityForGrievance,
} from './authorityRegistry.js';

describe('authorityRegistry', () => {
  it('exposes verified statutory directory with required portal and regulatory metadata', () => {
    assert.ok(VERIFIED_AUTHORITIES.UGC_SAMADHAAN);
    assert.equal(VERIFIED_AUTHORITIES.UGC_SAMADHAAN.resolutionWindowDays, 20);
    assert.equal(VERIFIED_AUTHORITIES.UGC_SAMADHAAN.submissionMode, 'ASSISTED_PORTAL_HANDOFF');

    assert.ok(VERIFIED_AUTHORITIES.FSSAI_FOSCOS);
    assert.deepEqual(VERIFIED_AUTHORITIES.FSSAI_FOSCOS.allowedAttachments.formats, ['jpg', 'jpeg', 'png']);
    assert.ok(!VERIFIED_AUTHORITIES.FSSAI_FOSCOS.allowedAttachments.formats.includes('pdf'), 'FSSAI FoSCoS strictly rejects PDF format');

    assert.ok(VERIFIED_AUTHORITIES.CYBERCRIME_INDIA);
    assert.equal(VERIFIED_AUTHORITIES.CYBERCRIME_INDIA.emergencyHelpline, '1930');

    assert.ok(VERIFIED_AUTHORITIES.COLLEGE_ICC);
    assert.equal(VERIFIED_AUTHORITIES.COLLEGE_ICC.resolutionWindowDays, 90);
    assert.equal(VERIFIED_AUTHORITIES.COLLEGE_ICC.submissionMode, 'AUTHORIZED_EMAIL');

    assert.ok(VERIFIED_AUTHORITIES.ANTI_RAGGING);
    assert.equal(VERIFIED_AUTHORITIES.ANTI_RAGGING.emergencyHelpline, '1800-180-5522');
  });

  it('routes ragging or coercive initiation to Anti-Ragging Agency with immediate escalation advice', () => {
    const res1 = matchAuthorityForGrievance({ category: 'RAGGING', statement: 'Forced to do pushups by seniors in hostel' });
    assert.equal(res1.primaryAuthority.code, 'ANTI_RAGGING');
    assert.match(res1.escalationAdvice, /1800-180-5522/);

    const res2 = matchAuthorityForGrievance({ statement: 'hostel seniors forced by seniors to stay outside all night' });
    assert.equal(res2.primaryAuthority.code, 'ANTI_RAGGING');
  });

  it('routes mess food contamination to FSSAI FoSCoS with image format restrictions highlighted', () => {
    const res = matchAuthorityForGrievance({
      category: 'MESS_FOOD_CONTAMINATION',
      statement: 'Found worms in mess dal and contaminated drinking water in cooler',
    });
    assert.equal(res.primaryAuthority.code, 'FSSAI_FOSCOS');
    assert.equal(res.secondaryAuthority.code, 'UGC_SAMADHAAN');
    assert.match(res.escalationAdvice, /strictly requires JPG\/PNG/);
  });

  it('routes cyberstalking and digital harassment to National Cybercrime Reporting Portal', () => {
    const res = matchAuthorityForGrievance({
      category: 'CYBERSTALKING',
      statement: 'Received repeated abusive messages on Instagram and WhatsApp from fake account',
    });
    assert.equal(res.primaryAuthority.code, 'CYBERCRIME_INDIA');
    assert.equal(res.secondaryAuthority.code, 'COLLEGE_ICC');
    assert.match(res.routingReason, /anonymous reporting option/);
  });

  it('routes campus sexual harassment to College ICC under PoSH statutory framework', () => {
    const res = matchAuthorityForGrievance({
      category: 'SEXUAL_HARASSMENT',
      statement: 'Student stalked on campus and faced inappropriate physical conduct outside department',
    });
    assert.equal(res.primaryAuthority.code, 'COLLEGE_ICC');
    assert.match(res.routingReason, /PoSH Act 2013/);
  });

  it('routes rat bite, sanitation, and ignored hostel warden complaints to UGC e-Samadhaan with statutory 20-day timeline', () => {
    const res = matchAuthorityForGrievance({
      category: 'HOSTEL_SANITATION',
      statement: 'Rats in room bit a student sleeping at night. Warden ignored 3 written requests.',
      priorReportIgnored: true,
    });
    assert.equal(res.primaryAuthority.code, 'UGC_SAMADHAAN');
    assert.match(res.routingReason, /20-working-day mandatory redressal window/);
  });
});

