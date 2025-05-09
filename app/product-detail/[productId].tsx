import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCart } from '../context/CartContext';
import api from '../utils/api';

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  category?: { name: string };
  stockQuantity?: number;
}

export default function ProductDetailScreen() {
  const { productId } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const { cartCount, updateCartCount } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/product/${productId}`);
        setProduct(res.data);
      } catch (e) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await api.post('/cart/add', { productId: product._id, quantity });
      await updateCartCount(); // Update the global cart count
      Alert.alert('Success', 'Product added to cart!');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1, marginTop: 40 }} />;
  }
  if (!product) {
    return <Text style={{ margin: 20 }}>Product not found.</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top Bar */}
      <View style={styles.detailTopBar}>
        <TouchableOpacity onPress={() => router.replace('/screens/HomeScreen') /* or router.back() */}> 
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.detailCartIcon} onPress={() => router.push('/cart')}>
          <Ionicons name="cart-outline" size={26} color="#333" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      {product.image && (
        <Image source={{ uri: product.image }} style={styles.image} />
      )}
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>${product.price}</Text>
      {product.category && (
        <Text style={styles.category}>Category: {product.category.name}</Text>
      )}
      <Text style={styles.description}>{product.description || 'No description.'}</Text>
      {typeof product.stockQuantity === 'number' && (
        <Text style={styles.quantity}>Quantity in stock: {product.stockQuantity}</Text>
      )}
      {/* Quantity Selector */}
      <View style={styles.qtyRow}>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => setQuantity(q => Math.max(1, q - 1))}
          disabled={quantity <= 1 || adding}
        >
          <Text style={styles.qtyBtnText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.qtyValue}>{quantity}</Text>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => setQuantity(q => product.stockQuantity ? Math.min(product.stockQuantity, q + 1) : q + 1)}
          disabled={product.stockQuantity ? quantity >= product.stockQuantity : false || adding}
        >
          <Text style={styles.qtyBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      {/* Add to Cart Button */}
      <TouchableOpacity
        style={[styles.addCartBtn, adding && { opacity: 0.6 }]}
        onPress={handleAddToCart}
        disabled={adding}
      >
        <Text style={styles.addCartBtnText}>{adding ? 'Adding...' : 'Add to Cart'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: '#f3f3f3',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
    textAlign: 'center',
  },
  price: {
    fontSize: 20,
    color: '#4a90e2',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    color: '#888',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  quantity: {
    fontSize: 16,
    color: '#4a90e2',
    marginTop: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
    justifyContent: 'center',
  },
  qtyBtn: {
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginHorizontal: 10,
  },
  qtyBtnText: {
    fontSize: 22,
    color: '#4a90e2',
    fontWeight: 'bold',
  },
  qtyValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    minWidth: 32,
    textAlign: 'center',
  },
  addCartBtn: {
    backgroundColor: '#4a90e2',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 16,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 180,
  },
  addCartBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  detailTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 36,
    paddingBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  detailCartIcon: {
    marginLeft: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#f90',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 2,
  },
  cartBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
}); 