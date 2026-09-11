export type Currency = 'NGN' | 'USD';

export type TransactionType = 'credit' | 'debit';

export type TransactionStatus = 'pending' | 'completed' | 'failed';

export type TransactionCategory =
  | 'deposit'
  | 'transfer'
  | 'bill'
  | 'swap'
  | 'airtime'
  | 'data'
  | 'power'
  | 'cable'
  | 'sms'
  | 'social'
  | 'logs'
  | 'refund';

export type UserTitle = 'Mr' | 'Mrs' | 'Miss';
export type UserRole = 'admin' | 'customer';

export type UserStatus = 'active' | 'suspended' | 'blocked';

export interface UserProfile {
  id: string;
  role?: UserRole;
  status?: UserStatus;
  is_pin_set?: boolean;
  title?: UserTitle | string | null;
  username?: string | null;
  first_name: string;
  last_name: string;
  phone_number?: string | null;
  avatar_url?: string | null;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: Currency;
  created_at: string;
  updated_at: string;
}

export interface VirtualAccount {
  id?: string;
  user_id?: string;
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  account_reference: string;
  status: string;
  created_at?: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  description: string | null;
  reference: string;
  status: TransactionStatus;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  category: string;
  iconName: string;
  href: string;
  badge?: string;
  gradient: string;
}

// Gongoz Types
export interface NetworkProvider {
  id: string;
  name: 'MTN' | 'Airtel' | 'Glo' | '9mobile' | 'Smile' | string;
  color: string;
  logo: string;
  prefixes: string[];
}

export interface DataPlan {
  id: string;
  network: string;
  type: string;
  name: string;
  validity: string;
  price: number;
  dataAmount: string;
  gongozPlanId?: number;
}

export interface DiscoProvider {
  id: string;
  name: string;
  code: string;
  type: 'prepaid' | 'postpaid' | 'both';
}

export interface CableProvider {
  id: string;
  name: 'DSTV' | 'GOTV' | 'StarTimes' | 'Showmax';
  code: string;
  bouquets: {
    id: string;
    name: string;
    price: number;
  }[];
}

// GrizzlySMS Types
export interface SmsCountry {
  code: string;
  name: string;
  flag: string;
  cost: number; // in NGN or USD
}

export interface SmsService {
  id: string;
  name: string;
  icon: string;
  price: number;
  countAvailable: number;
}

export interface SmsActiveOrder {
  orderId: string;
  service: string;
  country: string;
  phoneNumber: string;
  status: 'WAIT_CODE' | 'RECEIVED' | 'CANCELED' | 'TIMEOUT';
  code?: string;
  expiresAt: number; // timestamp
  cost: number;
  reference: string;
}

// MomoPanel Social Types
export interface SocialService {
  serviceId: number;
  name: string;
  category: string;
  ratePer1000: number; // in NGN
  min: number;
  max: number;
  description?: string;
}

// Fadded Logs Marketplace Types
export interface AccountLogItem {
  id: string;
  category: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  features: string[];
  cleanDescription?: string;
  rawDescription?: string;
  mockCredentials?: {
    username: string;
    password?: string;
    twoFactor?: string;
    cookies?: string;
  };
}
