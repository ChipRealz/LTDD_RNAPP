import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type NavBarActive = 'home' | 'orders' | 'review' | 'favorites' | 'recently' | 'notification' | 'chatbot';
export default function BottomNavBar({ active }: { active: NavBarActive }) {
  const router = useRouter();
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => router.replace('/screens/HomeScreen')}
      >
        <Ionicons name="home" size={24} color={active === 'home' ? '#4a90e2' : '#888'} />
        <Text style={[styles.navText, active === 'home' && { color: '#4a90e2', fontWeight: 'bold' }]}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => router.replace('/order-history')}
      >
        <Ionicons name="list" size={24} color={active === 'orders' ? '#4a90e2' : '#888'} />
        <Text style={[styles.navText, active === 'orders' && { color: '#4a90e2', fontWeight: 'bold' }]}>Orders</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navButton}
        // @ts-ignore
        onPress={() => router.replace('/favorites')}
      >
        <Ionicons name="heart" size={24} color={active === 'favorites' ? '#e74c3c' : '#888'} />
        <Text style={[styles.navText, active === 'favorites' && { color: '#e74c3c', fontWeight: 'bold' }]}>Favorites</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navButton}
        // @ts-ignore
        onPress={() => router.replace('/recently-viewed')}
      >
        <Ionicons name="time" size={24} color={active === 'recently' ? '#4a90e2' : '#888'} />
        <Text style={[styles.navText, active === 'recently' && { color: '#4a90e2', fontWeight: 'bold' }]}>Recent</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navButton}  
        // @ts-ignore 
        onPress={() => router.replace('/review-product')}
      >
        <Ionicons name="star" size={24} color={active === 'review' ? '#4a90e2' : '#888'} />
        <Text style={[styles.navText, active === 'review' && { color: '#4a90e2', fontWeight: 'bold' }]}>Review</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navButton} 
      // @ts-ignore 
      onPress={() => router.replace('/notification')}>
        <Ionicons name="notifications-outline" size={28} color={active === 'notification' ? '#4a90e2' : '#888'} />
        <Text style={[styles.navText, active === 'notification' && { color: '#4a90e2', fontWeight: 'bold' }]}>Noti</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navButton} 
      // @ts-ignore
      onPress={() => router.push('/chatbot')}>
        <Ionicons name="chatbubble-ellipses-outline" size={28} color={active === 'chatbot' ? '#4a90e2' : '#888'} />
        <Text style={[styles.navText, active === 'chatbot' && { color: '#4a90e2', fontWeight: 'bold' }]}>Chatbot</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  activeLabel: {
    fontWeight: 'bold',
  },
}); 