'use client';

export type SocialPlatform = 'youtube' | 'instagram' | 'facebook' | 'twitter' | 'tiktok' | 'telegram';

export interface SocialOrderRecord {
  orderId: string | number;
  reference: string;
  platform: SocialPlatform;
  category: string;
  serviceName: string;
  serviceId: number;
  link: string;
  quantity: number;
  price: number;
  createdAt: number;
  status: 'Pending' | 'In progress' | 'Processing' | 'Completed' | 'Partial' | 'Canceled' | 'Unknown';
  startCount?: string | number;
  remains?: string | number;
  charge?: string;
  lastCheckedAt?: number;
}

const STORAGE_KEY = 'zuvapay_social_orders_list';
const EVENT_NAME = 'zuvapay_social_orders_updated';

export function getSocialOrders(): SocialOrderRecord[] {
  if (typeof window === 'undefined') return [];

  let orders: SocialOrderRecord[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      orders = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse social orders:', e);
  }

  // Scan localStorage for any transactions with category 'social' that aren't yet in the list
  try {
    const existingRefs = new Set(orders.map((o) => o.reference));
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('zuvapay_txs_')) {
        const item = localStorage.getItem(k);
        if (item) {
          try {
            const txs = JSON.parse(item);
            if (Array.isArray(txs)) {
              for (const tx of txs) {
                if (tx.category === 'social' && tx.reference && !existingRefs.has(tx.reference)) {
                  const meta = tx.metadata || {};
                  orders.push({
                    orderId: meta.momoOrderId || `KP-${tx.reference}`,
                    reference: tx.reference,
                    platform: meta.platform || 'instagram',
                    category: meta.category || 'Social Boost',
                    serviceName: meta.serviceName || tx.description || 'Social Service',
                    serviceId: meta.serviceId || 101,
                    link: meta.targetLink || meta.link || 'https://instagram.com',
                    quantity: meta.quantity || 1000,
                    price: tx.amount || 0,
                    createdAt: new Date(tx.created_at || Date.now()).getTime(),
                    status: 'In progress',
                    remains: 0,
                  });
                  existingRefs.add(tx.reference);
                }
              }
            }
          } catch {}
        }
      }
    }
  } catch {}

  return orders.sort((a, b) => b.createdAt - a.createdAt);
}

export function saveSocialOrder(order: SocialOrderRecord): void {
  if (typeof window === 'undefined') return;

  try {
    const current = getSocialOrders();
    const existingIndex = current.findIndex(
      (o) => String(o.orderId) === String(order.orderId) || o.reference === order.reference
    );

    if (existingIndex >= 0) {
      current[existingIndex] = { ...current[existingIndex], ...order };
    } else {
      current.unshift(order);
    }

    const trimmed = current.slice(0, 100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch (err) {
    console.error('Failed to save social order:', err);
  }
}

export function updateSocialOrderStatus(
  orderId: string | number,
  updates: Partial<SocialOrderRecord>
): SocialOrderRecord | null {
  if (typeof window === 'undefined') return null;

  try {
    const current = getSocialOrders();
    const index = current.findIndex((o) => String(o.orderId) === String(orderId));

    if (index >= 0) {
      const updated = {
        ...current[index],
        ...updates,
        lastCheckedAt: Date.now(),
      };
      current[index] = updated;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      window.dispatchEvent(new CustomEvent(EVENT_NAME));
      return updated;
    }
  } catch (err) {
    console.error('Failed to update social order:', err);
  }

  return null;
}

export function getActiveSocialOrders(): SocialOrderRecord[] {
  const orders = getSocialOrders();
  return orders.filter(
    (o) =>
      o.status === 'Pending' ||
      o.status === 'In progress' ||
      o.status === 'Processing'
  );
}

export function subscribeSocialOrders(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = () => callback();
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener(EVENT_NAME, handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener(EVENT_NAME, handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
}
