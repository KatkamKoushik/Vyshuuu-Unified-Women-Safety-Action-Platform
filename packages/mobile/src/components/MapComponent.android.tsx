/**
 * @file MapComponent.android.tsx
 * @description Hardware-accelerated native Android vector map using @maplibre/maplibre-react-native 11.5.0.
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import {
  Map,
  Camera,
  GeoJSONSource,
  Layer,
  Marker,
  CameraRef,
} from '@maplibre/maplibre-react-native';
import { RoutingCoord } from '../services/routingAdapter';
import { AppIcon } from './common/AppIcon';

// High-resolution OpenStreetMap standard raster tiles (keyless, official OpenStreetMap)
export const DEFAULT_MAP_STYLE = JSON.stringify({
  version: 8,
  sources: {
    'osm-standard': {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-standard-layer',
      type: 'raster',
      source: 'osm-standard',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
});

export interface MapRouteItem {
  id: string;
  coordinates: [number, number][]; // [lon, lat]
  isSelected: boolean;
}

export interface MapAmenityItem {
  id: string;
  name: string;
  category: 'transit' | 'emergency' | 'services' | 'lighting' | 'other' | string;
  coordinates: [number, number]; // [lon, lat]
}

export interface MapPhotoItem {
  id: string;
  latitude: number;
  longitude: number;
  headingDeg?: number | null;
}

export interface MapComponentProps {
  origin: RoutingCoord | null;
  destination: RoutingCoord | null;
  routes: MapRouteItem[];
  amenities?: MapAmenityItem[];
  streetPhotos?: MapPhotoItem[];
  userLocation?: { latitude: number; longitude: number } | null;
  onSelectRoute?: (id: string) => void;
  onSelectAmenity?: (amenity: MapAmenityItem) => void;
  onSelectPhoto?: (photo: MapPhotoItem) => void;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  origin,
  destination,
  routes,
  amenities,
  streetPhotos,
  userLocation,
  onSelectRoute,
  onSelectAmenity,
  onSelectPhoto,
}) => {
  const cameraRef = useRef<CameraRef>(null);

  // Automatically center and fit camera to origin & destination
  useEffect(() => {
    if (!cameraRef.current) return;
    if (origin && destination) {
      const minLon = Math.min(origin.longitude, destination.longitude);
      const maxLon = Math.max(origin.longitude, destination.longitude);
      const minLat = Math.min(origin.latitude, destination.latitude);
      const maxLat = Math.max(origin.latitude, destination.latitude);

      const deltaLon = Math.max(maxLon - minLon, 0.006);
      const deltaLat = Math.max(maxLat - minLat, 0.006);

      cameraRef.current.fitBounds(
        [minLon - deltaLon * 0.25, minLat - deltaLat * 0.25, maxLon + deltaLon * 0.25, maxLat + deltaLat * 0.25],
        { padding: { top: 70, bottom: 70, left: 70, right: 70 }, duration: 900 }
      );
    } else if (origin) {
      cameraRef.current.flyTo({
        center: [origin.longitude, origin.latitude],
        zoom: 14,
        duration: 800,
      });
    }
  }, [origin?.latitude, origin?.longitude, destination?.latitude, destination?.longitude]);

  const centerCoord: [number, number] = origin
    ? [origin.longitude, origin.latitude]
    : [78.4747, 17.3616]; // Default: Hyderabad Hub (Charminar, India)

  return (
    <View style={styles.container}>
      <Map
        style={styles.map}
        mapStyle={DEFAULT_MAP_STYLE}
        attributionPosition={{ bottom: 8, right: 8 }}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: centerCoord,
            zoom: 14,
          }}
        />

        {/* Origin Marker */}
        {origin && (
          <Marker id="origin-pin" lngLat={[origin.longitude, origin.latitude]}>
            <View style={[styles.marker, styles.originMarker]}>
              <Text style={styles.markerText}>A</Text>
            </View>
          </Marker>
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker id="destination-pin" lngLat={[destination.longitude, destination.latitude]}>
            <View style={[styles.marker, styles.destMarker]}>
              <Text style={styles.markerText}>B</Text>
            </View>
          </Marker>
        )}

        {/* Real-Time Live User Location Puck */}
        {userLocation && (
          <Marker id="user-location-puck" lngLat={[userLocation.longitude, userLocation.latitude]}>
            <View style={styles.userPuckContainer}>
              <View style={styles.userPuckPulse} />
              <View style={styles.userPuckDot} />
            </View>
          </Marker>
        )}

        {/* Route Polylines */}
        {routes.map((route) => {
          const featureCollection: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: { id: route.id },
                geometry: {
                  type: 'LineString',
                  coordinates: route.coordinates,
                },
              },
            ],
          };

          return (
            <GeoJSONSource
              key={route.id}
              id={`source-${route.id}`}
              data={featureCollection}
              onPress={() => onSelectRoute?.(route.id)}
            >
              <Layer
                id={`line-${route.id}`}
                type="line"
                paint={{
                  'line-color': route.isSelected ? '#0284C7' : '#94A3B8',
                  'line-width': route.isSelected ? 6 : 4,
                  'line-opacity': route.isSelected ? 0.95 : 0.6,
                }}
                layout={{
                  'line-cap': 'round',
                  'line-join': 'round',
                }}
              />
            </GeoJSONSource>
          );
        })}

        {/* Mapped Corridor Amenities */}
        {amenities?.map((amenity) => {
          const badgeColor =
            amenity.category === 'emergency'
              ? '#10B981' // emerald
              : amenity.category === 'transit'
              ? '#F59E0B' // amber
              : amenity.category === 'lighting'
              ? '#06B6D4' // cyan
              : '#38BDF8'; // sky blue

          return (
            <Marker
              key={amenity.id}
              id={amenity.id}
              lngLat={amenity.coordinates}
            >
              <View style={[styles.amenityDot, { backgroundColor: badgeColor }]} />
            </Marker>
          );
        })}

        {/* Street-Level Photography Coordinates */}
        {streetPhotos?.map((photo) => (
          <Marker
            key={photo.id}
            id={`photo-${photo.id}`}
            lngLat={[photo.longitude, photo.latitude]}
          >
            <View style={styles.photoMarker}>
              <AppIcon name="camera" size={12} color="#FFFFFF" />
            </View>
          </Marker>
        ))}
      </Map>

      {/* Floating 1-Tap Recenter on Me Button */}
      {userLocation && (
        <TouchableOpacity
          style={styles.recenterBtn}
          onPress={() => {
            if (cameraRef.current && userLocation) {
              cameraRef.current.flyTo({
                center: [userLocation.longitude, userLocation.latitude],
                zoom: 16,
                duration: 600,
              });
            }
          }}
          accessibilityRole="button"
          accessibilityLabel="Recenter map on current location"
        >
          <AppIcon name="target" size={18} color="#0284C7" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  map: {
    flex: 1,
  },
  amenityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    elevation: 3,
  },
  photoMarker: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    elevation: 4,
  },
  photoIcon: {
    fontSize: 10,
  },
  marker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
  },
  originMarker: {
    backgroundColor: '#10B981', // Emerald
  },
  destMarker: {
    backgroundColor: '#EF4444', // Red
  },
  markerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  userPuckContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userPuckPulse: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.6)',
  },
  userPuckDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0284C7',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
  },
  recenterBtn: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    elevation: 5,
  },
  recenterIcon: {
    fontSize: 20,
  },
});
