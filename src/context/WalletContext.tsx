'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './AuthContext';
import { Wallet, Transaction, TransactionCategory } from '@/types';
import { generateReference, formatNaira, formatUSD } from '@/lib/utils';
import { TransactionPinModal, PinPromptDetails } from '@/components/modals/TransactionPinModal';
import { PinSetupModal } from '@/components/modals/PinSetupModal';

interface PayBillParams {
  amount: number;
  category: TransactionCategory;
  description: string;
  metadata?: Record<string, any>;
}

interface PayBillResult {
  success: boolean;
  reference?: string;
  error?: string;
  transaction?: Transaction;
}

interface RefundBillParams {
  amount: number;
  title: string;
  reason: string;
  originalReference?: string;
}

interface WalletContextType {
  wallet: Wallet | null;
  usdBalance: number;
  transactions: Transaction[];
  loading: boolean;
  activeReceipt: Transaction | null;
  openReceipt: (transaction: Transaction) => void;
  closeReceipt: () => void;
  isFundModalOpen: boolean;
  openFundModal: () => void;
  closeFundModal: () => void;
  isBalanceHidden: boolean;
  toggleBalanceHidden: () => void;
  formatBalance: (amount?: number | null, currency?: 'NGN' | 'USD') => string;
  payBill: (params: PayBillParams) => Promise<PayBillResult>;
  refundBill: (params: RefundBillParams) => Promise<{ success: boolean; error?: string }>;
  fundWallet: (amount: number, method?: string) => Promise<{ success: boolean; error?: string }>;
  swapCurrency: (from: 'NGN' | 'USD', to: 'NGN' | 'USD', amount: number, rate: number) => Promise<{ success: boolean; error?: string }>;
  refreshWallet: () => Promise<void>;
  recordManualAdjustment: (params: {
    walletId: string;
    amount: number;
    action: 'credit' | 'debit';
    reason?: string;
    reference?: string;
    newBalance?: number;
  }) => Promise<void>;
  requestPinAuthorization: (details: PinPromptDetails) => Promise<boolean>;
  openPinSetupModal: () => void;
  exchangeRate: number; // NGN per USD, e.g. 1550
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const NGN_USD_RATE = 1550; // Current standard bank rate

const INITIAL_DEMO_TRANSACTIONS: Transaction[] = [];

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user, isMockMode } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [usdBalance, setUsdBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);

  // Transaction PIN verification modal state
  const [pinModalState, setPinModalState] = useState<{
    isOpen: boolean;
    details: PinPromptDetails | null;
    resolver: ((authorized: boolean) => void) | null;
  }>({
    isOpen: false,
    details: null,
    resolver: null,
  });

  const [isPinSetupModalOpen, setIsPinSetupModalOpen] = useState(false);

  const requestPinAuthorization = useCallback((details: PinPromptDetails): Promise<boolean> => {
    return new Promise((resolve) => {
      setPinModalState({
        isOpen: true,
        details,
        resolver: resolve,
      });
    });
  }, []);

  const handlePinSuccess = useCallback(() => {
    setPinModalState((prev) => {
      if (prev.resolver) prev.resolver(true);
      return { isOpen: false, details: null, resolver: null };
    });
  }, []);

  const handlePinCancel = useCallback(() => {
    setPinModalState((prev) => {
      if (prev.resolver) prev.resolver(false);
      return { isOpen: false, details: null, resolver: null };
    });
  }, []);

  const handleNeedSetupPin = useCallback(() => {
    setPinModalState((prev) => {
      if (prev.resolver) prev.resolver(false);
      return { isOpen: false, details: null, resolver: null };
    });
    setIsPinSetupModalOpen(true);
  }, []);

  // Global persistent hidden balance state across all views and page refreshes
  // Initialized to false to guarantee identical server and initial client render (prevents Next.js hydration mismatch)
  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(false);

  const toggleBalanceHidden = useCallback(() => {
    setIsBalanceHidden((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('zuvapay_hide_balance', String(next));
          window.dispatchEvent(new Event('zuvapay_balance_hidden_changed'));
        } catch (e) {
          console.warn('Failed to save hide balance state', e);
        }
      }
      return next;
    });
  }, []);

  useEffect(() => {
    // Read persisted preference on client mount
    try {
      const stored = localStorage.getItem('zuvapay_hide_balance');
      if (stored !== null) {
        setIsBalanceHidden(stored === 'true');
      }
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'zuvapay_hide_balance') {
        setIsBalanceHidden(e.newValue === 'true');
      }
    };
    const handleCustom = () => {
      try {
        const stored = localStorage.getItem('zuvapay_hide_balance');
        setIsBalanceHidden(stored === 'true');
      } catch {}
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
      window.addEventListener('zuvapay_balance_hidden_changed', handleCustom);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener('zuvapay_balance_hidden_changed', handleCustom);
      }
    };
  }, []);

  const formatBalance = useCallback(
    (amount?: number | null, currency: 'NGN' | 'USD' = 'NGN') => {
      if (isBalanceHidden) {
        return currency === 'USD' ? '$ ••••' : '₦ ••••••••';
      }
      const val =
        amount !== undefined && amount !== null
          ? amount
          : currency === 'USD'
          ? usdBalance
          : wallet?.balance || 0;
      return currency === 'USD' ? formatUSD(val) : formatNaira(val);
    },
    [isBalanceHidden, usdBalance, wallet?.balance]
  );

  const openReceipt = useCallback((transaction: Transaction) => {
    setActiveReceipt(transaction);
  }, []);

  const closeReceipt = useCallback(() => {
    setActiveReceipt(null);
  }, []);

  const openFundModal = useCallback(() => {
    setIsFundModalOpen(true);
  }, []);

  const closeFundModal = useCallback(() => {
    setIsFundModalOpen(false);
  }, []);

  // Fetch or init wallet data
  const refreshWallet = useCallback(async () => {
    if (!user) {
      setWallet(null);
      setTransactions([]);
      setLoading(false);
      return;
    }

    if (isMockMode) {
      // Local demo wallet
      const savedWallet = localStorage.getItem(`zuvapay_wallet_${user.id}`);
      const savedTxs = localStorage.getItem(`zuvapay_txs_${user.id}`);
      const savedUsd = localStorage.getItem(`zuvapay_usd_${user.id}`);

      if (savedWallet) {
        setWallet(JSON.parse(savedWallet));
      } else {
        const defaultWallet: Wallet = {
          id: 'mock-wallet-' + user.id,
          user_id: user.id,
          balance: 0.00,
          currency: 'NGN',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setWallet(defaultWallet);
        localStorage.setItem(`zuvapay_wallet_${user.id}`, JSON.stringify(defaultWallet));
      }

      if (savedTxs) {
        setTransactions(JSON.parse(savedTxs));
      } else {
        setTransactions(INITIAL_DEMO_TRANSACTIONS);
        localStorage.setItem(`zuvapay_txs_${user.id}`, JSON.stringify(INITIAL_DEMO_TRANSACTIONS));
      }

      if (savedUsd) {
        setUsdBalance(parseFloat(savedUsd));
      } else {
        setUsdBalance(0.00);
        localStorage.setItem(`zuvapay_usd_${user.id}`, '0.00');
      }

      setLoading(false);
      return;
    }

    try {
      // 1. First fetch via server API to guarantee correct balance without client RLS propagation delay
      const apiRes = await fetch('/api/user/wallet').catch(() => null);
      if (apiRes && apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData.wallet) {
          setWallet(apiData.wallet);
          if (apiData.transactions) {
            setTransactions(apiData.transactions);
          }
          setLoading(false);
          return;
        }
      }

      // 2. Fallback to direct client-side Supabase query
      let { data: walletData } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .eq('currency', 'NGN')
        .maybeSingle();

      if (walletData) {
        setWallet({
          ...walletData,
          balance: parseFloat(walletData.balance),
        });
      }

      // Fetch transactions
      if (walletData?.id) {
        const { data: txData } = await supabase
          .from('transactions')
          .select('*')
          .eq('wallet_id', walletData.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (txData) {
          setTransactions(
            txData.map((t: any) => ({
              ...t,
              amount: parseFloat(t.amount),
            }))
          );
        }
      }
    } catch (err) {
      console.error('Failed to fetch wallet / transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isMockMode, supabase]);

  // Set up real-time listener on public.wallets and public.transactions
  useEffect(() => {
    refreshWallet();

    const handleSync = () => {
      refreshWallet();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleSync);
      window.addEventListener('zuvapay_wallet_updated', handleSync);
    }

    if (!user || isMockMode) {
      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('storage', handleSync);
          window.removeEventListener('zuvapay_wallet_updated', handleSync);
        }
      };
    }

    // Realtime channel for instant synchronization across web and mobile
    const channel = supabase
      .channel(`wallet-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallets',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new && (payload.new as any).balance !== undefined) {
            setWallet((prev) =>
              prev
                ? {
                    ...prev,
                    balance: parseFloat((payload.new as any).balance),
                    updated_at: (payload.new as any).updated_at,
                  }
                : null
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
        },
        (payload) => {
          const newTx = payload.new as any;
          if (wallet && newTx.wallet_id === wallet.id) {
            setTransactions((prev) => [
              { ...newTx, amount: parseFloat(newTx.amount) },
              ...prev,
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleSync);
        window.removeEventListener('zuvapay_wallet_updated', handleSync);
      }
      supabase.removeChannel(channel);
    };
  }, [user, isMockMode, supabase, refreshWallet]);

  /**
   * CRITICAL SECURITY FLOW: "Debit First, Fulfill Second"
   * Deducts funds from public.wallets and inserts debit into public.transactions.
   */
  const payBill = async ({
    amount,
    category,
    description,
    metadata,
  }: PayBillParams): Promise<PayBillResult> => {
    if (!wallet) {
      return { success: false, error: 'Wallet not found' };
    }

    // 1. Pre-flight Balance Check
    if (wallet.balance < amount) {
      return {
        success: false,
        error: `Insufficient wallet balance. You have ₦${wallet.balance.toLocaleString()} but need ₦${amount.toLocaleString()}. Please fund your wallet.`,
      };
    }

    // 2. MANDATORY TRANSACTION PIN AUTHORIZATION
    const isAuthorized = await requestPinAuthorization({
      title: `${category.toUpperCase()} Payment`,
      category,
      amount,
      currency: 'NGN',
      description,
    });

    if (!isAuthorized) {
      return {
        success: false,
        error: 'Transaction cancelled by user or PIN authorization failed.',
      };
    }

    const reference = generateReference(`KP-${category.substring(0, 3).toUpperCase()}`);

    if (isMockMode) {
      const newBalance = wallet.balance - amount;
      const updatedWallet: Wallet = {
        ...wallet,
        balance: newBalance,
        updated_at: new Date().toISOString(),
      };
      const newTx: Transaction = {
        id: 'tx-' + Date.now(),
        wallet_id: wallet.id,
        amount,
        type: 'debit',
        category,
        description,
        reference,
        status: 'completed',
        created_at: new Date().toISOString(),
        metadata,
      };

      setWallet(updatedWallet);
      const updatedTxs = [newTx, ...transactions];
      setTransactions(updatedTxs);

      if (user) {
        localStorage.setItem(`zuvapay_wallet_${user.id}`, JSON.stringify(updatedWallet));
        localStorage.setItem(`zuvapay_txs_${user.id}`, JSON.stringify(updatedTxs));
      }

      return {
        success: true,
        reference,
        transaction: newTx,
      };
    }

    // Real Supabase RPC debit execution
    try {
      const { data, error } = await supabase.rpc('debit_wallet_for_bill', {
        p_wallet_id: wallet.id,
        p_amount: amount,
        p_category: category,
        p_description: description,
        p_reference: reference,
        p_metadata: metadata || {},
      });

      if (error) {
        // Fallback to direct table updates if RPC not yet created in Supabase
        const newBalance = wallet.balance - amount;
        const { error: updateErr } = await supabase
          .from('wallets')
          .update({ balance: newBalance, updated_at: new Date().toISOString() })
          .eq('id', wallet.id);

        if (updateErr) throw updateErr;

        const { data: createdTx, error: txErr } = await supabase
          .from('transactions')
          .insert({
            wallet_id: wallet.id,
            amount,
            type: 'debit',
            category,
            description,
            reference,
            status: 'completed',
          })
          .select()
          .single();

        if (txErr) throw txErr;

        const txObject: Transaction = {
          ...createdTx,
          amount: parseFloat(createdTx.amount),
          metadata,
        };

        setWallet((prev) => (prev ? { ...prev, balance: newBalance } : null));
        setTransactions((prev) => [txObject, ...prev]);

        return {
          success: true,
          reference,
          transaction: txObject,
        };
      }

      if (!data.success) {
        return { success: false, error: data.error || 'Failed to debit wallet' };
      }

      const txObject: Transaction = {
        id: data.transaction_id,
        wallet_id: wallet.id,
        amount,
        type: 'debit',
        category,
        description,
        reference,
        status: 'completed',
        created_at: new Date().toISOString(),
        metadata,
      };

      setWallet((prev) => (prev ? { ...prev, balance: data.new_balance } : null));
      setTransactions((prev) => [txObject, ...prev]);

      return {
        success: true,
        reference,
        transaction: txObject,
      };
    } catch (err: any) {
      console.error('payBill error:', err);
      return { success: false, error: err.message || 'Payment transaction failed' };
    }
  };

  /**
   * AUTOMATED REFUND ON FAILURE:
   * Credits the wallet back and logs a refund credit record in public.transactions.
   */
  const refundBill = async ({
    amount,
    title,
    reason,
    originalReference,
  }: RefundBillParams): Promise<{ success: boolean; error?: string }> => {
    if (!wallet) return { success: false, error: 'Wallet not found' };

    const refundReference = generateReference('KP-REF');
    const cleanReason = reason
      ? reason
          .replace(/https?:\/\/[^\s)]+/g, '')
          .replace(/smspool\.net|smspool|grizzlysms|grizzly|momo|fadded|gongoz/gi, 'provider')
          .replace(/\s+/g, ' ')
          .trim()
      : 'Service Unfulfilled';

    // 1. Strict Idempotency Guard: Prevent duplicate refunds for the same original bill
    if (originalReference) {
      if (isMockMode) {
        const alreadyRefunded = transactions.some(
          (t) =>
            t.type === 'credit' &&
            (t.metadata?.original_reference === originalReference ||
              (t.description && t.description.includes(originalReference)))
        );
        if (alreadyRefunded) {
          console.warn(`[refundBill] Original reference ${originalReference} was already refunded. Skipping duplicate credit.`);
          return { success: true };
        }
      } else {
        const { data: existingRefund } = await supabase
          .from('transactions')
          .select('id')
          .eq('wallet_id', wallet.id)
          .eq('type', 'credit')
          .or(`description.ilike.%${originalReference}%,metadata->>original_reference.eq.${originalReference}`)
          .limit(1);

        if (existingRefund && existingRefund.length > 0) {
          console.warn(`[refundBill] Original reference ${originalReference} was already refunded in database. Skipping duplicate credit.`);
          return { success: true };
        }
      }
    }

    const description = `Refund: ${title} (${cleanReason})${
      originalReference ? ` [Ref: ${originalReference}]` : ''
    }`;

    if (isMockMode) {
      const newBalance = wallet.balance + amount;
      const updatedWallet: Wallet = {
        ...wallet,
        balance: newBalance,
        updated_at: new Date().toISOString(),
      };
      const refundTx: Transaction = {
        id: 'tx-ref-' + Date.now(),
        wallet_id: wallet.id,
        amount,
        type: 'credit',
        category: 'refund',
        description,
        reference: refundReference,
        status: 'completed',
        created_at: new Date().toISOString(),
      };

      setWallet(updatedWallet);
      const updatedTxs = [refundTx, ...transactions];
      setTransactions(updatedTxs);

      if (user) {
        localStorage.setItem(`zuvapay_wallet_${user.id}`, JSON.stringify(updatedWallet));
        localStorage.setItem(`zuvapay_txs_${user.id}`, JSON.stringify(updatedTxs));
      }

      return { success: true };
    }

    try {
      const { data, error } = await supabase.rpc('refund_wallet_for_bill', {
        p_wallet_id: wallet.id,
        p_amount: amount,
        p_category: 'refund',
        p_description: description,
        p_reference: refundReference,
        p_metadata: {
          original_reference: originalReference,
          refund_reason: cleanReason,
        },
      });

      if (error) {
        // Fallback direct table update
        const newBalance = wallet.balance + amount;
        await supabase
          .from('wallets')
          .update({ balance: newBalance, updated_at: new Date().toISOString() })
          .eq('id', wallet.id);

        const { data: createdTx } = await supabase
          .from('transactions')
          .insert({
            wallet_id: wallet.id,
            amount,
            type: 'credit',
            category: 'refund',
            description,
            reference: refundReference,
            status: 'completed',
          })
          .select()
          .single();

        setWallet((prev) => (prev ? { ...prev, balance: newBalance } : null));
        if (createdTx) {
          setTransactions((prev) => [
            { ...createdTx, amount: parseFloat(createdTx.amount) },
            ...prev,
          ]);
        }
        return { success: true };
      }

      // Mark the original debit transaction as failed/reversed in Supabase and state
      if (originalReference) {
        try {
          await supabase
            .from('transactions')
            .update({
              status: 'failed',
              metadata: {
                refunded: true,
                refund_reason: cleanReason,
                refund_reference: refundReference,
              },
            })
            .eq('reference', originalReference);
        } catch (updateErr: any) {
          console.warn('[refundBill] Could not update original tx status:', updateErr?.message);
        }
      }

      setWallet((prev) => (prev ? { ...prev, balance: data.new_balance } : null));
      await refreshWallet();
      return { success: true };
    } catch (err: any) {
      console.error('refundBill error:', err);
      return { success: false, error: err.message || 'Refund execution failed' };
    }
  };

  /**
   * Instant wallet funding
   */
  const fundWallet = async (
    amount: number,
    method: string = 'Instant Bank Transfer'
  ): Promise<{ success: boolean; error?: string }> => {
    if (!wallet) return { success: false, error: 'Wallet not found' };

    const ref = generateReference('KP-DEP');
    const description = `Wallet Deposit via ${method}`;

    if (isMockMode) {
      const newBalance = wallet.balance + amount;
      const updatedWallet: Wallet = {
        ...wallet,
        balance: newBalance,
        updated_at: new Date().toISOString(),
      };
      const depositTx: Transaction = {
        id: 'tx-fund-' + Date.now(),
        wallet_id: wallet.id,
        amount,
        type: 'credit',
        category: 'deposit',
        description,
        reference: ref,
        status: 'completed',
        created_at: new Date().toISOString(),
      };

      setWallet(updatedWallet);
      const updatedTxs = [depositTx, ...transactions];
      setTransactions(updatedTxs);

      if (user) {
        localStorage.setItem(`zuvapay_wallet_${user.id}`, JSON.stringify(updatedWallet));
        localStorage.setItem(`zuvapay_txs_${user.id}`, JSON.stringify(updatedTxs));
      }

      return { success: true };
    }

    try {
      const newBalance = wallet.balance + amount;
      await supabase
        .from('wallets')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', wallet.id);

      const { data: createdTx } = await supabase
        .from('transactions')
        .insert({
          wallet_id: wallet.id,
          amount,
          type: 'credit',
          category: 'deposit',
          description,
          reference: ref,
          status: 'completed',
        })
        .select()
        .single();

      setWallet((prev) => (prev ? { ...prev, balance: newBalance } : null));
      if (createdTx) {
        setTransactions((prev) => [
          { ...createdTx, amount: parseFloat(createdTx.amount) },
          ...prev,
        ]);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Deposit failed' };
    }
  };

  /**
   * Quick Currency Swap Tool (NGN <-> USD)
   */
  const swapCurrency = async (
    from: 'NGN' | 'USD',
    to: 'NGN' | 'USD',
    amount: number,
    rate: number = NGN_USD_RATE
  ): Promise<{ success: boolean; error?: string }> => {
    if (!wallet) return { success: false, error: 'Wallet not found' };

    if (from === 'NGN' && to === 'USD' && wallet.balance < amount) {
      return { success: false, error: 'Insufficient NGN balance for swap' };
    }
    if (from === 'USD' && to === 'NGN' && usdBalance < amount) {
      return { success: false, error: 'Insufficient USD balance for swap' };
    }

    // MANDATORY TRANSACTION PIN AUTHORIZATION
    const isAuthorized = await requestPinAuthorization({
      title: 'Currency Swap Authorization',
      category: 'Currency Swap',
      amount,
      currency: from,
      description: `Swap ${from === 'NGN' ? formatNaira(amount) : formatUSD(amount)} to ${to}`,
    });

    if (!isAuthorized) {
      return { success: false, error: 'Swap cancelled by user or PIN authorization failed.' };
    }

    if (from === 'NGN' && to === 'USD') {
      const receivedUSD = Number((amount / rate).toFixed(2));
      const newNgn = wallet.balance - amount;
      const newUsd = usdBalance + receivedUSD;

      setWallet((prev) => (prev ? { ...prev, balance: newNgn } : null));
      setUsdBalance(newUsd);

      const ref = generateReference('KP-SWP');
      const swapTx: Transaction = {
        id: 'tx-swap-' + Date.now(),
        wallet_id: wallet.id,
        amount,
        type: 'debit',
        category: 'swap',
        description: `Swapped ₦${amount.toLocaleString()} for $${receivedUSD} USD (Rate: ₦${rate}/$)`,
        reference: ref,
        status: 'completed',
        created_at: new Date().toISOString(),
      };

      setTransactions((prev) => [swapTx, ...prev]);

      if (user && isMockMode) {
        localStorage.setItem(`zuvapay_wallet_${user.id}`, JSON.stringify({ ...wallet, balance: newNgn }));
        localStorage.setItem(`zuvapay_usd_${user.id}`, newUsd.toString());
      }

      return { success: true };
    } else if (from === 'USD' && to === 'NGN') {
      if (usdBalance < amount) {
        return { success: false, error: 'Insufficient USD balance for swap' };
      }
      const receivedNGN = Number((amount * rate).toFixed(2));
      const newUsd = usdBalance - amount;
      const newNgn = wallet.balance + receivedNGN;

      setWallet((prev) => (prev ? { ...prev, balance: newNgn } : null));
      setUsdBalance(newUsd);

      const ref = generateReference('KP-SWP');
      const swapTx: Transaction = {
        id: 'tx-swap-' + Date.now(),
        wallet_id: wallet.id,
        amount: receivedNGN,
        type: 'credit',
        category: 'swap',
        description: `Swapped $${amount} USD for ₦${receivedNGN.toLocaleString()} (Rate: ₦${rate}/$)`,
        reference: ref,
        status: 'completed',
        created_at: new Date().toISOString(),
      };

      setTransactions((prev) => [swapTx, ...prev]);

      if (user && isMockMode) {
        localStorage.setItem(`zuvapay_wallet_${user.id}`, JSON.stringify({ ...wallet, balance: newNgn }));
        localStorage.setItem(`zuvapay_usd_${user.id}`, newUsd.toString());
      }

      return { success: true };
    }

    return { success: false, error: 'Invalid currency pair' };
  };

  /**
   * Handle manual admin balance credit / debit adjustments
   */
  const recordManualAdjustment = useCallback(
    async ({
      walletId,
      amount,
      action,
      reason,
      reference,
      newBalance,
    }: {
      walletId: string;
      amount: number;
      action: 'credit' | 'debit';
      reason?: string;
      reference?: string;
      newBalance?: number;
    }) => {
      const isCredit = action === 'credit';
      const ref = reference || `KP-ADJ-${Date.now().toString(36).toUpperCase()}`;
      const desc = `Manual Admin Adjustment: ${reason || (isCredit ? 'Account Credit' : 'Account Debit')}`;

      const currentBal = wallet?.balance ?? 42800;
      const finalBal =
        typeof newBalance === 'number'
          ? newBalance
          : isCredit
          ? currentBal + amount
          : Math.max(0, currentBal - amount);

      const updatedWallet: Wallet = {
        ...(wallet || {
          id: walletId,
          user_id: user?.id || '00000000-0000-0000-0000-000000000001',
          currency: 'NGN',
          created_at: new Date().toISOString(),
        }),
        balance: finalBal,
        updated_at: new Date().toISOString(),
      };

      const newTx: Transaction = {
        id: 'tx-adj-' + Date.now(),
        wallet_id: walletId,
        amount,
        type: action,
        category: 'transfer',
        description: desc,
        reference: ref,
        status: 'completed',
        created_at: new Date().toISOString(),
      };

      setWallet(updatedWallet);
      setTransactions((prev) => [newTx, ...prev]);

      if (user) {
        try {
          localStorage.setItem(`zuvapay_wallet_${user.id}`, JSON.stringify(updatedWallet));
          const prevTxsStr = localStorage.getItem(`zuvapay_txs_${user.id}`);
          const prevTxs = prevTxsStr ? JSON.parse(prevTxsStr) : [];
          localStorage.setItem(`zuvapay_txs_${user.id}`, JSON.stringify([newTx, ...prevTxs]));
        } catch (e) {
          console.error('Error writing adjusted wallet to localStorage', e);
        }
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('zuvapay_wallet_updated'));
      }

      if (!isMockMode) {
        await refreshWallet();
      }
    },
    [wallet, user, isMockMode, refreshWallet]
  );

  return (
    <WalletContext.Provider
      value={{
        wallet,
        usdBalance,
        transactions,
        loading,
        activeReceipt,
        openReceipt,
        closeReceipt,
        isFundModalOpen,
        openFundModal,
        closeFundModal,
        isBalanceHidden,
        toggleBalanceHidden,
        formatBalance,
        payBill,
        refundBill,
        fundWallet,
        swapCurrency,
        refreshWallet,
        recordManualAdjustment,
        requestPinAuthorization,
        openPinSetupModal: () => setIsPinSetupModalOpen(true),
        exchangeRate: NGN_USD_RATE,
      }}
    >
      {children}
      <TransactionPinModal
        isOpen={pinModalState.isOpen}
        details={pinModalState.details}
        onSuccess={handlePinSuccess}
        onCancel={handlePinCancel}
        onNeedSetupPin={handleNeedSetupPin}
      />
      <PinSetupModal
        isOpen={isPinSetupModalOpen}
        onSuccess={() => setIsPinSetupModalOpen(false)}
      />
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
