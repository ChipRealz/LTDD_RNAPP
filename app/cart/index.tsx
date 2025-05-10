import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCart } from '../context/CartContext';
import api from '../utils/api';

interface CartItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
}

export default function CartScreen() {
  const [cart, setCart] = useState<{ items: CartItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const { updateCartCount } = useCart();

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cart');
      setCart(res.data);
    } catch (e) {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (productId: string) => {
    setUpdating(true);
    try {
      await api.delete(`/cart/remove/${productId}`);
      await fetchCart();
      await updateCartCount();
    } catch (e) {
      Alert.alert('Error', 'Could not remove item');
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) return;
    router.push('/order');
  };

  const total = cart?.items.reduce((sum, item) => sum + item.productId.price * item.quantity, 0) || 0;

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!cart || cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color="#ccc" />
        <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
        <Text style={styles.emptyText}>Looks like you haven't added any items to your cart yet.</Text>
        <TouchableOpacity 
          style={styles.continueShoppingButton}
          onPress={() => router.replace('/screens/HomeScreen')}
        >
          <Text style={styles.continueShoppingText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart.items}
        keyExtractor={item => item.productId._id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            {item.productId.image && (
              <Image source={{ uri: item.productId.image }} style={styles.itemImage} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.productId.name}</Text>
              <Text style={styles.itemPrice}>${item.productId.price}</Text>
              <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
            </View>
            <TouchableOpacity onPress={() => handleRemove(item.productId._id)} disabled={updating}>
              <Text style={styles.removeBtn}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
      <View style={styles.checkoutContainer}>
        <Text style={styles.total}>Total: ${total}</Text>
        <TouchableOpacity
          style={[styles.checkoutButton, checkingOut && styles.checkoutButtonDisabled]}
          onPress={handleCheckout}
          disabled={checkingOut}
        >
          {checkingOut ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    marginBottom: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#e0e0e0',
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#222',
  },
  itemPrice: {
    color: '#4a90e2',
    fontWeight: 'bold',
    fontSize: 15,
  },
  itemQty: {
    fontSize: 14,
    color: '#888',
  },
  removeBtn: {
    color: '#f00',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 10,
  },
  checkoutContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
    marginTop: 8,
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a90e2',
    textAlign: 'right',
    marginBottom: 16,
  },
  checkoutButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutButtonDisabled: {
    opacity: 0.7,
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  continueShoppingButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueShoppingText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 