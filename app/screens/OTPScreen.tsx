import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../utils/api';

export default function OTPScreen() {
  const { userId, email, type } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/user/verifyOTP', { userId, otp });
      if (res.data.status === 'SUCCESS') {
        // Save token (for demo, use async storage or context in real app)
        global.authToken = res.data.token;
        router.replace('/screens/HomeScreen');
      }
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'response' in e) {
        setError((e.response as any)?.data?.message || 'Error');
      } else {
        setError('Error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/user/resendOTPVerification', { userId, email });
    } catch (e) {
      setError('Could not resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <TextInput
        style={styles.input}
        placeholder="6-digit OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        maxLength={6}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
        <Text style={{ color: '#fff' }}>{loading ? 'Verifying...' : 'Verify OTP'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.resend} onPress={handleResend} disabled={loading}>
        <Text style={{ color: '#4a90e2' }}>Resend OTP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, width: '100%', marginBottom: 10, textAlign: 'center', fontSize: 18 },
  button: { backgroundColor: '#4a90e2', padding: 15, borderRadius: 8, alignItems: 'center', width: '100%', marginTop: 10 },
  error: { color: 'red', marginBottom: 10 },
  resend: { marginTop: 20 },
}); 