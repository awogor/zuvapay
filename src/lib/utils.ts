import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-US').format(amount);
}

export function formatDate(dateInput: string | number | Date): string {
  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return new Intl.DateTimeFormat('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return String(dateInput);
  }
}

export function generateReference(prefix: string = 'KP'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Detect Nigerian Network Provider by phone prefix
 */
export function detectNetwork(phone: string): 'MTN' | 'Airtel' | 'Glo' | '9mobile' | null {
  const cleaned = phone.replace(/\D/g, '');
  let prefix = '';

  if (cleaned.startsWith('234')) {
    prefix = '0' + cleaned.substring(3, 6);
  } else if (cleaned.startsWith('0')) {
    prefix = cleaned.substring(0, 4);
  } else {
    prefix = '0' + cleaned.substring(0, 3);
  }

  const mtnPrefixes = [
    '0803', '0806', '0703', '0706', '0813', '0816', '0810', '0814', '0903', '0906', '0913', '0916', '0704', '0702'
  ];
  const airtelPrefixes = [
    '0802', '0808', '0708', '0812', '0701', '0902', '0901', '0907', '0912', '0911'
  ];
  const gloPrefixes = [
    '0805', '0807', '0705', '0815', '0811', '0905', '0915'
  ];
  const nineMobilePrefixes = [
    '0809', '0818', '0817', '0909', '0908'
  ];

  if (mtnPrefixes.includes(prefix)) return 'MTN';
  if (airtelPrefixes.includes(prefix)) return 'Airtel';
  if (gloPrefixes.includes(prefix)) return 'Glo';
  if (nineMobilePrefixes.includes(prefix)) return '9mobile';

  return null;
}
