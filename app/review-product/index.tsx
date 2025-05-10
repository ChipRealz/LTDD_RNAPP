import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import api from '../utils/api';

interface Product {
  _id: string;
  name?: string;
}
interface OrderItem {
  productId: Product | string;
}
interface Order {
  status: string;
  items: OrderItem[];
}
interface Review {
  productId: Product | string;
}

export default function ReviewProductScreen() {
  const [eligibleProducts, setEligibleProducts] = useState<(Product | string)[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch delivered products not yet reviewed
    const fetchEligible = async () => {
      setLoading(true);
      try {
        const ordersRes = await api.get('/order/my-orders');
        let reviewedProductIds: string[] = [];
        try {
          const reviewsRes = await api.get('/review/my-reviews');
          reviewedProductIds = (reviewsRes.data as Review[]).map((r: Review) =>
            typeof r.productId === 'object' ? (r.productId as Product)._id : r.productId
          );
        } catch {}
        const deliveredItems: (Product | string)[] = [];
        (ordersRes.data.orders as Order[]).forEach((order: Order) => {
          if (order.status === 'Delivered' || order.status === 'DELIVERED') {
            order.items.forEach((item: OrderItem) => {
              const prodId = typeof item.productId === 'object' ? (item.productId as Product)._id : item.productId;
              if (!reviewedProductIds.includes(prodId)) {
                deliveredItems.push(item.productId); // If not populated, you may need to fetch product details
              }
            });
          }
        });
        // Debug logging
        console.log('Orders:', ordersRes.data.orders);
        console.log('Reviewed product IDs:', reviewedProductIds);
        console.log('Delivered items:', deliveredItems);
        setEligibleProducts(deliveredItems);
      } catch (e) {
        Alert.alert('Error', 'Could not fetch eligible products');
      } finally {
        setLoading(false);
      }
    };
    fetchEligible();
  }, []);

  const submitReview = async () => {
    if (!selectedProduct) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/review/${typeof selectedProduct === 'object' ? selectedProduct._id : selectedProduct}`, { rating, comment });
      Alert.alert('Thank you!', 'Your review has been submitted.');
      setSelectedProduct(null);
      setComment('');
      setRating(5);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 16 }}>Review a Product</Text>
        {!selectedProduct ? (
          <>
            <Text>Select a product to review:</Text>
            {eligibleProducts.length === 0 ? (
              <Text style={{ marginTop: 16 }}>No products available for review.</Text>
            ) : (
              eligibleProducts.map((product: Product | string) => (
                <TouchableOpacity
                  key={typeof product === 'object' ? product._id : product}
                  style={{
                    padding: 12,
                    backgroundColor: '#f9f9f9',
                    borderRadius: 8,
                    marginVertical: 8,
                  }}
                  onPress={() => setSelectedProduct(product)}
                >
                  <Text style={{ fontWeight: 'bold' }}>{typeof product === 'object' ? product.name : product}</Text>
                </TouchableOpacity>
              ))
            )}
          </>
        ) : (
          <View>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{typeof selectedProduct === 'object' ? selectedProduct.name : selectedProduct}</Text>
            <Text>Rating:</Text>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              {[1,2,3,4,5].map(num => (
                <TouchableOpacity key={num} onPress={() => setRating(num)} disabled={submitting}>
                  <Text style={{ fontSize: 24, color: num <= rating ? '#f9a825' : '#ccc' }}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Your comment"
              style={{ backgroundColor: '#fff', borderRadius: 8, padding: 8, marginBottom: 8, minHeight: 40 }}
              editable={!submitting}
            />
            <TouchableOpacity
              onPress={submitReview}
              style={{
                backgroundColor: '#4a90e2',
                borderRadius: 8,
                padding: 12,
                alignItems: 'center',
                opacity: submitting ? 0.6 : 1,
                marginBottom: 8,
              }}
              disabled={submitting}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedProduct(null)}>
              <Text style={{ color: '#4a90e2', textAlign: 'center' }}>Back to product list</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <BottomNavBar active="review" />
    </View>
  );
} 