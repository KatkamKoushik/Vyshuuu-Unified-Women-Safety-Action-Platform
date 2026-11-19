import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Share,
} from 'react-native';
import {
  saveGrievance,
  getSavedGrievances,
  deleteGrievance,
  SavedGrievance,
} from '../services/storageService';
import { GATEWAY_BASE_URL } from '../services/routingAdapter';
import {
  matchAuthorityForGrievance,
  composeFormalGrievance,
  VERIFIED_AUTHORITIES,
  hashSha256,
} from '@walking-companion/core';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import { VaultSecurityModal } from '../components/common/VaultSecurityModal';
import { readAndHashFile } from '../services/evidenceHasher';
import { useTheme } from '../theme/ThemeContext';
import { AppIcon } from '../components/common/AppIcon';

interface ActScreenProps {
  initialStatement?: string;
  onOpenPrivacy?: () => void;
}

export const ActScreen: React.FC<ActScreenProps> = ({ initialStatement }) => {
  const { theme } = useTheme();
  const [actSubTab, setActSubTab] = useState<'composer' | 'vault' | 'directory'>('composer');
  const [savedGrievancesList, setSavedGrievancesList] = useState<SavedGrievance[]>([]);
  const [isLoadingVault, setIsLoadingVault] = useState(false);
  const [selectedVaultDoc, setSelectedVaultDoc] = useState<SavedGrievance | null>(null);

  const [category, setCategory] = useState('HOSTEL_SANITATION');
  const [complainantName, setComplainantName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [institution, setInstitution] = useState('');
  const [hostelLocation, setHostelLocation] = useState('');
  const [incidentDate, setIncidentDate] = useState(
    new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  );
  const [narrative, setNarrative] = useState(initialStatement || '');
  const [priorSteps, setPriorSteps] = useState('');
  const [relief, setRelief] = useState('');

  const [step, setStep] = useState<'intake' | 'review' | 'handoff'>('intake');
  const [isLoading, setIsLoading] = useState(false);
  const [intakeData, setIntakeData] = useState<any>(null);
  const [composedCase, setComposedCase] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [isVaultModalVisible, setIsVaultModalVisible] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<
    Array<{
      name: string;
      sizeBytes: number;
      uri: string;
      digestHex: string;
      mimeType: string;
      digestType: 'FILE_CONTENT_SHA256' | 'METADATA_CHECKSUM' | 'METADATA_REFERENCE_SHA256';
    }>
  >([]);
  const [clarificationAnswers, setClarificationAnswers] = useState<Record<string, string>>({});

  const handlePickEvidenceFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf', 'text/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const hashed = await readAndHashFile(asset.uri, asset.name, asset.size);
        setAttachedFiles((prev) => [
          ...prev,
          {
            name: asset.name,
            sizeBytes: hashed.byteCount,
            uri: asset.uri,
            digestHex: hashed.hash,
            mimeType: asset.mimeType || 'image/jpeg',
            digestType: hashed.integrityType,
          },
        ]);
        Alert.alert('Evidence Hashed', `${hashed.label}\nSHA-256: ${hashed.hash.slice(0, 24)}...`);
      }
    } catch {
      Alert.alert('Attachment Notice', 'Could not open document picker on this device.');
    }
  };

  const handleRemoveAttachedFile = (idx: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  useEffect(() => {
    if (initialStatement) {
      setNarrative(initialStatement);
      setStep('intake');
    }
  }, [initialStatement]);

  // Load saved statutory petitions from SQLite
  const loadSavedGrievances = useCallback(async () => {
    try {
      setIsLoadingVault(true);
      const list = await getSavedGrievances();
      setSavedGrievancesList(list || []);
    } catch {
      Alert.alert('Vault Notice', 'Could not load saved representations from SQLite.');
    } finally {
      setIsLoadingVault(false);
    }
  }, []);

  useEffect(() => {
    if (actSubTab === 'vault') {
      loadSavedGrievances();
    }
  }, [actSubTab, loadSavedGrievances]);

  const handleDeleteGrievanceRecord = (id: string, title: string) => {
    Alert.alert(
      'Delete Representation',
      `Permanently delete "${title}" from your on-device vault?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGrievance(id);
              await loadSavedGrievances();
              if (selectedVaultDoc?.id === id) setSelectedVaultDoc(null);
            } catch {
              Alert.alert('Delete Error', 'Could not delete representation from local database.');
            }
          },
        },
      ]
    );
  };

  const handleShareFormalDoc = async (docText?: string, subject?: string) => {
    const text = docText || composedCase?.formalDocument;
    const subj = subject || composedCase?.subjectLine || 'Formal Statutory Representation';
    if (!text) return;
    try {
      await Share.share({
        title: subj,
        message: text,
      });
    } catch {
      Alert.alert('Share Error', 'Could not launch device share sheet.');
    }
  };

  const handleEmailPetition = (authorityCode?: string, docText?: string, subject?: string) => {
    const text = docText || composedCase?.formalDocument || '';
    const subj = subject || composedCase?.subjectLine || 'Formal Statutory Representation';
    const code = authorityCode || composedCase?.authority?.code || intakeData?.authorityMatch?.primaryAuthority?.code || '';

    const authorityEmails: Record<string, string> = {
      ANTI_RAGGING: 'helpline@antiragging.in',
      UGC_SAMADHAAN: 'contact.ugc@nic.in',
      UGC_E_SAMADHAAN: 'contact.ugc@nic.in',
      FSSAI_FOSCOS: 'contact-us@fssai.gov.in',
      CYBERCRIME_INDIA: 'complaints@cybercrime.gov.in',
      NATIONAL_CYBER_CRIME: 'complaints@cybercrime.gov.in',
      NCW_WOMEN_COMMISSION: 'complaints-ncw@nic.in',
      COLLEGE_ICC: '', // Institution specific
    };
    const targetEmail = authorityEmails[code] || '';

    if (code === 'COLLEGE_ICC' || !targetEmail) {
      Alert.alert(
        'College ICC Email Required',
        'College Internal Complaints Committees have institution-specific email addresses. Opening email composer — please enter your institution ICC email address in the "To:" field.',
        [
          {
            text: 'Open Email Composer',
            onPress: () => {
              const mailUrl = `mailto:?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(text)}`;
              Linking.openURL(mailUrl).catch(() => {
                Alert.alert('Email Error', 'Could not open device email client.');
              });
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    const mailUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(text)}`;
    Linking.openURL(mailUrl).catch(() => {
      Alert.alert('Email Error', 'Could not open device email client.');
    });
  };

  const handleClearForm = () => {
    Alert.alert('Reset Form', 'Clear all grievance intake fields?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: () => {
          setComplainantName('');
          setStudentId('');
          setInstitution('');
          setHostelLocation('');
          setIncidentDate(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }));
          setNarrative('');
          setPriorSteps('');
          setRelief('');
          setIntakeData(null);
          setComposedCase(null);
          setStep('intake');
        },
      },
    ]);
  };

  const handleRunIntake = async () => {
    if (!narrative.trim() || !institution.trim()) {
      Alert.alert('Required Fields', 'Please enter your institution name and factual statement.');
      return;
    }

    setIsLoading(true);
    const statementCombined = `${narrative.trim()} ${priorSteps.trim()}`;

    try {
      const res = await fetch(`${GATEWAY_BASE_URL}/api/v1/act/cases/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          statement: statementCombined,
          institutionName: institution.trim(),
          priorReportIgnored: Boolean(priorSteps.trim()),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIntakeData(data);
        setStep('review');
      } else {
        // Fallback to on-device deterministic statutory authority matching
        const authorityMatch = matchAuthorityForGrievance({
          category,
          statement: statementCombined,
          priorReportIgnored: Boolean(priorSteps.trim()),
        });
        setIntakeData({
          ok: true,
          authorityMatch,
          clarifyingQuestions: [
            { id: 'q1', question: 'On what specific date and time did this incident occur?', purpose: 'Factual chronology' },
            { id: 'q2', question: 'Did you inform warden, dean, or administration previously?', purpose: 'Proves institutional negligence' },
            { id: 'q3', question: 'Were there medical consequences or physical safety hazards?', purpose: 'Evidence of harm' },
          ],
        });
        setStep('review');
      }
    } catch {
      // Offline fallback: execute real deterministic authority matching on-device
      const authorityMatch = matchAuthorityForGrievance({
        category,
        statement: statementCombined,
        priorReportIgnored: Boolean(priorSteps.trim()),
      });
      setIntakeData({
        ok: true,
        authorityMatch,
        clarifyingQuestions: [
          { id: 'q1', question: 'On what specific date and time did this incident occur?', purpose: 'Factual chronology' },
          { id: 'q2', question: 'Did you inform warden, dean, or administration previously?', purpose: 'Proves institutional negligence' },
          { id: 'q3', question: 'Were there medical consequences or physical safety hazards?', purpose: 'Evidence of harm' },
        ],
      });
      setStep('review');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComposeRepresentation = async () => {
    setIsLoading(true);
    const casePayload = {
      complainantName: complainantName.trim() || 'Aggrieved Student',
      studentId: studentId.trim() || 'NOT_SPECIFIED',
      institutionName: institution.trim(),
      hostelOrLocation: hostelLocation.trim() || 'Campus',
      category,
      incidentDate: incidentDate.trim() || new Date().toISOString(),
      rawNarrative: narrative.trim(),
      priorSteps: priorSteps.trim(),
      reliefRequested: relief.trim() || 'Immediate remediation and safety audit.',
      clarificationAnswers: Object.entries(clarificationAnswers).map(([qid, ans]) => ({
        question: intakeData?.clarifyingQuestions?.find((q: any) => q.id === qid)?.question || qid,
        answer: ans.trim(),
      })).filter((item) => item.answer.length > 0),
      evidenceItems: attachedFiles.map((f) => ({
        name: f.name,
        type: f.mimeType,
        sizeBytes: f.sizeBytes,
        capturedAt: new Date().toISOString(),
        digestHex: f.digestHex,
        digestType: f.digestType,
      })),
    };

    try {
      const res = await fetch(`${GATEWAY_BASE_URL}/api/v1/act/cases/compose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(casePayload),
      });

      let composedDoc = '';
      let portalHandoffObj: any = null;

      if (res.ok) {
        const data = await res.json();
        setComposedCase(data.case);
        composedDoc = data.case.formalDocument;
        portalHandoffObj = data.case.portalHandoff;
      } else {
        // Fallback to local on-device formal composition
        const localComposed = composeFormalGrievance(casePayload);
        setComposedCase(localComposed);
        composedDoc = localComposed.formalDocument;
        portalHandoffObj = localComposed.portalHandoff;
      }

      // Save formal petition to on-device SQLite database
      const grievanceRecord: SavedGrievance = {
        id: `grievance_${Date.now()}`,
        title: `${category.replace(/_/g, ' ')} - ${institution.trim()}`,
        category,
        institution_name: institution.trim(),
        hostel_location: hostelLocation.trim(),
        incident_date: incidentDate.trim(),
        raw_narrative: narrative.trim(),
        prior_steps: priorSteps.trim(),
        relief_requested: relief.trim(),
        authority_code: intakeData?.authorityMatch?.primaryAuthority?.code || 'STATUTORY',
        formal_document: composedDoc,
        status: 'PREPARED_FOR_HANDOFF',
        created_at: new Date().toISOString(),
      };

      await saveGrievance(grievanceRecord);
      setStep('handoff');
      Alert.alert(
        'Petition Saved to Vault',
        'Formal representation drafted and securely saved to your local SQLite database.'
      );
    } catch {
      // Offline fallback: execute real deterministic formal composition on-device
      try {
        const localComposed = composeFormalGrievance(casePayload);
        setComposedCase(localComposed);

        const grievanceRecord: SavedGrievance = {
          id: `grievance_${Date.now()}`,
          title: `${category.replace(/_/g, ' ')} - ${institution.trim()}`,
          category,
          institution_name: institution.trim(),
          hostel_location: hostelLocation.trim(),
          incident_date: incidentDate.trim(),
          raw_narrative: narrative.trim(),
          prior_steps: priorSteps.trim(),
          relief_requested: relief.trim(),
          authority_code: intakeData?.authorityMatch?.primaryAuthority?.code || 'STATUTORY',
          formal_document: localComposed.formalDocument,
          status: 'PREPARED_FOR_HANDOFF',
          created_at: new Date().toISOString(),
        };

        await saveGrievance(grievanceRecord);
        setStep('handoff');
        Alert.alert(
          'Saved to Local Vault',
          'Formal petition synthesized offline and saved to your on-device SQLite database.'
        );
      } catch (err: any) {
        Alert.alert('Composition Error', err.message || 'Failed to synthesize formal draft.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPill = async (key: string, value: string) => {
    try {
      await Clipboard.setStringAsync(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
      Alert.alert('Copied to Clipboard', `Pill "${key}" copied to clipboard.`);
    } catch {
      Alert.alert('Clipboard Notice', 'Could not copy text to clipboard.');
    }
  };

  const categories = [
    { key: 'HOSTEL_SANITATION', label: 'Hostel Living / Sanitation' },
    { key: 'MESS_FOOD', label: 'Mess Food / Hygiene' },
    { key: 'CYBERSTALKING', label: 'Cyberstalking / Threat' },
    { key: 'SEXUAL_HARASSMENT', label: 'Campus Harassment / ICC' },
    { key: 'RAGGING', label: 'Anti-Ragging Zero-Tolerance' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.contentContainer}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.screenTitle, { color: theme.text }]}>Act Navigator</Text>
          <Text style={[styles.screenSubtitle, { color: theme.textSecondary }]}>Statutory grievance navigator & evidence assistant</Text>
        </View>
        {actSubTab === 'composer' && (
          <TouchableOpacity style={[styles.demoBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={handleClearForm}>
            <Text style={[styles.demoBtnText, { color: theme.textSecondary }]}>Clear Form</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sub Tab Switcher: Composer | Petitions Vault | Directory */}
      <View style={[styles.subTabRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.subTabBtn, actSubTab === 'composer' && { backgroundColor: theme.card }]}
          onPress={() => setActSubTab('composer')}
        >
          <Text
            style={[
              styles.subTabBtnText,
              { color: theme.textMuted },
              actSubTab === 'composer' && { color: theme.primary, fontWeight: '700' },
            ]}
          >
            Draft Petition
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, actSubTab === 'vault' && { backgroundColor: theme.card }]}
          onPress={() => setActSubTab('vault')}
        >
          <Text
            style={[
              styles.subTabBtnText,
              { color: theme.textMuted },
              actSubTab === 'vault' && { color: theme.primary, fontWeight: '700' },
            ]}
          >
            Vault ({savedGrievancesList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, actSubTab === 'directory' && { backgroundColor: theme.card }]}
          onPress={() => setActSubTab('directory')}
        >
          <Text
            style={[
              styles.subTabBtnText,
              { color: theme.textMuted },
              actSubTab === 'directory' && { color: theme.primary, fontWeight: '700' },
            ]}
          >
            Directory
          </Text>
        </TouchableOpacity>
      </View>

      {/* COMPOSER SUBTAB */}
      {actSubTab === 'composer' && (
        <View>
          {/* Progress Steps Indicator */}
          <View style={styles.stepsRow}>
            <View style={[styles.stepDot, step === 'intake' && styles.stepDotActive]}>
              <Text style={styles.stepNum}>1. Intake</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={[styles.stepDot, step === 'review' && styles.stepDotActive]}>
              <Text style={styles.stepNum}>2. Authority</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={[styles.stepDot, step === 'handoff' && styles.stepDotActive]}>
              <Text style={styles.stepNum}>3. Handoff</Text>
            </View>
          </View>

      {/* STEP 1: INTAKE */}
      {step === 'intake' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Document Incident Facts</Text>

          <Text style={styles.label}>Grievance Category</Text>
          <View style={styles.catWrap}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c.key}
                style={[styles.catPill, category === c.key && styles.catPillActive]}
                onPress={() => setCategory(c.key)}
              >
                <Text style={[styles.catPillText, category === c.key && styles.catPillTextActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Complainant Name (Optional / Anonymous)</Text>
          <TextInput
            style={styles.input}
            value={complainantName}
            onChangeText={setComplainantName}
            placeholder="Your name or leave blank for anonymous..."
            placeholderTextColor="#64748B"
          />

          <Text style={styles.label}>Student ID / Roll Number (Optional)</Text>
          <TextInput
            style={styles.input}
            value={studentId}
            onChangeText={setStudentId}
            placeholder="Roll number or student ID..."
            placeholderTextColor="#64748B"
          />

          <Text style={styles.label}>Institution / College *</Text>
          <TextInput
            style={styles.input}
            value={institution}
            onChangeText={setInstitution}
            placeholder="College or University name..."
            placeholderTextColor="#64748B"
          />

          <Text style={styles.label}>Hostel / Location on Campus</Text>
          <TextInput
            style={styles.input}
            value={hostelLocation}
            onChangeText={setHostelLocation}
            placeholder="e.g. Ganga Girls Hostel, Room 204 or Campus Block"
            placeholderTextColor="#64748B"
          />

          <Text style={styles.label}>Date & Time of Incident</Text>
          <TextInput
            style={styles.input}
            value={incidentDate}
            onChangeText={setIncidentDate}
            placeholder="e.g. 12th November 2026, 02:30 AM"
            placeholderTextColor="#64748B"
          />

          <Text style={styles.label}>What Happened? (Factual Statement) *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={narrative}
            onChangeText={setNarrative}
            multiline
            placeholder="Describe the incident objectively: dates, events, physical safety hazards..."
            placeholderTextColor="#64748B"
          />

          <Text style={styles.label}>Prior Internal Steps Taken</Text>
          <TextInput
            style={[styles.input, styles.textArea, { minHeight: 60 }]}
            value={priorSteps}
            onChangeText={setPriorSteps}
            multiline
            placeholder="Did you inform warden, dean, or maintenance? Mention dates..."
            placeholderTextColor="#64748B"
          />

          <Text style={styles.label}>Relief / Action Requested</Text>
          <TextInput
            style={[styles.input, styles.textArea, { minHeight: 60 }]}
            value={relief}
            onChangeText={setRelief}
            multiline
            placeholder="What specific remedy do you seek?"
            placeholderTextColor="#64748B"
          />

          <Text style={styles.label}>Contemporaneous Evidence / Photos (Optional)</Text>
          <TouchableOpacity
            style={[styles.attachBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={handlePickEvidenceFile}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <AppIcon name="attach" size={14} color={theme.primary} />
              <Text style={[styles.attachBtnText, { color: theme.primary }]}>Attach Document or Photograph</Text>
            </View>
          </TouchableOpacity>

          {attachedFiles.length > 0 && (
            <View style={styles.attachedFilesList}>
              {attachedFiles.map((file, idx) => (
                <View key={idx} style={[styles.attachedFileBadge, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.attachedFileName, { color: theme.text }]} numberOfLines={1}>{file.name}</Text>
                    <Text style={[styles.attachedFileMeta, { color: theme.textSecondary }]}>
                      {Math.round(file.sizeBytes / 1024)} KB • SHA-256: {file.digestHex.slice(0, 16)}...
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveAttachedFile(idx)}
                    style={[styles.removeFileBtn, { backgroundColor: theme.surface }]}
                  >
                    <AppIcon name="close" size={12} color={theme.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleRunIntake}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#090D16" />
            ) : (
              <Text style={styles.primaryBtnText}>Match Statutory Authority →</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 2: AUTHORITY REVIEW & CLARIFYING QUESTIONS */}
      {step === 'review' && intakeData && (
        <View>
          <View style={styles.card}>
            <View style={styles.authorityHeader}>
              <View style={styles.authBadge}>
                <Text style={styles.authBadgeText}>STATUTORY MATCH</Text>
              </View>
              {intakeData.authorityMatch?.primaryAuthority?.resolutionWindowDays && (
                <View style={styles.windowBadge}>
                  <Text style={styles.windowBadgeText}>
                    ⏱️ {intakeData.authorityMatch.primaryAuthority.resolutionWindowDays}-Day Mandate
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.authName}>
              {intakeData.authorityMatch?.primaryAuthority?.name}
            </Text>
            <Text style={styles.authReason}>
              {intakeData.authorityMatch?.routingReason}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>ADAPTIVE VERIFICATION QUESTIONS (PROVIDE ANSWERS):</Text>
            {intakeData.clarifyingQuestions?.map((q: any) => (
              <View key={q.id} style={styles.qCard}>
                <Text style={styles.qText}>{q.question}</Text>
                <Text style={styles.qPurpose}>Factual context: {q.purpose}</Text>
                <TextInput
                  style={styles.qAnswerInput}
                  placeholder="Type your response to this question..."
                  placeholderTextColor="#64748B"
                  value={clarificationAnswers[q.id] || ''}
                  onChangeText={(txt) => setClarificationAnswers((prev) => ({ ...prev, [q.id]: txt }))}
                  multiline
                />
              </View>
            ))}

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => setStep('intake')}
              >
                <Text style={styles.secondaryBtnText}>← Edit Facts</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryBtnFlex}
                onPress={handleComposeRepresentation}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#090D16" />
                ) : (
                  <Text style={styles.primaryBtnText}>Draft Formal Petition →</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* STEP 3: HANDOFF & CLIPBOARD PILLS */}
      {step === 'handoff' && composedCase && (
        <View>
          {/* Official Representation Preview */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Formal Representation Draft</Text>
            <Text style={styles.docSubject}>{composedCase.subjectLine}</Text>
            <Text style={styles.docCitation}>Statutory Mandate: {composedCase.statutoryCitation}</Text>

            <ScrollView style={styles.docBox} nestedScrollEnabled>
              <Text style={styles.docContent}>{composedCase.formalDocument}</Text>
            </ScrollView>
          </View>

          {/* Assisted Portal Handoff Card */}
          <View style={[styles.card, styles.handoffCard]}>
            <Text style={styles.handoffTitle}>Assisted Portal Handoff</Text>
            <Text style={styles.handoffDesc}>
              Tap each pill below to copy pre-formatted text into your clipboard, then open the official portal.
            </Text>

            <TouchableOpacity
              style={styles.portalActionBtn}
              onPress={() => Linking.openURL(composedCase.portalHandoff.targetUrl)}
            >
              <Text style={styles.portalActionBtnText}>
                Open {composedCase.authority.name} ↗
              </Text>
            </TouchableOpacity>

            <View style={styles.handoffActionsRow}>
              <TouchableOpacity
                style={[styles.shareDocBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => handleShareFormalDoc()}
              >
                <AppIcon name="share" size={14} color={theme.text} />
                <Text style={[styles.shareDocBtnText, { color: theme.text }]}>Share Petition</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.emailDocBtn, { backgroundColor: theme.primary }]}
                onPress={() => handleEmailPetition()}
              >
                <AppIcon name="email" size={14} color="#FFFFFF" />
                <Text style={styles.emailDocBtnText}>Send by Email</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.pillSectionHeader, { color: theme.textMuted }]}>1-TAP CLIPBOARD PILLS:</Text>
            {composedCase.portalHandoff.clipboardPills?.map((pill: any) => (
              <TouchableOpacity
                key={pill.key}
                style={[
                  styles.pillCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  copiedKey === pill.key && { borderColor: theme.success, backgroundColor: theme.successLight },
                ]}
                onPress={() => handleCopyPill(pill.key, pill.value)}
              >
                <View style={styles.pillTop}>
                  <Text style={[styles.pillLabel, { color: theme.primary }]}>{pill.label}</Text>
                  <Text style={[styles.pillCopyIndicator, { color: copiedKey === pill.key ? theme.success : theme.textMuted }]}>
                    {copiedKey === pill.key ? 'COPIED' : 'TAP TO COPY'}
                  </Text>
                </View>
                <Text style={[styles.pillPreview, { color: theme.text }]} numberOfLines={2}>
                  {pill.value}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.resetBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => setStep('intake')}
            >
              <Text style={[styles.resetBtnText, { color: theme.textSecondary }]}>← Start New Grievance</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
        </View>
      )}

      {/* VAULT SUBTAB */}
      {actSubTab === 'vault' && (
        <View style={styles.vaultContainer}>
          {!isVaultUnlocked ? (
            <View style={[styles.lockedVaultCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={{ marginBottom: 12, alignItems: 'center' }}>
                <AppIcon name="lock" size={32} color={theme.primary} />
              </View>
              <Text style={[styles.lockedVaultTitle, { color: theme.text }]}>Vault Authentication Required</Text>
              <Text style={[styles.lockedVaultDesc, { color: theme.textSecondary }]}>
                Statutory representations contain sensitive student and grievance information.
                Enter your 4-digit security PIN to unlock and view saved records.
              </Text>
              <TouchableOpacity
                style={[styles.unlockVaultBtn, { backgroundColor: theme.primary }]}
                onPress={() => setIsVaultModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.unlockVaultBtnText}>Unlock Protected Vault</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.vaultHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.vaultTitle, { color: theme.text }]}>Saved Statutory Petitions</Text>
                  <Text style={[styles.vaultSubtitle, { color: theme.textSecondary }]}>
                    Locally protected records persisted in on-device SQLite
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.lockVaultBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => setIsVaultUnlocked(false)}
                >
                  <Text style={[styles.lockVaultBtnText, { color: theme.textSecondary }]}>Lock Vault</Text>
                </TouchableOpacity>
              </View>

              {isLoadingVault ? (
                <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 24 }} />
              ) : savedGrievancesList.length === 0 ? (
            <View style={[styles.emptyVaultCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <AppIcon name="legal" size={36} color={theme.textMuted} />
              <Text style={[styles.emptyVaultTitle, { color: theme.text }]}>No Grievance Petitions Saved</Text>
              <Text style={[styles.emptyVaultDesc, { color: theme.textSecondary }]}>
                Petitions generated in the Draft Petition tab will be stored here on your device for fast review, emailing, and statutory filing.
              </Text>
            </View>
          ) : (
            <View style={styles.vaultList}>
              {savedGrievancesList.map((item) => {
                const isSelected = selectedVaultDoc?.id === item.id;
                return (
                  <View key={item.id} style={[styles.vaultCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.vaultTopRow}>
                      <View style={[styles.vaultCatBadge, { backgroundColor: theme.primaryLight }]}>
                        <Text style={[styles.vaultCatText, { color: theme.primary }]}>{item.category.replace(/_/g, ' ')}</Text>
                      </View>
                      <Text style={[styles.vaultDate, { color: theme.textMuted }]}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </Text>
                    </View>

                    <Text style={[styles.vaultCardTitle, { color: theme.text }]}>{item.title}</Text>
                    <Text style={[styles.vaultInstitution, { color: theme.textSecondary }]}>
                      Institution: {item.institution_name} {item.hostel_location ? `(${item.hostel_location})` : ''}
                    </Text>
                    <Text style={[styles.vaultAuthority, { color: theme.textMuted }]}>
                      Authority: <Text style={{ color: theme.primary, fontWeight: '700' }}>{item.authority_code}</Text>
                    </Text>

                    {isSelected && (
                      <View style={[styles.vaultDocExpanded, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Text style={[styles.vaultDocExpandedHeading, { color: theme.text }]}>Formal Document Content:</Text>
                        <ScrollView style={[styles.vaultDocBox, { backgroundColor: theme.card }]} nestedScrollEnabled>
                          <Text style={[styles.vaultDocText, { color: theme.text }]}>{item.formal_document}</Text>
                        </ScrollView>
                      </View>
                    )}

                    <View style={styles.vaultBtnRow}>
                      <TouchableOpacity
                        style={[styles.vaultActionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={() => setSelectedVaultDoc(isSelected ? null : item)}
                      >
                        <Text style={[styles.vaultActionBtnText, { color: theme.text }]}>
                          {isSelected ? 'Hide Doc' : 'View Doc'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.vaultActionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={() => handleShareFormalDoc(item.formal_document, item.title)}
                      >
                        <Text style={[styles.vaultActionBtnText, { color: theme.text }]}>Share</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.vaultActionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={() => handleEmailPetition(item.authority_code, item.formal_document, item.title)}
                      >
                        <Text style={[styles.vaultActionBtnText, { color: theme.text }]}>Email</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.vaultActionBtn, styles.vaultDeleteBtn, { backgroundColor: theme.dangerLight }]}
                        onPress={() => handleDeleteGrievanceRecord(item.id, item.title)}
                      >
                        <AppIcon name="trash" size={14} color={theme.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
            </>
          )}
        </View>
      )}

      {/* DIRECTORY SUBTAB */}
      {actSubTab === 'directory' && (
        <View style={styles.dirContainer}>
          <View style={styles.dirHeaderRow}>
            <Text style={[styles.dirTitle, { color: theme.text }]}>Verified Statutory Authorities</Text>
            <Text style={[styles.dirSubtitle, { color: theme.textSecondary }]}>
              Government statutory portals with established resolution mandates
            </Text>
          </View>

          <View style={styles.dirList}>
            {Object.values(VERIFIED_AUTHORITIES).map((auth) => (
              <View key={auth.code} style={[styles.dirCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.dirCardTop}>
                  <Text style={[styles.dirCode, { color: theme.primary }]}>{auth.code.replace(/_/g, ' ')}</Text>
                  {auth.resolutionWindowDays && (
                    <View style={[styles.dirWindowBadge, { backgroundColor: theme.primaryLight }]}>
                      <Text style={[styles.dirWindowText, { color: theme.primary }]}>{auth.resolutionWindowDays}-Day Window</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.dirName, { color: theme.text }]}>{auth.name}</Text>
                <Text style={[styles.dirJurisdiction, { color: theme.textSecondary }]}>{auth.jurisdiction}</Text>

                <View style={styles.dirActionsRow}>
                  {auth.portalUrl && (
                    <TouchableOpacity
                      style={[styles.dirPortalBtn, { backgroundColor: theme.primary }]}
                      onPress={() => Linking.openURL(auth.portalUrl)}
                    >
                      <Text style={styles.dirPortalBtnText}>Official Portal ↗</Text>
                    </TouchableOpacity>
                  )}

                  {auth.emergencyHelpline && (
                    <TouchableOpacity
                      style={[styles.dirCallBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                      onPress={() => Linking.openURL(`tel:${auth.emergencyHelpline}`)}
                    >
                      <AppIcon name="phone" size={12} color={theme.text} />
                      <Text style={[styles.dirCallBtnText, { color: theme.text }]}>Call {auth.emergencyHelpline}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Ground Truth Disclaimer */}
      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>
          Draft generated for your review. ResQ does not provide legal advice, guarantee administrative outcomes,
          or submit reports automatically. You retain sole authority to review and manually submit this documentation.
        </Text>
      </View>

      <VaultSecurityModal
        visible={isVaultModalVisible}
        onSuccess={() => {
          setIsVaultModalVisible(false);
          setIsVaultUnlocked(true);
          loadSavedGrievances();
        }}
        onCancel={() => {
          setIsVaultModalVisible(false);
        }}
        title="Unlock Petitions Vault"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subTabRow: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  subTabBtnActive: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  subTabBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  subTabBtnTextActive: {
    color: '#38BDF8',
  },
  screenTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
  },
  screenSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  demoBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  demoBtnText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  stepDot: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#1E293B',
  },
  stepDotActive: {
    backgroundColor: '#38BDF8',
  },
  stepNum: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 4,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  label: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  catWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  catPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  catPillActive: {
    backgroundColor: '#38BDF8',
  },
  catPillText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  catPillTextActive: {
    color: '#090D16',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  primaryBtn: {
    backgroundColor: '#38BDF8',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryBtnFlex: {
    flex: 1,
    backgroundColor: '#38BDF8',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#090D16',
    fontSize: 13,
    fontWeight: '700',
  },
  authorityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  authBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  authBadgeText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
  },
  windowBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  windowBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  authName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  authReason: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 12,
  },
  sectionHeader: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  qCard: {
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  qText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  qPurpose: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  qAnswerInput: {
    marginTop: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 13,
    minHeight: 48,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  secondaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 12,
  },
  docSubject: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  docCitation: {
    color: '#94A3B8',
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  docBox: {
    maxHeight: 220,
    backgroundColor: '#090D16',
    borderRadius: 8,
    padding: 12,
  },
  docContent: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  handoffCard: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  handoffTitle: {
    color: '#10B981',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  handoffDesc: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  portalActionBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 14,
  },
  portalActionBtnText: {
    color: '#090D16',
    fontWeight: '800',
    fontSize: 13,
  },
  pillSectionHeader: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pillCard: {
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  pillCardCopied: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  pillTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  pillLabel: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  pillCopyIndicator: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
  },
  pillPreview: {
    color: '#E2E8F0',
    fontSize: 11,
  },
  resetBtn: {
    marginTop: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  resetBtnText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  disclaimerContainer: {
    marginTop: 10,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
  },
  disclaimerText: {
    color: '#64748B',
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
  handoffActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  shareDocBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  shareDocBtnText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  emailDocBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
  },
  emailDocBtnText: {
    color: '#A5B4FC',
    fontSize: 12,
    fontWeight: '700',
  },
  vaultContainer: {
    gap: 12,
  },
  vaultHeaderRow: {
    marginBottom: 8,
  },
  vaultTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  vaultSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  emptyVaultCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  emptyVaultIcon: {
    fontSize: 32,
  },
  emptyVaultTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyVaultDesc: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  vaultList: {
    gap: 12,
  },
  vaultCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 6,
  },
  vaultTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vaultCatBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  vaultCatText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
  },
  vaultDate: {
    color: '#64748B',
    fontSize: 10,
  },
  vaultCardTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  vaultInstitution: {
    color: '#94A3B8',
    fontSize: 12,
  },
  vaultAuthority: {
    color: '#64748B',
    fontSize: 11,
  },
  vaultDocExpanded: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  vaultDocExpandedHeading: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  vaultDocBox: {
    maxHeight: 200,
  },
  vaultDocText: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  vaultBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  vaultActionBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  vaultActionBtnText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '600',
  },
  vaultDeleteBtn: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    marginLeft: 'auto',
  },
  vaultDeleteBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '800',
  },
  dirContainer: {
    gap: 12,
  },
  dirHeaderRow: {
    marginBottom: 8,
  },
  dirTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  dirSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  dirList: {
    gap: 10,
  },
  dirCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 6,
  },
  dirCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dirCode: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dirWindowBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dirWindowText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '700',
  },
  dirName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  dirJurisdiction: {
    color: '#94A3B8',
    fontSize: 11,
  },
  dirActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  dirPortalBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  dirPortalBtnText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  dirCallBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  dirCallBtnText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  lockedVaultCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  lockedVaultIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  lockedVaultTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  lockedVaultDesc: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  unlockVaultBtn: {
    backgroundColor: '#38BDF8',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
  },
  unlockVaultBtnText: {
    color: '#090D16',
    fontWeight: '800',
    fontSize: 13,
  },
  lockVaultBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  lockVaultBtnText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },
  attachBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    marginBottom: 10,
    alignItems: 'center',
  },
  attachBtnText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  attachedFilesList: {
    marginBottom: 12,
    gap: 6,
  },
  attachedFileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  attachedFileName: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  attachedFileMeta: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  removeFileBtn: {
    padding: 6,
  },
  removeFileText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
});

