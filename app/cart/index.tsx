import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
      fetchCart();
    } catch (e) {
      Alert.alert('Error', 'Could not remove item');
    } finally {
      setUpdating(false);
    }
  };

  const total = cart?.items.reduce((sum, item) => sum + item.productId.price * item.quantity, 0) || 0;

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!cart || cart.items.length === 0) return <Text style={{ margin: 20 }}>Your cart is empty.</Text>;

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
      <Text style={styles.total}>Total: ${total}</Text>
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
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a90e2',
    textAlign: 'right',
    marginTop: 16,
  },
}); 