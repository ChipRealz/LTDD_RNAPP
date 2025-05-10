import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCart } from '../context/CartContext';
import api from '../utils/api';

interface OrderResponse {
  success: boolean;
  message: string;
  order: {
    _id: string;
    orderStatus: string;
    totalAmount: number;
    orderCreatedAt: string;
    discount?: number;
  };
}

export default function OrderScreen() {
  const [loading, setLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    address: '',
    city: '',
    country: '',
    name: '',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [note, setNote] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [lastOrderTotal, setLastOrderTotal] = useState<number | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [usePoints, setUsePoints] = useState('');
  const [discountApplied, setDiscountApplied] = useState<number | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const { updateCartCount } = useCart();

  const handlePlaceOrder = async () => {
    // Check authentication first
    if (!global.authToken) {
      Alert.alert(
        'Authentication Required',
        'Please log in to place an order',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Log In',
            onPress: () => router.replace('/screens/AuthScreen'),
          },
        ]
      );
      return;
    }

    // Validate shipping info
    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.country || !shippingInfo.name || !shippingInfo.phone) {
      Alert.alert('Error', 'Please fill in all shipping information including name and phone number');
      return;
    }

    setLoading(true);
    try {
      console.log('=== Order Placement Debug ===');
      console.log('Auth Token:', global.authToken ? 'Present' : 'Missing');
      console.log('Request URL:', `${api.defaults.baseURL}/order`);
      console.log('Request Headers:', api.defaults.headers);
      console.log('Request Payload:', {
        paymentMethod,
        shippingInfo,
        note,
        promotionCode: promoCode || undefined,
        usePoints: usePoints ? Number(usePoints) : undefined,
      });

      const response = await api.post<OrderResponse>('/order', {
        paymentMethod,
        shippingInfo,
        note,
        promotionCode: promoCode || undefined,
        usePoints: usePoints ? Number(usePoints) : undefined,
      });

      console.log('Response Status:', response.status);
      console.log('Response Headers:', response.headers);
      console.log('Response Data:', response.data);
      console.log('=== End Debug ===');

      if (response.data.success) {
        await updateCartCount();
        setOrderSuccess(true);
        setLastOrderId(response.data.order._id);
        setLastOrderTotal(response.data.order.totalAmount);
        setDiscountApplied(response.data.order.discount || 0);
        setTimeout(() => {
          router.replace('/screens/HomeScreen');
        }, 5000);
      }
    } catch (error: any) {
      console.error('=== Order Placement Error Debug ===');
      console.error('Error Type:', error.name);
      console.error('Error Message:', error.message);
      console.error('Request Config:', error.config);
      console.error('Response Status:', error.response?.status);
      console.error('Response Headers:', error.response?.headers);
      console.error('Response Data:', error.response?.data);
      console.error('=== End Error Debug ===');

      if (error.response?.status === 401) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in again.',
          [
            {
              text: 'Log In',
              onPress: () => router.replace('/screens/AuthScreen'),
            },
          ]
        );
      } else if (error.response?.data?.message === 'Cart is empty') {
        Alert.alert(
          'Empty Cart',
          'Your cart is empty. Please add items before placing an order.',
          [
            {
              text: 'Continue Shopping',
              onPress: () => router.replace('/screens/HomeScreen'),
            },
          ]
        );
      } else if (error.response?.data?.message?.includes('Not enough stock')) {
        Alert.alert('Error', error.response.data.message);
        router.back();
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.message || 'Could not place order. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} scrollEnabled={!orderSuccess}>
      <View style={styles.header} pointerEvents={orderSuccess ? 'none' : 'auto'}>
        <TouchableOpacity onPress={() => router.back()} disabled={orderSuccess}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Place Order</Text>
        <View style={{ width: 28 }} />
      </View>
      <View style={styles.formContainer} pointerEvents={orderSuccess ? 'none' : 'auto'}>
        <Text style={styles.sectionTitle}>Shipping Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={shippingInfo.name}
            onChangeText={(text) => setShippingInfo(prev => ({ ...prev, name: text }))}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={shippingInfo.phone}
            onChangeText={(text) => setShippingInfo(prev => ({ ...prev, phone: text }))}
            placeholder="Enter your phone number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={shippingInfo.address}
            onChangeText={(text) => setShippingInfo(prev => ({ ...prev, address: text }))}
            placeholder="Enter your address"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={shippingInfo.city}
            onChangeText={(text) => setShippingInfo(prev => ({ ...prev, city: text }))}
            placeholder="Enter your city"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Country</Text>
          <TextInput
            style={styles.input}
            value={shippingInfo.country}
            onChangeText={(text) => setShippingInfo(prev => ({ ...prev, country: text }))}
            placeholder="Enter your country"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Note (Optional)</Text>
          <TextInput
            style={[styles.input, styles.noteInput]}
            value={note}
            onChangeText={setNote}
            placeholder="Add any special instructions"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />
        </View>

        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentOptions} pointerEvents={orderSuccess ? 'none' : 'auto'}>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'COD' && styles.paymentOptionSelected,
            ]}
            onPress={() => setPaymentMethod('COD')}
            disabled={orderSuccess}
          >
            <Ionicons
              name="cash-outline"
              size={24}
              color={paymentMethod === 'COD' ? '#fff' : '#4a90e2'}
            />
            <Text
              style={[
                styles.paymentOptionText,
                paymentMethod === 'COD' && styles.paymentOptionTextSelected,
              ]}
            >
              Cash on Delivery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'ONLINE' && styles.paymentOptionSelected,
            ]}
            onPress={() => setPaymentMethod('ONLINE')}
            disabled={orderSuccess}
          >
            <Ionicons
              name="card-outline"
              size={24}
              color={paymentMethod === 'ONLINE' ? '#fff' : '#4a90e2'}
            />
            <Text
              style={[
                styles.paymentOptionText,
                paymentMethod === 'ONLINE' && styles.paymentOptionTextSelected,
              ]}
            >
              Online Payment
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Promotion Code (Optional)</Text>
          <TextInput
            style={styles.input}
            value={promoCode}
            onChangeText={setPromoCode}
            placeholder="Enter promotion code"
            placeholderTextColor="#999"
            autoCapitalize="characters"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Points to Use (Optional)</Text>
          <TextInput
            style={styles.input}
            value={usePoints}
            onChangeText={setUsePoints}
            placeholder="Enter points"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            (loading || orderSuccess) && styles.placeOrderButtonDisabled,
          ]}
          onPress={handlePlaceOrder}
          disabled={loading || orderSuccess}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.placeOrderButtonText}>Place Order</Text>
          )}
        </TouchableOpacity>
      </View>
      {orderSuccess && (
        <View style={styles.successOverlay} pointerEvents="auto">
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" style={{ marginBottom: 16 }} />
            <Text style={styles.successTitle}>Order Placed!</Text>
            <Text style={styles.successText}>Your order has been placed successfully.</Text>
            <Text style={{ color: '#4a90e2', marginTop: 8 }}>
              {(discountApplied ?? 0) > 0 ? `Discount applied: $${discountApplied} | Final total: $${lastOrderTotal}` : `Total: $${lastOrderTotal}`}
            </Text>
            <Text style={[styles.successText, { marginTop: 16 }]}>You will be redirected to home shortly.</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  noteInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#4a90e2',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  paymentOptionSelected: {
    backgroundColor: '#4a90e2',
  },
  paymentOptionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: 'bold',
  },
  paymentOptionTextSelected: {
    color: '#fff',
  },
  placeOrderButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeOrderButtonDisabled: {
    opacity: 0.7,
  },
  placeOrderButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  successBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
}); 