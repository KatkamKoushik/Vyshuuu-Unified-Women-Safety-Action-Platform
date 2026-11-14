import { hashSha256 } from './cryptoUtils.js';
/**
 * @module protectEngine
 * @description Core analytical engine for Protect module (ResQ).
 * Provides temporal event graph construction, multi-channel pattern detection,
 * evidence vault integrity hashing, and voluntary digital exposure auditing.
 */

// cross-platform hash handling

export const PROTECT_DISCLAIMER =
  'ResQ Protect organizes contemporaneous records and identifies behavioral patterns for documentation. ' +
  'It does not make legal determinations of guilt, provide law enforcement surveillance, or replace ' +
  'formal investigative authorities.';
export const STALKLEDGER_DISCLAIMER = PROTECT_DISCLAIMER;

/**
 * Calculates a SHA-256 cryptographic digest for an incident log entry.
 * @param {Object} incident
 * @returns {string} 64-char hex digest
 */
export function calculateIncidentHash(incident) {
  if (!incident || typeof incident !== 'object') {
    throw new Error('Incident must be a valid object');
  }
  const payloadString = JSON.stringify({
    id: incident.id || null,
    timestamp: incident.timestamp || '',
    platform: incident.platform || '',
    senderHandle: incident.senderHandle || '',
    messageContent: incident.messageContent || '',
    threatKeywords: incident.threatKeywords || [],
  });
  return hashSha256(payloadString);
}

/**
 * @typedef {Object} IncidentRecord
 * @property {string} id - Unique incident identifier
 * @property {string} timestamp - ISO 8601 timestamp
 * @property {string} platform - e.g. 'INSTAGRAM', 'WHATSAPP', 'TELEGRAM', 'SMS', 'CALL_LOG', 'CAMPUS_IN_PERSON'
 * @property {string} senderHandle - Identifier or alias of sender
 * @property {string} messageContent - Factual record or quote of communication
 * @property {boolean} [wasBlockedPrior] - Whether sender was blocked before this event
 * @property {string} [evidenceReference] - Reference to screenshot or audio file
 * @property {string} [hash] - SHA-256 digest
 */

/**
 * @typedef {Object} DetectedPattern
 * @property {string} patternId
 * @property {'ESCALATING_FREQUENCY' | 'CROSS_PLATFORM_CONVERGENCE' | 'BLOCK_EVASION' | 'OFF_HOURS_CONTACT' | 'LOCATION_AWARENESS'} type
 * @property {'HIGH' | 'MEDIUM' | 'LOW'} severity
 * @property {string} summary
 * @property {string} factualBasis
 * @property {string[]} relatedIncidentIds
 */

/**
 * Analyzes an ordered sequence of incidents and surfaces objective, non-speculative factual patterns.
 * @param {IncidentRecord[]} incidents
 * @param {{ timezoneOffsetMinutes?: number }} [options]
 * @returns {{ patterns: DetectedPattern[]; timelineSpanDays: number; uniqueSendersCount: number; platformsCovered: string[] }}
 */
