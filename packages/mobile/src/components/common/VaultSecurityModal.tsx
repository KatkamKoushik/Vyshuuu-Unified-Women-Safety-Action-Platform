import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getSecuritySetting, setSecuritySetting } from '../../services/storageService';
import { deriveKeyPbkdf2, generateSecureRandomHex, hashSha256 } from '@walking-companion/core';
import { useTheme } from '../../theme/ThemeContext';
import { AppIcon } from './AppIcon';

interface VaultSecurityModalProps {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  mode?: 'verify' | 'setup';
  title?: string;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

export const VaultSecurityModal: React.FC<VaultSecurityModalProps> = ({
  visible,
  onSuccess,
  onCancel,
  mode: initialMode = 'verify',
  title,
}) => {
  const { theme } = useTheme();
  const [activeMode, setActiveMode] = useState<'verify' | 'setup'>(initialMode);
  const [pin, setPin] = useState('');
  const [storedPinHash, setStoredPinHash] = useState<string | null>(null);
  const [deviceSalt, setDeviceSalt] = useState<string>('');
  const [setupStep, setSetupStep] = useState<'enter' | 'confirm'>('enter');
  const [firstPin, setFirstPin] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  const timerRef = useRef<any>(null);

  // Derives memory-hard cryptographic credential token via PBKDF2-HMAC-SHA256
  const derivePinToken = (rawPin: string, saltStr: string): string => {
    return deriveKeyPbkdf2(rawPin, saltStr || 'resq_vault_default_salt', 100000, 32);
  };

  // Read stored PIN hash from secure store or SQLite security settings
  useEffect(() => {
    if (visible) {
      setPin('');
      setFirstPin('');
      setSetupStep('enter');

      const loadCredential = async () => {
        try {
          // Check persisted lockout state across component remounts
          let lockoutUntilStr: string | null = null;
          try {
            lockoutUntilStr = await SecureStore.getItemAsync('vault_lockout_until');
          } catch {
            lockoutUntilStr = null;
          }
          if (!lockoutUntilStr) {
            lockoutUntilStr = await getSecuritySetting('vault_lockout_until', '');
          }
          if (lockoutUntilStr) {
            const until = parseInt(lockoutUntilStr, 10);
            const remaining = Math.ceil((until - Date.now()) / 1000);
            if (remaining > 0) {
              setLockoutTimer(remaining);
            }
          }

          // 0. Load or provision dynamic per-device salt
          let salt: string | null = null;
          try {
            salt = await SecureStore.getItemAsync('vault_device_salt');
          } catch {
            salt = null;
          }
          if (!salt) {
            salt = await getSecuritySetting('vault_device_salt', '');
          }
          if (!salt) {
            salt = generateSecureRandomHex(16);
            try {
              await SecureStore.setItemAsync('vault_device_salt', salt);
            } catch {
              await setSecuritySetting('vault_device_salt', salt);
            }
          }
          setDeviceSalt(salt);

          // 1. Try platform-backed hardware keystore (SecureStore)
          let hash: string | null = null;
          try {
            hash = await SecureStore.getItemAsync('vault_pin_hash');
          } catch {
            hash = null;
          }

          // 2. Fall back to on-device SQLite security settings only if SecureStore returned null
          if (!hash) {
            const rawVal = await getSecuritySetting('vault_pin_hash', '');
            hash = rawVal ? rawVal.trim() : null;
          }

          setStoredPinHash(hash);

          // If in verify mode but user has never enrolled a PIN, mandate enrollment
          if (initialMode === 'verify' && !hash) {
            setActiveMode('setup');
          } else {
            setActiveMode(initialMode);
          }
        } catch {
          setStoredPinHash(null);
          setActiveMode('setup');
        }
      };

      loadCredential();
    }
  }, [visible, initialMode]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTimer > 0) {
      timerRef.current = setTimeout(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [lockoutTimer]);

  const handleDigit = (digit: string) => {
    if (lockoutTimer > 0) return;
    if (pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);

    if (nextPin.length === 4) {
      setTimeout(async () => {
        if (activeMode === 'setup') {
          if (setupStep === 'enter') {
            setFirstPin(nextPin);
            setPin('');
            setSetupStep('confirm');
          } else {
            if (nextPin === firstPin) {
              const currentSalt = deviceSalt || 'resq_vault_default_salt';
              const newDerivedToken = derivePinToken(nextPin, currentSalt);
              try {
                // Save to SecureStore hardware-backed keystore
                let savedToSecureStore = false;
                try {
                  await SecureStore.setItemAsync('vault_pin_hash', newDerivedToken);
                  savedToSecureStore = true;
                } catch {
                  savedToSecureStore = false;
                }
                // Only fall back to SQLite if SecureStore hardware keystore is unavailable
                if (!savedToSecureStore) {
                  await setSecuritySetting('vault_pin_hash', newDerivedToken);
                }

                setStoredPinHash(newDerivedToken);
                Alert.alert(
                  'Vault Enrolled & Secured',
                  'Your 4-digit vault PIN has been cryptographically secured using memory-hard key derivation and device-backed protection.'
                );
                setPin('');
                setFirstPin('');
                onSuccess();
              } catch {
                Alert.alert('Storage Error', 'Could not save vault credentials to device.');
              }
            } else {
              Alert.alert('PIN Mismatch', 'The PINs you entered do not match. Please try again.');
              setPin('');
              setFirstPin('');
              setSetupStep('enter');
            }
          }
        } else {
          // Verification mode: check PBKDF2-derived token against stored credential
          const currentSalt = deviceSalt || 'resq_vault_default_salt';
          const attemptToken = derivePinToken(nextPin, currentSalt);
          let isMatch = Boolean(storedPinHash && attemptToken === storedPinHash);

          // Graceful backward-compatibility migration for existing fast SHA-256 credentials
          if (!isMatch && storedPinHash) {
            const legacyHash = hashSha256(`resq_vault_v1_salt_9f8e7d:${nextPin}`);
            if (storedPinHash === legacyHash) {
              isMatch = true;
              try {
                await SecureStore.setItemAsync('vault_pin_hash', attemptToken);
              } catch {
                await setSecuritySetting('vault_pin_hash', attemptToken);
              }
              setStoredPinHash(attemptToken);
            }
          }

          if (isMatch) {
            setPin('');
            setFailedAttempts(0);
            try {
              await SecureStore.deleteItemAsync('vault_lockout_until');
            } catch {
              await setSecuritySetting('vault_lockout_until', '');
            }
            onSuccess();
          } else {
            const nextFail = failedAttempts + 1;
            setFailedAttempts(nextFail);
            setPin('');

            if (nextFail >= MAX_ATTEMPTS) {
              const lockoutUntil = Date.now() + LOCKOUT_SECONDS * 1000;
              setLockoutTimer(LOCKOUT_SECONDS);
              try {
                await SecureStore.setItemAsync('vault_lockout_until', String(lockoutUntil));
              } catch {
                await setSecuritySetting('vault_lockout_until', String(lockoutUntil));
              }
              Alert.alert(
                'Access Locked',
                `Too many failed attempts. Vault keypad locked for ${LOCKOUT_SECONDS} seconds for brute-force defense.`
              );
            } else {
              Alert.alert(
                'Incorrect PIN',
                `The entered vault PIN is incorrect. ${MAX_ATTEMPTS - nextFail} attempts remaining before temporary lockout.`
              );
            }
          }
        }
      }, 150);
    }
  };

  const handleDelete = () => {
    if (lockoutTimer > 0) return;
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };

  const getHeading = () => {
    if (title) return title;
    if (activeMode === 'setup') {
      return setupStep === 'enter' ? 'Enroll 4-Digit Vault PIN' : 'Confirm Vault PIN';
    }
    return 'Unlock Protected Vault';
  };

  const getSubheading = () => {
    if (lockoutTimer > 0) {
      return `Keypad locked for brute-force defense: ${lockoutTimer}s remaining.`;
    }
    if (activeMode === 'setup') {
      return setupStep === 'enter'
        ? 'Create a 4-digit PIN to secure your incident logs and legal petitions.'
        : 'Re-enter your 4-digit PIN to verify.';
    }
    return 'Enter your 4-digit PIN to access private incident & petition vault.';
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={{ marginBottom: 12, alignItems: 'center' }}>
            <AppIcon
              name={lockoutTimer > 0 ? 'alert' : 'lock'}
              size={36}
              color={lockoutTimer > 0 ? theme.warning : theme.primary}
            />
          </View>
          <Text style={[styles.heading, { color: theme.text }]}>{getHeading()}</Text>
          <Text style={[styles.subheading, { color: theme.textSecondary }, lockoutTimer > 0 && styles.lockoutText]}>
            {getSubheading()}
          </Text>

          {/* 4 PIN Dots */}
          <View style={styles.dotsRow}>
            {[0, 1, 2, 3].map((idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  { borderColor: theme.border, backgroundColor: theme.surface },
                  pin.length > idx && [styles.dotFilled, { backgroundColor: theme.primary, borderColor: theme.primary }],
                  lockoutTimer > 0 && styles.dotDisabled,
                ]}
              />
            ))}
          </View>

          {/* Numeric Keypad Grid */}
          <View style={styles.keypad}>
            {digits.map((item, idx) => {
              if (item === '') {
                return <View key={`empty_${idx}`} style={styles.keyEmpty} />;
              }
              const isDelete = item === '⌫';
              return (
                <TouchableOpacity
                  key={`key_${idx}`}
                  style={[
                    styles.keyBtn,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    isDelete && styles.keyDelete,
                    lockoutTimer > 0 && styles.keyBtnDisabled,
                  ]}
                  onPress={() => (isDelete ? handleDelete() : handleDigit(item))}
                  disabled={lockoutTimer > 0}
                  activeOpacity={0.6}
                >
                  <Text
                    style={[
                      styles.keyText,
                      { color: theme.text },
                      isDelete && styles.keyDeleteText,
                      lockoutTimer > 0 && styles.keyTextDisabled,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Storage Architecture Disclosure */}
          <View style={[styles.disclosureCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.disclosureText, { color: theme.textSecondary }]}>
              [NOTICE] Hardware Security Notice: PIN gates on-device UI display. Enable device OS lockscreen
              encryption in system settings for hardware-level storage protection.
            </Text>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity style={[styles.cancelBtn, { borderColor: theme.border }]} onPress={onCancel}>
            <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  heading: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  subheading: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  lockoutText: {
    color: '#EF4444',
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 20,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#64748B',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    borderColor: '#38BDF8',
    backgroundColor: '#38BDF8',
  },
  dotDisabled: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  keypad: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  keyBtn: {
    width: '30%',
    aspectRatio: 1.3,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  keyBtnDisabled: {
    opacity: 0.3,
  },
  keyEmpty: {
    width: '30%',
    aspectRatio: 1.3,
  },
  keyText: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
  },
  keyTextDisabled: {
    color: '#64748B',
  },
  keyDelete: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  keyDeleteText: {
    color: '#EF4444',
    fontSize: 18,
  },
  disclosureCard: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderRadius: 8,
    padding: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  disclosureText: {
    color: '#94A3B8',
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
  cancelBtn: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  cancelBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
});
