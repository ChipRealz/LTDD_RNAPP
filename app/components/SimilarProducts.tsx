import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import api from '../utils/api';

export default function SimilarProducts({ productId }: { productId: string }) {
  const [similar, setSimilar] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    api.get(`/product-features/similar/${productId}`).then(res => setSimilar(res.data));
  }, [productId]);

  if (similar.length === 0) return null;

  return (
    <View style={{ width: '100%', marginTop: 32 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Similar Products</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {similar.map(product => (
          <TouchableOpacity
            key={product._id}
            style={{ marginRight: 16, alignItems: 'center' }}
            onPress={() => router.push({ pathname: '/product-detail/[productId]', params: { productId: product._id } })}
          >
            <Image source={{ uri: product.image }} style={{ width: 80, height: 80, borderRadius: 8, marginBottom: 4 }} />
            <Text style={{ fontWeight: 'bold', fontSize: 14 }}>{product.name}</Text>
            <Text style={{ color: '#4a90e2', fontWeight: 'bold' }}>${product.price}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
} 