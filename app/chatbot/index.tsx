import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import api from '../utils/api';

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<(
    { from: 'user' | 'bot'; text: string } |
    { from: 'bot'; type: 'products'; products: any[] } |
    { from: 'bot'; type: 'orders'; orders: any[] }
  )[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user' as const, text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/chatbot', { message: userMsg.text });
      setMessages(prev => {
        const next = [...prev, { from: 'bot' as const, text: res.data.reply }];
        if (Array.isArray(res.data.products) && res.data.products.length > 0) {
          next.push({ from: 'bot', type: 'products', products: res.data.products });
        }
        if (Array.isArray(res.data.orders) && res.data.orders.length > 0) {
          next.push({ from: 'bot', type: 'orders', orders: res.data.orders });
        }
        return next;
      });
    } catch (e: any) {
      setMessages(prev => [...prev, { from: 'bot' as const, text: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderProductCard = (product: any) => (
    <View key={product._id} style={styles.productCard}>
      {product.image && (
        <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />
      )}
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productPrice}>${product.price}</Text>
      <Text style={styles.productStock}>Stock: {product.stockQuantity}</Text>
      {product.category && (
        <Text style={styles.productCategory}>Category: {product.category.name || product.category}</Text>
      )}
      {product.description && (
        <Text style={styles.productDescription} numberOfLines={2}>{product.description}</Text>
      )}
      {product.analytics && (
        <View style={{ marginTop: 6 }}>
          {product.analytics.avgRating && (
            <Text style={styles.productRating}>
              ⭐ {product.analytics.avgRating.toFixed(1)} ({product.analytics.reviewCount} reviews)
            </Text>
          )}
          {product.analytics.topKeywords && product.analytics.topKeywords.length > 0 && (
            <Text style={styles.productKeywords}>
              Keywords: {product.analytics.topKeywords.map((k: any) => k.word).join(', ')}
            </Text>
          )}
          {'sentiment' in product.analytics && (
            <Text style={styles.productSentiment}>
              Sentiment: {product.analytics.sentiment > 0 ? '😊 Positive' : product.analytics.sentiment < 0 ? '😞 Negative' : '😐 Neutral'}
            </Text>
          )}
        </View>
      )}
      <TouchableOpacity
        style={styles.detailsBtn}
        onPress={() => router.push(`/product-detail/${product._id}`)}
      >
        <Text style={styles.detailsBtnText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chat with ShopBot</Text>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => {
          if ('type' in item && item.type === 'products') {
            return (
              <View style={styles.productsRow}>
                <FlatList
                  data={item.products}
                  keyExtractor={p => p._id}
                  renderItem={({ item }) => renderProductCard(item)}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            );
          }
          if ('type' in item && item.type === 'orders') {
            return (
              <View style={styles.ordersRow}>
                {item.orders.map((order: any) => (
                  <View key={order.orderNumber} style={styles.orderCard}>
                    <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
                    <Text>Status: {order.status}</Text>
                    <Text>Total: ${order.totalAmount}</Text>
                    <Text>Date: {new Date(order.createdAt).toLocaleDateString()}</Text>
                  </View>
                ))}
              </View>
            );
          }
          return (
            <View style={[styles.messageRow, item.from === 'user' ? styles.userRow : styles.botRow]}>
              <Text style={[styles.message, item.from === 'user' ? styles.userMsg : styles.botMsg]}>{item.text}</Text>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 125, paddingTop: 8 }}
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
  productsRow: { flexDirection: 'row', marginVertical: 8, marginLeft: 12 },
  productCard: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 12, marginRight: 10, minWidth: 100, maxWidth: 200, alignItems: 'flex-start', elevation: 1 },
  productImage: { width: 100, height: 90, borderRadius: 8, marginBottom: 6, alignSelf: 'center' },
  productName: { fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  productPrice: { color: '#4a90e2', fontWeight: 'bold', marginBottom: 2 },
  productStock: { color: '#888', fontSize: 13 },
  productRating: { color: '#f1c40f', fontWeight: 'bold', fontSize: 13 },
  productKeywords: { color: '#888', fontSize: 12, marginTop: 2 },
  productSentiment: { fontSize: 12, marginTop: 2 },
  productCategory: { color: '#666', fontSize: 12, marginBottom: 2 },
  productDescription: { color: '#444', fontSize: 12, marginBottom: 2 },
  detailsBtn: { marginTop: 8, backgroundColor: '#4a90e2', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12, alignSelf: 'flex-start' },
  detailsBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  ordersRow: { marginVertical: 8, marginLeft: 12 },
  orderCard: { backgroundColor: '#f0f0f0', borderRadius: 8, padding: 10, marginBottom: 8, minWidth: 100, maxWidth: 150 },
  orderNumber: { fontWeight: 'bold', marginBottom: 2 },
}); 