import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, Alert, ActivityIndicator, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { registerUser } from '../utils/api';

export default function RegisterScreen({ onRegistered }) {
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [contactInput, setContactInput] = useState('');
  const [loading, setLoading] = useState(false);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission needed', 'Allow photo access to upload your photo.');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.7,
    });
    if (!result.canceled) setPhoto(result.assets[0]);
  };

  const addContact = () => {
    const p = contactInput.trim();
    if (!p) return;
    if (contacts.length >= 5) return Alert.alert('Max 5 contacts');
    if (contacts.includes(p)) return Alert.alert('Already added');
    setContacts([...contacts, p]);
    setContactInput('');
  };

  const removeContact = (i) => setContacts(contacts.filter((_, idx) => idx !== i));

  const handleRegister = async () => {
    if (!userId.trim()) return Alert.alert('Error', 'Please choose a User ID.');
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(userId))
      return Alert.alert('Invalid User ID', '3-20 characters: letters, numbers, underscores only.');
    if (!name.trim()) return Alert.alert('Error', 'Please enter your name.');
    if (!phone.trim()) return Alert.alert('Error', 'Please enter your phone number.');
    if (!photo) return Alert.alert('Error', 'Please upload your photo.');
    if (contacts.length === 0) return Alert.alert('Error', 'Add at least one emergency contact.');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('userId', userId.trim());
      formData.append('name', name.trim());
      formData.append('phone', phone.trim());
      formData.append('photo', {
        uri: Platform.OS === 'android' ? photo.uri : photo.uri.replace('file://', ''),
        name: 'photo.jpg', type: 'image/jpeg',
      });
      formData.append('emergencyContacts', JSON.stringify(
        contacts.map(p => ({ phone: p, userId: null }))
      ));

      const { data } = await registerUser(formData);

      await SecureStore.setItemAsync('safeUserId', userId.trim());
      await SecureStore.setItemAsync('safeName', name.trim());
      await SecureStore.setItemAsync('safePhone', phone.trim());
      await SecureStore.setItemAsync('safePhoto', photo.uri);
      await SecureStore.setItemAsync('safeVapidKey', data.vapidPublicKey);

      Alert.alert('✅ Registered!', `Welcome, ${name.trim()}!`);
      onRegistered({ userId: userId.trim(), name: name.trim(), phone: phone.trim(), photo: photo.uri });
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Check your connection.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.logo}>🛡️ SAFE</Text>
      <Text style={styles.tagline}>Your personal safety companion</Text>

      <TextInput style={styles.input} placeholder="Choose a User ID (e.g. john_doe)"
        placeholderTextColor="#555" value={userId} onChangeText={setUserId} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Full Name"
        placeholderTextColor="#555" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Phone Number"
        placeholderTextColor="#555" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto}>
        {photo
          ? <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
          : <Text style={styles.photoBtnText}>📷 Upload Your Photo</Text>}
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>Emergency Contacts (up to 5)</Text>
      <View style={styles.contactRow}>
        <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Enter phone number" placeholderTextColor="#555"
          value={contactInput} onChangeText={setContactInput} keyboardType="phone-pad" />
        <TouchableOpacity style={styles.addBtn} onPress={addContact}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {contacts.map((c, i) => (
        <View key={i} style={styles.contactTag}>
          <View style={styles.contactAvatar}><Text style={styles.contactAvatarText}>{c.slice(-2)}</Text></View>
          <Text style={styles.contactPhone}>{c}</Text>
          <TouchableOpacity onPress={() => removeContact(i)}>
            <Text style={styles.removeBtn}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerBtnText}>Register</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  content: { padding: 24, paddingTop: 60, alignItems: 'center' },
  logo: { fontSize: 36, fontWeight: '900', color: '#ff3b3b', letterSpacing: 4 },
  tagline: { color: '#888', fontSize: 13, marginBottom: 24 },
  input: {
    width: '100%', backgroundColor: '#1a1a1a', color: '#f0f0f0',
    borderRadius: 10, borderWidth: 1, borderColor: '#333',
    padding: 14, fontSize: 15, marginBottom: 12,
  },
  photoBtn: {
    width: '100%', backgroundColor: '#1a1a1a', borderRadius: 10,
    borderWidth: 1, borderStyle: 'dashed', borderColor: '#555',
    padding: 16, alignItems: 'center', marginBottom: 12,
  },
  photoBtnText: { color: '#aaa', fontSize: 15 },
  photoPreview: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#ff3b3b' },
  sectionLabel: { color: '#aaa', fontSize: 13, alignSelf: 'flex-start', marginBottom: 8 },
  contactRow: { flexDirection: 'row', gap: 8, width: '100%', marginBottom: 12 },
  addBtn: {
    backgroundColor: '#ff3b3b', borderRadius: 10,
    paddingHorizontal: 18, justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  contactTag: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a',
    borderRadius: 10, borderWidth: 1, borderColor: '#333',
    padding: 10, width: '100%', marginBottom: 8, gap: 10,
  },
  contactAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#333', borderWidth: 2, borderColor: '#ff3b3b',
    alignItems: 'center', justifyContent: 'center',
  },
  contactAvatarText: { color: '#aaa', fontSize: 12, fontWeight: '700' },
  contactPhone: { flex: 1, color: '#f0f0f0', fontSize: 14 },
  removeBtn: { color: '#f88', fontSize: 18, paddingHorizontal: 4 },
  registerBtn: {
    width: '100%', backgroundColor: '#ff3b3b', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 8,
  },
  registerBtnText: { color: '#fff', fontWeight: '800', fontSize: 17 },
});
