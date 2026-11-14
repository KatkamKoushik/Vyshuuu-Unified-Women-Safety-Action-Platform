import { hashSha256 } from './cryptoUtils.js';
/**
 * @module grievanceDraftsman
 * @description Core engine for structuring grievances, generating clarifying questions,
 * creating formal legal representations, calculating cryptographic evidence digests,
 * and producing Assisted Portal Handoff payloads.
 */

// cross-platform hash handling
import { matchAuthorityForGrievance, VERIFIED_AUTHORITIES } from '../domain/authorityRegistry.js';

export const DRAFTSMAN_DISCLAIMER =
  'This grievance draft was generated for your review. ResQ does not provide legal advice, ' +
  'guarantee administrative outcomes, or submit reports automatically. You retain full control to ' +
  'review, edit, and manually submit this documentation to the appropriate authority.';

/**
 * Calculates a SHA-256 cryptographic digest for evidence integrity verification.
 * @param {string | Buffer | Uint8Array} data
 * @returns {string} Hexadecimal SHA-256 hash
 */
export function calculateEvidenceSha256(data) {
  return hashSha256(data);
}

/**
 * Generates 3 targeted clarifying questions to establish missing facts.
 * @param {string} category
 * @param {string} statement
 * @returns {Array<{ id: string; question: string; purpose: string; exampleAnswer: string }>}
 */
export function generateClarifyingQuestions(category, statement = '') {
  const norm = statement.toLowerCase();

  if (category === 'HOSTEL_SANITATION' || norm.includes('rat') || norm.includes('mold') || norm.includes('water')) {
    return [
      {
        id: 'q_dates_timeline',
        question: 'On what specific date and time did this incident or severe condition occur?',
        purpose: 'Establishes precise chronological sequence in Section 1 of the formal grievance.',
        exampleAnswer: '12th November 2026, approximately 2:30 AM in Room 204, Ganga Hostel.',
      },
      {
        id: 'q_prior_memos',
        question: 'Did you inform the hostel warden, caretaker, or college maintenance previously?',
        purpose: 'Proves institutional negligence / administrative inertia to satisfy UGC e-Samadhaan criteria.',
        exampleAnswer: 'Submitted written complaint to Warden Ms. Sharma on Nov 5; followed up verbally on Nov 8 with no response.',
      },
      {
        id: 'q_medical_or_hazard',
        question: 'Were there medical consequences, doctor consultations, or structural safety hazards?',
        purpose: 'Documents personal impact, medical evidence, and grounds for urgent emergency remediation.',
        exampleAnswer: 'Received medical treatment and anti-rabies injection at City Govt Hospital on Nov 12 (prescription available).',
      },
    ];
  }

  if (category === 'MESS_FOOD' || category === 'MESS_FOOD_CONTAMINATION' || norm.includes('food')) {
    return [
      {
        id: 'q_meal_and_time',
        question: 'Which specific meal service (breakfast/lunch/dinner) and date did the contamination occur?',
        purpose: 'Required field for FSSAI FoSCoS consumer grievance registration.',
        exampleAnswer: 'Dinner on 13th November 2026 at the Main Campus Hostel Mess.',
      },
      {
        id: 'q_vendor_or_caterer',
        question: 'What is the name of the catering contractor or mess operator, or FSSAI license number if posted?',
        purpose: 'Identifies the Food Business Operator (FBO) for enforcement inspection.',
        exampleAnswer: 'Annapurna Caterers Pvt Ltd / Contractor displayed on notice board.',
      },
      {
        id: 'q_symptoms_and_affected',
        question: 'Did multiple students experience symptoms of food poisoning or illness?',
        purpose: 'Documents public health scope and severity.',
        exampleAnswer: 'At least 8 students reported nausea and cramps, 2 attended campus clinic.',
      },
    ];
  }

  if (category === 'CYBERSTALKING' || category === 'ONLINE_HARASSMENT' || norm.includes('instagram') || norm.includes('whatsapp')) {
    return [
      {
        id: 'q_platform_handles',
        question: 'What platform was used, and what are the specific sender handles, phone numbers, or profile URLs?',
        purpose: 'Mandatory technical identifier for National Cybercrime Reporting Portal intake.',
        exampleAnswer: 'Instagram handle @anon_shadow_99 and WhatsApp messages from +91 98765 43210.',
      },
      {
        id: 'q_persistence_and_blocks',
        question: 'Did the contact persist after you blocked or requested them to stop?',
        purpose: 'Establishes repeated pattern and intentional harassment under Section 354D IPC / BNS equivalent.',
        exampleAnswer: 'Blocked initial account on Nov 2; sender created 3 subsequent accounts to continue sending messages.',
      },
      {
        id: 'q_threat_nature',
        question: 'Did the messages involve threats of physical harm, exposure of private information, or extortion?',
        purpose: 'Categorizes severity for priority law enforcement escalation.',
        exampleAnswer: 'Sender threatened to post altered photographs and mentioned knowing my hostel room number.',
      },
    ];
  }

  // General grievance questions fallback
  return [
    {
      id: 'q_chronology',
      question: 'When did this issue begin and what was the most recent occurrence?',
      purpose: 'Creates a verifiable chronological factual record.',
      exampleAnswer: 'Began in October 2026; last occurred on 10th November 2026.',
    },
    {
      id: 'q_internal_escalation',
      question: 'What internal college authorities or officials have been notified so far?',
      purpose: 'Documents exhaustiveness of internal remedy before statutory escalation.',
      exampleAnswer: 'Emailed Head of Department and Academic Dean with acknowledgment pending.',
    },
    {
      id: 'q_relief_sought',
      question: 'What specific outcome, remedy, or action are you requesting from the authority?',
      purpose: 'Ensures the petition concludes with clear, actionable prayers for relief.',
      exampleAnswer: 'Immediate repair of security locks and written confirmation of disciplinary review.',
    },
  ];
}

