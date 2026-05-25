'use client';

import { CartProvider } from '@/lib/cart/cart-context';
import { WishlistProvider } from '@/lib/wishlist/wishlist-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <WishlistProvider>{children}</WishlistProvider>
    </CartProvider>
  );
}
