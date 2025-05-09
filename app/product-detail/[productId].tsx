import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text } from 'react-native';
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
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <ActivityIndicator style={{ flex: 1, marginTop: 40 }} />;
  }
  if (!product) {
    return <Text style={{ margin: 20 }}>Product not found.</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
}); 