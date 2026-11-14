import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import {
  getSavedJourneys,
  toggleFavoriteJourney,
  deleteJourney,
  getSavedIncidents,
  deleteIncident,
  getSavedGrievances,
  deleteGrievance,
  hardWipeAllData,
  SavedJourney,
  SavedIncident,
  SavedGrievance,
} from '../services/storageService';

interface SavedJourneysScreenProps {
  onSelectJourney: (saved: SavedJourney) => void;
  onOpenPrivacySettings: () => void;
}

export const SavedJourneysScreen: React.FC<SavedJourneysScreenProps> = ({
  onSelectJourney,
  onOpenPrivacySettings,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'corridors' | 'vault'>('corridors');
  const [journeys, setJourneys] = useState<SavedJourney[]>([]);
  const [incidents, setIncidents] = useState<SavedIncident[]>([]);
  const [grievances, setGrievances] = useState<SavedGrievance[]>([]);
  const [, setLoading] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [jList, iList, gList] = await Promise.all([
        getSavedJourneys(),
        getSavedIncidents(),
        getSavedGrievances(),
      ]);
      setJourneys(jList);
      setIncidents(iList);
      setGrievances(gList);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleToggleFav = async (id: string) => {
    await toggleFavoriteJourney(id);
    await loadAllData();
  };

  const handleDeleteJourney = async (id: string) => {
    Alert.alert('Delete Corridor', 'Are you sure you want to remove this saved corridor?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteJourney(id);
          await loadAllData();
        },
      },
    ]);
  };

  const handleDeleteIncident = async (id: string) => {
    Alert.alert('Delete Incident', 'Remove this record from local vault?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteIncident(id);
          await loadAllData();
        },
      },
    ]);
  };

  const handleDeleteGrievance = async (id: string) => {
    Alert.alert('Delete Grievance', 'Remove this formal grievance from local vault?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteGrievance(id);
          await loadAllData();
        },
      },
    ]);
  };

  const handleClearAllData = () => {
    Alert.alert(
      '1-Tap Hard Wipe (Panic Wipe)',
      'This will permanently erase all saved corridors, search history, incident evidence logs, and statutory grievances from your local SQLite database.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Permanently Wipe Everything',
          style: 'destructive',
          onPress: async () => {
            await hardWipeAllData();
            await loadAllData();
            Alert.alert('Database Cleared', 'All local data has been purged with zero residual traces.');
          },
        },
      ]
    );
  };

  const formatDistance = (m: number) => {
    if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
    return `${Math.round(m)} m`;
  };

  const formatDuration = (s: number) => {
    const min = Math.ceil(s / 60);
    return `${min} min`;
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Local Vault & Privacy</Text>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={loadAllData}
          accessibilityLabel="Refresh local database list"
        >
          <Text style={styles.refreshBtnText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Segmented Sub Tab Switcher */}
      <View style={styles.subTabRow}>
        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'corridors' && styles.subTabBtnActive]}
          onPress={() => setActiveSubTab('corridors')}
        >
          <Text style={[styles.subTabText, activeSubTab === 'corridors' && styles.subTabTextActive]}>
            Saved Corridors ({journeys.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'vault' && styles.subTabBtnActive]}
          onPress={() => setActiveSubTab('vault')}
        >
          <Text style={[styles.subTabText, activeSubTab === 'vault' && styles.subTabTextActive]}>
            Evidence & Cases ({incidents.length + grievances.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* On-Device Local Storage Guarantee Banner */}
        <View style={styles.privacyCard}>
          <View style={styles.privacyIconCircle}>
            <Text style={styles.privacyIcon}>🛡️</Text>
          </View>
          <View style={styles.privacyTextCol}>
            <Text style={styles.privacyTitle}>Zero-Telemetry On-Device Storage</Text>
            <Text style={styles.privacyDesc}>
              All saved corridors, incident evidence logs, and statutory petitions are stored exclusively on this device.
            </Text>
          </View>
        </View>

        {/* CORRIDORS SUBTAB */}
        {activeSubTab === 'corridors' && (
          <View>
            {journeys.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🗺️</Text>
                <Text style={styles.emptyTitle}>No Saved Routes Yet</Text>
                <Text style={styles.emptyDesc}>
                  When you plan a walking route, tap "Save Corridor" to save it offline here.
                </Text>
              </View>
            ) : (
              journeys.map((item) => (
                <View key={item.id} style={styles.journeyCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.titleCol}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardTimestamp}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.actionIconsRow}>
                      <TouchableOpacity
                        onPress={() => handleToggleFav(item.id)}
                        style={styles.iconBtn}
                      >
                        <Text style={styles.actionIcon}>{item.is_favorite === 1 ? '⭐' : '☆'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteJourney(item.id)}
                        style={styles.iconBtn}
                      >
                        <Text style={styles.actionIcon}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.metricsRow}>
                    <Text style={styles.metricItem}>📏 {formatDistance(item.distance_m)}</Text>
                    <Text style={styles.metricItem}>⏱️ {formatDuration(item.duration_s)}</Text>
                    <Text style={styles.metricItem}>✨ {item.context_score}% Coverage</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.loadRouteBtn}
                    onPress={() => onSelectJourney(item)}
                  >
                    <Text style={styles.loadRouteBtnText}>View Corridor on Map ➔</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* EVIDENCE & CASES SUBTAB */}
        {activeSubTab === 'vault' && (
          <View>
            {/* Incident Records */}
            <Text style={styles.sectionHeader}>INCIDENT EVIDENCE RECORDS ({incidents.length})</Text>
            {incidents.length === 0 ? (
              <View style={styles.miniEmpty}>
                <Text style={styles.miniEmptyText}>No incidents logged in local vault.</Text>
              </View>
            ) : (
              incidents.map((inc) => (
                <View key={inc.id} style={styles.vaultItemCard}>
                  <View style={styles.vaultTop}>
                    <View style={styles.platformBadge}>
                      <Text style={styles.platformBadgeText}>{inc.platform}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteIncident(inc.id)}>
                      <Text style={styles.deleteMini}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.vaultSender}>Sender: {inc.sender_handle}</Text>
                  <Text style={styles.vaultQuote}>"{inc.message_content}"</Text>
                  <Text style={styles.vaultHash} numberOfLines={1}>SHA-256: {inc.hash}</Text>
                </View>
              ))
            )}

            {/* Statutory Grievance Cases */}
            <Text style={[styles.sectionHeader, { marginTop: 16 }]}>STATUTORY GRIEVANCE PETITIONS ({grievances.length})</Text>
            {grievances.length === 0 ? (
              <View style={styles.miniEmpty}>
                <Text style={styles.miniEmptyText}>No grievances saved in local vault.</Text>
              </View>
            ) : (
              grievances.map((g) => (
                <View key={g.id} style={styles.vaultItemCard}>
                  <View style={styles.vaultTop}>
                    <View style={styles.authBadge}>
                      <Text style={styles.authBadgeText}>{g.authority_code}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteGrievance(g.id)}>
                      <Text style={styles.deleteMini}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.vaultTitle}>{g.title}</Text>
                  <Text style={styles.vaultInstitution}>{g.institution_name} • {g.hostel_location}</Text>
                  <Text style={styles.vaultStatus}>Status: {g.status}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* 1-Tap Hard Wipe & Privacy Controls */}
        <View style={styles.dangerZoneCard}>
          <Text style={styles.dangerTitle}>Emergency Panic Wipe</Text>
          <Text style={styles.dangerSubtitle}>
            Permanently purges all saved corridors, search logs, incident records, and statutory grievances with SQLite VACUUM.
          </Text>

          <View style={styles.dangerActionsRow}>
            <TouchableOpacity
              style={styles.settingsSheetBtn}
              onPress={onOpenPrivacySettings}
            >
              <Text style={styles.settingsSheetBtnText}>⚙️ Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.hardWipeBtn}
              onPress={handleClearAllData}
            >
              <Text style={styles.hardWipeBtnText}>🚨 1-Tap Hard Wipe</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
  },
  refreshBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshBtnText: {
    fontSize: 18,
  },
  subTabRow: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 10,
    padding: 3,
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  subTabBtnActive: {
    backgroundColor: '#1E293B',
  },
  subTabText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  subTabTextActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  privacyCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    alignItems: 'center',
    gap: 12,
  },
  privacyIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  privacyIcon: {
    fontSize: 18,
  },
  privacyTextCol: {
    flex: 1,
  },
  privacyTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  privacyDesc: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyDesc: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
  },
  journeyCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleCol: {
    flex: 1,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  cardTimestamp: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  actionIconsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    padding: 4,
  },
  actionIcon: {
    fontSize: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 10,
  },
  metricItem: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '500',
  },
  loadRouteBtn: {
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  loadRouteBtnText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  miniEmpty: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 8,
  },
  miniEmptyText: {
    color: '#64748B',
    fontSize: 11,
    fontStyle: 'italic',
  },
  vaultItemCard: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 8,
  },
  vaultTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  platformBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  platformBadgeText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '700',
  },
  authBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  authBadgeText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '700',
  },
  deleteMini: {
    fontSize: 14,
  },
  vaultSender: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '600',
  },
  vaultQuote: {
    color: '#CBD5E1',
    fontSize: 11,
    fontStyle: 'italic',
    marginVertical: 4,
  },
  vaultHash: {
    color: '#64748B',
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  vaultTitle: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  vaultInstitution: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  vaultStatus: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  dangerZoneCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.3)',
    marginTop: 8,
  },
  dangerTitle: {
    color: '#F43F5E',
    fontSize: 14,
    fontWeight: '700',
  },
  dangerSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
    marginVertical: 6,
  },
  dangerActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  settingsSheetBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  settingsSheetBtnText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 12,
  },
  hardWipeBtn: {
    flex: 1,
    backgroundColor: '#E11D48',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  hardWipeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
