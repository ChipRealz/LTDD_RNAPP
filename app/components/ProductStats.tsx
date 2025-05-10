import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import api from '../utils/api';

export default function ProductStats({ productId }: { productId: string }) {
  const [stats, setStats] = useState<{ purchaseCount: number; commentCount: number }>({ purchaseCount: 0, commentCount: 0 });

  useEffect(() => {
    api.get(`/product-features/stats/${productId}`).then(res => setStats(res.data));
  }, [productId]);

  return (
    <View style={{ flexDirection: 'row', marginTop: 8 }}>
      <Text style={{ marginRight: 16 }}>{stats.purchaseCount} bought</Text>
      <Text>{stats.commentCount} comments</Text>
    </View>
  );
} 