import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import api from '../utils/api';

export default function CategoryList() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/category');
        setCategories(res.data);
      } catch (e) {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) return <ActivityIndicator size="small" />;

  return (
    <FlatList
      data={categories}
      keyExtractor={item => item._id}
      horizontal
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.categoryBox}
          onPress={() => router.push({ pathname: '/screens/CategoryProductsScreen', params: { categoryId: item._id, categoryName: item.name } })}
        >
          <Text style={styles.categoryText}>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: 10, paddingHorizontal: 8 },
  categoryBox: {
    backgroundColor: '#f3f3f3',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#b6e7c9',
  },
  categoryText: {
    fontWeight: 'bold',
    color: '#333',
  },
}); 