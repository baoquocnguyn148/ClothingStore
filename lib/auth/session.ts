export interface UserAddress {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  isDefault: boolean;
}

export interface MockOrder {
  id: string;
  date: string;
  status: 'pending' | 'shipping' | 'delivered' | 'cancelled';
  total: number;
  items: { title: string; quantity: number; price: number }[];
}

export interface MockUser {
  email: string;
  name: string;
  phone?: string;
  membershipTier?: 'standard' | 'silver' | 'gold';
  addresses: UserAddress[];
  orders: MockOrder[];
}

const SESSION_KEY = 'bd-user';

export function getSession(): MockUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as MockUser) : null;
  } catch {
    return null;
  }
}

export function setSession(user: MockUser): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function updateSession(partial: Partial<MockUser>): MockUser | null {
  const current = getSession();
  if (!current) return null;
  const updated = { ...current, ...partial };
  setSession(updated);
  return updated;
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function createDefaultUser(
  email: string,
  name: string,
  phone?: string
): MockUser {
  return {
    email,
    name,
    phone: phone ?? '',
    membershipTier: 'standard',
    addresses: [],
    orders: [],
  };
}
