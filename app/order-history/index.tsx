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
  const [cashflow, setCashflow] = useState<Record<string, number> | null>(null);

  const statusColors: Record<string, string> = {
    PENDING: '#888',
    SUCCESS: '#27ae60',
    FAILED: '#e74c3c',
    CANCELED: '#b2bec3',
    DELIVERED: '#27ae60',
    NEW: '#4a90e2',
    CONFIRMED: '#f90',
    PREPARING: '#f1c40f',
    DELIVERING: '#2980b9',
    CANCELREQUESTED: '#e67e22',
    awaitingConfirmation: '#4a90e2',
    beingDelivered: '#f90',
    delivered: '#27ae60',
  };

  useEffect(() => {
    api.get('/order/my-orders')
      .then(res => setOrders(res.data.orders))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
    api.get('/usercashflow/cashflow')
      .then(res => setCashflow(res.data as Record<string, number>))
      .catch(err => console.error('Cashflow error:', err));
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

  function formatCurrency(amount: number) {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Order History</Text>
      {cashflow && (
        <View style={styles.cashflowCard}>
          <Text style={styles.cashflowTitle}>Cash Flow Summary</Text>
          {Object.entries(cashflow).filter(([k]) => k !== 'totalSpent').map(([status, amount]) => (
            <View style={styles.cashflowRow} key={status}>
              <Text style={styles.cashflowLabel}>{status.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}:</Text>
              <Text style={[styles.cashflowValue, { color: statusColors[status] || '#222' }]}>{formatCurrency(Number(amount))}</Text>
            </View>
          ))}
          {'totalSpent' in cashflow && (
            <View style={[styles.cashflowRow, { marginTop: 8 }]}> 
              <Text style={[styles.cashflowLabel, { fontWeight: 'bold' }]}>Total Spent:</Text>
              <Text style={[styles.cashflowValue, { color: '#27ae60', fontWeight: 'bold' }]}>{formatCurrency(cashflow.totalSpent)}</Text>
            </View>
          )}
        </View>
      )}
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
        contentContainerStyle={{ paddingBottom: 45 }}
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
  cashflowCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cashflowTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8, color: '#4a90e2' },
  cashflowRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cashflowLabel: { color: '#333' },
  cashflowValue: { fontWeight: 'bold', color: '#222' },
}); 