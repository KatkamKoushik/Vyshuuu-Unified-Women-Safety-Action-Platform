import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import type { LocationPoint } from '../services/geocodingService';
import { getRecentSearches, RecentSearch, getSavedJourneys, SavedJourney } from '../services/storageService';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { AppIcon } from './common/AppIcon';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  searchTarget: 'origin' | 'destination';
  setSearchTarget: (target: 'origin' | 'destination') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: LocationPoint[];
  onSelectResult: (item: LocationPoint) => void;
  onUseGps: () => void;
  onSelectPreset: (origin: LocationPoint, destination: LocationPoint) => void;
  origin: LocationPoint | null;
  destination: LocationPoint | null;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  searchTarget,
  setSearchTarget,
  searchQuery,
  setSearchQuery,
  searchResults,
  onSelectResult,
  onUseGps,
  onSelectPreset,
  origin,
  destination,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [recentList, setRecentList] = useState<RecentSearch[]>([]);
  const [savedList, setSavedList] = useState<SavedJourney[]>([]);

  useEffect(() => {
    if (visible) {
      getRecentSearches(6)
        .then((items) => setRecentList(items || []))
        .catch(() => {});
      getSavedJourneys()
        .then((items) => setSavedList(items || []))
        .catch(() => {});
    }
  }, [visible]);

  const PRESET_ROUTES = [
    {
      title: 'Hyderabad: Charminar to Madina Junction',
      subtitle: 'Old City cultural & high-density pedestrian corridor',
      origin: {
        title: 'Charminar',
        latitude: 17.3616,
        longitude: 78.4747,
      },
      destination: {
        title: 'Madina Junction',
        latitude: 17.3688,
        longitude: 78.4735,
      },
    },
    {
      title: 'Hyderabad: Hitec City to Cyber Towers',
      subtitle: 'IT corridor with dedicated skywalks and metro connectivity',
      origin: {
        title: 'Hitec City Metro',
        latitude: 17.4483,
        longitude: 78.3762,
      },
      destination: {
        title: 'Cyber Towers',
        latitude: 17.4504,
        longitude: 78.3815,
      },
    },
    {
      title: 'Bengaluru: MG Road to Brigade Road',
      subtitle: 'Mapped OSM sidewalk & commercial amenities',
      origin: {
        title: 'MG Road Metro',
        latitude: 12.9756,
        longitude: 77.6066,
      },
      destination: {
        title: 'Brigade Road Junction',
        latitude: 12.9738,
        longitude: 77.6080,
      },
    },
    {
      title: 'Delhi: Rajiv Chowk to India Gate',
      subtitle: 'Central vista pedestrian avenue',
      origin: {
        title: 'Rajiv Chowk Metro',
        latitude: 28.6328,
        longitude: 77.2195,
      },
      destination: {
        title: 'India Gate',
        latitude: 28.6129,
        longitude: 77.2295,
      },
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />

        {/* Header & Close Affordance */}
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Choose Route Points</Text>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close search dialog"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={[styles.closeBtnText, { color: theme.primary }]}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Target Segmented Switcher (Origin vs Destination) */}
        <View style={[styles.segmentedContainer, { backgroundColor: theme.surface }]}>
          <TouchableOpacity
            style={[
              styles.segmentItem,
              searchTarget === 'origin' && [
                styles.segmentItemActive,
                { backgroundColor: theme.card, borderColor: theme.primary },
              ],
            ]}
            onPress={() => setSearchTarget('origin')}
            accessibilityRole="button"
            accessibilityLabel="Set start origin location"
          >
            <Text
              style={[
                styles.segmentText,
                { color: theme.textSecondary },
                searchTarget === 'origin' && [styles.segmentTextActive, { color: theme.text }],
              ]}
              numberOfLines={1}
            >
              Start: {origin ? origin.title : 'Select'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentItem,
              searchTarget === 'destination' && [
                styles.segmentItemActive,
                { backgroundColor: theme.card, borderColor: theme.primary },
              ],
            ]}
            onPress={() => setSearchTarget('destination')}
            accessibilityRole="button"
            accessibilityLabel="Set walk destination location"
          >
            <Text
              style={[
                styles.segmentText,
                { color: theme.textSecondary },
                searchTarget === 'destination' && [styles.segmentTextActive, { color: theme.text }],
              ]}
              numberOfLines={1}
            >
              End: {destination ? destination.title : 'Select'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar Input */}
        <View style={styles.searchBarRow}>
          <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TextInput
              style={[styles.textInput, { color: theme.text }]}
              placeholder={`Search ${searchTarget === 'origin' ? 'start' : 'destination'} address or place...`}
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              clearButtonMode="while-editing"
              accessibilityLabel="Address search input"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearBtn}
                accessibilityLabel="Clear search query"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <AppIcon name="close" size={14} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Nearby Walking Essentials Pills */}
        <View style={styles.essentialsRow}>
          <TouchableOpacity
            style={[styles.essentialPill, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => setSearchQuery('park')}
          >
            <Text style={[styles.essentialPillText, { color: theme.primary }]}>Near Park</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.essentialPill, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => setSearchQuery('pharmacy')}
          >
            <Text style={[styles.essentialPillText, { color: theme.primary }]}>Near Pharmacy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.essentialPill, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => setSearchQuery('metro')}
          >
            <Text style={[styles.essentialPillText, { color: theme.primary }]}>Near Transit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.essentialPill, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => setSearchQuery('police')}
          >
            <Text style={[styles.essentialPillText, { color: theme.primary }]}>Near Police</Text>
          </TouchableOpacity>
        </View>

        {/* GPS Current Location Action Button */}
        {searchTarget === 'origin' && (
          <TouchableOpacity
            style={[styles.gpsRow, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => {
              onUseGps();
              onClose();
            }}
            accessibilityRole="button"
            accessibilityLabel="Use current GPS location"
          >
            <View style={[styles.gpsIconCircle, { backgroundColor: theme.primary }]}>
              <Text style={styles.gpsIcon}>GPS</Text>
            </View>
            <View style={styles.gpsTextGroup}>
              <Text style={[styles.gpsTitle, { color: theme.text }]}>Use Current Location</Text>
              <Text style={[styles.gpsSubtitle, { color: theme.textMuted }]}>High-accuracy on-device GPS</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Search Results List */}
        {searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => `${item.latitude}_${item.longitude}_${item.title}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.resultItem, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => {
                  onSelectResult(item);
                  if (searchTarget === 'origin') {
                    setSearchTarget('destination');
                  } else {
                    onClose();
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel={`Select ${item.title}`}
              >
                <View style={styles.resultTextWrapper}>
                  <Text style={[styles.resultTitle, { color: theme.text }]}>{item.title}</Text>
                  {item.subtitle ? (
                    <Text style={[styles.resultSubtitle, { color: theme.textMuted }]} numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          /* Empty Query: Prioritize Recent & Saved Places, followed by Example Corridors */
          <ScrollView style={styles.presetsWrapper} showsVerticalScrollIndicator={false}>
            {recentList.length > 0 && (
              <View style={styles.recentSection}>
                <Text style={styles.sectionHeading}>Recent Searches</Text>
                {recentList.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={styles.recentItem}
                    onPress={() => {
                      onSelectResult({
                        title: r.display_name,
                        subtitle: `Recent search (${r.query})`,
                        latitude: r.lat,
                        longitude: r.lon,
                      });
                      if (searchTarget === 'origin') {
                        setSearchTarget('destination');
                      } else {
                        onClose();
                      }
                    }}
                  >
                    <Text style={[styles.recentTag, { color: theme.primary }]}>[REC]</Text>
                    <View style={styles.recentTextWrap}>
                      <Text style={[styles.recentTitle, { color: theme.text }]}>{r.display_name}</Text>
                      <Text style={[styles.recentSubtitle, { color: theme.textMuted }]}>Query: {r.query}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {savedList.length > 0 && (
              <View style={styles.savedSection}>
                <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>Saved Corridors (Vault)</Text>
                {savedList.slice(0, 3).map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.savedItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => {
                      onSelectPreset(
                        { title: s.origin_name, latitude: s.origin_lat, longitude: s.origin_lon },
                        { title: s.dest_name, latitude: s.dest_lat, longitude: s.dest_lon }
                      );
                      onClose();
                    }}
                  >
                    <Text style={[styles.savedTag, { color: theme.primary }]}>[SAVED]</Text>
                    <View style={styles.savedTextWrap}>
                      <Text style={[styles.savedTitle, { color: theme.text }]}>{s.title}</Text>
                      <Text style={[styles.savedSubtitle, { color: theme.textMuted }]}>
                        {(s.distance_m / 1000).toFixed(1)} km • {Math.ceil(s.duration_s / 60)} min walk
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.sectionHeading}>Explore Example Corridors</Text>
            {PRESET_ROUTES.map((p, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.presetCard}
                onPress={() => {
                  onSelectPreset(p.origin, p.destination);
                  onClose();
                }}
                accessibilityRole="button"
                accessibilityLabel={`Select preset corridor ${p.title}`}
              >
                <View style={styles.presetHeaderRow}>
                  <Text style={styles.presetTitle}>{p.title}</Text>
                  <Text style={styles.presetBadge}>Mapped Corridor</Text>
                </View>
                <Text style={styles.presetSubtitle}>{p.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
    paddingTop: Platform.OS === 'ios' ? 54 : 32,
    paddingHorizontal: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  closeBtnText: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '600',
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#131C2E',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
    gap: 6,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  segmentItemActive: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  segmentText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  searchBarRow: {
    marginBottom: 8,
  },
  essentialsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  essentialPill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  essentialPillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    minHeight: 48,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 15,
    minHeight: 44,
  },
  clearBtn: {
    padding: 6,
    minHeight: 32,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    minHeight: 52,
  },
  gpsIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  gpsIcon: {
    fontSize: 16,
  },
  gpsTextGroup: {
    flex: 1,
  },
  gpsTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  gpsSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131C2E',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    minHeight: 52,
  },
  resultIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  resultTextWrapper: {
    flex: 1,
  },
  resultTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  resultSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  presetsWrapper: {
    marginTop: 8,
  },
  recentSection: {
    marginBottom: 16,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  recentTag: {
    fontSize: 10,
    fontWeight: '800',
    marginRight: 10,
    letterSpacing: 0.5,
  },
  recentIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  recentTextWrap: {
    flex: 1,
  },
  recentTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  recentSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 1,
  },
  savedSection: {
    marginBottom: 16,
  },
  savedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.25)',
  },
  savedTag: {
    fontSize: 10,
    fontWeight: '800',
    marginRight: 10,
    letterSpacing: 0.5,
  },
  savedIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  savedTextWrap: {
    flex: 1,
  },
  savedTitle: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
  },
  savedSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 1,
  },
  sectionHeading: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingLeft: 4,
  },
  presetCard: {
    backgroundColor: '#131C2E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  presetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  presetTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  presetBadge: {
    color: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  presetSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
  },
});
