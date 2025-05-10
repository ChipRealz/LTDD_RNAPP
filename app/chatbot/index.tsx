import React, { useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import api from '../utils/api';

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<{ from: 'user' | 'bot'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/chatbot', { message: userMsg.text });
      setMessages(prev => [...prev, { from: 'bot', text: res.data.reply }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { from: 'bot', text: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chat with ShopBot</Text>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={[styles.messageRow, item.from === 'user' ? styles.userRow : styles.botRow]}>
            <Text style={[styles.message, item.from === 'user' ? styles.userMsg : styles.botMsg]}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 8 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      {loading && <ActivityIndicator style={{ marginBottom: 70 }} />}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80} style={styles.inputBarWrap}>
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            onSubmitEditing={sendMessage}
            editable={!loading}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={loading || !input.trim()}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <BottomNavBar active="chatbot" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', margin: 16 },
  messageRow: { flexDirection: 'row', marginHorizontal: 12, marginVertical: 4 },
  userRow: { justifyContent: 'flex-end' },
  botRow: { justifyContent: 'flex-start' },
  message: { padding: 10, borderRadius: 16, maxWidth: '80%', fontSize: 16 },
  userMsg: { backgroundColor: '#4a90e2', color: '#fff', alignSelf: 'flex-end' },
  botMsg: { backgroundColor: '#eee', color: '#222', alignSelf: 'flex-start' },
  inputBarWrap: { position: 'absolute', left: 0, right: 0, bottom: 60, backgroundColor: 'transparent' },
  inputBar: { flexDirection: 'row', backgroundColor: '#f9f9f9', borderRadius: 24, margin: 12, padding: 4, alignItems: 'center', elevation: 2 },
  input: { flex: 1, fontSize: 16, padding: 10, backgroundColor: '#fff', borderRadius: 20 },
  sendBtn: { backgroundColor: '#4a90e2', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 18, marginLeft: 8 },
}); 