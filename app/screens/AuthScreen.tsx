import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../utils/api';

export default function AuthScreen() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState<{
    name: string;
    email: string;
    password: string;
    dateOfBirth: string;
    address: string;
    image: ImagePicker.ImagePickerAsset | null;
  }>({
    name: '', email: '', password: '', dateOfBirth: '', address: '', image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setForm({ ...form, image: result.assets[0] });
    }
  };

  const handleChange = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value });

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      let data = new FormData();
      if (tab === 'register') {
        Object.entries(form).forEach(([k, v]) => {
          if (k === 'image' && v && typeof v !== 'string') {
            data.append('image', {
              uri: v.uri,
              name: 'user.jpg',
              type: 'image/jpeg',
            } as any);
          } else if (k !== 'image' && typeof v === 'string') {
            data.append(k, v);
          }
        });
        const res = await api.post('/user/signup', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (res.data.status === 'PENDING') {
          router.push({ pathname: '/screens/OTPScreen', params: { userId: res.data.userId, email: form.email, type: 'signup' } });
        }
      } else {
        const res = await api.post('/user/signin', { email: form.email, password: form.password });
        if (res.data.status === 'PENDING') {
          router.push({ pathname: '/screens/OTPScreen', params: { userId: res.data.userId, email: form.email, type: 'login' } });
        }
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, tab==='login'&&styles.activeTab]} onPress={()=>setTab('login')}><Text>Login</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab==='register'&&styles.activeTab]} onPress={()=>setTab('register')}><Text>Register</Text></TouchableOpacity>
      </View>
      {tab==='register' && (
        <>
          <TextInput style={styles.input} placeholder="Name" value={form.name} onChangeText={t=>handleChange('name',t)} />
          <TextInput style={styles.input} placeholder="Date of Birth (YYYY-MM-DD)" value={form.dateOfBirth} onChangeText={t=>handleChange('dateOfBirth',t)} />
          <TextInput style={styles.input} placeholder="Address" value={form.address} onChangeText={t=>handleChange('address',t)} />
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {form.image ? <Image source={{ uri: form.image.uri }} style={styles.avatar} /> : <Text>Pick Image</Text>}
          </TouchableOpacity>
        </>
      )}
      <TextInput style={styles.input} placeholder="Email" value={form.email} onChangeText={t=>handleChange('email',t)} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={form.password} onChangeText={t=>handleChange('password',t)} secureTextEntry />
      {tab === 'login' && (
        <TouchableOpacity onPress={() => router.push('/screens/ForgotPasswordScreen')}>
          <Text style={{ color: '#4a90e2', textAlign: 'right', marginBottom: 10 }}>Forgot Password?</Text>
        </TouchableOpacity>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={{ color: '#fff' }}>{loading ? 'Please wait...' : (tab==='login'?'Login':'Register')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  tabRow: { flexDirection: 'row', marginBottom: 20 },
  tab: { flex: 1, alignItems: 'center', padding: 10, borderBottomWidth: 2, borderBottomColor: '#eee' },
  activeTab: { borderBottomColor: '#4a90e2' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
  imagePicker: { alignItems: 'center', marginBottom: 10 },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  button: { backgroundColor: '#4a90e2', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  error: { color: 'red', marginBottom: 10 },
}); 