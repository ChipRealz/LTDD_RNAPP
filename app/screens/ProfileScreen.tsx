import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useUser } from '../context/UserContext';
import api from '../utils/api';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const router = useRouter();
  const { setUserImage } = useUser();

  useEffect(() => {
    // Fetch user profile
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('/user/profile');
        setProfile(res.data.data);
        setName(res.data.data.name || '');
        setDateOfBirth(res.data.data.dateOfBirth || '');
        setAddress(res.data.data.address || '');
        setImage(res.data.data.image || null);
        setUserImage(res.data.data.image || null);
      } catch (e) {
        Alert.alert('Error', 'Could not load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('dateOfBirth', dateOfBirth);
      formData.append('address', address);
      if (image && !image.startsWith('http')) {
        formData.append('image', {
          uri: image,
          name: 'profile.jpg',
          type: 'image/jpeg',
        } as any);
      }
      const res = await api.patch('/user/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.status === 'SUCCESS') {
        Alert.alert('Success', 'Profile updated!');
        setProfile(res.data.data);
        if (res.data.data.image) {
          setImage(res.data.data.image);
          setUserImage(res.data.data.image);
        }
      } else {
        Alert.alert('Error', res.data.message || 'Could not update profile');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.avatar} />
        ) : (
          <View style={styles.avatar} />
        )}
        <Text style={styles.changePhotoText}>Change Photo</Text>
      </TouchableOpacity>
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <Text style={styles.label}>Date of Birth</Text>
      <TextInput style={styles.input} value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="YYYY-MM-DD" />
      <Text style={styles.label}>Address</Text>
      <TextInput style={styles.input} value={address} onChangeText={setAddress} multiline />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 24, backgroundColor: '#fff', flexGrow: 1 },
  avatarContainer: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#4a90e2',
    marginBottom: 8,
  },
  changePhotoText: { color: '#4a90e2', fontWeight: 'bold', marginBottom: 8 },
  label: { alignSelf: 'flex-start', fontWeight: 'bold', marginTop: 12, marginBottom: 4, color: '#333' },
  input: {
    width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 12, fontSize: 16, backgroundColor: '#f9f9f9', marginBottom: 8,
  },
  saveButton: {
    backgroundColor: '#4a90e2', borderRadius: 10, paddingVertical: 16,
    alignItems: 'center', marginTop: 16, width: '100%',
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  backButton: { marginTop: 16, alignItems: 'center' },
  backButtonText: { color: '#4a90e2', fontWeight: 'bold', fontSize: 16 },
}); 