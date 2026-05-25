'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { CartLine } from '@/lib/commerce/types';
import { USE_SUPABASE } from '@/lib/config';
import {
  fetchCart,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
} from './cart-api';

const STORAGE_KEY = 'bd-cart';

interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addLine: (line: Omit<CartLine, 'quantity' | 'cartItemId'> & { quantity?: number }) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeLine: (variantId: string) => void;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadLocalCart(): CartLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

function mapApiItems(
  items: Array<CartLine & { id?: string }>
): CartLine[] {
  return items.map((item) => ({
    cartItemId: item.cartItemId ?? item.id,
    variantId: item.variantId,
    productHandle: item.productHandle,
    title: item.title,
    size: item.size,
    color: item.color,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
  }));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!USE_SUPABASE) return;
    try {
      const data = await fetchCart();
      setLines(mapApiItems(data.items as Array<CartLine & { id?: string }>));
    } catch {
      // API unavailable  Ekeep local state
    }
  }, []);

  useEffect(() => {
    if (USE_SUPABASE) {
      refreshCart().finally(() => setHydrated(true));
    } else {
      setLines(loadLocalCart());
      setHydrated(true);
    }
  }, [refreshCart]);

  useEffect(() => {
    if (hydrated && !USE_SUPABASE) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    }
  }, [lines, hydrated]);

  const addLine = useCallback(
    async (line: Omit<CartLine, 'quantity' | 'cartItemId'> & { quantity?: number }) => {
      if (USE_SUPABASE) {
        try {
          const data = await addToCartApi(line.variantId, line.quantity ?? 1);
          setLines(mapApiItems(data.items as Array<CartLine & { id?: string }>));
          setIsOpen(true);
          return;
        } catch {
          // fallback local
        }
      }
      setLines((prev) => {
        const existing = prev.find((l) => l.variantId === line.variantId);
        if (existing) {
          return prev.map((l) =>
            l.variantId === line.variantId
              ? { ...l, quantity: l.quantity + (line.quantity ?? 1) }
              : l
          );
        }
        return [...prev, { ...line, quantity: line.quantity ?? 1 }];
      });
      setIsOpen(true);
    },
    []
  );

  const updateQuantity = useCallback(
    async (variantId: string, quantity: number) => {
      const item = lines.find((l) => l.variantId === variantId);
      if (USE_SUPABASE && item?.cartItemId) {
        try {
          const data = await updateCartItemApi(item.cartItemId, quantity);
          setLines(mapApiItems(data.items as Array<CartLine & { id?: string }>));
          return;
        } catch {
          // fallback
        }
      }
      if (quantity <= 0) {
        setLines((prev) => prev.filter((l) => l.variantId !== variantId));
        return;
      }
      setLines((prev) =>
        prev.map((l) => (l.variantId === variantId ? { ...l, quantity } : l))
      );
    },
    [lines]
  );

  const removeLine = useCallback(
    async (variantId: string) => {
      const item = lines.find((l) => l.variantId === variantId);
      if (USE_SUPABASE && item?.cartItemId) {
        try {
          const data = await removeCartItemApi(item.cartItemId);
          setLines(mapApiItems(data.items as Array<CartLine & { id?: string }>));
          return;
        } catch {
          // fallback
        }
      }
      setLines((prev) => prev.filter((l) => l.variantId !== variantId));
    },
    [lines]
  );

  const clearCart = useCallback(() => setLines([]), []);

  const itemCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines]
  );

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    [lines]
  );

  const value = useMemo(
    () => ({
      lines,
      itemCount,
      subtotal,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addLine,
      updateQuantity,
      removeLine,
      clearCart,
      refreshCart,
    }),
    [lines, itemCount, subtotal, isOpen, addLine, updateQuantity, removeLine, clearCart, refreshCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
