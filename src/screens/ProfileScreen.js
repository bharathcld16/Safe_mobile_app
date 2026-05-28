import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function ProfileScreen({ user, onBack }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.logo}>🛡️ SAFE</Text>

      <View style={styles.card}>
        {user.photo
          ? <Image source={{ uri: user.photo }} style={styles.photo} />
          : <View style={styles.photoPlaceholder}><Text style={styles.photoPlaceholderText}>👤</Text></View>}

        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.phone}>📞 {user.phone}</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Your User ID</Text>
        <View style={styles.idBox}>
          <Text style={styles.idText}>{user.userId}</Text>
        </View>
        <Text style={styles.hint}>Share your User ID or phone number so others can add you as an emergency contact.</Text>
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  content: { padding: 24, paddingTop: 60, alignItems: 'center' },
  logo: { fontSize: 32, fontWeight: '900', color: '#ff3b3b', letterSpacing: 4, marginBottom: 24 },
  card: {
    width: '100%', backgroundColor: '#1a1a1a',
    borderRadius: 16, borderWidth: 1, borderColor: '#333',
    padding: 24, alignItems: 'center', gap: 8,
  },
  photo: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#ff3b3b' },
  photoPlaceholder: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#2a2a2a', borderWidth: 3, borderColor: '#ff3b3b',
    alignItems: 'center', justifyContent: 'center',
  },
  photoPlaceholderText: { fontSize: 36 },
  name: { fontSize: 22, fontWeight: '800', color: '#f0f0f0', marginTop: 8 },
  phone: { fontSize: 15, color: '#aaa' },
  divider: { width: '100%', height: 1, backgroundColor: '#2a2a2a', marginVertical: 12 },
  label: { fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1 },
  idBox: {
    backgroundColor: '#111', borderRadius: 8, borderWidth: 1,
    borderColor: '#2a2a2a', padding: 10, width: '100%',
  },
  idText: { color: '#888', fontSize: 14, textAlign: 'center', fontFamily: 'monospace' },
  hint: { fontSize: 12, color: '#555', textAlign: 'center', marginTop: 8 },
  backBtn: {
    marginTop: 20, backgroundColor: '#1a1a1a', borderWidth: 1,
    borderColor: '#444', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 40,
  },
  backBtnText: { color: '#f0f0f0', fontSize: 15 },
});
