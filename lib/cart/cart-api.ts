import type { CartLine } from '@/lib/commerce/types';
import { apiFetch } from '@/lib/api/client';

interface CartResponse {
  cartId: string;
  items: CartLine[];
  subtotal: number;
  itemCount: number;
}

export async function fetchCart(): Promise<CartResponse> {
  return apiFetch<CartResponse>('/cart');
}

export async function addToCartApi(variantId: string, quantity = 1) {
  return apiFetch<CartResponse>('/cart', {
    method: 'POST',
    body: JSON.stringify({ variantId, quantity }),
  });
}

export async function updateCartItemApi(cartItemId: string, quantity: number) {
  return apiFetch<{ items: CartLine[] }>('/cart', {
    method: 'PATCH',
    body: JSON.stringify({ cartItemId, quantity }),
  });
}

export async function removeCartItemApi(cartItemId: string) {
  return apiFetch<{ items: CartLine[] }>(`/cart?cartItemId=${cartItemId}`, {
    method: 'DELETE',
  });
}
