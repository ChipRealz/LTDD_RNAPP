import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import api from '../utils/api';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.get('/product-features/favorite').then(res => {
      setFavorites(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 16 }}>My Favorites</Text>
      {favorites.length === 0 ? (
        <Text>No favorite products yet.</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={item => item.productId._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
              onPress={() => router.push({ pathname: '/product-detail/[productId]', params: { productId: item.productId._id } })}
            >
              <Image source={{ uri: item.productId.image }} style={{ width: 60, height: 60, borderRadius: 8, marginRight: 12 }} />
              <View>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.productId.name}</Text>
                <Text style={{ color: '#4a90e2', fontWeight: 'bold' }}>${item.productId.price}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      <BottomNavBar active="favorites" />
    </View>
  );
} 