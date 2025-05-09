import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView } from 'react-native';
import api from '../utils/api';

const { width } = Dimensions.get('window');
const SLIDE_HEIGHT = 350;
const AUTO_PLAY_INTERVAL = 3000; // 3 seconds

export default function ProductSlideShow() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await api.get('/product');
        const imgs = res.data
          .map((p: any) => p.image)
          .filter((img: string | undefined) => !!img);
        setImages(imgs);
      } catch (e) {
        setImages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  // Auto-play effect
  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % images.length;
        scrollRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [images]);

  // Update currentIndex on manual scroll
  const handleScroll = (event: any) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(newIndex);
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      style={{ width, height: SLIDE_HEIGHT, backgroundColor: '#4a90e2' }}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      {images.map((img, idx) => (
        <Image
          key={idx}
          source={{ uri: img }}
          style={{ width, height: SLIDE_HEIGHT, resizeMode: 'cover' }}
        />
      ))}
    </ScrollView>
  );
} 