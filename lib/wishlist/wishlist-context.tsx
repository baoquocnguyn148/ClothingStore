'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { USE_SUPABASE } from '@/lib/config';
import { apiFetch } from '@/lib/api/client';

const STORAGE_KEY = 'bd-wishlist';

interface WishlistContextValue {
  handles: string[];
  count: number;
  isWishlisted: (handle: string) => boolean;
  toggle: (handle: string) => void;
  remove: (handle: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function loadLocal(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [handles, setHandles] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(async () => {
    if (USE_SUPABASE) {
      try {
        const data = await apiFetch<{ handles: string[] }>('/wishlist');
        setHandles(data.handles ?? []);
      } catch {
        setHandles(loadLocal());
      }
    } else {
      setHandles(loadLocal());
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setHydrated(true));
  }, [refresh]);

  useEffect(() => {
    if (hydrated && !USE_SUPABASE) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(handles));
    }
  }, [handles, hydrated]);

  const toggle = useCallback(
    async (handle: string) => {
      if (USE_SUPABASE) {
        try {
          const data = await apiFetch<{ handles: string[] }>('/wishlist', {
            method: 'POST',
            body: JSON.stringify({ productHandle: handle }),
          });
          setHandles(data.handles ?? []);
          return;
        } catch {
          // fallback local if not logged in
        }
      }
      setHandles((prev) =>
        prev.includes(handle) ? prev.filter((h) => h !== handle) : [...prev, handle]
      );
    },
    []
  );

  const remove = useCallback((handle: string) => {
    toggle(handle);
  }, [toggle]);

  const isWishlisted = useCallback(
    (handle: string) => handles.includes(handle),
    [handles]
  );

  const value = useMemo(
    () => ({
      handles,
      count: handles.length,
      isWishlisted,
      toggle,
      remove,
    }),
    [handles, isWishlisted, toggle, remove]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