export function buildTemporalIncidentGraph(incidents = [], options = {}) {
  const { timezoneOffsetMinutes = 0 } = options;
  if (!Array.isArray(incidents) || incidents.length === 0) {
    return {
      patterns: [],
      timelineSpanDays: 0,
      uniqueSendersCount: 0,
      platformsCovered: [],
    };
  }

  // Sort chronologically
  const sorted = [...incidents].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const patterns = [];
  const platforms = new Set();
  const senders = new Set();
  const times = [];

  for (const inc of sorted) {
    if (inc.platform) platforms.add(inc.platform.toUpperCase());
    if (inc.senderHandle) senders.add(inc.senderHandle.toLowerCase());
    const ts = new Date(inc.timestamp).getTime();
    if (!isNaN(ts)) times.push(ts);
  }

  const minTime = times.length > 0 ? Math.min(...times) : 0;
  const maxTime = times.length > 0 ? Math.max(...times) : 0;
  const spanMs = maxTime - minTime;
  const timelineSpanDays = spanMs > 0 ? Math.max(1, Math.round(spanMs / (1000 * 60 * 60 * 24))) : 0;

  // 1. Detect Block Evasion
  // When an incident follows a prior block with a different sender handle or same sender
  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i];
    if (cur.wasBlockedPrior) {
      patterns.push({
        patternId: `pat_block_evasion_${cur.id}`,
        type: 'BLOCK_EVASION',
        severity: 'HIGH',
        summary: 'Persistent communication recorded following explicit blocking action.',
        factualBasis: `Incident on ${cur.timestamp} occurred after recipient blocked previous account. Account handle recorded: ${cur.senderHandle}.`,
        relatedIncidentIds: [cur.id],
      });
    }
  }

  // 2. Detect Cross-Platform Convergence
  // Multiple platforms used by same suspected individual or within short span
  if (platforms.size >= 2 && sorted.length >= 2) {
    patterns.push({
      patternId: 'pat_cross_platform',
      type: 'CROSS_PLATFORM_CONVERGENCE',
      severity: 'HIGH',
      summary: 'Multi-channel contact spanning multiple independent digital platforms.',
      factualBasis: `Incidents recorded across ${platforms.size} distinct platforms: ${Array.from(platforms).join(', ')}.`,
      relatedIncidentIds: sorted.map((inc) => inc.id),
    });
  }

  // 3. Detect Off-Hours Contact (between 11:00 PM and 5:00 AM)
  const offHoursIncidents = sorted.filter((inc) => {
    const d = new Date(inc.timestamp);
    if (isNaN(d.getTime())) return false;
    const adjusted = new Date(d.getTime() + timezoneOffsetMinutes * 60000);
    const hour = adjusted.getUTCHours();
    return hour >= 23 || hour < 5;
  });

  if (offHoursIncidents.length >= 2) {
    patterns.push({
      patternId: 'pat_off_hours',
      type: 'OFF_HOURS_CONTACT',
      severity: 'MEDIUM',
      summary: 'Repeated nighttime contact outside customary hours.',
      factualBasis: `${offHoursIncidents.length} communications recorded between 11:00 PM and 5:00 AM.`,
      relatedIncidentIds: offHoursIncidents.map((i) => i.id),
    });
  }

  // 4. Detect Escalating Contact Frequency
  // More than 3 incidents within 48 hours
  if (sorted.length >= 3) {
    let denseClusterFound = false;
    for (let i = 0; i <= sorted.length - 3; i++) {
      const tStart = new Date(sorted[i].timestamp).getTime();
      const tEnd = new Date(sorted[i + 2].timestamp).getTime();
      if (tEnd - tStart <= 48 * 60 * 60 * 1000) {
        denseClusterFound = true;
        break;
      }
    }
    if (denseClusterFound) {
      patterns.push({
        patternId: 'pat_frequency_cluster',
        type: 'ESCALATING_FREQUENCY',
        severity: 'HIGH',
        summary: 'High-density communication cluster (3+ incidents within a 48-hour period).',
        factualBasis: `Concentrated volume of communications observed in tight temporal proximity.`,
        relatedIncidentIds: sorted.map((i) => i.id),
      });
    }
  }

  // 5. Detect Specific Location / Hostel Mentions in Message Content
  const locationTerms = ['hostel', 'room', 'block', 'gate', 'library', 'mess', 'campus', 'outside'];
  const locationIncidents = sorted.filter((inc) => {
    const text = (inc.messageContent || '').toLowerCase();
    return locationTerms.some((term) => text.includes(term));
  });

  if (locationIncidents.length > 0) {
    patterns.push({
      patternId: 'pat_location_awareness',
      type: 'LOCATION_AWARENESS',
      severity: 'HIGH',
      summary: 'Communications reference physical campus, residential, or routine locations.',
      factualBasis: `${locationIncidents.length} message(s) include specific physical location references.`,
      relatedIncidentIds: locationIncidents.map((i) => i.id),
    });
  }

  return {
    patterns,
    timelineSpanDays,
    uniqueSendersCount: senders.size,
    platformsCovered: Array.from(platforms),
  };
}

/**
 * @typedef {Object} ExposureFinding
 * @property {string} findingId
 * @property {'ROOM_OR_HOSTEL' | 'ROUTINE_OR_TIMETABLE' | 'PHONE_OR_CONTACT' | 'EXACT_GEOLOCATION'} category
 * @property {'HIGH' | 'MEDIUM' | 'LOW'} severity
 * @property {string} matchedSnippet
 * @property {string} riskExplanation
 * @property {string} remediationTip
 */

/**
 * Audits public social media bios, posts, or stories for inadvertent personal exposure risks.
 * Purely voluntary client-side privacy tool.
 * 
 * @param {string} textContent - User-submitted bio or caption text to audit
 * @returns {{ findings: ExposureFinding[]; overallRisk: 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE'; adviceSummary: string }}
 */
