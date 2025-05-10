import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import api from '../utils/api';

interface OrderItem {
  name: string;
  price: string;
  quantity: string;
  image: string;
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
  };
}

interface Order {
  _id: string;
  shippingInfo: {
    address: string;
    city: string;
    country: string;
    name?: string;
    phone?: string;
  };
  orderItems: OrderItem[];
  paymentMethod: string;
  totalAmount: number;
  orderStatus: string;
  orderCreatedAt: string;
  deliverAt?: string;
  orderNumber?: string;
  note?: string;
}

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    api.get(`/order/my-orders/${orderId}`)
      .then(res => setOrder(res.data.order))
      .catch(err => {
        if (err.response?.status === 403) {
          Alert.alert('Unauthorized', 'You are not allowed to view this order.');
          router.replace({ pathname: '/order-history/index' });
        } else {
          console.error(err);
        }
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!order) return;

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            setCanceling(true);
            try {
              const response = await api.put(`/order/cancel/${orderId}`);
              if (response.data.success) {
                Alert.alert('Success', 'Order canceled successfully');
                api.get(`/order/my-orders/${orderId}`)
                  .then(res => setOrder(res.data.order))
                  .catch(err => console.error(err));
              }
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Could not cancel order');
            } finally {
              setCanceling(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return '#4a90e2';
      case 'confirmed':
        return '#4a90e2';
      case 'preparing':
        return '#f90';
      case 'delivering':
        return '#f90';
      case 'delivered':
        return '#4CAF50';
      case 'canceled':
        return '#f44336';
      default:
        return '#666';
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!order) return <Text style={{ margin: 20 }}>Order not found.</Text>;

  const canCancel = order.orderStatus === 'new' && 
    (new Date().getTime() - new Date(order.orderCreatedAt).getTime()) <= 30 * 60 * 1000;

  return (
    <FlatList
      style={styles.container}
      data={order.orderItems}
      keyExtractor={item => item.product._id || item.product.name}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
          <Text style={styles.itemPrice}>Price: ${item.price}</Text>
        </View>
      )}
      ListHeaderComponent={
        <View>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Order Details</Text>
            <View style={{ width: 28 }} />
          </View>
          <View style={styles.content}>
            <Text style={styles.header}>Order #{order.orderNumber || order._id}</Text>
            <Text style={styles.section}>Status: {(order.orderStatus || 'unknown').toUpperCase()}</Text>
            <Text style={styles.section}>Total: ${order.totalAmount}</Text>
            <Text style={styles.section}>Date: {new Date(order.orderCreatedAt).toLocaleString()}</Text>
            <Text style={styles.section}>Shipping Info</Text>
            <Text style={styles.infoText}>Name: {order.shippingInfo?.name}</Text>
            <Text style={styles.infoText}>Phone: {order.shippingInfo?.phone}</Text>
            <Text style={styles.infoText}>Address: {order.shippingInfo?.address}, {order.shippingInfo?.city}, {order.shippingInfo?.country}</Text>
            <Text style={styles.section}>Items</Text>
          </View>
        </View>
      }
      ListFooterComponent={
        <View>
          {order.note ? (
            <>
              <Text style={styles.section}>Note</Text>
              <Text style={styles.infoText}>{order.note}</Text>
            </>
          ) : null}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>${order.totalAmount}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>Payment Method: {order.paymentMethod}</Text>
          </View>
          {canCancel && (
            <TouchableOpacity
              style={[styles.cancelButton, canceling && styles.cancelButtonDisabled]}
              onPress={handleCancelOrder}
              disabled={canceling}
            >
              {canceling ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.cancelButtonText}>Cancel Order</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 16,
  },
  section: { marginTop: 16, fontWeight: 'bold', fontSize: 16 },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  item: { paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
  itemName: { fontWeight: 'bold' },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 15,
    color: '#4a90e2',
    fontWeight: 'bold',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  infoCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  cancelButtonDisabled: {
    opacity: 0.7,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 