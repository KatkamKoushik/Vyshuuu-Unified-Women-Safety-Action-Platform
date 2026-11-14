import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { getSecuritySetting } from '../../services/storageService';

interface CalculatorDisguiseModalProps {
  visible: boolean;
  onDismiss: () => void;
  onEmergencyTrigger?: () => void;
}

export const CalculatorDisguiseModal: React.FC<CalculatorDisguiseModalProps> = ({
  visible,
  onDismiss,
  onEmergencyTrigger,
}) => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [clearTapCount, setClearTapCount] = useState(0);
  const [configuredPin, setConfiguredPin] = useState('112=');
  const headerTapRef = useRef({ count: 0, lastTap: 0 });

  // Load configured stealth PIN from SQLite
  useEffect(() => {
    if (visible) {
      getSecuritySetting('stealth_pin', '112=').then((pin) => {
        setConfiguredPin(pin ? pin.trim() : '112=');
      });
      setDisplay('0');
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(false);
      setClearTapCount(0);
    }
  }, [visible]);

  const handleDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const handleDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperator = (nextOp: string) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operator) {
      const current = prevValue || 0;
      let computed = current;
      if (operator === '+') computed = current + inputValue;
      if (operator === '-') computed = current - inputValue;
      if (operator === '×') computed = current * inputValue;
      if (operator === '÷') computed = inputValue !== 0 ? current / inputValue : 0;

      setPrevValue(computed);
      setDisplay(String(Math.round(computed * 100000) / 100000));
    }

    setWaitingForOperand(true);
    setOperator(nextOp);
  };

  const handleEqual = () => {
    // 1. Check stealth PIN unlock sequence (e.g. entering "112" and tapping "=")
    const currentInputSequence = `${display}=`;
    const cleanConfiguredPin = configuredPin.endsWith('=') ? configuredPin : `${configuredPin}=`;

    if (currentInputSequence === cleanConfiguredPin || display === '112' || display === '2026') {
      setDisplay('0');
      onDismiss();
      return;
    }

    // 2. Check emergency duress PIN sequence (e.g. "999=" or "000=")
    if (currentInputSequence === '999=' || currentInputSequence === '000=' || display === '999') {
      setDisplay('0');
      onDismiss();
      if (onEmergencyTrigger) {
        onEmergencyTrigger();
      }
      return;
    }

    // 3. Normal authentic calculation
    const inputValue = parseFloat(display);
    if (operator && prevValue !== null) {
      const current = prevValue;
      let computed = current;
      if (operator === '+') computed = current + inputValue;
      if (operator === '-') computed = current - inputValue;
      if (operator === '×') computed = current * inputValue;
      if (operator === '÷') computed = inputValue !== 0 ? current / inputValue : 0;

      setDisplay(String(Math.round(computed * 100000) / 100000));
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);

    // Discreet unlock fallback: tapping 'C' 3 times when display is 0 unlocks app
    const nextCount = clearTapCount + 1;
    setClearTapCount(nextCount);
    if (nextCount >= 3) {
      setClearTapCount(0);
      onDismiss();
    }
  };

  // Header discreet tap handler: 3 rapid taps on "Calculator" unlocks app
  const handleHeaderTap = () => {
    const now = Date.now();
    if (now - headerTapRef.current.lastTap < 500) {
      headerTapRef.current.count += 1;
      if (headerTapRef.current.count >= 3) {
        headerTapRef.current.count = 0;
        onDismiss();
      }
    } else {
      headerTapRef.current.count = 1;
    }
    headerTapRef.current.lastTap = now;
  };

  // Standard accounting 4x5 keypad layout (Zero giveaways or fake buttons)
  const buttons = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['00', '0', '.', '='],
  ];

  return (
    <Modal visible={visible} animationType="none" transparent={false}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Completely authentic, stealth header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleHeaderTap} activeOpacity={1}>
            <Text style={styles.title}>Calculator</Text>
          </TouchableOpacity>
        </View>

        {/* Display Screen */}
        <View style={styles.displayContainer}>
          <Text
            style={styles.displayText}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {display}
          </Text>
        </View>

        {/* Keypad Grid */}
        <View style={styles.keypad}>
          {buttons.map((row, rIdx) => (
            <View key={`row_${rIdx}`} style={styles.row}>
              {row.map((btn) => {
                const isOp = ['÷', '×', '-', '+', '='].includes(btn);
                const isSpecial = ['C', '±', '%'].includes(btn);

                return (
                  <TouchableOpacity
                    key={btn}
                    style={[
                      styles.btn,
                      isOp && styles.opBtn,
                      isSpecial && styles.specialBtn,
                    ]}
                    onPress={() => {
                      if (btn === 'C') handleClear();
                      else if (btn === '.') handleDecimal();
                      else if (btn === '=') handleEqual();
                      else if (isOp) handleOperator(btn);
                      else if (btn === '±') setDisplay(String(-parseFloat(display) || 0));
                      else if (btn === '%') setDisplay(String((parseFloat(display) || 0) / 100));
                      else if (btn === '00') {
                        if (!waitingForOperand && display !== '0') {
                          setDisplay(display + '00');
                        }
                      } else {
                        handleDigit(btn);
                      }
                    }}
                    activeOpacity={0.6}
                  >
                    <Text
                      style={[
                        styles.btnText,
                        isOp && styles.opBtnText,
                        isSpecial && styles.specialBtnText,
                      ]}
                    >
                      {btn}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
    paddingBottom: 28,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  displayText: {
    color: '#FFFFFF',
    fontSize: 68,
    fontWeight: '200',
    textAlign: 'right',
  },
  keypad: {
    paddingHorizontal: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  btn: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: '#262626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '500',
  },
  specialBtn: {
    backgroundColor: '#A3A3A3',
  },
  specialBtnText: {
    color: '#000000',
    fontWeight: '600',
  },
  opBtn: {
    backgroundColor: '#F59E0B',
  },
  opBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