export function auditDigitalExposure(textContent = '') {
  if (!textContent || typeof textContent !== 'string' || textContent.trim().length === 0) {
    return {
      findings: [],
      overallRisk: 'SAFE',
      adviceSummary: 'No public profile text provided for audit.',
    };
  }

  const findings = [];
  const text = textContent;

  // 1. Room / Hostel References (e.g., "Room 204", "Ganga Hostel", "Block B", "Hostel 4")
  const roomRegex = /\b(room\s*(?:no\.?|#)?\s*\d+[a-z]?|(?:ganga|yamuna|saraswati|cauvery|godavari|brahmaputra|tagore|nehru|shastri)\s*hostel|block\s*[a-z]\s*(?:room)?\s*\d*|hostel\s*\d+)\b/gi;
  let match;
  while ((match = roomRegex.exec(text)) !== null) {
    findings.push({
      findingId: `exp_room_${findings.length + 1}`,
      category: 'ROOM_OR_HOSTEL',
      severity: 'HIGH',
      matchedSnippet: match[0],
      riskExplanation: 'Publicly discloses your specific residence or room location, allowing individuals to locate you in physical space.',
      remediationTip: 'Remove specific room numbers and hostel wing identifiers from public bios and status messages.',
    });
  }

  // 2. Routine & Commute Timetable Leaks (e.g. "every Tuesday at 9pm", "daily 6pm library", "walking back from lab at 10")
  const routineRegex = /\b((?:every|daily|mondays?|tuesdays?|wednesdays?|thursdays?|fridays?|saturdays?|sundays?)\s*(?:at\s*)?\d{1,2}(?::\d{2})?\s*(?:am|pm)?|(?:routine|walking\s*back|leaves?\s*lab|library\s*(?:until|till))\s*(?:at\s*)?\d{1,2}\s*(?:am|pm)?)\b/gi;
  while ((match = routineRegex.exec(text)) !== null) {
    findings.push({
      findingId: `exp_routine_${findings.length + 1}`,
      category: 'ROUTINE_OR_TIMETABLE',
      severity: 'HIGH',
      matchedSnippet: match[0],
      riskExplanation: 'Reveals predictable personal schedules, commute times, or solitary walking routines.',
      remediationTip: 'Avoid posting recurring daily schedules, commute routes, or solitary study hours publicly.',
    });
  }

  // 3. Phone Numbers / Contact Leaks (Indian 10-digit mobile numbers or UPI IDs)
  const phoneRegex = /\b(?:\+91[-.\s]?)?[6-9]\d{9}\b|\b[a-zA-Z0-9._]+@[a-zA-Z0-9]+(?:okhdfcbank|okaxis|oksbi|paytm|ybl)\b/gi;
  while ((match = phoneRegex.exec(text)) !== null) {
    findings.push({
      findingId: `exp_contact_${findings.length + 1}`,
      category: 'PHONE_OR_CONTACT',
      severity: 'HIGH',
      matchedSnippet: match[0],
      riskExplanation: 'Direct personal telephone number or bank-linked UPI handle exposed publicly.',
      remediationTip: 'Never display personal phone numbers in public bios. Use platform-internal DM or official institutional channels.',
    });
  }

  // 4. Exact Campus Geolocation Tagging References
  const geoRegex = /\b((?:gate\s*(?:no\.?|#)?\s*\d+|campus\s*gate|back\s*gate|metro\s*station\s*pillar\s*\d+))\b/gi;
  while ((match = geoRegex.exec(text)) !== null) {
    findings.push({
      findingId: `exp_geo_${findings.length + 1}`,
      category: 'EXACT_GEOLOCATION',
      severity: 'MEDIUM',
      matchedSnippet: match[0],
      riskExplanation: 'Pinpoints specific arrival gates or pickup spots frequented during daily travel.',
      remediationTip: 'Keep meeting spots generic and do not broadcast specific entrance gates in real time.',
    });
  }

  let overallRisk = 'SAFE';
  if (findings.some((f) => f.severity === 'HIGH')) {
    overallRisk = 'HIGH';
  } else if (findings.some((f) => f.severity === 'MEDIUM')) {
    overallRisk = 'MEDIUM';
  } else if (findings.length > 0) {
    overallRisk = 'LOW';
  }

  const adviceSummary =
    overallRisk === 'HIGH'
      ? 'High risk exposure detected: Text contains residence, routine, or contact identifiers that could facilitate tracking.'
      : overallRisk === 'MEDIUM'
        ? 'Moderate risk exposure: Contains specific campus locations or meetup points.'
        : 'Safe profile: No overt room numbers, schedules, or contact vulnerabilities detected.';

  return {
    findings,
    overallRisk,
    adviceSummary,
  };
}
