import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import api from '../utils/api';

export default function CategoryProductsScreen() {
  const { categoryId, categoryName } = useLocalSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get(`/product?category=${categoryId}`);
        setProducts(res.data);
      } catch (e) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryId]);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Products in {categoryName}</Text>
      <FlatList
        data={products}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.productBox}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>${item.price}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  productBox: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productName: { fontSize: 16, fontWeight: 'bold' },
  productPrice: { color: '#4a90e2', marginTop: 4 },
}); 