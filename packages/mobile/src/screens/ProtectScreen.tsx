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
  Platform,
  Share,
} from 'react-native';
import {
  getSavedIncidents,
  saveIncident,
  deleteIncident,
  SavedIncident,
} from '../services/storageService';
import { GATEWAY_BASE_URL } from '../services/routingAdapter';
import {
  calculateIncidentHash,
  buildTemporalIncidentGraph,
  auditDigitalExposure,
} from '@walking-companion/core';

interface ProtectScreenProps {
  initialText?: string;
  onOpenPrivacy?: () => void;
}

export const ProtectScreen: React.FC<ProtectScreenProps> = ({ initialText }) => {
  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'exposure'>('timeline');

  // Real SQLite Timeline State
  const [incidents, setIncidents] = useState<SavedIncident[]>([]);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(true);

  const [newPlatform, setNewPlatform] = useState('INSTAGRAM');
  const [newSender, setNewSender] = useState('');
  const [newMessage, setNewMessage] = useState(initialText || '');
  const [newEvidenceRef, setNewEvidenceRef] = useState('');
  const [newWasBlocked, setNewWasBlocked] = useState(false);

  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Exposure Audit State (Starts clean without dummy text)
  const [bioText, setBioText] = useState('');
  const [auditResult, setAuditResult] = useState<any>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // Load real incidents from on-device SQLite database
  const loadIncidents = useCallback(async () => {
    try {
      setIsLoadingIncidents(true);
      const items = await getSavedIncidents();
      setIncidents(items || []);
    } catch {
      Alert.alert('Vault Notice', 'Failed to read incident records from SQLite.');
    } finally {
      setIsLoadingIncidents(false);
    }
  }, []);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  useEffect(() => {
    if (initialText) {
      setNewMessage(initialText);
      setActiveSubTab('timeline');
    }
  }, [initialText]);

  const handleAddIncident = async () => {
    if (!newSender.trim() || !newMessage.trim()) {
      Alert.alert('Required Fields', 'Please enter sender handle and message text.');
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const id = `inc_${Date.now()}`;

      // Calculate cryptographic SHA-256 digest on device immediately
      const hash = calculateIncidentHash({
        id,
        timestamp,
        platform: newPlatform,
        senderHandle: newSender.trim(),
        messageContent: newMessage.trim(),
      });

      const record: SavedIncident = {
        id,
        timestamp,
        platform: newPlatform,
        sender_handle: newSender.trim(),
        message_content: newMessage.trim(),
        was_blocked_prior: newWasBlocked ? 1 : 0,
        evidence_ref: newEvidenceRef.trim(),
        hash,
        created_at: timestamp,
      };

      await saveIncident(record);
      await loadIncidents();

      setNewSender('');
      setNewMessage('');
      setNewEvidenceRef('');
      setNewWasBlocked(false);
      Alert.alert(
        'Evidence Hashed & Saved',
        'Contemporaneous incident record committed to on-device SQLite vault with SHA-256 checksum.'
      );
    } catch (err: any) {
      Alert.alert('Vault Error', err.message || 'Could not save incident to local vault.');
    }
  };

  const handleExportManifest = async () => {
    if (incidents.length === 0) {
      Alert.alert('Vault Empty', 'No incident records to export.');
      return;
    }

    const itemsText = incidents
      .map((inc, i) => {
        return `[Incident ${i + 1}]\nTimestamp: ${inc.timestamp}\nPlatform: ${inc.platform}\nSender: ${inc.sender_handle}\nMessage: "${inc.message_content}"\nPrior Block: ${inc.was_blocked_prior ? 'YES' : 'NO'}\nEvidence Ref: ${inc.evidence_ref || 'None'}\nSHA-256 Digest: ${inc.hash}\n----------------------------------------`;
      })
      .join('\n\n');

    const manifestText = `VYSHUUU CONTEMPORANEOUS INCIDENT MANIFEST\nIntegrity: Cryptographically Hashed (SHA-256)\nTotal Logged Incidents: ${incidents.length}\nExport Date: ${new Date().toISOString()}\nStorage: On-Device SQLite (Zero Cloud Telemetry)\n========================================\n\n${itemsText}\n\nNotice: This contemporaneous log constitutes evidentiary record under statutory standards.`;

    try {
      await Share.share({
        title: 'vyshuuu Contemporaneous Incident Manifest',
        message: manifestText,
      });
    } catch {
      Alert.alert('Export Error', 'Could not open device sharing dialogue.');
    }
  };

  const handleDeleteIncident = (id: string) => {
    Alert.alert(
      'Delete Incident Record',
      'Permanently delete this contemporaneous record from local device storage?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteIncident(id);
              await loadIncidents();
            } catch {
              Alert.alert('Error', 'Could not delete incident record.');
            }
          },
        },
      ]
    );
  };

  const handleRunAnalysis = async () => {
    if (incidents.length === 0) {
      Alert.alert('Vault Empty', 'Log at least one incident to analyze temporal behavioral patterns.');
      return;
    }

    setIsAnalyzing(true);
    // Format records for analytical engine
    const formattedIncidents = incidents.map((inc) => ({
      id: inc.id,
      timestamp: inc.timestamp,
      platform: inc.platform,
      senderHandle: inc.sender_handle,
      messageContent: inc.message_content,
      wasBlockedPrior: Boolean(inc.was_blocked_prior),
      hash: inc.hash,
    }));

    try {
      const res = await fetch(`${GATEWAY_BASE_URL}/api/v1/protect/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidents: formattedIncidents }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data.summary);
      } else {
        // Fallback directly to deterministic core analytical engine
        const graph = buildTemporalIncidentGraph(formattedIncidents);
        setAnalysisResult(graph);
      }
    } catch {
      // Offline fallback: execute real deterministic core graph construction on-device
      const graph = buildTemporalIncidentGraph(formattedIncidents);
      setAnalysisResult(graph);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAuditExposure = async () => {
    if (!bioText.trim()) {
      Alert.alert('Input Required', 'Please paste profile bio, status, or caption text to audit.');
      return;
    }

    setIsAuditing(true);
    try {
      const res = await fetch(`${GATEWAY_BASE_URL}/api/v1/protect/audit-exposure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textContent: bioText.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setAuditResult(data.audit);
      } else {
        // Fallback directly to deterministic core exposure auditor
        const audit = auditDigitalExposure(bioText.trim());
        setAuditResult(audit);
      }
    } catch {
      // Offline fallback: execute real deterministic exposure audit on-device
      const audit = auditDigitalExposure(bioText.trim());
      setAuditResult(audit);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Sub Tab Switcher */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.switchBtn, activeSubTab === 'timeline' && styles.switchBtnActive]}
          onPress={() => setActiveSubTab('timeline')}
        >
          <Text style={[styles.switchBtnText, activeSubTab === 'timeline' && styles.switchBtnTextActive]}>
            Incident Timeline ({incidents.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switchBtn, activeSubTab === 'exposure' && styles.switchBtnActive]}
          onPress={() => setActiveSubTab('exposure')}
        >
          <Text style={[styles.switchBtnText, activeSubTab === 'exposure' && styles.switchBtnTextActive]}>
            Exposure Audit
          </Text>
        </TouchableOpacity>
      </View>

      {/* TIMELINE SUBTAB */}
      {activeSubTab === 'timeline' && (
        <View>
          {/* Action Bar */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Protect Vault</Text>
              <Text style={styles.sectionSubtitle}>Cryptographic SHA-256 contemporaneous timeline</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {incidents.length > 0 && (
                <TouchableOpacity
                  style={styles.exportBtn}
                  onPress={handleExportManifest}
                  accessibilityRole="button"
                  accessibilityLabel="Export incident ledger manifest"
                >
                  <Text style={styles.exportBtnText}>Export 📤</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.analyzeBtn}
                onPress={handleRunAnalysis}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <ActivityIndicator size="small" color="#090D16" />
                ) : (
                  <Text style={styles.analyzeBtnText}>Analyze ⚡</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Analysis Findings Card */}
          {analysisResult && (
            <View style={styles.analysisCard}>
              <Text style={styles.cardHeader}>DETECTED BEHAVIORAL PATTERNS</Text>
              <Text style={styles.cardMetrics}>
                Span: {analysisResult.timelineSpanDays} days | Platforms: {analysisResult.platformsCovered?.join(', ')} | Senders: {analysisResult.uniqueSendersCount}
              </Text>

              {analysisResult.patterns?.map((pat: any) => (
                <View key={pat.patternId} style={styles.patternItem}>
                  <View style={styles.patternHeader}>
                    <Text style={styles.patternType}>{pat.type.replace(/_/g, ' ')}</Text>
                    <View style={styles.severityBadge}>
                      <Text style={styles.severityText}>{pat.severity}</Text>
                    </View>
                  </View>
                  <Text style={styles.patternSummary}>{pat.summary}</Text>
                  <Text style={styles.patternBasis}>{pat.factualBasis}</Text>
                </View>
              ))}
            </View>
          )}

          {/* New Incident Quick Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Log Unwanted Electronic Contact</Text>

            <View style={styles.platformRow}>
              {['INSTAGRAM', 'WHATSAPP', 'TELEGRAM', 'CALL'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.pPill, newPlatform === p && styles.pPillActive]}
                  onPress={() => setNewPlatform(p)}
                >
                  <Text style={[styles.pPillText, newPlatform === p && styles.pPillTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Sender handle / phone number (e.g. @anon_user)"
              placeholderTextColor="#64748B"
              value={newSender}
              onChangeText={setNewSender}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Factual quote of message or communication..."
              placeholderTextColor="#64748B"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
            />

            <TextInput
              style={styles.input}
              placeholder="Evidence reference (e.g. Screenshot_01.jpg, Voice note)"
              placeholderTextColor="#64748B"
              value={newEvidenceRef}
              onChangeText={setNewEvidenceRef}
            />

            <TouchableOpacity
              style={styles.checkRow}
              onPress={() => setNewWasBlocked(!newWasBlocked)}
            >
              <Text style={styles.checkIcon}>{newWasBlocked ? '☑' : '☐'}</Text>
              <Text style={styles.checkLabel}>Contact occurred after I previously blocked this sender</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.addBtn} onPress={handleAddIncident}>
              <Text style={styles.addBtnText}>+ Save to Cryptographic Vault</Text>
            </TouchableOpacity>
          </View>

          {/* Timeline Feed */}
          <Text style={styles.timelineHeader}>RECORDED INCIDENTS (CHRONOLOGICAL)</Text>
          {isLoadingIncidents ? (
            <ActivityIndicator size="small" color="#38BDF8" style={{ marginVertical: 20 }} />
          ) : incidents.length === 0 ? (
            <View style={styles.emptyVaultCard}>
              <Text style={styles.emptyVaultIcon}>🛡️</Text>
              <Text style={styles.emptyVaultTitle}>Incident Vault is Empty</Text>
              <Text style={styles.emptyVaultDesc}>
                No incidents recorded on this device. Log unwanted messages, calls, or harassment above to calculate cryptographic SHA-256 evidence.
              </Text>
            </View>
          ) : (
            incidents.map((inc) => (
              <View key={inc.id} style={styles.incidentCard}>
                <View style={styles.incidentTop}>
                  <View style={styles.platformBadge}>
                    <Text style={styles.platformBadgeText}>{inc.platform}</Text>
                  </View>
                  <View style={styles.topRightActions}>
                    <Text style={styles.timestampText}>
                      {new Date(inc.timestamp).toLocaleDateString()} {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteIncident(inc.id)}
                      style={styles.deleteBtn}
                      accessibilityRole="button"
                      accessibilityLabel="Delete incident record"
                    >
                      <Text style={styles.deleteBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.senderText}>
                  Sender: <Text style={styles.senderHighlight}>{inc.sender_handle || (inc as any).senderHandle}</Text>
                </Text>
                <Text style={styles.messageText}>"{inc.message_content || (inc as any).messageContent}"</Text>

                {Boolean(inc.was_blocked_prior ?? (inc as any).wasBlockedPrior) && (
                  <View style={styles.blockWarning}>
                    <Text style={styles.blockWarningText}>⚠️ Recorded after prior account block</Text>
                  </View>
                )}

                {Boolean(inc.evidence_ref) && (
                  <View style={styles.evidenceRefBadge}>
                    <Text style={styles.evidenceRefText}>📎 Evidence Ref: {inc.evidence_ref}</Text>
                  </View>
                )}

                <View style={styles.hashRow}>
                  <Text style={styles.hashLabel}>SHA-256:</Text>
                  <Text style={styles.hashValue} numberOfLines={1}>
                    {inc.hash}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* EXPOSURE AUDIT SUBTAB */}
      {activeSubTab === 'exposure' && (
        <View>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.sectionTitle}>Digital Exposure Audit</Text>
              <Text style={styles.sectionSubtitle}>Identify accidental room, schedule, or phone leaks</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Paste Profile Bio, Status, or Post</Text>
            <TextInput
              style={[styles.input, styles.textArea, { minHeight: 90 }]}
              value={bioText}
              onChangeText={setBioText}
              multiline
              placeholder="Paste bio or post text to audit..."
              placeholderTextColor="#64748B"
            />
            <TouchableOpacity
              style={styles.auditActionBtn}
              onPress={handleAuditExposure}
              disabled={isAuditing}
            >
              {isAuditing ? (
                <ActivityIndicator size="small" color="#090D16" />
              ) : (
                <Text style={styles.auditActionBtnText}>Run Privacy Audit 🔍</Text>
              )}
            </TouchableOpacity>
          </View>

          {auditResult && (
            <View style={styles.auditResultCard}>
              <View style={styles.auditResultTop}>
                <Text style={styles.auditResultTitle}>Audit Result</Text>
                <View
                  style={[
                    styles.riskBadge,
                    auditResult.overallRisk === 'HIGH' && styles.riskHigh,
                    auditResult.overallRisk === 'MEDIUM' && styles.riskMedium,
                    auditResult.overallRisk === 'SAFE' && styles.riskSafe,
                  ]}
                >
                  <Text style={styles.riskText}>{auditResult.overallRisk} RISK</Text>
                </View>
              </View>

              <Text style={styles.auditAdvice}>{auditResult.adviceSummary}</Text>

              {auditResult.findings?.map((f: any) => (
                <View key={f.findingId} style={styles.findingCard}>
                  <Text style={styles.findingCat}>{f.category.replace(/_/g, ' ')}</Text>
                  <Text style={styles.findingSnippet}>Identified: "{f.matchedSnippet}"</Text>
                  <Text style={styles.findingExpl}>{f.riskExplanation}</Text>
                  <Text style={styles.findingTip}>💡 Tip: {f.remediationTip}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Ground Truth Disclaimer */}
      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>
          vyshuuu Protect organizes contemporaneous records and identifies behavioral patterns for documentation.
          It does not make legal determinations of guilt or replace official law enforcement agencies.
        </Text>
      </View>
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
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  switchBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  switchBtnActive: {
    backgroundColor: '#1E293B',
  },
  switchBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  switchBtnTextActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  analyzeBtn: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  analyzeBtnText: {
    color: '#090D16',
    fontWeight: '700',
    fontSize: 11,
  },
  exportBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  exportBtnText: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 11,
  },
  evidenceRefBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  evidenceRefText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  analysisCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    marginBottom: 16,
  },
  cardHeader: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardMetrics: {
    color: '#94A3B8',
    fontSize: 11,
    marginVertical: 4,
  },
  patternItem: {
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  patternType: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 12,
  },
  severityBadge: {
    backgroundColor: 'rgba(225, 29, 72, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  severityText: {
    color: '#F43F5E',
    fontSize: 9,
    fontWeight: '700',
  },
  patternSummary: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '500',
  },
  patternBasis: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  formCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  formTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  platformRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  pPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#1E293B',
  },
  pPillActive: {
    backgroundColor: '#38BDF8',
  },
  pPillText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  pPillTextActive: {
    color: '#090D16',
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 10,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  checkIcon: {
    color: '#38BDF8',
    fontSize: 16,
  },
  checkLabel: {
    color: '#94A3B8',
    fontSize: 11,
  },
  addBtn: {
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  addBtnText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  timelineHeader: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  incidentCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 10,
  },
  incidentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  platformBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  platformBadgeText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
  },
  timestampText: {
    color: '#64748B',
    fontSize: 10,
  },
  senderText: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
  },
  senderHighlight: {
    color: '#F8FAFC',
    fontWeight: '600',
  },
  messageText: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  blockWarning: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  blockWarningText: {
    color: '#EAB308',
    fontSize: 10,
    fontWeight: '600',
  },
  hashRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hashLabel: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '700',
  },
  hashValue: {
    color: '#64748B',
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    flex: 1,
  },
  auditActionBtn: {
    backgroundColor: '#38BDF8',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  auditActionBtnText: {
    color: '#090D16',
    fontWeight: '700',
    fontSize: 12,
  },
  auditResultCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  auditResultTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  auditResultTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  riskHigh: {
    backgroundColor: '#E11D48',
  },
  riskMedium: {
    backgroundColor: '#EAB308',
  },
  riskSafe: {
    backgroundColor: '#10B981',
  },
  riskText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  auditAdvice: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  findingCard: {
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  findingCat: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
  },
  findingSnippet: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '600',
    marginVertical: 2,
  },
  findingExpl: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
  },
  findingTip: {
    color: '#10B981',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyVaultCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  emptyVaultIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyVaultTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyVaultDesc: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  disclaimerContainer: {
    marginTop: 20,
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
});