/**
 * Validates whether attached evidence items conform to the target authority's constraints.
 * @param {string} authorityCode
 * @param {Array<{ name: string; type?: string; sizeBytes?: number }>} attachments
 * @returns {{ isValid: boolean; warnings: string[]; acceptedFormats: string[] }}
 */
export function validateAuthorityAttachments(authorityCode, attachments = []) {
  const authority = VERIFIED_AUTHORITIES[authorityCode] || VERIFIED_AUTHORITIES.UGC_SAMADHAAN;
  const warnings = [];
  const allowed = authority.allowedAttachments.formats.map((f) => f.toLowerCase());
  const maxBytes = authority.allowedAttachments.maxSizeMb * 1024 * 1024;

  for (const att of attachments) {
    const ext = (att.name.split('.').pop() || '').toLowerCase();
    if (!allowed.includes(ext)) {
      warnings.push(
        `File "${att.name}" (format .${ext}) is NOT accepted by ${authority.name}. Permitted formats: ${allowed.join(', ').toUpperCase()}.`
      );
    }
    if (att.sizeBytes && att.sizeBytes > maxBytes) {
      warnings.push(
        `File "${att.name}" exceeds the maximum limit of ${authority.allowedAttachments.maxSizeMb} MB for ${authority.name}.`
      );
    }
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    acceptedFormats: allowed,
  };
}

/**
 * Composes a formal, statutory-aligned grievance representation bundle.
 * 
 * @param {Object} input
 * @param {string} [input.complainantName]
 * @param {string} [input.studentId]
 * @param {string} input.institutionName
 * @param {string} input.hostelOrLocation
 * @param {string} input.category
 * @param {string} input.incidentDate
 * @param {string} input.rawNarrative
 * @param {string} [input.priorSteps]
 * @param {string} [input.impact]
 * @param {string} [input.reliefRequested]
 * @param {Array<{ name: string; type: string; sizeBytes?: number; capturedAt?: string; digestHex?: string; buffer?: Buffer | string }>} [input.evidenceItems]
 * @returns {Object} Structured grievance representation bundle
 */
