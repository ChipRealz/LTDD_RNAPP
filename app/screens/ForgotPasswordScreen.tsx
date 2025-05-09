import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../utils/api';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRequest = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/user/requestPasswordReset', { email });
      if (res.data.status === 'PENDING') {
        router.push({ pathname: '/screens/ResetPasswordScreen', params: { userId: res.data.userId, email } });
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleRequest} disabled={loading}>
        <Text style={{ color: '#fff' }}>{loading ? 'Sending...' : 'Send OTP'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
  button: { backgroundColor: '#4a90e2', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  error: { color: 'red', marginBottom: 10 },
}); 