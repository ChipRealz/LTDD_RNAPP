import { Stack } from "expo-router";
import { CartProvider } from './context/CartContext';

export default function RootLayout() {
  return (
    <CartProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="cart/index" options={{ headerShown: false }} />
        <Stack.Screen name="product-detail/[productId]" options={{ headerShown: false }} />
      </Stack>
    </CartProvider>
  );
}
