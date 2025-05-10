import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import api from '../utils/api';

type Order = {
  _id: string;
  orderNumber?: string;
  status: string;
  totalAmount: number;
};

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/order/my-orders')
      .then(res => setOrders(res.data.orders))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  if (!orders.length) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>You have no orders yet.</Text>
        <BottomNavBar active="orders" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Order History</Text>
      <FlatList
        data={orders}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.orderItem}
            onPress={() => router.push({ pathname: '/order-detail/[orderId]', params: { orderId: item._id } })}
          >
            <Text style={styles.orderNumber}>Order #{item.orderNumber || item._id}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Total: ${item.totalAmount}</Text>
          </TouchableOpacity>
        )}
      />
      <BottomNavBar active="orders" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  orderItem: { padding: 16, borderBottomWidth: 1, borderColor: '#eee' },
  orderNumber: { fontWeight: 'bold', marginBottom: 4 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#888' },
}); 