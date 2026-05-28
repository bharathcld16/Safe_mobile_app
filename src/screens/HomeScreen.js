import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  Vibration, AppState
} from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { sendSOS, updateLocation } from '../utils/api';
import useShakeDetector from '../hooks/useShakeDetector';
import SOSCountdown from '../components/SOSCountdown';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false,
  }),
});

export default function HomeScreen({ user, onProfile, onLogout }) {
  const [sosCountdown, setSOSCountdown] = useState(false);
  const [sending, setSending] = useState(false);
  const locationRef = useRef(null);
  const appState = useRef(AppState.currentState);

  // Request notification permission
  useEffect(() => {
    (async () => {
      if (Device.isDevice) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') Alert.alert('Notifications disabled', 'Enable notifications to receive SOS alerts.');
      }
    })();
  }, []);

  // Location tracking
  useEffect(() => {
    let watcher;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      watcher = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 10000, distanceInterval: 10 },
        ({ coords }) => {
          locationRef.current = coords;
          updateLocation(user.userId, coords.latitude, coords.longitude).catch(() => {});
        }
      );
    })();
    return () => watcher?.remove();
  }, [user.userId]);

  // App state — keep shake active in background
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      appState.current = state;
    });
    return () => sub.remove();
  }, []);

  const handleShake = useCallback(() => {
    if (sosCountdown || sending) return;
    setSOSCountdown(true);
  }, [sosCountdown, sending]);

  // Shake always active (foreground + background-ish)
  useShakeDetector(handleShake, true);

  const handleSOSSend = async () => {
    setSOSCountdown(false);
    setSending(true);
    Vibration.vibrate([0, 500, 200, 500, 200, 500]);
    try {
      const { data } = await sendSOS(user.userId);
      Alert.alert(
        '🚨 SOS Sent!',
        `Emergency contacts notified: ${data.notified.emergency.length}\nNearby users notified: ${data.notified.nearby.length}`
      );
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to send SOS. Check your connection.');
    } finally {
      setSending(false);
      Vibration.cancel();
    }
  };

  const handleSOSCancel = () => setSOSCountdown(false);

  const triggerManualSOS = () => {
    if (sending) return;
    setSOSCountdown(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🛡️ SAFE</Text>
      <Text style={styles.welcome}>Welcome, {user.name} 👋</Text>
      <Text style={styles.hint}>Shake phone 5× fast to trigger SOS</Text>

      <TouchableOpacity
        style={[styles.sosBtn, sending && styles.sosBtnDisabled]}
        onPress={triggerManualSOS}
        disabled={sending}
        activeOpacity={0.8}
      >
        <Text style={styles.sosBtnText}>{sending ? 'SENDING…' : 'SOS'}</Text>
      </TouchableOpacity>

      <Text style={styles.sosHint}>Press in emergency</Text>

      <View style={styles.bottomRow}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onProfile}>
          <Text style={styles.secondaryBtnText}>👤 My Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dangerBtn} onPress={onLogout}>
          <Text style={styles.dangerBtnText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>

      <SOSCountdown
        visible={sosCountdown}
        onSend={handleSOSSend}
        onCancel={handleSOSCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#0d0d0d',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  logo: { fontSize: 32, fontWeight: '900', color: '#ff3b3b', letterSpacing: 4, marginBottom: 4 },
  welcome: { color: '#aaa', fontSize: 15, marginBottom: 4 },
  hint: { color: '#444', fontSize: 12, marginBottom: 40, textAlign: 'center' },
  sosBtn: {
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#cc0000',
    borderWidth: 6, borderColor: '#ff4444',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#ff3b3b', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 30, elevation: 20,
  },
  sosBtnDisabled: { backgroundColor: '#660000', borderColor: '#880000' },
  sosBtnText: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: 4 },
  sosHint: { color: '#555', fontSize: 12, marginTop: 12, marginBottom: 40 },
  bottomRow: { flexDirection: 'row', gap: 12 },
  secondaryBtn: {
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#444',
    borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20,
  },
  secondaryBtnText: { color: '#f0f0f0', fontSize: 14 },
  dangerBtn: {
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#f88',
    borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20,
  },
  dangerBtnText: { color: '#f88', fontSize: 14 },
});
