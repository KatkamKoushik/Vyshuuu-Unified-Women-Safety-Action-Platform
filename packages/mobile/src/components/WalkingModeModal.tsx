import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { AppIcon } from './common/AppIcon';

interface Step {
  instruction: string;
  distanceMeters: number;
  streetName?: string;
}

interface WalkingModeModalProps {
  visible: boolean;
  onClose: () => void;
  steps: Step[];
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  routeTitle: string;
}

export const WalkingModeModal: React.FC<WalkingModeModalProps> = ({
  visible,
  onClose,
  steps,
  totalDistanceMeters,
  totalDurationSeconds,
  routeTitle,
}) => {
  const { theme } = useTheme();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (visible) {
      setCurrentStepIndex(0);
    }
  }, [visible, steps]);

  const currentStep = steps[currentStepIndex] || {
    instruction: 'Continue walking along path',
    distanceMeters: totalDistanceMeters,
  };

  const hasNext = currentStepIndex < steps.length - 1;
  const hasPrev = currentStepIndex > 0;

  const handleNextStep = () => {
    if (hasNext) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (hasPrev) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      'Emergency Call 112',
      'This will place an immediate call to India National Emergency Response Support System (112).',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call 112 Now',
          style: 'destructive',
          onPress: () => {
            Linking.openURL('tel:112').catch(() => {
              Alert.alert('Dialer Error', 'Could not open phone dialer on this device.');
            });
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
    const mins = Math.ceil(s / 60);
    return `${mins} min`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
        {/* Top Header */}
        <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <AppIcon name="walk" size={18} color={theme.primary} />
              <Text style={[styles.modeTitle, { color: theme.text }]}>Walking Mode</Text>
            </View>
            <Text style={[styles.routeSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
              {routeTitle} • {formatDistance(totalDistanceMeters)} ({formatDuration(totalDurationSeconds)})
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.exitButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={onClose}
            accessibilityLabel="Exit Walking Mode"
          >
            <Text style={[styles.exitText, { color: theme.textSecondary }]}>Exit</Text>
          </TouchableOpacity>
        </View>

        {/* Step Counter */}
        <View style={styles.counterRow}>
          <Text style={[styles.stepCounterText, { color: theme.primary }]}>
            Step {steps.length > 0 ? currentStepIndex + 1 : 1} of {Math.max(1, steps.length)}
          </Text>
        </View>

        {/* Big Instruction Box */}
        <View
          style={[
            styles.instructionContainer,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.instructionDistance, { color: theme.primary }]}>
            {formatDistance(currentStep.distanceMeters)}
          </Text>
          <Text style={[styles.instructionText, { color: theme.text }]}>
            {currentStep.instruction}
          </Text>
          {currentStep.streetName ? (
            <Text style={[styles.streetNameText, { color: theme.textSecondary }]}>
              on {currentStep.streetName}
            </Text>
          ) : null}
        </View>

        {/* Step Navigation Controls */}
        <View style={styles.navControlsRow}>
          <TouchableOpacity
            style={[
              styles.navButton,
              { backgroundColor: theme.surface, borderColor: theme.border },
              !hasPrev && { opacity: 0.4 },
            ]}
            onPress={handlePrevStep}
            disabled={!hasPrev}
            accessibilityLabel="Previous Step"
          >
            <Text style={[styles.navButtonText, { color: theme.textSecondary }]}>
              Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              styles.navButtonPrimary,
              { backgroundColor: theme.primary, borderColor: theme.primary },
              !hasNext && { opacity: 0.4 },
            ]}
            onPress={handleNextStep}
            disabled={!hasNext}
            accessibilityLabel="Next Step"
          >
            <Text style={[styles.navButtonText, { color: '#FFFFFF', fontWeight: '800' }]}>
              Next Step
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Safety & Emergency Bar */}
        <View style={[styles.bottomBar, { borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.emergencyButton, { backgroundColor: theme.danger }]}
            onPress={handleEmergencyCall}
            accessibilityLabel="Emergency Dialer 112"
          >
            <AppIcon name="alert" size={18} color="#FFFFFF" />
            <Text style={styles.emergencyText}>Emergency Call (112)</Text>
          </TouchableOpacity>
          <Text style={[styles.disclaimerFootnote, { color: theme.textMuted }]}>
            Keep eyes on your surroundings. Do not look at phone while crossing roads.
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  routeSubtitle: {
    fontSize: 12,
    marginTop: 2,
    maxWidth: 240,
  },
  exitButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  exitText: {
    fontSize: 13,
    fontWeight: '700',
  },
  counterRow: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  stepCounterText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  instructionContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 24,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  instructionDistance: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 8,
  },
  streetNameText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  navControlsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  navButtonPrimary: {},
  navButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  emergencyButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    minHeight: 52,
  },
  emergencyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  disclaimerFootnote: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 14,
  },
});
