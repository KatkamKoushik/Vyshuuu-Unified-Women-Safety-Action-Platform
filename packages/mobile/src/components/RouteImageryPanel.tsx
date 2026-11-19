import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Modal } from 'react-native';
import type { RouteImageryResult, PanoramaxImage } from '../services/imageryAdapter';
import { useTheme } from '../theme/ThemeContext';
import { AppIcon } from './common/AppIcon';

interface RouteImageryPanelProps {
  isLoading: boolean;
  result: RouteImageryResult | null;
  onClose: () => void;
}

export function RouteImageryPanel({ isLoading, result, onClose }: RouteImageryPanelProps) {
  const { theme } = useTheme();
  const [selectedImage, setSelectedImage] = useState<PanoramaxImage | null>(null);

  const panelTitle = result?.label || 'Panoramax Street Imagery';

  return (
    <View
      style={[
        styles.imageryPanel,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.imageryHeaderRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={[styles.imageryTitle, { color: theme.text }]}>{panelTitle}</Text>
          {result?.scope === 'route_corridor_sampled' && (
            <Text style={[styles.imagerySubtitle, { color: theme.primary }]}>
              Multi-point corridor sampling ({result.availableCount ?? 0}/{result.sampledCount ?? 0} waypoints with coverage)
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={onClose}
          accessibilityLabel="Close Photos Panel"
          style={styles.closeBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppIcon name="close" size={14} color={theme.textSecondary} />
          <Text style={[styles.imageryClose, { color: theme.textSecondary }]}>Close</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.imageryLoading}>
          <ActivityIndicator size="small" color={theme.primary} />
          <Text style={[styles.imageryLoadingText, { color: theme.textSecondary }]}>
            Searching open street imagery...
          </Text>
        </View>
      ) : result && result.hasImagery && result.images.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
          {result.images.map((img) => (
            <TouchableOpacity
              key={img.id}
              style={[
                styles.imageCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => setSelectedImage(img)}
              accessibilityLabel={`View full photo captured on ${img.captureDate || 'historical'}`}
            >
              {img.thumbUrl ? (
                <Image source={{ uri: img.thumbUrl }} style={styles.imageThumb} resizeMode="cover" />
              ) : (
                <View style={[styles.imagePlaceholder, { backgroundColor: theme.surfaceHover }]}>
                  <Text style={[styles.imagePlaceholderText, { color: theme.textMuted }]}>No preview</Text>
                </View>
              )}
              <View style={styles.imageMeta}>
                <Text style={[styles.imageDate, { color: theme.textSecondary }]}>
                  {img.captureDate ? new Date(img.captureDate).toLocaleDateString() : 'Historical'}
                </Text>
                <Text style={[styles.imagePanoType, { color: theme.primary }]}>
                  {img.is360Panorama ? '360°' : 'Flat'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.noImageryBox}>
          <Text style={[styles.noImageryText, { color: theme.textSecondary }]}>
            No street-level imagery currently available near this point on Panoramax.
          </Text>
          <Text style={[styles.noImageryNote, { color: theme.textMuted }]}>
            Route planning remains fully usable without imagery.
          </Text>
        </View>
      )}

      <Text style={[styles.imageryAttribution, { color: theme.textMuted }]}>
        Photos © Panoramax contributors (CC-BY-SA 4.0) • Tap image to inspect
      </Text>

      {/* Full Photo Inspection Modal */}
      {selectedImage && (
        <Modal visible animationType="fade" transparent onRequestClose={() => setSelectedImage(null)}>
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {selectedImage.is360Panorama ? '360° Panorama' : 'Street Photo'} (
                  {selectedImage.captureDate ? new Date(selectedImage.captureDate).toLocaleDateString() : 'Historical'}
                  )
                </Text>
                <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.modalCloseBtn}>
                  <AppIcon name="close" size={18} color={theme.text} />
                </TouchableOpacity>
              </View>
              <Image
                source={{ uri: selectedImage.fullUrl || selectedImage.thumbUrl || undefined }}
                style={styles.fullImage}
                resizeMode="contain"
              />
              <View style={[styles.modalFooter, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
                <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
                  Position: {selectedImage.latitude.toFixed(5)}, {selectedImage.longitude.toFixed(5)}
                  {selectedImage.headingDeg != null ? ` • Heading: ${Math.round(selectedImage.headingDeg)}°` : ''}
                </Text>
                <Text style={[styles.modalSub, { color: theme.textMuted }]}>
                  Source: Panoramax Open Imagery (CC-BY-SA 4.0)
                </Text>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  imageryPanel: {
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
  },
  imageryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  imageryTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  imagerySubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  imageryClose: {
    fontSize: 12,
    fontWeight: '600',
  },
  imageryLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  imageryLoadingText: {
    fontSize: 12,
    marginLeft: 8,
  },
  imageScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  imageCard: {
    width: 120,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  imageThumb: {
    width: 120,
    height: 75,
  },
  imagePlaceholder: {
    width: 120,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 10,
  },
  imageMeta: {
    padding: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageDate: {
    fontSize: 9,
  },
  imagePanoType: {
    fontSize: 9,
    fontWeight: '700',
  },
  noImageryBox: {
    paddingVertical: 8,
  },
  noImageryText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  noImageryNote: {
    fontSize: 11,
    marginTop: 2,
  },
  imageryAttribution: {
    fontSize: 10,
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontWeight: '700',
    fontSize: 14,
  },
  modalCloseBtn: {
    padding: 4,
  },
  fullImage: {
    width: '100%',
    height: 320,
    backgroundColor: '#020617',
  },
  modalFooter: {
    padding: 12,
    borderTopWidth: 1,
  },
  modalSub: {
    fontSize: 11,
    marginTop: 2,
  },
});
