/**
 * Local Journey and Search Storage Service
 * 
 * Powered by expo-sqlite on-device database.
 * Strict zero-telemetry guarantee: all journeys remain local on device.
 * Provides a 1-tap hardWipeAllData() for complete privacy compliance.
 */

import { encryptRecord, decryptRecord, generateSecureRandomHex } from '@walking-companion/core';

export interface ISQLiteDatabase {
  execAsync(source: string): Promise<any>;
  runAsync(source: string, ...params: any[]): Promise<any>;
  getAllAsync<T = any>(source: string, ...params: any[]): Promise<T[]>;
  getFirstAsync<T = any>(source: string, ...params: any[]): Promise<T | null>;
}

export interface SavedJourney {
  id: string;
  title: string;
  origin_name: string;
  origin_lat: number;
  origin_lon: number;
  dest_name: string;
  dest_lat: number;
  dest_lon: number;
  distance_m: number;
  duration_s: number;
  context_score: number;
  is_favorite: number; // 0 or 1
  created_at: string;
}

export interface RecentSearch {
  id: string;
  query: string;
  lat: number;
  lon: number;
  display_name: string;
  created_at: string;
}

export interface SavedIncident {
  id: string;
  timestamp: string;
  platform: string;
  sender_handle: string;
  message_content: string;
  was_blocked_prior: number; // 0 or 1
  evidence_ref: string;
  hash: string;
  created_at: string;
}

export interface SavedGrievance {
  id: string;
  title: string;
  category: string;
  institution_name: string;
  hostel_location: string;
  incident_date: string;
  raw_narrative: string;
  prior_steps: string;
  relief_requested: string;
  authority_code: string;
  formal_document: string;
  status: string; // 'DRAFT' | 'PREPARED_FOR_HANDOFF' | 'SUBMITTED_MANUALLY'
  created_at: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone_number: string;
  relationship: string;
  created_at: string;
}

let dbInstance: ISQLiteDatabase | null = null;
let dbInitPromise: Promise<ISQLiteDatabase> | null = null;

/**
 * Injects or overrides the active SQLite database instance (used for testing or custom paths).
 */
export function setDbInstance(db: ISQLiteDatabase | null): void {
  dbInstance = db;
  dbInitPromise = db ? Promise.resolve(db) : null;
}

/**
 * Initializes and returns the local SQLite database instance
 */
export async function getDb(): Promise<ISQLiteDatabase> {
  if (dbInstance) return dbInstance;
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      const SQLite = await import('expo-sqlite');
      const db = await SQLite.openDatabaseAsync('walking_companion.db');
      await initSchema(db);
      dbInstance = db;
      return db;
    })();
  }
  return dbInitPromise;
}

let activeVaultKey: string | null = null;

/**
 * Injects or overrides the active vault encryption key (used in tests or session unlock).
 */
export function setVaultEncryptionKey(key: string | null): void {
  activeVaultKey = key;
}

/**
 * Retrieves or generates the device-backed 256-bit encryption key for database records at rest.
 * Uses hardware keystore (SecureStore) on physical devices with SQLite fallback in tests.
 */
export async function getVaultEncryptionKey(): Promise<string> {
  if (activeVaultKey) return activeVaultKey;

  let key: string | null = null;
  try {
    const SecureStore = await import('expo-secure-store');
    key = await SecureStore.getItemAsync('vault_encryption_key');
  } catch {
    key = null;
  }

  if (!key) {
    key = await getSecuritySetting('vault_encryption_key', '');
  }

  if (!key) {
    key = generateSecureRandomHex(32);
    try {
      const SecureStore = await import('expo-secure-store');
      await SecureStore.setItemAsync('vault_encryption_key', key);
    } catch {
      await setSecuritySetting('vault_encryption_key', key);
    }
  }

  activeVaultKey = key;
  return key;
}

/**
 * Sets up database schema if tables do not exist
 */
