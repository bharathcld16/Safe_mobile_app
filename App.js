import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';

export default function App() {
  const [screen, setScreen] = useState('loading'); // loading | register | home | profile
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const userId = await SecureStore.getItemAsync('safeUserId');
      const name = await SecureStore.getItemAsync('safeName');
      const phone = await SecureStore.getItemAsync('safePhone');
      const photo = await SecureStore.getItemAsync('safePhoto');
      if (userId && name) {
        setUser({ userId, name, phone, photo });
        setScreen('home');
      } else {
        setScreen('register');
      }
    })();
  }, []);

  const handleRegistered = (userData) => {
    setUser(userData);
    setScreen('home');
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'This will clear your profile. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive', onPress: async () => {
          await SecureStore.deleteItemAsync('safeUserId');
          await SecureStore.deleteItemAsync('safeName');
          await SecureStore.deleteItemAsync('safePhone');
          await SecureStore.deleteItemAsync('safePhoto');
          await SecureStore.deleteItemAsync('safeVapidKey');
          setUser(null);
          setScreen('register');
        }
      }
    ]);
  };

  if (screen === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#ff3b3b" />
      </View>
    );
  }

  if (screen === 'register') return <RegisterScreen onRegistered={handleRegistered} />;
  if (screen === 'profile') return <ProfileScreen user={user} onBack={() => setScreen('home')} />;
  return (
    <HomeScreen
      user={user}
      onProfile={() => setScreen('profile')}
      onLogout={handleLogout}
    />
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: '#0d0d0d', alignItems: 'center', justifyContent: 'center' },
});
