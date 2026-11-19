import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  SavedJourney,
  getSavedJourneys,
  toggleFavoriteJourney,
  deleteJourney,
} from '../services/storageService';
import { useTheme } from '../theme/ThemeContext';
import { AppIcon } from './common/AppIcon';

interface SavedJourneysModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectJourney: (journey: SavedJourney) => void;
}

export const SavedJourneysModal: React.FC<SavedJourneysModalProps> = ({
  visible,
  onClose,
  onSelectJourney,
}) => {
  const { theme } = useTheme();
  const [journeys, setJourneys] = useState<SavedJourney[]>([]);
  const [loading, setLoading] = useState(false);

  const loadJourneys = async () => {
    setLoading(true);
    try {
      const data = await getSavedJourneys();
      setJourneys(data);
    } catch (err: any) {
      console.warn('Failed to load journeys from SQLite:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadJourneys();
    }
  }, [visible]);

  const handleToggleFavorite = async (id: string) => {
    try {
      await toggleFavoriteJourney(id);
      await loadJourneys();
    } catch (err: any) {
      Alert.alert('Error', 'Failed to update favorite status.');
    }
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete Journey', `Remove "${title}" from saved journeys?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteJourney(id);
            await loadJourneys();
          } catch (err: any) {
            Alert.alert('Error', 'Failed to delete journey.');
          }
        },
      },
    ]);
  };

  const formatDistance = (m: number) => {
    if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
    return `${Math.round(m)} m`;
  };

  const formatDuration = (s: number) => {
    const mins = Math.ceil(s / 60);
    return `${mins} min`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <AppIcon name="star" size={20} color={theme.warning} />
            <Text style={[styles.headerTitle, { color: theme.text }]}>Saved Journeys</Text>
          </View>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={onClose}
          >
            <Text style={[styles.closeText, { color: theme.textSecondary }]}>Close</Text>
          </TouchableOpacity>
        </View>

        {journeys.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AppIcon name="nav" size={40} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No saved journeys yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              When you view a walking route, tap the "Save" button to keep it stored locally in SQLite.
            </Text>
          </View>
        ) : (
          <FlatList
            data={journeys}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <TouchableOpacity
                  style={styles.cardMain}
                  onPress={() => {
                    onSelectJourney(item);
                    onClose();
                  }}
                >
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={[styles.scoreBadge, { backgroundColor: theme.primaryLight }]}>
                      <Text style={[styles.scoreText, { color: theme.primary }]}>{item.context_score}% Context</Text>
                    </View>
                  </View>

                  <Text style={[styles.cardLocations, { color: theme.textSecondary }]} numberOfLines={1}>
                    {item.origin_name} → {item.dest_name}
                  </Text>

                  <View style={styles.cardMetrics}>
                    <Text style={[styles.metricText, { color: theme.textMuted }]}>
                      {formatDistance(item.distance_m)} • {formatDuration(item.duration_s)}
                    </Text>
                    <Text style={[styles.dateText, { color: theme.textMuted }]}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Actions */}
                <View style={styles.actionColumn}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.surface }]}
                    onPress={() => handleToggleFavorite(item.id)}
                    accessibilityLabel="Toggle Favorite"
                  >
                    <AppIcon
                      name="star"
                      size={16}
                      color={item.is_favorite === 1 ? theme.warning : theme.textMuted}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.dangerLight }]}
                    onPress={() => handleDelete(item.id, item.title)}
                    accessibilityLabel="Delete Journey"
                  >
                    <AppIcon name="trash" size={16} color={theme.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  closeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  cardMain: {
    flex: 1,
    marginRight: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  scoreBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  scoreText: {
    fontSize: 10,
    fontWeight: '800',
  },
  cardLocations: {
    fontSize: 12,
    marginBottom: 8,
  },
  cardMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricText: {
    fontSize: 11,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 11,
  },
  actionColumn: {
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
