import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../utils/api';

export default function ResetPasswordScreen() {
  const { userId, email } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleReset = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/user/resetPassword', { userId, otp, newPassword });
      if (res.data.status === 'SUCCESS') {
        setSuccess('Password reset successful! You can now log in.');
        setTimeout(() => {
          router.replace('/screens/AuthScreen');
        }, 1500);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        maxLength={6}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter new password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
        <Text style={{ color: '#fff' }}>{loading ? 'Resetting...' : 'Reset Password'}</Text>
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
  success: { color: 'green', marginBottom: 10 },
}); 