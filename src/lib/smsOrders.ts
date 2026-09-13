'use client';

export interface SmsOrderRecord {
  orderId: string;
  phoneNumber: string;
  country: string;
  countryFlag?: string;
  service: string;
  cost: number;
  server: 'server1' | 'server2';
  expiresAt: number; // timestamp in ms
  createdAt: number; // timestamp in ms
  reference: string;
  status: 'WAIT_CODE' | 'RECEIVED' | 'CANCELED' | 'EXPIRED';
  otpCode?: string | null;
}

const STORAGE_KEY = 'zuvapay_sms_orders_list';
const EVENT_NAME = 'zuvapay_sms_orders_updated';

/**
 * Retrieve all saved SMS orders, migrating any legacy keys if found.
 */
export function getSmsOrders(): SmsOrderRecord[] {
  if (typeof window === 'undefined') return [];

  let orders: SmsOrderRecord[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      orders = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse SMS orders:', e);
  }

  // Check for legacy individual keys: zuvapay_active_sms_*
  try {
    const existingIds = new Set(orders.map((o) => o.orderId));
    let hasMigration = false;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('zuvapay_active_sms_')) {
        const orderId = key.replace('zuvapay_active_sms_', '');
        if (!existingIds.has(orderId)) {
          const rawItem = localStorage.getItem(key);
          if (rawItem) {
            try {
              const parsed = JSON.parse(rawItem);
              orders.push({
                orderId: parsed.orderId || orderId,
                phoneNumber: parsed.phoneNumber || '',
                country: parsed.country || 'Unknown',
                service: parsed.service || 'Online Service',
                cost: parsed.cost || 0,
                server: parsed.server || 'server1',
                expiresAt: parsed.expiresAt || Date.now() + 15 * 60 * 1000,
                createdAt: parsed.createdAt || Date.now() - 60000,
                reference: parsed.reference || `REF-${orderId}`,
                status: parsed.status || (parsed.expiresAt && parsed.expiresAt < Date.now() ? 'EXPIRED' : 'WAIT_CODE'),
                otpCode: parsed.otpCode || null,
              });
              hasMigration = true;
            } catch {
              // ignore invalid items
            }
          }
        }
      }
    }

    if (hasMigration) {
      orders.sort((a, b) => b.createdAt - a.createdAt);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders.slice(0, 50)));
    }
  } catch {
    // ignore
  }

  return orders.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Save or update a single SMS order
 */
export function saveSmsOrder(order: SmsOrderRecord): void {
  if (typeof window === 'undefined') return;

  try {
    const current = getSmsOrders();
    const existingIndex = current.findIndex((o) => o.orderId === order.orderId);

    if (existingIndex >= 0) {
      current[existingIndex] = { ...current[existingIndex], ...order };
    } else {
      current.unshift(order);
    }

    const trimmed = current.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    sessionStorage.setItem(`zuvapay_active_sms_${order.orderId}`, JSON.stringify(order));
    localStorage.setItem(`zuvapay_active_sms_${order.orderId}`, JSON.stringify(order));

    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch (err) {
    console.error('Failed to save SMS order:', err);
  }
}

/**
 * Update the status, code, or details of an existing SMS order
 */
export function updateSmsOrderStatus(
  orderId: string,
  updates: Partial<SmsOrderRecord>
): SmsOrderRecord | null {
  if (typeof window === 'undefined') return null;

  try {
    const current = getSmsOrders();
    const index = current.findIndex((o) => o.orderId === orderId);

    if (index >= 0) {
      const updated = { ...current[index], ...updates };
      current[index] = updated;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      sessionStorage.setItem(`zuvapay_active_sms_${orderId}`, JSON.stringify(updated));
      localStorage.setItem(`zuvapay_active_sms_${orderId}`, JSON.stringify(updated));

      window.dispatchEvent(new CustomEvent(EVENT_NAME));
      return updated;
    }
  } catch (err) {
    console.error('Failed to update SMS order:', err);
  }

  return null;
}

/**
 * Get only orders that are currently waiting for code and have not timed out
 */
export function getActiveSmsOrders(): SmsOrderRecord[] {
  const orders = getSmsOrders();
  const now = Date.now();
  return orders.filter((o) => o.status === 'WAIT_CODE' && o.expiresAt > now);
}

/**
 * Find single SMS order by orderId
 */
export function getSmsOrderById(orderId: string): SmsOrderRecord | null {
  const orders = getSmsOrders();
  return orders.find((o) => o.orderId === orderId) || null;
}

/**
 * Listen for changes to SMS orders across windows / tabs / events
 */
export function subscribeSmsOrders(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = () => callback();
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || (e.key && e.key.startsWith('zuvapay_active_sms_'))) {
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
