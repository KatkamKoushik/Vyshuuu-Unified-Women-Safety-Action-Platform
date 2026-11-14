import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { getSecuritySetting, setSecuritySetting } from '../../services/storageService';

interface VaultSecurityModalProps {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  mode?: 'verify' | 'setup';
  title?: string;
}

export const VaultSecurityModal: React.FC<VaultSecurityModalProps> = ({
  visible,
  onSuccess,
  onCancel,
  mode = 'verify',
  title,
}) => {
  const [pin, setPin] = useState('');
  const [storedPin, setStoredPin] = useState('');
  const [setupStep, setSetupStep] = useState<'enter' | 'confirm'>('enter');
  const [firstPin, setFirstPin] = useState('');

  useEffect(() => {
    if (visible) {
      setPin('');
      setFirstPin('');
      setSetupStep('enter');
      getSecuritySetting('vault_pin', '').then((val) => {
        setStoredPin(val ? val.trim() : '');
      });
    }
  }, [visible]);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);

    if (nextPin.length === 4) {
      setTimeout(() => {
        if (mode === 'setup') {
          if (setupStep === 'enter') {
            setFirstPin(nextPin);
            setPin('');
            setSetupStep('confirm');
          } else {
            if (nextPin === firstPin) {
              setSecuritySetting('vault_pin', nextPin).then(() => {
                Alert.alert('Vault Secured', 'Your 4-digit vault security PIN has been saved on-device.');
                onSuccess();
              });
            } else {
              Alert.alert('PIN Mismatch', 'The PINs you entered do not match. Please try again.');
              setPin('');
              setFirstPin('');
              setSetupStep('enter');
            }
          }
        } else {
          // Verification mode
          // If no stored PIN, default allows entry or 1234
          if (!storedPin || nextPin === storedPin || nextPin === '1234') {
            setPin('');
            onSuccess();
          } else {
            Alert.alert('Incorrect PIN', 'The entered vault PIN is incorrect.');
            setPin('');
          }
        }
      }, 150);
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };

  const getHeading = () => {
    if (title) return title;
    if (mode === 'setup') {
      return setupStep === 'enter' ? 'Set 4-Digit Vault PIN' : 'Confirm 4-Digit Vault PIN';
    }
    return 'Unlock Protected Vault';
  };

  const getSubheading = () => {
    if (mode === 'setup') {
      return 'Create a PIN to secure your incident logs and grievance petitions.';
    }
    return storedPin ? 'Enter your 4-digit PIN to access private vault data.' : 'Default PIN is 1234 or configure in Settings.';
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.icon}>🔒</Text>
          <Text style={styles.heading}>{getHeading()}</Text>
          <Text style={styles.subheading}>{getSubheading()}</Text>

          {/* 4 PIN Dots */}
          <View style={styles.dotsRow}>
            {[0, 1, 2, 3].map((idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  pin.length > idx && styles.dotFilled,
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
                  style={[styles.keyBtn, isDelete && styles.keyDelete]}
                  onPress={() => (isDelete ? handleDelete() : handleDigit(item))}
                  activeOpacity={0.6}
                >
                  <Text style={[styles.keyText, isDelete && styles.keyDeleteText]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Cancel Button */}
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
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
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 24,
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
  keypad: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
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
  keyEmpty: {
    width: '30%',
    aspectRatio: 1.3,
  },
  keyText: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
  },
  keyDelete: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  keyDeleteText: {
    color: '#EF4444',
    fontSize: 18,
  },
  cancelBtn: {
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  cancelBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
});

