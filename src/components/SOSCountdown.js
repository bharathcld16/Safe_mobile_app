import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration, Modal } from 'react-native';

export default function SOSCountdown({ visible, onSend, onCancel }) {
  const [count, setCount] = useState(5);
  const timer = useRef(null);

  useEffect(() => {
    if (!visible) { setCount(5); return; }

    Vibration.vibrate([0, 300, 200, 300, 200, 300]);
    setCount(5);

    timer.current = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(timer.current);
          onSend();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer.current);
  }, [visible]);

  const handleCancel = () => {
    clearInterval(timer.current);
    Vibration.cancel();
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.shake}>📳 Shake Detected!</Text>
          <Text style={styles.label}>Sending SOS in</Text>
          <Text style={styles.count}>{count}</Text>
          <Text style={styles.sub}>Shake again to cancel or tap below</Text>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelText}>✋ CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center', justifyContent: 'center',
  },
  box: {
    backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#ff3b3b',
    borderRadius: 20, padding: 32, alignItems: 'center', width: '80%',
  },
  shake: { fontSize: 22, color: '#fff', marginBottom: 8 },
  label: { fontSize: 16, color: '#aaa' },
  count: { fontSize: 80, fontWeight: '900', color: '#ff3b3b', lineHeight: 90 },
  sub: { fontSize: 12, color: '#666', marginBottom: 20, textAlign: 'center' },
  cancelBtn: {
    backgroundColor: '#333', borderWidth: 1, borderColor: '#ff3b3b',
    borderRadius: 12, paddingVertical: 14, paddingHorizontal: 40,
  },
  cancelText: { color: '#ff3b3b', fontWeight: '800', fontSize: 16 },
});