export function composeFormalGrievance({
  complainantName = 'Concerned Student / Complainant',
  studentId = 'Confidential / Enclosed in Verification',
  institutionName,
  hostelOrLocation,
  category,
  incidentDate,
  rawNarrative,
  priorSteps = '',
  impact = 'Substantial risk to health, safety, and academic well-being.',
  reliefRequested = 'Immediate inspection, certified remediation, and institutional compliance.',
  evidenceItems = [],
  clarificationAnswers = [],
}) {
  if (!institutionName || !hostelOrLocation || !rawNarrative) {
    throw new Error('institutionName, hostelOrLocation, and rawNarrative are mandatory for grievance composition');
  }

  const hasPriorSteps = Boolean(priorSteps && priorSteps.trim().length > 0);

  // 1. Match Authority
  const routeMatch = matchAuthorityForGrievance({
    category,
    statement: `${rawNarrative} ${priorSteps || ''}`,
    priorReportIgnored: hasPriorSteps,
  });
  const authority = routeMatch.primaryAuthority;

  // 2. Compute evidence digests if buffer provided and digest not pre-set
  const processedEvidence = evidenceItems.map((item, idx) => {
    let digest = item.digestHex;
    let digestType = 'FILE_CONTENT_SHA256';
    if (!digest && item.buffer) {
      digest = calculateEvidenceSha256(item.buffer);
      digestType = 'FILE_CONTENT_SHA256';
    } else if (!digest) {
      // Deterministic digest based on metadata - clearly labeled as metadata checksum
      digest = calculateEvidenceSha256(`${item.name}:${item.sizeBytes || 0}:${item.capturedAt || incidentDate}`);
      digestType = 'METADATA_REFERENCE_SHA256';
    } else {
      digestType = item.digestType || 'FILE_CONTENT_SHA256';
    }
    return {
      index: idx + 1,
      name: item.name,
      type: item.type || 'image/jpeg',
      sizeBytes: item.sizeBytes || 0,
      capturedAt: item.capturedAt || incidentDate,
      digestHex: digest,
      digestType,
    };
  });

  // 3. Determine Statutory Citation
  let statutoryCitation = 'Statutory Provisions of the Higher Education Institution Mandate & Student Rights';
  if (authority.code === 'UGC_SAMADHAAN') {
    statutoryCitation =
      'University Grants Commission (Redressal of Grievances of Students) Regulations, 2023 [F.1-13/2022 (CPP-II)] ' +
      'mandating safe living conditions and a 20-working-day redressal resolution window.';
  } else if (authority.code === 'FSSAI_FOSCOS') {
    statutoryCitation =
      'Section 59 & Section 65 of the Food Safety and Standards Act, 2006 (Contaminated Food & Consumer Redressal).';
  } else if (authority.code === 'COLLEGE_ICC') {
    statutoryCitation =
      'Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 read with ' +
      'UGC (Prevention, Prohibition and Redressal of Sexual Harassment in HEIs) Regulations, 2015.';
  } else if (authority.code === 'CYBERCRIME_INDIA') {
    statutoryCitation =
      'Information Technology Act, 2000 (Sections 66E, 67, 67A) read with applicable provisions of the Bharatiya Nyaya Sanhita (BNS) 2023.';
  } else if (authority.code === 'ANTI_RAGGING') {
    statutoryCitation =
      'UGC Regulations on Curbing the Menace of Ragging in Higher Educational Institutions, 2009.';
  }

  // 4. Construct Subject Line
  const subjectLine = `FORMAL REPRESENTATION: Urgent Grievance regarding ${category.replace(/_/g, ' ')} at ${hostelOrLocation}, ${institutionName}`;

  // 5. Construct Formal Markdown Document
  const formalLines = [
    `# ${subjectLine}`,
    '',
    `**TO:**`,
    `The Competent Redressal Authority / Presiding Officer`,
    `${authority.name}`,
    `In Re: ${institutionName}`,
    '',
    `**DATE OF REPRESENTATION:** ${new Date().toISOString().split('T')[0]}`,
    `**COMPLAINANT:** ${complainantName} (Student ID: ${studentId})`,
    `**CAMPUS/RESIDENCE:** ${hostelOrLocation}, ${institutionName}`,
    `**PRIMARY STATUTORY REFERENCE:** ${statutoryCitation}`,
    '',
    `---`,
    '',
    `### SECTION 1: STATEMENT OF FACTUAL CHRONOLOGY`,
    `1. The undersigned is a bona fide resident/student residing at ${hostelOrLocation}, ${institutionName}.`,
    `2. On or about ${incidentDate}, the following incident and material hazard occurred:`,
    `   > ${rawNarrative.trim().replace(/\n/g, '\n   > ')}`,
    `3. The occurrence has caused tangible injury and prejudice, specifically: ${impact}`,
    '',
  ];

  if (hasPriorSteps) {
    formalLines.push(
      `### SECTION 2: PRIOR INTERNAL REPORTING & INSTITUTIONAL INACTION`,
      `1. Prior to this formal representation, administrative notice was served internally:`,
      `   > ${priorSteps.trim().replace(/\n/g, '\n   > ')}`,
      `2. Despite notice, responsible authorities failed to remediate the hazard within reasonable time, necessitating this statutory escalation.`,
      ''
    );
  } else {
    formalLines.push(
      `### SECTION 2: PROCEDURAL POSTURE & INITIAL FORMAL NOTICE`,
      `1. This representation constitutes the first formal written submission tendered contemporaneously for administrative record and immediate corrective intervention.`,
      ''
    );
  }

  // Adaptive clarification answers incorporated directly into petition record
  let nextSectionNum = 3;
  if (Array.isArray(clarificationAnswers) && clarificationAnswers.length > 0) {
    const answeredList = clarificationAnswers.filter((a) => a && typeof a.answer === 'string' && a.answer.trim().length > 0);
    if (answeredList.length > 0) {
      formalLines.push(
        `### SECTION ${nextSectionNum}: CLARIFIED FACTUAL PARTICULARS (ADAPTIVE INTAKE)`,
        `The Complainant has provided the following specific factual particulars under structured interview:`,
        ''
      );
      for (const item of answeredList) {
        formalLines.push(
          `- **Question:** ${item.question}`,
          `  > **Complainant Statement:** ${item.answer.trim()}`,
          ''
        );
      }
      nextSectionNum++;
    }
  }

  formalLines.push(
    `### SECTION ${nextSectionNum++}: LEGAL & STATUTORY FRAMEWORK`,
    `The failure to maintain habitable and safe living quarters violates established safety norms and statutory mandates:`,
    `- **Mandate:** ${statutoryCitation}`,
    `- **Statutory Resolution Window:** ${authority.resolutionWindowDays ? `${authority.resolutionWindowDays} working days` : 'Immediate escalation required'}`,
    '',
    `### SECTION ${nextSectionNum++}: SPECIFIC RELIEF SOUGHT (PRAYERS)`,
    `The Complainant respectfully requests the following time-bound remedies:`,
    `1. **Immediate Inspection:** Conduct an on-site physical inspection of ${hostelOrLocation}.`,
    `2. **Remedial Action:** ${reliefRequested}`,
    `3. **Written Report:** Furnish a written action-taken report detailing corrective interventions.`,
    `4. **Protection from Retaliation:** Ensure the complainant suffers no academic, administrative, or residential prejudice.`,
    '',
    `### SECTION ${nextSectionNum}: ANNEXURES & CRYPTOGRAPHIC EVIDENCE DIGEST (SHA-256)`,
    `The following contemporaneous evidence is submitted in support of this representation. To ensure tamper-evidence, each item is indexed with its cryptographic SHA-256 checksum and scope disclosure:`,
    '',
    `| Annexure | Item Name | Captured Timestamp | Format | SHA-256 Digest (64 hex characters) | Digest Verification Scope |`,
    `| :--- | :--- | :--- | :--- | :--- | :--- |`
  );

  if (processedEvidence.length === 0) {
    formalLines.push(`| Annexure A | Statement of Fact (Self-attested) | ${incidentDate} | text/markdown | \`${calculateEvidenceSha256(rawNarrative)}\` | Narrative Content Hash |`);
  } else {
    for (const ev of processedEvidence) {
      const scopeLabel = ev.digestType === 'FILE_CONTENT_SHA256' ? 'File Content Byte Hash' : 'Metadata Checksum';
      formalLines.push(
        `| Annexure ${String.fromCharCode(64 + ev.index)} | ${ev.name} | ${ev.capturedAt} | ${ev.type} | \`${ev.digestHex}\` | ${scopeLabel} |`
      );
    }
  }

  formalLines.push('');
  formalLines.push('---');
  formalLines.push(`*Verification: I confirm that the factual statements above are accurate to the best of my knowledge and contemporaneous documentation.*`);
  formalLines.push('');
  formalLines.push(`**Submitted Respectfully,**`);
  formalLines.push(`${complainantName}`);
  formalLines.push(`Date: ${new Date().toISOString().split('T')[0]}`);

  const formalDocument = formalLines.join('\n');

  // 6. Assisted Portal Handoff Payload (1-tap clipboard pills + validation)
  const attachmentValidation = validateAuthorityAttachments(authority.code, processedEvidence);

  // Portal text character limit safety (e.g. 1500 chars concise narrative for UGC e-Samadhaan portal textarea)
  const concisePortalSummary =
    `[Grievance at ${institutionName} - ${hostelOrLocation}]\n` +
    `Date: ${incidentDate}\n` +
    `Category: ${category}\n\n` +
    `Factual Summary:\n${rawNarrative.substring(0, 750)}\n\n` +
    `Prior Notice: ${priorSteps.substring(0, 250)}\n\n` +
    `Relief Requested: ${reliefRequested.substring(0, 300)}\n\n` +
    `Evidence Count: ${processedEvidence.length} items (SHA-256 hashed). Attached in annexures.`;

  const clipboardPills = [
    { key: 'subject', label: 'Subject / Title', value: subjectLine },
    { key: 'institution', label: 'Institution Name', value: institutionName },
    { key: 'hostel_location', label: 'Hostel / Premises Location', value: hostelOrLocation },
    { key: 'incident_date', label: 'Date of Incident', value: incidentDate },
    { key: 'grievance_description', label: 'Portal Grievance Description', value: concisePortalSummary },
    { key: 'relief_sought', label: 'Relief / Remedy Sought', value: reliefRequested },
    { key: 'statutory_act', label: 'Statutory Reference', value: statutoryCitation },
  ];

  return {
    disclaimer: DRAFTSMAN_DISCLAIMER,
    authority: {
      code: authority.code,
      name: authority.name,
      portalUrl: authority.portalUrl,
      submissionMode: authority.submissionMode,
      resolutionWindowDays: authority.resolutionWindowDays,
      emergencyHelpline: authority.emergencyHelpline,
    },
    subjectLine,
    statutoryCitation,
    formalDocument,
    evidenceDigest: processedEvidence,
    portalHandoff: {
      targetUrl: authority.portalUrl,
      submissionMode: authority.submissionMode,
      clipboardPills,
      attachmentValidation,
    },
  };
}