export async function initSchema(db: ISQLiteDatabase): Promise<void> {
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
export async function saveJourney(journey: Omit<SavedJourney, 'created_at'>): Promise<void> {
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
export async function getSavedJourneys(): Promise<SavedJourney[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<SavedJourney>(
    `SELECT * FROM saved_journeys ORDER BY is_favorite DESC, created_at DESC;`
  );
  return rows || [];
}

/**
 * Toggles the favorite status of a saved journey
 */
export async function toggleFavoriteJourney(id: string): Promise<boolean> {
  const db = await getDb();
  const existing = await db.getFirstAsync<{ is_favorite: number }>(
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
export async function deleteJourney(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM saved_journeys WHERE id = ?;`, [id]);
}

/**
 * Records a recent search with defensive sanitization
 */
export async function saveRecentSearch(search: Omit<RecentSearch, 'created_at'>): Promise<void> {
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
export async function getRecentSearches(limit = 5): Promise<RecentSearch[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<RecentSearch>(
    `SELECT * FROM recent_searches ORDER BY created_at DESC LIMIT ?;`,
    [limit]
  );
  return rows || [];
}

/**
 * 1-Tap Hard Wipe: deletes all local journey records,
 * search history, incident records, grievance cases, emergency contacts,
 * and clears SecureStore credentials.
 * Note: While SQLite VACUUM reclaims deleted pages, OS flash storage may retain
 * residual page artifacts; for complete forensic erasure, device-level factory wipe is required.
 */
export async function hardWipeAllData(): Promise<void> {
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

  activeVaultKey = null;
  try {
    const SecureStore = await import('expo-secure-store');
    await SecureStore.deleteItemAsync('vault_encryption_key');
    await SecureStore.deleteItemAsync('vault_device_salt');
    await SecureStore.deleteItemAsync('vault_pin_hash');
    await SecureStore.deleteItemAsync('vault_lockout_until');
  } catch {
    // Non-fatal if SecureStore is not supported or key absent
  }
}

/**
 * Saves an incident evidence record locally with cryptographic hash.
 * Encrypts private incident narratives, sender handles, and evidence references at rest.
 * Validates content size before save to prevent silent post-hash truncation.
 */
export async function saveIncident(incident: Omit<SavedIncident, 'created_at'>): Promise<void> {
  const db = await getDb();
  const createdAt = new Date().toISOString();
  const key = await getVaultEncryptionKey();

  if (incident.message_content && incident.message_content.length > 4096) {
    throw new Error('Incident message content exceeds maximum allowable length of 4096 characters');
  }

  const safeId = String(incident.id || '').slice(0, 128);
  const safeTimestamp = String(incident.timestamp || createdAt).slice(0, 64);
  const safePlatform = String(incident.platform || 'UNKNOWN').slice(0, 64);
  const safeSender = String(incident.sender_handle || 'ANONYMOUS').slice(0, 128);
  const safeContent = String(incident.message_content || '');
  const safeWasBlocked = incident.was_blocked_prior === 1 ? 1 : 0;
  const safeEvidenceRef = String(incident.evidence_ref || '').slice(0, 256);
  const safeHash = String(incident.hash || '').slice(0, 128);

  // Authenticated encryption at rest
  const encSender = encryptRecord(safeSender, key);
  const encContent = encryptRecord(safeContent, key);
  const encEvidenceRef = safeEvidenceRef ? encryptRecord(safeEvidenceRef, key) : '';

  await db.runAsync(
    `INSERT OR REPLACE INTO saved_incidents
      (id, timestamp, platform, sender_handle, message_content, was_blocked_prior, evidence_ref, hash, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      safeId,
      safeTimestamp,
      safePlatform,
      encSender,
      encContent,
      safeWasBlocked,
      encEvidenceRef,
      safeHash,
      createdAt,
    ]
  );
}

/**
 * Retrieves all saved incident records ordered chronologically.
 * Decrypts private fields before returning to authorized views.
 */
export async function getSavedIncidents(): Promise<SavedIncident[]> {
  const db = await getDb();
  const key = await getVaultEncryptionKey();
  const rows = await db.getAllAsync<SavedIncident>(
    `SELECT * FROM saved_incidents ORDER BY timestamp DESC;`
  );
  if (!rows || rows.length === 0) return [];
  return rows.map((r) => ({
    ...r,
    sender_handle: decryptRecord(r.sender_handle, key),
    message_content: decryptRecord(r.message_content, key),
    evidence_ref: r.evidence_ref ? decryptRecord(r.evidence_ref, key) : '',
  }));
}

/**
 * Deletes a single incident by ID
 */
export async function deleteIncident(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM saved_incidents WHERE id = ?;`, [id]);
}

/**
 * Saves a statutory grievance case locally.
 * Encrypts sensitive personal narratives, institutional targets, and draft documents at rest.
 */
export async function saveGrievance(grievance: Omit<SavedGrievance, 'created_at'>): Promise<void> {
  const db = await getDb();
  const createdAt = new Date().toISOString();
  const key = await getVaultEncryptionKey();

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

  // Authenticated encryption at rest for sensitive grievance fields
  const encInstitution = encryptRecord(safeInstitution, key);
  const encLocation = encryptRecord(safeLocation, key);
  const encNarrative = encryptRecord(safeNarrative, key);
  const encPriorSteps = safePriorSteps ? encryptRecord(safePriorSteps, key) : '';
  const encRelief = safeRelief ? encryptRecord(safeRelief, key) : '';
  const encFormalDoc = encryptRecord(safeFormalDoc, key);

  await db.runAsync(
    `INSERT OR REPLACE INTO saved_grievances
      (id, title, category, institution_name, hostel_location, incident_date, raw_narrative, prior_steps, relief_requested, authority_code, formal_document, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      safeId,
      safeTitle,
      safeCategory,
      encInstitution,
      encLocation,
      safeDate,
      encNarrative,
      encPriorSteps,
      encRelief,
      safeAuthority,
      encFormalDoc,
      safeStatus,
      createdAt,
    ]
  );
}

/**
 * Retrieves all saved grievance cases with transparent at-rest decryption.
 */
export async function getSavedGrievances(): Promise<SavedGrievance[]> {
  const db = await getDb();
  const key = await getVaultEncryptionKey();
  const rows = await db.getAllAsync<SavedGrievance>(
    `SELECT * FROM saved_grievances ORDER BY created_at DESC;`
  );
  if (!rows || rows.length === 0) return [];
  return rows.map((r) => ({
    ...r,
    institution_name: decryptRecord(r.institution_name, key),
    hostel_location: decryptRecord(r.hostel_location, key),
    raw_narrative: decryptRecord(r.raw_narrative, key),
    prior_steps: r.prior_steps ? decryptRecord(r.prior_steps, key) : '',
    relief_requested: r.relief_requested ? decryptRecord(r.relief_requested, key) : '',
    formal_document: decryptRecord(r.formal_document, key),
  }));
}

/**
 * Deletes a single grievance case by ID
 */
export async function deleteGrievance(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM saved_grievances WHERE id = ?;`, [id]);
}

/**
 * Saves or updates a trusted emergency contact locally.
 * Encrypts phone numbers and relationship details at rest.
 */
export async function saveEmergencyContact(contact: Omit<EmergencyContact, 'created_at'>): Promise<void> {
  const db = await getDb();
  const createdAt = new Date().toISOString();
  const key = await getVaultEncryptionKey();

  const safeId = String(contact.id || `contact_${Date.now()}`).slice(0, 128);
  const safeName = String(contact.name || 'Emergency Contact').slice(0, 128);
  const safePhone = String(contact.phone_number || '').trim().slice(0, 32);
  const safeRel = String(contact.relationship || 'Trusted Contact').slice(0, 64);

  // Authenticated encryption at rest
  const encPhone = encryptRecord(safePhone, key);
  const encRel = encryptRecord(safeRel, key);

  await db.runAsync(
    `INSERT OR REPLACE INTO emergency_contacts (id, name, phone_number, relationship, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [safeId, safeName, encPhone, encRel, createdAt]
  );
}

/**
 * Retrieves all saved emergency contacts with transparent decryption.
 */
export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  const db = await getDb();
  const key = await getVaultEncryptionKey();
  const rows = await db.getAllAsync<EmergencyContact>(
    `SELECT * FROM emergency_contacts ORDER BY created_at ASC;`
  );
  if (!rows || rows.length === 0) return [];
  return rows.map((r) => ({
    ...r,
    phone_number: decryptRecord(r.phone_number, key),
    relationship: decryptRecord(r.relationship, key),
  }));
}

/**
 * Deletes an emergency contact by ID
 */
export async function deleteEmergencyContact(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM emergency_contacts WHERE id = ?;`, [id]);
}

/**
 * Reads an application security setting from local SQLite
 */
export async function getSecuritySetting(key: string, defaultValue = ''): Promise<string> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM app_security_settings WHERE key = ?;`,
    [key]
  );
  return row?.value ?? defaultValue;
}

/**
 * Writes or updates an application security setting in local SQLite
 */
export async function setSecuritySetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO app_security_settings (key, value) VALUES (?, ?);`,
    [key, value]
  );
}


