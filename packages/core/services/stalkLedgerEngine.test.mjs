import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateIncidentHash,
  buildTemporalIncidentGraph,
  auditDigitalExposure,
  STALKLEDGER_DISCLAIMER,
} from './stalkLedgerEngine.js';

describe('stalkLedgerEngine', () => {
  it('exports non-safety legal disclaimer', () => {
    assert.ok(STALKLEDGER_DISCLAIMER);
    assert.match(STALKLEDGER_DISCLAIMER, /does not make legal determinations/);
  });

  describe('calculateIncidentHash', () => {
    it('produces deterministic 64-char hex SHA-256 hash for incident record', () => {
      const inc = {
        platform: 'INSTAGRAM',
        senderHandle: '@anon_watcher',
        timestamp: '2026-11-12T14:30:00Z',
        messageContent: 'Saw you outside the library today',
      };
      const h1 = calculateIncidentHash(inc);
      const h2 = calculateIncidentHash(inc);
      assert.equal(h1.length, 64);
      assert.equal(h1, h2);
    });

    it('changes hash when any field is altered', () => {
      const inc1 = {
        platform: 'INSTAGRAM',
        senderHandle: '@anon_watcher',
        timestamp: '2026-11-12T14:30:00Z',
        messageContent: 'Saw you outside the library today',
      };
      const inc2 = {
        ...inc1,
        messageContent: 'Saw you outside the library today.',
      };
      assert.notEqual(calculateIncidentHash(inc1), calculateIncidentHash(inc2));
    });
  });

  describe('buildTemporalIncidentGraph', () => {
    it('handles empty incident array gracefully', () => {
      const res = buildTemporalIncidentGraph([]);
      assert.equal(res.patterns.length, 0);
      assert.equal(res.timelineSpanDays, 0);
      assert.equal(res.uniqueSendersCount, 0);
      assert.deepEqual(res.platformsCovered, []);
    });

    it('detects block evasion, cross-platform convergence, and off-hours contact', () => {
      const incidents = [
        {
          id: 'inc_1',
          timestamp: '2026-11-10T23:30:00Z', // Off-hours (11:30 PM)
          platform: 'INSTAGRAM',
          senderHandle: '@anon_shadow_1',
          messageContent: 'Why did you not reply to me in hostel lobby?',
          wasBlockedPrior: false,
        },
        {
          id: 'inc_2',
          timestamp: '2026-11-11T01:15:00Z', // Off-hours (1:15 AM)
          platform: 'WHATSAPP',
          senderHandle: '+91 98765 00000',
          messageContent: 'You blocked me on IG, so I am messaging here.',
          wasBlockedPrior: true, // Block evasion
        },
        {
          id: 'inc_3',
          timestamp: '2026-11-11T16:00:00Z',
          platform: 'TELEGRAM',
          senderHandle: '@shadow_runner',
          messageContent: 'Waiting outside gate 2 for you.',
          wasBlockedPrior: false,
        },
      ];

      const res = buildTemporalIncidentGraph(incidents);

      assert.equal(res.platformsCovered.length, 3);
      assert.equal(res.uniqueSendersCount, 3);

      const types = res.patterns.map((p) => p.type);
      assert.ok(types.includes('BLOCK_EVASION'), 'Should identify block evasion pattern');
      assert.ok(types.includes('CROSS_PLATFORM_CONVERGENCE'), 'Should identify cross-platform convergence');
      assert.ok(types.includes('OFF_HOURS_CONTACT'), 'Should identify off-hours contact pattern');
      assert.ok(types.includes('LOCATION_AWARENESS'), 'Should identify campus/gate references');
      assert.ok(types.includes('ESCALATING_FREQUENCY'), 'Should identify dense cluster within 48h');

      // Verify tone is factual, not criminal accusatory
      for (const p of res.patterns) {
        assert.ok(!p.summary.toLowerCase().includes('guilty of crime'));
        assert.ok(p.factualBasis.length > 10);
      }
    });
  });

  describe('auditDigitalExposure', () => {
    it('returns SAFE for benign non-revealing bio text', () => {
      const bio = 'Passionate computer science student. Enthusiastic about open-source and robotics. She/her.';
      const res = auditDigitalExposure(bio);
      assert.equal(res.overallRisk, 'SAFE');
      assert.equal(res.findings.length, 0);
    });

    it('identifies room number and hostel name exposures with remediation advice', () => {
      const bio = 'CS Sophomore @ Apex Univ | Ganga Hostel Room 204 | Living the hostel life!';
      const res = auditDigitalExposure(bio);
      assert.equal(res.overallRisk, 'HIGH');
      const roomFinding = res.findings.find((f) => f.category === 'ROOM_OR_HOSTEL');
      assert.ok(roomFinding);
      assert.match(roomFinding.matchedSnippet, /ganga hostel/i);
      assert.match(roomFinding.remediationTip, /Remove specific room numbers/);
    });

    it('identifies predictable routine and timetable leaks', () => {
      const post = 'Study mode: Daily 6pm at library 3rd floor, then walking back from lab at 10pm every Tuesday!';
      const res = auditDigitalExposure(post);
      assert.equal(res.overallRisk, 'HIGH');
      const routineFinding = res.findings.find((f) => f.category === 'ROUTINE_OR_TIMETABLE');
      assert.ok(routineFinding);
      assert.match(routineFinding.remediationTip, /Avoid posting recurring daily schedules/);
    });

    it('identifies exposed personal phone number and UPI handles', () => {
      const text = 'For event registration contact me at +91 9876543210 or GPay at student99@okaxis';
      const res = auditDigitalExposure(text);
      assert.equal(res.overallRisk, 'HIGH');
      const contactFinding = res.findings.find((f) => f.category === 'PHONE_OR_CONTACT');
      assert.ok(contactFinding);
      assert.match(contactFinding.remediationTip, /Never display personal phone numbers/);
    });
  });
});
