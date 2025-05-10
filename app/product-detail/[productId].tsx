import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ProductStats from '../components/ProductStats';
import SimilarProducts from '../components/SimilarProducts';
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

interface Review {
  _id: string;
  userId: { name: string };
  rating: number;
  comment: string;
  createdAt?: string;
}

export default function ProductDetailScreen() {
  const { productId } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const { cartCount, updateCartCount } = useCart();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

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
    // Fetch reviews for this product
    api.get(`/review/${productId}`).then(res => setReviews(res.data));
    api.get(`/review/comment/${productId}`).then(res => setComments(res.data));
  }, [productId]);

  useFocusEffect(
    React.useCallback(() => {
      // Fetch product and comments here
      api.get(`/review/comment/${productId}`).then(res => setComments(res.data));
      // ...fetch other data if needed...
    }, [productId])
  );

  useEffect(() => {
    // Check if this product is in favorites
    api.get('/product-features/favorite').then(res => {
      setIsFavorite(res.data.some((fav: { productId: { _id: string } }) => fav.productId._id === productId));
    });
  }, [productId]);

  useEffect(() => {
    if (productId) {
      api.post(`/product-features/viewed/${productId}`)
        .then(() => {
          // Optionally log for debugging
          console.log('Viewed product recorded:', productId);
        })
        .catch(err => {
          console.error('Failed to record viewed product:', err);
        });
    }
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

  const toggleFavorite = async () => {
    if (isFavorite) {
      await api.delete(`/product-features/favorite/${productId}`);
      setIsFavorite(false);
    } else {
      await api.post(`/product-features/favorite/${productId}`);
      setIsFavorite(true);
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
      {/* --- REVIEWS SECTION --- */}
      <View style={{ width: '100%', marginTop: 32 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Reviews</Text>
        {reviews.length === 0 ? (
          <Text>No reviews yet.</Text>
        ) : (
          reviews.map(r => (
            <View key={r._id} style={{ marginVertical: 8, backgroundColor: '#f9f9f9', borderRadius: 8, padding: 10 }}>
              <Text style={{ fontWeight: 'bold' }}>{r.userId?.name || 'User'}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 2 }}>
                {[1,2,3,4,5].map(num => (
                  <Ionicons
                    key={num}
                    name={num <= r.rating ? 'star' : 'star-outline'}
                    size={18}
                    color="#f9a825"
                  />
                ))}
                {r.createdAt && (
                  <Text style={{ marginLeft: 8, color: '#888', fontSize: 12 }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
              <Text>{r.comment}</Text>
            </View>
          ))
        )}
      </View>
      {/* --- DIVIDER --- */}
      <View style={{ width: '100%', height: 1, backgroundColor: '#eee', marginVertical: 24 }} />
      {/* --- COMMENTS SECTION --- */}
      <View style={{ width: '100%', marginBottom: 16 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Comments</Text>
        {comments.length === 0 ? (
          <Text>No comments yet.</Text>
        ) : (
          comments.map(c => (
            <View key={c._id} style={{ marginVertical: 6, backgroundColor: '#f3f3f3', borderRadius: 8, padding: 8 }}>
              <Text style={{ fontWeight: 'bold' }}>{c.userId?.name || 'User'}</Text>
              <Text>{c.comment}</Text>
            </View>
          ))
        )}
        <TouchableOpacity
          style={{ marginTop: 16, alignSelf: 'flex-end', backgroundColor: '#eee', borderRadius: 8, padding: 8 }}
          onPress={() => router.push({ pathname: '/comment-product/[productId]', params: { productId } })}
        >
          <Text style={{ color: '#4a90e2', fontWeight: 'bold' }}>Leave a Comment</Text>
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
      <TouchableOpacity onPress={toggleFavorite}>
        <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={28} color="#e74c3c" />
      </TouchableOpacity>
      <ProductStats productId={productId as string} />
      <SimilarProducts productId={productId as string} />
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