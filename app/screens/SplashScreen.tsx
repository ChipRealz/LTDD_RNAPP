import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

declare global {
  var authToken: string | undefined;
}

export default function SplashScreen() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(5); // Shorten for dev
  const [shouldNavigate, setShouldNavigate] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setShouldNavigate(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (shouldNavigate) {
      if (global.authToken) {
        router.replace('/screens/HomeScreen');
      } else {
        router.replace('/screens/AuthScreen');
      }
    }
  }, [shouldNavigate, router]);

  const handleSkip = () => {
    setShouldNavigate(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to E-commerce</Text>
        <Text style={styles.timer}>Auto redirect in {timeLeft}s</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  timer: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
  },
}); 