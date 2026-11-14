/**
 * Local Journey and Search Storage Service
 * 
 * Powered by expo-sqlite on-device database.
 * Strict zero-telemetry guarantee: all journeys remain local on device.
 * Provides a 1-tap hardWipeAllData() for complete privacy compliance.
 */

let dbInstance = null;

/**
 * Injects or overrides the active SQLite database instance (used for testing or custom paths).
 */
export function setDbInstance(db) {
  dbInstance = db;
}

/**
 * Initializes and returns the local SQLite database instance
 */
export async function getDb() {
  if (!dbInstance) {
    const SQLite = await import('expo-sqlite');
    dbInstance = await SQLite.openDatabaseAsync('walking_companion.db');
    await initSchema(dbInstance);
  }
  return dbInstance;
}

/**
 * Sets up database schema if tables do not exist
 */
export async function initSchema(db) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS saved_journeys (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      origin_name TEXT NOT NULL,
      origin_lat REAL NOT NULL,
      origin_lon REAL NOT NULL,
      dest_name TEXT NOT NULL,
      dest_lat REAL NOT NULL,
      dest_lon REAL NOT NULL,
      distance_m REAL NOT NULL,
      duration_s REAL NOT NULL,
      context_score REAL NOT NULL,
      is_favorite INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recent_searches (
      id TEXT PRIMARY KEY,
      query TEXT NOT NULL,
      lat REAL NOT NULL,
      lon REAL NOT NULL,
      display_name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS saved_incidents (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      platform TEXT NOT NULL,
      sender_handle TEXT NOT NULL,
      message_content TEXT NOT NULL,
      was_blocked_prior INTEGER DEFAULT 0,
      evidence_ref TEXT,
      hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS saved_grievances (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      institution_name TEXT NOT NULL,
      hostel_location TEXT NOT NULL,
      incident_date TEXT NOT NULL,
      raw_narrative TEXT NOT NULL,
      prior_steps TEXT,
      relief_requested TEXT,
      authority_code TEXT NOT NULL,
      formal_document TEXT NOT NULL,
      status TEXT DEFAULT 'DRAFT',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS emergency_contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      relationship TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_security_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

/**
 * Saves a walking journey to local storage with boundary validation and sanitization
 */
export async function saveJourney(journey) {
  const db = await getDb();
  const createdAt = new Date().toISOString();

  // Defensive sanitization: cap strings to prevent DB bloat; ensure numeric invariants
  const safeId = String(journey.id || '').slice(0, 128);
  const safeTitle = String(journey.title || 'Walking Route').slice(0, 256);
  const safeOriginName = String(journey.origin_name || 'Start Point').slice(0, 256);
  const safeDestName = String(journey.dest_name || 'Destination').slice(0, 256);
  const safeOriginLat = Number.isFinite(journey.origin_lat) ? Math.max(-90, Math.min(90, journey.origin_lat)) : 0;
  const safeOriginLon = Number.isFinite(journey.origin_lon) ? Math.max(-180, Math.min(180, journey.origin_lon)) : 0;
  const safeDestLat = Number.isFinite(journey.dest_lat) ? Math.max(-90, Math.min(90, journey.dest_lat)) : 0;
  const safeDestLon = Number.isFinite(journey.dest_lon) ? Math.max(-180, Math.min(180, journey.dest_lon)) : 0;
  const safeDistM = Math.max(0, Number.isFinite(journey.distance_m) ? journey.distance_m : 0);
  const safeDurS = Math.max(0, Number.isFinite(journey.duration_s) ? journey.duration_s : 0);
  const safeScore = Math.max(0, Math.min(100, Number.isFinite(journey.context_score) ? journey.context_score : 0));
  const safeFav = journey.is_favorite === 1 ? 1 : 0;

  await db.runAsync(
    `INSERT OR REPLACE INTO saved_journeys 
      (id, title, origin_name, origin_lat, origin_lon, dest_name, dest_lat, dest_lon, distance_m, duration_s, context_score, is_favorite, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      safeId,
      safeTitle,
      safeOriginName,
      safeOriginLat,
      safeOriginLon,
      safeDestName,
      safeDestLat,
      safeDestLon,
      safeDistM,
      safeDurS,
      safeScore,
      safeFav,
      createdAt,
    ]
  );
}

/**
 * Retrieves all saved journeys ordered by newest first
 */
export async function getSavedJourneys() {
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT * FROM saved_journeys ORDER BY is_favorite DESC, created_at DESC;`
  );
  return rows || [];
}

/**
 * Toggles the favorite status of a saved journey
 */
export async function toggleFavoriteJourney(id) {
  const db = await getDb();
  const existing = await db.getFirstAsync(
    `SELECT is_favorite FROM saved_journeys WHERE id = ?;`,
    [id]
  );
  if (!existing) return false;

  const newStatus = existing.is_favorite === 1 ? 0 : 1;
  await db.runAsync(
    `UPDATE saved_journeys SET is_favorite = ? WHERE id = ?;`,
    [newStatus, id]
  );
  return newStatus === 1;
}

/**
 * Deletes a single journey from local storage
 */
export async function deleteJourney(id) {
  const db = await getDb();
  await db.runAsync(`DELETE FROM saved_journeys WHERE id = ?;`, [id]);
}

/**
 * Records a recent search with defensive sanitization
 */
export async function saveRecentSearch(search) {
  const db = await getDb();
  const createdAt = new Date().toISOString();

  const safeId = String(search.id || '').slice(0, 128);
  const safeQuery = String(search.query || '').slice(0, 120);
  const safeDisplayName = String(search.display_name || '').slice(0, 256);
  const safeLat = Number.isFinite(search.lat) ? Math.max(-90, Math.min(90, search.lat)) : 0;
  const safeLon = Number.isFinite(search.lon) ? Math.max(-180, Math.min(180, search.lon)) : 0;

  await db.runAsync(
    `INSERT OR REPLACE INTO recent_searches (id, query, lat, lon, display_name, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [safeId, safeQuery, safeLat, safeLon, safeDisplayName, createdAt]
  );
}

/**
 * Retrieves recent searches (up to limit)
 */
export async function getRecentSearches(limit = 5) {
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT * FROM recent_searches ORDER BY created_at DESC LIMIT ?;`,
    [limit]
  );
  return rows || [];
}

/**
 * 1-Tap Hard Wipe: permanently deletes all local journey records,
 * search history, incident records, and grievance cases, then runs SQLite VACUUM.
 */
export async function hardWipeAllData() {
  const db = await getDb();
  await db.execAsync(`
    DELETE FROM saved_journeys;
    DELETE FROM recent_searches;
    DELETE FROM saved_incidents;
    DELETE FROM saved_grievances;
    DELETE FROM emergency_contacts;
    DELETE FROM app_security_settings;
    VACUUM;
  `);
}

/**
 * Saves an incident evidence record locally with cryptographic hash
 */
export async function saveIncident(incident) {
  const db = await getDb();
  const createdAt = new Date().toISOString();

  const safeId = String(incident.id || '').slice(0, 128);
  const safeTimestamp = String(incident.timestamp || createdAt).slice(0, 64);
  const safePlatform = String(incident.platform || 'UNKNOWN').slice(0, 64);
  const safeSender = String(incident.sender_handle || 'ANONYMOUS').slice(0, 128);
  const safeContent = String(incident.message_content || '').slice(0, 2048);
  const safeWasBlocked = incident.was_blocked_prior === 1 ? 1 : 0;
  const safeEvidenceRef = String(incident.evidence_ref || '').slice(0, 256);
  const safeHash = String(incident.hash || '').slice(0, 128);

  await db.runAsync(
    `INSERT OR REPLACE INTO saved_incidents
      (id, timestamp, platform, sender_handle, message_content, was_blocked_prior, evidence_ref, hash, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      safeId,
      safeTimestamp,
      safePlatform,
      safeSender,
      safeContent,
      safeWasBlocked,
      safeEvidenceRef,
      safeHash,
      createdAt,
    ]
  );
}

/**
 * Retrieves all saved incident records ordered chronologically
 */
export async function getSavedIncidents() {
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT * FROM saved_incidents ORDER BY timestamp DESC;`
  );
  return rows || [];
}

/**
 * Deletes a single incident by ID
 */
export async function deleteIncident(id) {
  const db = await getDb();
  await db.runAsync(`DELETE FROM saved_incidents WHERE id = ?;`, [id]);
}

/**
 * Saves a statutory grievance case locally
 */
export async function saveGrievance(grievance) {
  const db = await getDb();
  const createdAt = new Date().toISOString();

  const safeId = String(grievance.id || '').slice(0, 128);
  const safeTitle = String(grievance.title || 'Formal Grievance').slice(0, 256);
  const safeCategory = String(grievance.category || 'GENERAL').slice(0, 64);
  const safeInstitution = String(grievance.institution_name || '').slice(0, 256);
  const safeLocation = String(grievance.hostel_location || '').slice(0, 256);
  const safeDate = String(grievance.incident_date || '').slice(0, 128);
  const safeNarrative = String(grievance.raw_narrative || '').slice(0, 10000);
  const safePriorSteps = String(grievance.prior_steps || '').slice(0, 2048);
  const safeRelief = String(grievance.relief_requested || '').slice(0, 2048);
  const safeAuthority = String(grievance.authority_code || '').slice(0, 64);
  const safeFormalDoc = String(grievance.formal_document || '').slice(0, 25000);
  const safeStatus = String(grievance.status || 'DRAFT').slice(0, 64);

  await db.runAsync(
    `INSERT OR REPLACE INTO saved_grievances
      (id, title, category, institution_name, hostel_location, incident_date, raw_narrative, prior_steps, relief_requested, authority_code, formal_document, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      safeId,
      safeTitle,
      safeCategory,
      safeInstitution,
      safeLocation,
      safeDate,
      safeNarrative,
      safePriorSteps,
      safeRelief,
      safeAuthority,
      safeFormalDoc,
      safeStatus,
      createdAt,
    ]
  );
}

/**
 * Retrieves all saved grievance cases
 */
export async function getSavedGrievances() {
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT * FROM saved_grievances ORDER BY created_at DESC;`
  );
  return rows || [];
}

/**
 * Deletes a single grievance case by ID
 */
export async function deleteGrievance(id) {
  const db = await getDb();
  await db.runAsync(`DELETE FROM saved_grievances WHERE id = ?;`, [id]);
}

/**
 * Saves or updates a trusted emergency contact locally
 */
export async function saveEmergencyContact(contact) {
  const db = await getDb();
  const createdAt = new Date().toISOString();

  const safeId = String(contact.id || `contact_${Date.now()}`).slice(0, 128);
  const safeName = String(contact.name || 'Emergency Contact').slice(0, 128);
  const safePhone = String(contact.phone_number || '').trim().slice(0, 32);
  const safeRel = String(contact.relationship || 'Trusted Contact').slice(0, 64);

  await db.runAsync(
    `INSERT OR REPLACE INTO emergency_contacts (id, name, phone_number, relationship, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [safeId, safeName, safePhone, safeRel, createdAt]
  );
}

/**
 * Retrieves all saved emergency contacts ordered by creation date
 */
export async function getEmergencyContacts() {
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT * FROM emergency_contacts ORDER BY created_at ASC;`
  );
  return rows || [];
}

/**
 * Deletes an emergency contact by ID
 */
export async function deleteEmergencyContact(id) {
  const db = await getDb();
  await db.runAsync(`DELETE FROM emergency_contacts WHERE id = ?;`, [id]);
}

/**
 * Reads an application security setting from local SQLite
 */
export async function getSecuritySetting(key, defaultValue = '') {
  const db = await getDb();
  const row = await db.getFirstAsync(
    `SELECT value FROM app_security_settings WHERE key = ?;`,
    [key]
  );
  return row?.value ?? defaultValue;
}

/**
 * Writes or updates an application security setting in local SQLite
 */
export async function setSecuritySetting(key, value) {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO app_security_settings (key, value) VALUES (?, ?);`,
    [key, value]
  );
}


