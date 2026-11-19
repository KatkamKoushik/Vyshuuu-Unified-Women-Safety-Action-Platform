import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { BENCHMARK_POINTS, LocationPoint } from '../services/geocodingService';
import { useTheme } from '../theme/ThemeContext';
import { AppIcon } from './common/AppIcon';

interface RoutePointsCardProps {
  origin: LocationPoint | null;
  destination: LocationPoint | null;
  searchTarget: 'origin' | 'destination';
  setSearchTarget: (target: 'origin' | 'destination') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: LocationPoint[];
  onSelectSearchResult: (point: LocationPoint) => void;
  onUseGps: () => void;
  onSelectPreset: (origin: LocationPoint, dest: LocationPoint) => void;
  onTestTimeout: () => void;
  onTestRateLimit: () => void;
}

export function RoutePointsCard({
  origin,
  destination,
  searchTarget,
  setSearchTarget,
  searchQuery,
  setSearchQuery,
  searchResults,
  onSelectSearchResult,
  onUseGps,
  onSelectPreset,
  onTestTimeout,
  onTestRateLimit,
}: RoutePointsCardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.pointsCard,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
    >
      {/* Origin Row */}
      <TouchableOpacity
        style={[
          styles.pointRow,
          { backgroundColor: theme.surface },
          searchTarget === 'origin' && { borderColor: theme.primary, borderWidth: 1 },
        ]}
        onPress={() => {
          setSearchTarget('origin');
          setSearchQuery('');
        }}
      >
        <View style={[styles.pointDot, { backgroundColor: theme.success }]} />
        <Text style={[styles.pointLabel, { color: theme.textSecondary }]}>From:</Text>
        <Text style={[styles.pointValue, { color: theme.text }]} numberOfLines={1}>
          {origin?.title || 'Tap to select origin'}
        </Text>
        <TouchableOpacity
          style={[styles.gpsButton, { backgroundColor: theme.isDark ? theme.border : theme.surfaceHover }]}
          onPress={onUseGps}
        >
          <AppIcon name="target" size={12} color={theme.primary} />
          <Text style={[styles.gpsButtonText, { color: theme.primary }]}>GPS</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Destination Row */}
      <TouchableOpacity
        style={[
          styles.pointRow,
          { backgroundColor: theme.surface },
          searchTarget === 'destination' && { borderColor: theme.primary, borderWidth: 1 },
        ]}
        onPress={() => {
          setSearchTarget('destination');
          setSearchQuery('');
        }}
      >
        <View style={[styles.pointDot, { backgroundColor: theme.danger }]} />
        <Text style={[styles.pointLabel, { color: theme.textSecondary }]}>To:</Text>
        <Text style={[styles.pointValue, { color: theme.text }]} numberOfLines={1}>
          {destination?.title || 'Tap to select destination'}
        </Text>
      </TouchableOpacity>

      {/* Universal Search Box */}
      <View style={styles.searchRow}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.surface,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          placeholder={`Search ${searchTarget === 'origin' ? 'origin' : 'destination'} or landmark...`}
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Quick Benchmark Presets */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsBar}>
        <TouchableOpacity
          style={[styles.presetChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => onSelectPreset(BENCHMARK_POINTS[0], BENCHMARK_POINTS[1])}
        >
          <Text style={[styles.presetChipText, { color: theme.text }]}>Hyderabad: Charminar → Madina</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.presetChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => onSelectPreset(BENCHMARK_POINTS[2], BENCHMARK_POINTS[3])}
        >
          <Text style={[styles.presetChipText, { color: theme.text }]}>Hyderabad: Hitec City → Cyber Towers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.presetChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => onSelectPreset(BENCHMARK_POINTS[4], BENCHMARK_POINTS[5])}
        >
          <Text style={[styles.presetChipText, { color: theme.text }]}>Bengaluru: MG Rd → Brigade Rd</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.presetChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => onSelectPreset(BENCHMARK_POINTS[8], BENCHMARK_POINTS[9])}
        >
          <Text style={[styles.presetChipText, { color: theme.text }]}>Delhi: Rajiv Chowk → India Gate</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.presetChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => onSelectPreset(BENCHMARK_POINTS[10], BENCHMARK_POINTS[11])}
        >
          <Text style={[styles.presetChipText, { color: theme.text }]}>Mumbai: Bandra Stand → Carter Rd</Text>
        </TouchableOpacity>

        {__DEV__ && (
          <>
            <TouchableOpacity
              style={[styles.presetChip, { backgroundColor: theme.warningLight, borderColor: theme.warning }]}
              onPress={() =>
                onSelectPreset(
                  { title: 'Null Island', subtitle: 'Ocean', latitude: 0.0, longitude: 0.0 },
                  { title: 'London', subtitle: 'UK', latitude: 51.508, longitude: -0.1281 }
                )
              }
            >
              <Text style={[styles.presetChipText, { color: theme.warning }]}>[TEST] Zero Route</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.presetChip, { backgroundColor: theme.warningLight, borderColor: theme.warning }]}
              onPress={onTestTimeout}
            >
              <Text style={[styles.presetChipText, { color: theme.warning }]}>[TEST] Timeout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.presetChip, { backgroundColor: theme.warningLight, borderColor: theme.warning }]}
              onPress={onTestRateLimit}
            >
              <Text style={[styles.presetChipText, { color: theme.warning }]}>[TEST] Rate Limit</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Autocomplete Suggestions */}
      {searchResults.length > 0 && (
        <View
          style={[
            styles.suggestionsContainer,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {searchResults.map((item: LocationPoint, idx: number) => (
            <TouchableOpacity
              key={`${item.title}-${idx}`}
              style={[styles.suggestionItem, { borderBottomColor: theme.borderLight }]}
              onPress={() => onSelectSearchResult(item)}
            >
              <Text style={[styles.suggestionTitle, { color: theme.text }]}>{item.title}</Text>
              {item.subtitle && (
                <Text style={[styles.suggestionSub, { color: theme.textMuted }]} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pointsCard: {
    padding: 12,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  pointDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  pointLabel: {
    fontSize: 13,
    fontWeight: '600',
    width: 44,
  },
  pointValue: {
    fontSize: 13,
    flex: 1,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  gpsButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },
  searchRow: {
    marginTop: 6,
  },
  searchInput: {
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  presetsBar: {
    marginTop: 8,
    flexDirection: 'row',
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  suggestionsContainer: {
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 140,
    borderWidth: 1,
  },
  suggestionItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  suggestionTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  suggestionSub: {
    fontSize: 11,
  },
});
