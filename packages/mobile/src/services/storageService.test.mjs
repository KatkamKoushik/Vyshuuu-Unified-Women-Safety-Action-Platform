import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  setDbInstance,
  initSchema,
  saveJourney,
  getSavedJourneys,
  toggleFavoriteJourney,
  deleteJourney,
  saveRecentSearch,
  getRecentSearches,
  hardWipeAllData,
  saveIncident,
  getSavedIncidents,
  deleteIncident,
  saveGrievance,
  getSavedGrievances,
  deleteGrievance,
  saveEmergencyContact,
  getEmergencyContacts,
  deleteEmergencyContact,
  getSecuritySetting,
  setSecuritySetting,
} from './storageService.js';

function createInMemoryDb() {
  let hasTables = false;
  const savedJourneys = new Map();
  const recentSearches = new Map();
  const savedIncidents = new Map();
  const savedGrievances = new Map();
  const emergencyContacts = new Map();
  const securitySettings = new Map();

  return {
    async execAsync(sql) {
      if (sql.includes('CREATE TABLE')) {
        hasTables = true;
      }
      if (sql.includes('DELETE FROM saved_journeys')) {
        savedJourneys.clear();
      }
      if (sql.includes('DELETE FROM recent_searches')) {
        recentSearches.clear();
      }
      if (sql.includes('DELETE FROM saved_incidents')) {
        savedIncidents.clear();
      }
      if (sql.includes('DELETE FROM saved_grievances')) {
        savedGrievances.clear();
      }
      if (sql.includes('DELETE FROM emergency_contacts')) {
        emergencyContacts.clear();
      }
      if (sql.includes('DELETE FROM app_security_settings')) {
        securitySettings.clear();
      }
      return Promise.resolve();
    },
    async runAsync(sql, ...params) {
      const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
      if (sql.includes('INSERT OR REPLACE INTO saved_journeys')) {
        const [
          id, title, origin_name, origin_lat, origin_lon,
          dest_name, dest_lat, dest_lon, distance_m, duration_s,
          context_score, is_favorite, created_at
        ] = flatParams;
        savedJourneys.set(id, {
          id, title, origin_name, origin_lat, origin_lon,
          dest_name, dest_lat, dest_lon, distance_m, duration_s,
          context_score, is_favorite, created_at
        });
      } else if (sql.includes('UPDATE saved_journeys SET is_favorite = ? WHERE id = ?')) {
        const [newStatus, id] = flatParams;
        const j = savedJourneys.get(id);
        if (j) {
          j.is_favorite = newStatus;
        }
      } else if (sql.includes('DELETE FROM saved_journeys WHERE id = ?')) {
        const [id] = flatParams;
        savedJourneys.delete(id);
      } else if (sql.includes('INSERT OR REPLACE INTO recent_searches')) {
        const [id, query, lat, lon, display_name, created_at] = flatParams;
        recentSearches.set(id, { id, query, lat, lon, display_name, created_at });
      } else if (sql.includes('INSERT OR REPLACE INTO saved_incidents')) {
        const [id, timestamp, platform, sender_handle, message_content, was_blocked_prior, evidence_ref, hash, created_at] = flatParams;
        savedIncidents.set(id, { id, timestamp, platform, sender_handle, message_content, was_blocked_prior, evidence_ref, hash, created_at });
      } else if (sql.includes('DELETE FROM saved_incidents WHERE id = ?')) {
        const [id] = flatParams;
        savedIncidents.delete(id);
      } else if (sql.includes('INSERT OR REPLACE INTO saved_grievances')) {
        const [id, title, category, institution_name, hostel_location, incident_date, raw_narrative, prior_steps, relief_requested, authority_code, formal_document, status, created_at] = flatParams;
        savedGrievances.set(id, { id, title, category, institution_name, hostel_location, incident_date, raw_narrative, prior_steps, relief_requested, authority_code, formal_document, status, created_at });
      } else if (sql.includes('DELETE FROM saved_grievances WHERE id = ?')) {
        const [id] = flatParams;
        savedGrievances.delete(id);
      } else if (sql.includes('INSERT OR REPLACE INTO emergency_contacts')) {
        const [id, name, phone_number, relationship, created_at] = flatParams;
        emergencyContacts.set(id, { id, name, phone_number, relationship, created_at });
      } else if (sql.includes('DELETE FROM emergency_contacts WHERE id = ?')) {
        const [id] = flatParams;
        emergencyContacts.delete(id);
      } else if (sql.includes('INSERT OR REPLACE INTO app_security_settings')) {
        const [key, value] = flatParams;
        securitySettings.set(key, { key, value });
      }
      return Promise.resolve();
    },
    async getAllAsync(sql, ...params) {
      const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
      if (sql.includes('sqlite_master')) {
        if (!hasTables) return [];
        if (sql.includes("('saved_journeys', 'recent_searches')")) {
          return [{ name: 'saved_journeys' }, { name: 'recent_searches' }];
        }
        return [{ name: 'saved_journeys' }, { name: 'recent_searches' }, { name: 'saved_incidents' }, { name: 'saved_grievances' }, { name: 'emergency_contacts' }, { name: 'app_security_settings' }];
      }
      if (sql.includes('saved_journeys')) {
        const arr = Array.from(savedJourneys.values());
        arr.sort((a, b) => {
          if (b.is_favorite !== a.is_favorite) {
            return b.is_favorite - a.is_favorite;
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        return arr;
      }
      if (sql.includes('recent_searches')) {
        const limit = flatParams[0] || 5;
        const arr = Array.from(recentSearches.values());
        arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return arr.slice(0, limit);
      }
      if (sql.includes('saved_incidents')) {
        const arr = Array.from(savedIncidents.values());
        arr.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return arr;
      }
      if (sql.includes('saved_grievances')) {
        const arr = Array.from(savedGrievances.values());
        arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return arr;
      }
      if (sql.includes('emergency_contacts')) {
        const arr = Array.from(emergencyContacts.values());
        arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        return arr;
      }
      return [];
    },
    async getFirstAsync(sql, ...params) {
      const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
      if (sql.includes('SELECT is_favorite FROM saved_journeys WHERE id = ?')) {
        const [id] = flatParams;
        const j = savedJourneys.get(id);
        return j ? { is_favorite: j.is_favorite } : null;
      }
      if (sql.includes('SELECT value FROM app_security_settings WHERE key = ?')) {
        const [key] = flatParams;
        const s = securitySettings.get(key);
        return s ? { value: s.value } : null;
      }
      return null;
    },
    getRawIncident(id) {
      return savedIncidents.get(id);
    },
    getRawGrievance(id) {
      return savedGrievances.get(id);
    },
  };
}

describe('storageService (SQLite Local Storage & Zero-Telemetry Privacy)', () => {
  let db;

  beforeEach(async () => {
    db = createInMemoryDb();
    setDbInstance(db);
    await initSchema(db);
  });

  describe('schema initialization and migrations', () => {
    it('initializes saved_journeys and recent_searches tables', async () => {
      const tables = await db.getAllAsync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('saved_journeys', 'recent_searches');"
      );
      assert.equal(tables.length, 2);
      const names = tables.map((t) => t.name).sort();
      assert.deepEqual(names, ['recent_searches', 'saved_journeys']);
    });

    it('is idempotent and supports re-running initSchema without throwing or corrupting data', async () => {
      await saveJourney({
        id: 'test-1',
        title: 'Work to Home',
        origin_name: 'Origin A',
        origin_lat: 12.975,
        origin_lon: 77.605,
        dest_name: 'Dest B',
        dest_lat: 12.980,
        dest_lon: 77.610,
        distance_m: 850,
        duration_s: 600,
        context_score: 45,
        is_favorite: 1,
      });

      // Second migration pass
      await initSchema(db);

      const rows = await getSavedJourneys();
      assert.equal(rows.length, 1);
      assert.equal(rows[0].title, 'Work to Home');
    });
  });

  describe('saved journeys and favorites', () => {
    it('saves a journey and retrieves it with correct types and timestamp', async () => {
      await saveJourney({
        id: 'j-london-1',
        title: 'Trafalgar to Covent Garden',
        origin_name: 'Trafalgar Square',
        origin_lat: 51.5080,
        origin_lon: -0.1281,
        dest_name: 'Covent Garden',
        dest_lat: 51.5117,
        dest_lon: -0.1240,
        distance_m: 670,
        duration_s: 540,
        context_score: 80,
        is_favorite: 0,
      });

      const journeys = await getSavedJourneys();
      assert.equal(journeys.length, 1);
      const j = journeys[0];
      assert.equal(j.id, 'j-london-1');
      assert.equal(j.title, 'Trafalgar to Covent Garden');
      assert.equal(j.distance_m, 670);
      assert.equal(j.duration_s, 540);
      assert.equal(j.context_score, 80);
      assert.equal(j.is_favorite, 0);
      assert.ok(j.created_at);
    });

    it('sorts saved journeys with favorites first, then newest first', async () => {
      await saveJourney({
        id: 'j-1',
        title: 'Journey 1 (Normal)',
        origin_name: 'A',
        origin_lat: 0,
        origin_lon: 0,
        dest_name: 'B',
        dest_lat: 0,
        dest_lon: 0,
        distance_m: 100,
        duration_s: 60,
        context_score: 10,
        is_favorite: 0,
      });

      await saveJourney({
        id: 'j-2',
        title: 'Journey 2 (Favorited)',
        origin_name: 'C',
        origin_lat: 0,
        origin_lon: 0,
        dest_name: 'D',
        dest_lat: 0,
        dest_lon: 0,
        distance_m: 200,
        duration_s: 120,
        context_score: 50,
        is_favorite: 1,
      });

      const journeys = await getSavedJourneys();
      assert.equal(journeys.length, 2);
      assert.equal(journeys[0].id, 'j-2', 'Favorited journey must come first');
      assert.equal(journeys[1].id, 'j-1');
    });

    it('toggles favorite status between 0 and 1', async () => {
      await saveJourney({
        id: 'j-fav-test',
        title: 'Toggle Journey',
        origin_name: 'A',
        origin_lat: 0,
        origin_lon: 0,
        dest_name: 'B',
        dest_lat: 0,
        dest_lon: 0,
        distance_m: 100,
        duration_s: 60,
        context_score: 10,
        is_favorite: 0,
      });

      // 0 -> 1
      const favResult1 = await toggleFavoriteJourney('j-fav-test');
      assert.equal(favResult1, true);
      let list = await getSavedJourneys();
      assert.equal(list[0].is_favorite, 1);

      // 1 -> 0
      const favResult2 = await toggleFavoriteJourney('j-fav-test');
      assert.equal(favResult2, false);
      list = await getSavedJourneys();
      assert.equal(list[0].is_favorite, 0);

      // Non-existent id
      const favMissing = await toggleFavoriteJourney('non-existent-id');
      assert.equal(favMissing, false);
    });

    it('deletes a single journey by id', async () => {
      await saveJourney({
        id: 'j-to-delete',
        title: 'Delete Me',
        origin_name: 'A',
        origin_lat: 0,
        origin_lon: 0,
        dest_name: 'B',
        dest_lat: 0,
        dest_lon: 0,
        distance_m: 100,
        duration_s: 60,
        context_score: 10,
      });

      await saveJourney({
        id: 'j-to-keep',
        title: 'Keep Me',
        origin_name: 'A',
        origin_lat: 0,
        origin_lon: 0,
        dest_name: 'B',
        dest_lat: 0,
        dest_lon: 0,
        distance_m: 100,
        duration_s: 60,
        context_score: 10,
      });

      await deleteJourney('j-to-delete');

      const remaining = await getSavedJourneys();
      assert.equal(remaining.length, 1);
      assert.equal(remaining[0].id, 'j-to-keep');
    });
  });

  describe('recent searches', () => {
    it('saves and retrieves recent searches respecting limit', async () => {
      for (let i = 1; i <= 6; i++) {
        await saveRecentSearch({
          id: `s-${i}`,
          query: `Search ${i}`,
          lat: 12.9 + i * 0.01,
          lon: 77.6 + i * 0.01,
          display_name: `Location ${i}`,
        });
      }

      const top3 = await getRecentSearches(3);
      assert.equal(top3.length, 3);

      const top5 = await getRecentSearches(5);
      assert.equal(top5.length, 5);
    });
  });

  describe('1-tap hard wipe (hardWipeAllData)', () => {
    it('clears all saved journeys, recent searches, and leaves tables empty', async () => {
      await saveJourney({
        id: 'j-wipe-1',
        title: 'Wipe Journey',
        origin_name: 'A',
        origin_lat: 0,
        origin_lon: 0,
        dest_name: 'B',
        dest_lat: 0,
        dest_lon: 0,
        distance_m: 100,
        duration_s: 60,
        context_score: 10,
      });

      await saveRecentSearch({
        id: 's-wipe-1',
        query: 'Wipe Search',
        lat: 0,
        lon: 0,
        display_name: 'Wipe Loc',
      });

      // Execute Hard Wipe
      await hardWipeAllData();

      const remainingJourneys = await getSavedJourneys();
      const remainingSearches = await getRecentSearches();

      assert.equal(remainingJourneys.length, 0);
      assert.equal(remainingSearches.length, 0);
    });
  });

  describe('concurrency, boundary sanitization, and SQL injection resistance', () => {
    it('handles high-concurrency burst writes (50 parallel saves) without corruption', async () => {
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(
          saveJourney({
            id: `concurrent-${i}`,
            title: `Burst Journey ${i}`,
            origin_name: `Point ${i}`,
            origin_lat: 12.97 + i * 0.001,
            origin_lon: 77.60 + i * 0.001,
            dest_name: `Destination ${i}`,
            dest_lat: 12.98 + i * 0.001,
            dest_lon: 77.61 + i * 0.001,
            distance_m: 500 + i,
            duration_s: 300 + i,
            context_score: 50,
          })
        );
      }

      await Promise.all(promises);
      const rows = await getSavedJourneys();
      assert.equal(rows.length, 50);
    });

    it('safely neutralizes SQL injection attempts in string fields', async () => {
      const maliciousPayload = "'; DROP TABLE saved_journeys; SELECT '1";
      await saveJourney({
        id: 'sqli-test',
        title: maliciousPayload,
        origin_name: "admin' --",
        origin_lat: 12.9,
        origin_lon: 77.6,
        dest_name: "dest' OR '1'='1",
        dest_lat: 12.9,
        dest_lon: 77.6,
        distance_m: 100,
        duration_s: 100,
        context_score: 50,
      });

      const rows = await getSavedJourneys();
      assert.equal(rows.length, 1);
      assert.equal(rows[0].title, maliciousPayload);
      assert.equal(rows[0].origin_name, "admin' --");
    });

    it('sanitizes NaN and out-of-range numbers into valid bounded numbers', async () => {
      await saveJourney({
        id: 'nan-test',
        title: 'NaN Route',
        origin_name: 'Origin',
        origin_lat: NaN,
        origin_lon: NaN,
        dest_name: 'Dest',
        dest_lat: 195.5, // exceeds 90
        dest_lon: -250.0, // exceeds -180
        distance_m: -50, // negative distance
        duration_s: NaN,
        context_score: 999, // exceeds 100
      });

      const rows = await getSavedJourneys();
      assert.equal(rows.length, 1);
      assert.equal(rows[0].origin_lat, 0);
      assert.equal(rows[0].origin_lon, 0);
      assert.equal(rows[0].dest_lat, 90);
      assert.equal(rows[0].dest_lon, -180);
      assert.equal(rows[0].distance_m, 0);
      assert.equal(rows[0].context_score, 100);
    });
  });

  describe('Incident Evidence & Grievance Local Persistence', () => {
    it('saves, retrieves, and deletes incident evidence records with cryptographic hash', async () => {
      await saveIncident({
        id: 'inc_test_1',
        timestamp: '2026-11-12T10:00:00Z',
        platform: 'INSTAGRAM',
        sender_handle: '@anon_tracker',
        message_content: 'Watched you walk into Ganga Hostel',
        was_blocked_prior: 1,
        evidence_ref: 'screenshot_1.jpg',
        hash: 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
      });

      // Verify at-rest authenticated encryption in raw SQLite row (REQ-005)
      const rawStoredIncident = db.getRawIncident('inc_test_1');
      assert.ok(rawStoredIncident.message_content.startsWith('enc:v1:'));
      assert.ok(!rawStoredIncident.message_content.includes('Ganga Hostel'));
      assert.ok(rawStoredIncident.sender_handle.startsWith('enc:v1:'));
      assert.ok(!rawStoredIncident.sender_handle.includes('@anon_tracker'));

      const incidents = await getSavedIncidents();
      assert.equal(incidents.length, 1);
      assert.equal(incidents[0].sender_handle, '@anon_tracker');
      assert.equal(incidents[0].message_content, 'Watched you walk into Ganga Hostel');
      assert.equal(incidents[0].was_blocked_prior, 1);
      assert.equal(incidents[0].hash.length, 64);

      await deleteIncident('inc_test_1');
      const remaining = await getSavedIncidents();
      assert.equal(remaining.length, 0);
    });

    it('saves, retrieves, and deletes statutory grievance cases', async () => {
      await saveGrievance({
        id: 'case_test_1',
        title: 'Hostel Rat Infestation',
        category: 'HOSTEL_SANITATION',
        institution_name: 'Apex Engineering University',
        hostel_location: 'Ganga Hostel Room 204',
        incident_date: '12th November 2026',
        raw_narrative: 'Rat bite in room 204 at night.',
        prior_steps: 'Informed warden twice without response.',
        relief_requested: 'Immediate fumigation and medical refund.',
        authority_code: 'UGC_SAMADHAAN',
        formal_document: '# FORMAL REPRESENTATION TO UGC',
        status: 'PREPARED_FOR_HANDOFF',
      });

      // Verify at-rest authenticated encryption in raw SQLite row (REQ-005)
      const rawStoredCase = db.getRawGrievance('case_test_1');
      assert.ok(rawStoredCase.raw_narrative.startsWith('enc:v1:'));
      assert.ok(!rawStoredCase.raw_narrative.includes('Rat bite'));
      assert.ok(rawStoredCase.formal_document.startsWith('enc:v1:'));
      assert.ok(!rawStoredCase.formal_document.includes('# FORMAL'));

      const cases = await getSavedGrievances();
      assert.equal(cases.length, 1);
      assert.equal(cases[0].authority_code, 'UGC_SAMADHAAN');
      assert.equal(cases[0].raw_narrative, 'Rat bite in room 204 at night.');
      assert.equal(cases[0].status, 'PREPARED_FOR_HANDOFF');

      await deleteGrievance('case_test_1');
      const remaining = await getSavedGrievances();
      assert.equal(remaining.length, 0);
    });

    it('comprehensive 1-tap hard wipe purges all journeys, searches, incidents, and grievances', async () => {
      await saveJourney({
        id: 'j1',
        title: 'Walk to Lab',
        origin_name: 'Hostel',
        origin_lat: 12.9,
        origin_lon: 77.6,
        dest_name: 'Lab',
        dest_lat: 12.91,
        dest_lon: 77.61,
        distance_m: 500,
        duration_s: 300,
        context_score: 80,
      });

      await saveRecentSearch({
        id: 's1',
        query: 'Central Library',
        lat: 12.92,
        lon: 77.62,
        display_name: 'Central Library',
      });

      await saveIncident({
        id: 'i1',
        timestamp: '2026-11-12T10:00:00Z',
        platform: 'WHATSAPP',
        sender_handle: '+91 99999 88888',
        message_content: 'Persistent text',
        was_blocked_prior: 0,
        evidence_ref: '',
        hash: 'a'.repeat(64),
      });

      await saveGrievance({
        id: 'g1',
        title: 'Mess food issue',
        category: 'MESS_FOOD',
        institution_name: 'Univ',
        hostel_location: 'Mess Hall',
        incident_date: '2026-11-12',
        raw_narrative: 'Contaminated dal',
        prior_steps: '',
        relief_requested: '',
        authority_code: 'FSSAI_FOSCOS',
        formal_document: 'text',
        status: 'DRAFT',
      });

      await saveEmergencyContact({
        id: 'ec1',
        name: 'Priya (Sister)',
        phone_number: '+91 98765 43210',
        relationship: 'Sister',
      });

      await setSecuritySetting('stealth_pin', '112=');

      // Perform 1-tap hard wipe
      await hardWipeAllData();

      const journeys = await getSavedJourneys();
      const searches = await getRecentSearches();
      const incidents = await getSavedIncidents();
      const grievances = await getSavedGrievances();
      const contacts = await getEmergencyContacts();
      const stealthPin = await getSecuritySetting('stealth_pin', 'default');

      assert.equal(journeys.length, 0);
      assert.equal(searches.length, 0);
      assert.equal(incidents.length, 0);
      assert.equal(grievances.length, 0);
      assert.equal(contacts.length, 0);
      assert.equal(stealthPin, 'default');
    });

    it('saves, retrieves, and deletes trusted emergency contacts with defensive bounds', async () => {
      await saveEmergencyContact({
        id: 'ec1',
        name: 'Amma',
        phone_number: '+91 98480 12345',
        relationship: 'Mother',
      });
      await saveEmergencyContact({
        id: 'ec2',
        name: 'Campus Security',
        phone_number: '040-23000000',
        relationship: 'Hostel Security',
      });

      let contacts = await getEmergencyContacts();
      assert.equal(contacts.length, 2);
      assert.equal(contacts[0].name, 'Amma');
      assert.equal(contacts[0].phone_number, '+91 98480 12345');

      await deleteEmergencyContact('ec1');
      contacts = await getEmergencyContacts();
      assert.equal(contacts.length, 1);
      assert.equal(contacts[0].id, 'ec2');
    });

    it('persists and retrieves app security settings', async () => {
      const defaultPin = await getSecuritySetting('stealth_pin', '112=');
      assert.equal(defaultPin, '112=');

      await setSecuritySetting('stealth_pin', '999=');
      const updatedPin = await getSecuritySetting('stealth_pin', '112=');
      assert.equal(updatedPin, '999=');
    });
  });
});
