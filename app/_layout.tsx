import { Stack } from "expo-router";
import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';

export default function RootLayout() {
  return (
    <UserProvider>
      <CartProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="cart/index" options={{ headerShown: false }} />
          <Stack.Screen name="product-detail/[productId]" options={{ headerShown: false }} />
          <Stack.Screen name="order/index" options={{ headerShown: false }} />
        </Stack>
      </CartProvider>
    </UserProvider>
  );
}
