import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../utils/api';

export default function CommentProductScreen() {
  const { productId } = useLocalSearchParams();
  const router = useRouter();
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitComment = async () => {
    if (!comment.trim()) {
      Alert.alert('Please enter a comment.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/review/comment/${productId}`, { comment });
      Alert.alert('Thank you!', 'Your comment has been submitted.');
      setComment('');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 20 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 16 }}>Leave a Comment</Text>
      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Your comment"
        style={{ backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12, minHeight: 80, marginBottom: 16 }}
        multiline
        editable={!submitting}
      />
      <TouchableOpacity
        onPress={submitComment}
        style={{
          backgroundColor: '#4a90e2',
          borderRadius: 8,
          padding: 14,
          alignItems: 'center',
          opacity: submitting ? 0.6 : 1,
        }}
        disabled={submitting}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
          {submitting ? 'Submitting...' : 'Submit Comment'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
