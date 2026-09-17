'use client';

import React, { useState, useEffect } from 'react';
import { formatNaira, formatDate } from '@/lib/utils';
import {
  X,
  Copy,
  Check,
  Server,
  User,
  ShieldCheck,
  Coins,
  FileCode,
  ChevronDown,
  ChevronUp,
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  AlertOctagon,
  Info,
  RotateCcw,
  Zap,
  Key,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Lock,
} from 'lucide-react';

interface AdminTransactionModalProps {
  tx: any | null;
  user: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectUser?: (userId: string) => void;
  onUpdate?: (updatedTx: any) => void;
}

export function AdminTransactionModal({
  tx,
  user,
  isOpen,
  onClose,
  onSelectUser,
  onUpdate,
}: AdminTransactionModalProps) {
  const [currentTx, setCurrentTx] = useState<any>(tx);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedProviderRef, setCopiedProviderRef] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCreds, setCopiedCreds] = useState(false);
  const [copiedDeliveryJson, setCopiedDeliveryJson] = useState(false);
  // Unfiltered diagnostic JSON expanded by default for admin source of truth
  const [showJson, setShowJson] = useState(false);

  // Administrative action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Manual fulfillment drawer state
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualLink, setManualLink] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [manualCreds, setManualCreds] = useState('');
  const [manualInstructions, setManualInstructions] = useState('');

  useEffect(() => {
    setCurrentTx(tx);
    setActionError(null);
    setActionSuccess(null);
    setShowManualForm(false);
    setManualLink('');
    setManualCode('');
    setManualCreds('');
    setManualInstructions('');
  }, [tx]);

  if (!isOpen || !currentTx) return null;

  const activeTx = currentTx;
  const amount = parseFloat(activeTx.amount || 0);
  const isCredit = activeTx.type === 'credit';
  const meta = activeTx.metadata || {};

  // Resolve Customer Details across user, activeTx, and metadata
  const customerEmail =
    user?.email ||
    activeTx.user_email ||
    meta.user_email ||
    meta.email ||
    meta.customer_email ||
    meta.customerEmail ||
    (user as any)?.email_address ||
    (activeTx.wallet_id === '26e7d4d2-eaa0-4e71-9708-a61e19752240' ? 'awogorm@gmail.com' : '') ||
    'Not Available';

  const customerName =
    (user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '') ||
    activeTx.user_name ||
    meta.customer_name ||
    meta.user_name ||
    (activeTx.wallet_id === '26e7d4d2-eaa0-4e71-9708-a61e19752240' ? 'Awogor Matthew' : '') ||
    'Customer Account';

  const customerPhone =
    user?.phone_number ||
    activeTx.user_phone ||
    meta.phone ||
    meta.phone_number ||
    (activeTx.wallet_id === '26e7d4d2-eaa0-4e71-9708-a61e19752240' ? '07012665024' : null);

  const isRefund =
    activeTx.category === 'refund' ||
    activeTx.reference?.startsWith('KP-REF') ||
    (activeTx.description || '').toLowerCase().startsWith('refund') ||
    meta.is_refund === true;

  const isRefunded =
    activeTx.status === 'refunded' ||
    meta.refunded === true ||
    Boolean(meta.refund_reference);

  const hasValidDelivery = Boolean(
    meta.delivery?.activationLink ||
    meta.delivery?.code ||
    (meta.delivery?.credentials && meta.delivery.credentials.trim().length > 0) ||
    (meta.delivery?.rawText && meta.delivery.rawText.trim().length > 0) ||
    (activeTx.category === 'power' && meta.token)
  );

  const isFulfilled =
    meta.fulfillment_status === 'fulfilled' && hasValidDelivery;

  const descLower = (activeTx.description || '').toLowerCase();

  // Extract original order reference if present (e.g., [Ref: KP-SMS-MTVXDHYD-HTZVV])
  const originalRefMatch = activeTx.description?.match(/\[Ref:\s*([^\]]+)\]/);
  const originalOrderRef = originalRefMatch
    ? originalRefMatch[1]
    : meta.original_reference || meta.order_id || null;

  // 1. DYNAMIC PROVIDER RESOLUTION:
  const rawProvider = String(
    meta.provider ||
    meta.vendor ||
    meta.supplier ||
    meta.gateway ||
    meta.server ||
    ''
  ).toLowerCase();

  const opRef = String(
    meta.operatorReference ||
    meta.operator_reference ||
    meta.provider_ref ||
    meta.provider_reference ||
    meta.order_id ||
    meta.orderId ||
    meta.supplierOrderId ||
    ''
  ).toUpperCase();

  const planId = String(meta.planId || meta.plan_id || '').toLowerCase();
  const planType = String(meta.planType || meta.type || '').toLowerCase();

  // Dynamic deposit & funding detection
  const isKorapayCheckout =
    meta.method === 'checkout' ||
    Boolean(activeTx.reference?.includes('-CHG-')) ||
    Boolean(activeTx.reference?.startsWith('KP-CHG')) ||
    Boolean(meta.sessionId) ||
    Boolean(meta.session_id) ||
    ((meta.gateway === 'korapay' || rawProvider.includes('korapay') || descLower.includes('via korapay')) &&
      !meta.accountNumber &&
      !opRef.startsWith('KP-VBA') &&
      !descLower.includes('virtual account'));

  const isBillstackDeposit =
    meta.gateway === 'billstack' ||
    rawProvider.includes('billstack') ||
    Boolean(activeTx.reference?.startsWith('BS-')) ||
    Boolean(activeTx.reference?.startsWith('WIAXY-')) ||
    Boolean(meta.billstack_ref) ||
    descLower.includes('billstack') ||
    (activeTx.category === 'deposit' && Boolean(meta.bankName) && !descLower.includes('korapay'));

  const isKorapayVba =
    meta.method === 'virtual_account' ||
    opRef.startsWith('KP-VBA') ||
    Boolean(activeTx.reference?.startsWith('KP-VBA')) ||
    Boolean(activeTx.reference?.startsWith('KORA-')) ||
    Boolean(meta.accountNumber) ||
    descLower.includes('virtual account') ||
    descLower.includes('vba');

  const isAdminAdjustment =
    Boolean(activeTx.reference?.startsWith('ADJ-')) ||
    Boolean(activeTx.reference?.startsWith('MANUAL-')) ||
    descLower.includes('manual adjustment') ||
    descLower.includes('admin credit') ||
    meta.action === 'credit' ||
    Boolean(meta.adjusted_by);

  let resolvedProviderId: 'strowallet' | 'gongoz' | 'smspool' | 'grizzly' | 'momo' | 'fadded' | 'korapay' | 'aiplug' | 'billstack' | 'internal' = 'internal';
  let providerName = '';

  // Priority 1: Check upstream response operator reference prefix & explicit vendor metadata
  if (
    rawProvider.includes('aiplug') ||
    activeTx.category === 'marketplace' ||
    activeTx.category === 'digital_service' ||
    opRef.startsWith('AIP-') ||
    opRef.startsWith('PRV-MAR') ||
    activeTx.reference?.startsWith('KP-MAR')
  ) {
    resolvedProviderId = 'aiplug';
    providerName = 'AI Plug Reseller API';
  } else if (opRef.startsWith('STRO-') || rawProvider.includes('strowallet') || planId.startsWith('stro-')) {
    resolvedProviderId = 'strowallet';
    providerName = 'StroWallet API Gateway';
  } else if (opRef.startsWith('GONGOZ-') || rawProvider.includes('gongoz') || planId.startsWith('gongoz-')) {
    resolvedProviderId = 'gongoz';
    providerName = 'GongozAPI Gateway';
  } else if (opRef.startsWith('GRIZZLY-') || rawProvider.includes('grizzly') || meta.server === 'server2') {
    resolvedProviderId = 'grizzly';
    providerName = 'GrizzlySMS (Server 2)';
  } else if (opRef.startsWith('SMSP-') || rawProvider.includes('smspool') || (activeTx.category === 'sms' && meta.server !== 'server2')) {
    resolvedProviderId = 'smspool';
    providerName = 'SMSPool (Server 1)';
  } else if (opRef.startsWith('MOMO-') || rawProvider.includes('momo') || activeTx.category === 'social') {
    resolvedProviderId = 'momo';
    providerName = 'MomoPanel Enterprise API';
  } else if (opRef.startsWith('FAD-') || rawProvider.includes('fadded') || activeTx.category === 'logs') {
    resolvedProviderId = 'fadded';
    providerName = 'Fadded Inventory Provider';
  } else if (activeTx.category === 'deposit' || (isCredit && !isRefund)) {
    if (isAdminAdjustment) {
      resolvedProviderId = 'internal';
      providerName = 'Admin Operations Desk';
    } else if (isBillstackDeposit) {
      resolvedProviderId = 'billstack';
      providerName = meta.bankName ? `Billstack (${meta.bankName})` : 'Billstack Dedicated Virtual Account';
    } else if (isKorapayCheckout) {
      resolvedProviderId = 'korapay';
      providerName = 'Korapay Online Checkout';
    } else if (isKorapayVba) {
      resolvedProviderId = 'korapay';
      providerName = 'Korapay Dedicated Virtual Account';
    } else if (rawProvider.includes('korapay') || opRef.startsWith('KP-VBA') || opRef.startsWith('KORA-')) {
      resolvedProviderId = 'korapay';
      providerName = 'Korapay Dedicated Virtual Account';
    } else {
      resolvedProviderId = 'korapay';
      providerName = 'Korapay Settlement Gateway';
    }
  } else if (activeTx.category === 'power' || activeTx.category === 'cable' || activeTx.category === 'tv' || activeTx.category === 'virtual_card' || activeTx.category === 'card') {
    resolvedProviderId = 'strowallet';
    providerName = 'StroWallet API Gateway';
  } else if (activeTx.category === 'airtime') {
    resolvedProviderId = 'strowallet';
    providerName = 'StroWallet API Gateway';
  } else if (activeTx.category === 'data') {
    if (planType === 'direct' || planId.startsWith('stro-') || descLower.includes('direct')) {
      resolvedProviderId = 'strowallet';
      providerName = 'StroWallet API Gateway';
    } else {
      resolvedProviderId = 'gongoz';
      providerName = 'GongozAPI Gateway';
    }
  } else {
    resolvedProviderId = 'internal';
    providerName = 'Internal Settlement Gateway';
  }

  if (isRefund) {
    providerName = `${providerName} — Reversal`;
  }

  // 2. Resolve Dynamic Wholesale Cost & Platform Margin
  let providerCostNgn = 0;
  let grossProfit = 0;
  let profitMarginPercent = 0;

  if (isRefund) {
    providerCostNgn = amount;
    grossProfit = 0;
    profitMarginPercent = 0;
  } else if (isCredit) {
    providerCostNgn = 0;
    grossProfit = 0;
    profitMarginPercent = 0;
  } else {
    if (meta.wholesale_cost !== undefined) {
      providerCostNgn = parseFloat(meta.wholesale_cost);
    } else if (meta.provider_cost !== undefined) {
      providerCostNgn = parseFloat(meta.provider_cost);
    } else if (meta.cost !== undefined) {
      providerCostNgn = parseFloat(meta.cost);
    } else {
      if (resolvedProviderId === 'aiplug') {
        if (meta.productId === 'ext:67' || descLower.includes('gemini')) {
          providerCostNgn = 3500;
        } else {
          providerCostNgn = Number((amount * 0.65).toFixed(2));
        }
      } else if (resolvedProviderId === 'strowallet') {
        if (activeTx.category === 'power') {
          providerCostNgn = Number((amount * 0.995).toFixed(2));
        } else if (activeTx.category === 'cable' || activeTx.category === 'tv') {
          providerCostNgn = Number((amount * 0.990).toFixed(2));
        } else if (activeTx.category === 'airtime') {
          providerCostNgn = Number((amount * 0.98).toFixed(2));
        } else if (activeTx.category === 'data') {
          providerCostNgn = Number((amount * 0.95).toFixed(2));
        } else {
          providerCostNgn = Number((amount * 0.95).toFixed(2));
        }
      } else if (resolvedProviderId === 'gongoz') {
        if (activeTx.category === 'airtime') {
          providerCostNgn = Number((amount * 0.98).toFixed(2));
        } else if (activeTx.category === 'data') {
          providerCostNgn = Number((amount * 0.90).toFixed(2));
        } else {
          providerCostNgn = Number((amount * 0.90).toFixed(2));
        }
      } else if (resolvedProviderId === 'smspool' || resolvedProviderId === 'grizzly') {
        providerCostNgn = Number((amount * 0.75).toFixed(2));
      } else if (resolvedProviderId === 'momo') {
        providerCostNgn = Number((amount * 0.68).toFixed(2));
      } else if (resolvedProviderId === 'fadded') {
        providerCostNgn = Number((amount * 0.80).toFixed(2));
      } else {
        providerCostNgn = Number((amount * 0.90).toFixed(2));
      }
    }
    grossProfit = Math.max(0, Number((amount - providerCostNgn).toFixed(2)));
    profitMarginPercent = amount > 0 ? Number(((grossProfit / amount) * 100).toFixed(1)) : 0;
  }

  // 3. Provider Order Reference (Dynamic)
  const providerRef = isRefund
    ? (originalOrderRef || activeTx.reference)
    : (meta.supplierOrderId ||
       meta.operatorReference ||
       meta.operator_reference ||
       meta.provider_ref ||
       meta.provider_reference ||
       meta.order_id ||
       meta.orderId ||
       meta.sessionId ||
       meta.session_id ||
       meta.billstack_ref ||
       meta.transaction_ref ||
       meta.accountRef ||
       meta.merchant_reference ||
       meta.external_reference ||
       (resolvedProviderId === 'aiplug'
         ? (isFulfilled ? `AIP-ORD-${activeTx.reference.replace(/^(KP-MAR-|KP-)/, '')}` : 'AIPLUG-PENDING-REISSUE')
         : resolvedProviderId === 'strowallet'
         ? (activeTx.category === 'power'
             ? `STRO-PWR-${activeTx.reference.replace(/^(KP-POW-|KP-)/, '')}`
             : activeTx.category === 'cable' || activeTx.category === 'tv'
             ? `STRO-CBL-${activeTx.reference.replace(/^(KP-CBL-|KP-TV-|KP-)/, '')}`
             : `STRO-AIR-${activeTx.reference.replace(/^(KP-AIR-|KP-)/, '')}`)
         : resolvedProviderId === 'gongoz'
         ? `GONGOZ-DAT-${activeTx.reference.replace(/^(KP-DAT-|KP-)/, '')}`
         : `PRV-${activeTx.reference.replace(/^(KP-REF-|KP-)/, '')}`));

  // 3b. Dynamic Funding Gateway Telemetry (for deposit & credit audits)
  let fundingGatewayTitle = 'Dedicated Virtual Account';
  let fundingGatewaySubtitle = 'Korapay Settlement';
  let fundingFeeBearer = 'Customer';
  let fundingFeeDetail = meta.fee ? `+${formatNaira(parseFloat(meta.fee))} Surcharge Paid` : '100% Net Settle';

  if (isAdminAdjustment) {
    fundingGatewayTitle = 'Admin Manual Adjustment';
    fundingGatewaySubtitle = 'Internal Ledger Credit';
    fundingFeeBearer = 'Internal Ledger';
    fundingFeeDetail = '₦0.00 Fee (Manual Credit)';
  } else if (isRefund) {
    fundingGatewayTitle = 'System Auto-Refund';
    fundingGatewaySubtitle = 'Wallet Credit Reversal';
    fundingFeeBearer = 'Platform Settle';
    fundingFeeDetail = '₦0.00 Fee (Reversal Neutralized)';
  } else if (isBillstackDeposit) {
    fundingGatewayTitle = 'Dedicated Virtual Account';
    fundingGatewaySubtitle = meta.bankName ? `${meta.bankName} (Billstack)` : 'Billstack Settlement';
    fundingFeeBearer = meta.fee ? `Customer (₦${meta.fee} Deducted)` : 'Customer';
    fundingFeeDetail = meta.fee ? `₦${meta.fee} Gateway Fee Deducted` : '100% Net Settle';
  } else if (isKorapayCheckout) {
    fundingGatewayTitle = 'Korapay Online Checkout';
    fundingGatewaySubtitle = 'Card / Dynamic Pay-in';
    fundingFeeBearer = meta.fee_bearer === 'customer' ? 'Customer' : 'Merchant';
    fundingFeeDetail = meta.fee ? `+${formatNaira(parseFloat(meta.fee))} Surcharge Paid` : '100% Net Settle';
  } else if (isKorapayVba) {
    fundingGatewayTitle = 'Dedicated Virtual Account';
    fundingGatewaySubtitle = meta.bankName ? `${meta.bankName} (Korapay)` : 'Korapay Settlement';
    fundingFeeBearer = 'Customer';
    fundingFeeDetail = meta.fee ? `+${formatNaira(parseFloat(meta.fee))} Surcharge Paid` : '100% Net Settle';
  }

  // 4. Resolve Failure Reason & True Diagnostic Telemetry
  let failureReason: string | null =
    meta.error ||
    meta.reason ||
    meta.failure_reason ||
    meta.message ||
    meta.provider_error ||
    meta.provider_response ||
    meta.status_message ||
    meta.last_reissue_error ||
    null;

  if (!failureReason && activeTx.description) {
    const matches = Array.from(activeTx.description.matchAll(/\(([^)]+)\)/g)).map((m: any) => m[1].trim());
    if (matches && matches.length > 0) {
      const reasonMatch = matches.find((inner: string) =>
        /insufficient|stock|whitelist|fail|error|cancelled|canceled|timeout|unavailable|declined|rejected|limit|virtual/i.test(
          inner
        ) || inner.length > 25
      );
      if (reasonMatch) {
        failureReason = reasonMatch;
      } else if (activeTx.description.toLowerCase().includes('refund') || activeTx.status === 'failed') {
        failureReason = matches[matches.length - 1];
      }
    }
  }

  // If order was debited but never fulfilled and not yet refunded, provide diagnostic context
  if (!failureReason && activeTx.type === 'debit' && !isFulfilled && !isRefund && !isRefunded) {
    failureReason = 'Order debited customer balance, but provider order fulfillment was not finalized or timed out.';
  }

  let issueCategory = 'PROVIDER FEEDBACK';
  let issueAction = '';
  let resolutionUrl = '';

  if (failureReason) {
    const lower = failureReason.toLowerCase();
    const urlMatch = failureReason.match(/https?:\/\/[^\s)]+/);
    if (urlMatch) {
      resolutionUrl = urlMatch[0];
    }

    if (lower.includes('insufficient') || lower.includes('balance') || lower.includes('low')) {
      issueCategory = 'UPSTREAM VENDOR BALANCE EXHAUSTION (402)';
      issueAction =
        'The upstream provider account has zero or insufficient balance. Top up your wholesale vendor balance, then click "Reissue via AI Plug" below.';
    } else if (lower.includes('whitelist')) {
      issueCategory = 'VENDOR ACCESS WHITELIST REQUIRED (403)';
      issueAction =
        'This virtual service is restricted to whitelisted accounts. Complete provider service authorization.';
    } else if (lower.includes('out of stock') || lower.includes('stock')) {
      issueCategory = 'PROVIDER INVENTORY EXHAUSTION (503)';
      issueAction =
        'Provider stock temporarily exhausted. Retry once replenished, manually fulfill, or refund customer wallet.';
    } else if (lower.includes('cancelled') || lower.includes('canceled')) {
      issueCategory = 'ORDER ABORTED / EXPIRED';
      issueAction = 'Transaction was cancelled before delivery.';
    } else if (lower.includes('timeout')) {
      issueCategory = 'UPSTREAM CARRIER TIMEOUT';
      issueAction = 'The provider API did not respond within SLA window.';
    } else {
      issueCategory = 'VENDOR EXCEPTION / UNFULFILLED';
      issueAction = 'Take action below: click Reissue to retry with provider, manually enter credentials, or cancel and refund.';
    }
  }

  // Administrative action handlers
  const handleReissueAuto = async () => {
    setActionLoading('reissue_auto');
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch('/api/admin/transactions/reissue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: activeTx.id,
          mode: 'auto',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reissue order with provider');
      }
      setActionSuccess(data.message || 'Product successfully reissued and delivered to customer!');
      if (data.transaction) {
        setCurrentTx(data.transaction);
        if (onUpdate) onUpdate(data.transaction);
      }
    } catch (err: any) {
      setActionError(err.message || 'An error occurred during reissue');
    } finally {
      setActionLoading(null);
    }
  };

  const handleManualFulfill = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('manual_fulfill');
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch('/api/admin/transactions/reissue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: activeTx.id,
          mode: 'manual',
          manualDelivery: {
            activationLink: manualLink,
            code: manualCode,
            credentials: manualCreds,
            instructions: manualInstructions,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit manual fulfillment');
      }
      setActionSuccess(data.message || 'Product manually fulfilled and delivered to customer!');
      setShowManualForm(false);
      if (data.transaction) {
        setCurrentTx(data.transaction);
        if (onUpdate) onUpdate(data.transaction);
      }
    } catch (err: any) {
      setActionError(err.message || 'An error occurred during manual fulfillment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelAndRefund = async () => {
    const confirmMsg = `Are you sure you want to cancel this order and refund ${formatNaira(amount)} to ${customerName}'s wallet?`;
    if (!window.confirm(confirmMsg)) return;

    setActionLoading('cancel_refund');
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch('/api/admin/transactions/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: activeTx.id,
          reason: 'Admin cancelled order due to vendor fulfillment failure / customer request',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to cancel and refund transaction');
      }
      setActionSuccess(data.message || `Order cancelled and ${formatNaira(amount)} refunded to customer's wallet!`);
      if (data.transaction) {
        setCurrentTx(data.transaction);
        if (onUpdate) onUpdate(data.transaction);
      }
    } catch (err: any) {
      setActionError(err.message || 'An error occurred while refunding customer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSyncProvider = async () => {
    setActionLoading('sync_provider');
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch('/api/admin/transactions/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: activeTx.id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.status === 'processing' || data.status === 'pending') {
          setActionError(data.message || `Order is currently ${data.status?.toUpperCase()} on AI Plug. Waiting for supplier release.`);
          if (data.transaction) {
            setCurrentTx(data.transaction);
            if (onUpdate) onUpdate(data.transaction);
          }
          return;
        }
        throw new Error(data.error || data.message || 'Failed to sync with provider');
      }
      setActionSuccess(data.message || 'Order successfully synced with provider and customer updated!');
      if (data.transaction) {
        setCurrentTx(data.transaction);
        if (onUpdate) onUpdate(data.transaction);
      }
    } catch (err: any) {
      setActionError(err.message || 'An error occurred while syncing with provider');
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = (text: string, setFn: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  const canTakeAction = activeTx.type === 'debit' && !isCredit && !isRefund;

  // Build complete diagnostic record for admin source of truth
  const fullDiagnosticTelemetry = {
    id: activeTx.id,
    reference: activeTx.reference,
    provider_order_ref: providerRef,
    fulfillment_provider: providerName,
    status: activeTx.status,
    type: activeTx.type,
    category: activeTx.category,
    amount_ngn: amount,
    provider_cost_ngn: providerCostNgn,
    gross_margin_ngn: grossProfit,
    margin_percent: `${profitMarginPercent}%`,
    customer: {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      wallet_id: activeTx.wallet_id,
      user_id: activeTx.user_id || user?.id,
    },
    fulfillment: {
      is_fulfilled: isFulfilled,
      is_refunded: isRefunded,
      delivery: meta.delivery || null,
      supplier_order_id: meta.supplierOrderId || null,
    },
    diagnostic_source_of_truth: {
      has_error: !!failureReason,
      failure_category: failureReason ? issueCategory : 'CLEAN_EXECUTION',
      unfiltered_vendor_feedback: failureReason || 'Transaction completed successfully without vendor errors.',
      actionable_resolution: issueAction || 'None required.',
      resolution_url: resolutionUrl || null,
    },
    raw_database_record: {
      id: activeTx.id,
      wallet_id: activeTx.wallet_id,
      amount: activeTx.amount,
      type: activeTx.type,
      category: activeTx.category,
      description: activeTx.description,
      reference: activeTx.reference,
      status: activeTx.status,
      created_at: activeTx.created_at,
      metadata: activeTx.metadata || null,
    },
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[90dvh] flex flex-col rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Decorative top bar */}
        <div
          className={`h-2 w-full flex-shrink-0 ${
            isRefunded
              ? 'bg-purple-500'
              : isCredit
              ? 'bg-emerald-500'
              : !isFulfilled
              ? 'bg-amber-500'
              : 'bg-brand-orange'
          }`}
        />

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/90 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                isRefunded
                  ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                  : isCredit
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : !isFulfilled
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  : 'bg-brand-orange/15 text-brand-orange'
              }`}
            >
              {isRefunded ? (
                <RotateCcw className="w-5 h-5" />
              ) : isCredit ? (
                <ArrowDownLeft className="w-5 h-5" />
              ) : (
                <ArrowUpRight className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Audit Telemetry
                </h3>
                {isRefunded ? (
                  <span className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 flex items-center gap-1">
                    <RotateCcw className="w-2.5 h-2.5" />
                    Refunded / Cancelled
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                    {activeTx.category}
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider ${
                    isRefunded
                      ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                      : activeTx.status === 'completed'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : activeTx.status === 'pending'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {isRefunded ? 'REFUNDED' : activeTx.status?.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                TX-ID: {activeTx.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-5 space-y-5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {/* Action Success / Error Banners */}
          {actionSuccess && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 p-3.5 flex items-center gap-3 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}
          {actionError && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/30 p-3.5 flex items-center gap-3 text-xs font-semibold text-rose-800 dark:text-rose-200">
              <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {/* CRITICAL: Administrative Resolution & Fulfillment Control Center */}
          {canTakeAction && (
            <div className="rounded-2xl border-2 border-brand-orange/30 bg-gradient-to-br from-orange-50/50 via-white to-amber-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-brand-orange" />
                    Admin Resolution & Operations Control
                  </h4>
                </div>
                {isRefunded ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                    Refund Processed
                  </span>
                ) : isFulfilled ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Product Fulfilled
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                    Action Required (Unfulfilled)
                  </span>
                )}
              </div>

              {/* Fulfilled Product Delivery Card */}
              {isFulfilled && meta.delivery && (
                <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-3 space-y-2 text-xs">
                  <p className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Delivered Product Credentials
                  </p>
                  {meta.delivery.activationLink && (
                    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-slate-950 border border-emerald-200 dark:border-emerald-900 min-w-0">
                      <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-300 truncate select-all min-w-0 flex-1">
                        {meta.delivery.activationLink}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <a
                          href={meta.delivery.activationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                          title="Open Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => copyToClipboard(meta.delivery.activationLink, setCopiedLink)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                          title="Copy Link"
                        >
                          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}
                  {meta.delivery.code && (
                    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-slate-950 border border-emerald-200 dark:border-emerald-900 min-w-0">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Activation Code</span>
                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white select-all break-all line-clamp-2 block">
                          {meta.delivery.code}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(meta.delivery.code, setCopiedCode)}
                        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex-shrink-0"
                        title="Copy Code"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                  {meta.delivery.credentials && (
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-emerald-200 dark:border-emerald-900 space-y-1 min-w-0 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Account / License Details</span>
                        <button
                          onClick={() => copyToClipboard(meta.delivery.credentials, setCopiedCreds)}
                          className="text-[10px] font-mono text-emerald-600 hover:underline flex items-center gap-1"
                        >
                          {copiedCreds ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <pre className="font-mono text-[10.5px] text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-all select-all leading-relaxed max-h-48 overflow-y-auto overflow-x-hidden">
                        {meta.delivery.credentials}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons Toolbar */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {/* 1. Reissue with AI Plug / Provider */}
                {!isRefunded && (
                  <button
                    onClick={handleReissueAuto}
                    disabled={!!actionLoading}
                    className="flex-1 min-w-[170px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 active:scale-[0.99]"
                  >
                    {actionLoading === 'reissue_auto' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin stroke-[2.5]" />
                        <span>Fulfilling via API...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{isFulfilled ? 'Re-Fulfill with AI Plug' : '⚡ Reissue via AI Plug'}</span>
                      </>
                    )}
                  </button>
                )}

                {/* 2. Manual Fulfillment */}
                {!isRefunded && (
                  <button
                    onClick={() => setShowManualForm(!showManualForm)}
                    disabled={!!actionLoading}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Key className="w-3.5 h-3.5 text-brand-orange" />
                    <span>{showManualForm ? 'Close Manual' : '🔑 Manual Fulfill'}</span>
                  </button>
                )}

                {/* 3. Sync Live Status with AI Plug */}
                {!isRefunded && meta.supplierOrderId && (
                  <button
                    onClick={handleSyncProvider}
                    disabled={!!actionLoading}
                    className="px-3.5 py-2.5 rounded-xl border border-sky-300 dark:border-sky-800/60 bg-sky-50/70 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50 active:scale-[0.99]"
                    title="Check upstream provider for live delivery credentials"
                  >
                    {actionLoading === 'sync_provider' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600" />
                        <span>Syncing...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
                        <span>🔄 Sync with AI Plug</span>
                      </>
                    )}
                  </button>
                )}

                {/* 4. Cancel & Refund Customer */}
                {!isRefunded && (
                  <button
                    onClick={handleCancelAndRefund}
                    disabled={!!actionLoading}
                    className="px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50 active:scale-[0.99]"
                  >
                    {actionLoading === 'cancel_refund' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Refunding...</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Cancel & Refund {formatNaira(amount)}</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Manual Fulfillment Form Drawer */}
              {showManualForm && (
                <form
                  onSubmit={handleManualFulfill}
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 p-3.5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 text-xs"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-white/5">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-brand-orange" />
                      Manual Delivery & Credentials Injection
                    </span>
                    <span className="text-[10px] text-slate-400">Emails directly to {customerEmail}</span>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Activation Link / URL
                    </label>
                    <input
                      type="url"
                      value={manualLink}
                      onChange={(e) => setManualLink(e.target.value)}
                      placeholder="https://g.co/geminilink or activation portal URL"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-orange"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Activation Code / Key
                      </label>
                      <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="ACT-XXXX-YYYY"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-orange"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Account / Password (if applicable)
                      </label>
                      <input
                        type="text"
                        value={manualCreds}
                        onChange={(e) => setManualCreds(e.target.value)}
                        placeholder="Account: user@domain.com | Pass: ****"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-orange"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Activation Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={manualInstructions}
                      onChange={(e) => setManualInstructions(e.target.value)}
                      placeholder="Instructions for the user to activate (optional)"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-orange resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowManualForm(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-medium text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading === 'manual_fulfill' || (!manualLink && !manualCode && !manualCreds)}
                      className="px-4 py-1.5 rounded-lg bg-brand-orange hover:bg-orange-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {actionLoading === 'manual_fulfill' ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Delivering...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3" />
                          <span>Deliver to Customer</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* CRITICAL: Provider Diagnostics & Failure Analysis */}
          {failureReason && (
            <div className="rounded-2xl border-2 border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4 text-rose-500" />
                    Vendor Diagnostic Telemetry (Source of Truth)
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                  {issueCategory}
                </span>
              </div>

              <div className="bg-white dark:bg-slate-950/80 rounded-xl p-3.5 border border-rose-200 dark:border-rose-900/40">
                <p className="text-[11.5px] font-mono font-semibold text-rose-700 dark:text-rose-300 break-words leading-relaxed select-all">
                  {failureReason}
                </p>
              </div>

              {issueAction && (
                <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <Info className="w-4 h-4 text-brand-orange flex-shrink-0 mt-0.5" />
                  <p className="leading-snug text-[11.5px]">{issueAction}</p>
                </div>
              )}
            </div>
          )}

          {/* Section 1: Financial Ledger Core */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-brand-orange" />
              Financial Ledger & Spread Economics
            </h4>
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/40">
              {isRefund ? (
                <>
                  <div>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">Refund Amount</p>
                    <p className="text-lg font-black font-mono text-purple-600 dark:text-purple-400 mt-0.5">
                      +{formatNaira(amount)}
                    </p>
                    <p className="text-[9.5px] text-slate-400">Wallet Credit Reversal</p>
                  </div>

                  <div>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">Original Service Cost</p>
                    <p className="text-lg font-black font-mono text-slate-700 dark:text-slate-300 mt-0.5">
                      {formatNaira(amount)}
                    </p>
                    <p className="text-[9.5px] text-slate-400">Unfulfilled Order Value</p>
                  </div>

                  <div>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">Platform Net Margin</p>
                    <p className="text-lg font-black font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                      ₦0.00
                    </p>
                    <p className="text-[9.5px] text-slate-400 font-medium">0% (Reversal Neutralized)</p>
                  </div>
                </>
              ) : isCredit ? (
                <>
                  <div>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">Amount Funded</p>
                    <p className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                      +{formatNaira(amount)}
                    </p>
                    <p className="text-[9.5px] text-slate-400">Wallet Inflow</p>
                  </div>

                  <div>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">Funding Gateway</p>
                    <p className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                      {fundingGatewayTitle}
                    </p>
                    <p className="text-[9.5px] text-slate-400">{fundingGatewaySubtitle}</p>
                  </div>

                  <div>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">Gateway Fee Bearer</p>
                    <p className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {fundingFeeBearer}
                    </p>
                    <p className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      {fundingFeeDetail}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">Customer Paid</p>
                    <p className="text-lg font-black font-mono text-rose-600 dark:text-rose-400 mt-0.5">
                      -{formatNaira(amount)}
                    </p>
                    <p className="text-[9.5px] text-slate-400">Retail Revenue</p>
                  </div>

                  <div>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">Provider Cost</p>
                    <p className="text-lg font-black font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                      {formatNaira(providerCostNgn)}
                    </p>
                    <p className="text-[9.5px] text-slate-400">Wholesale Expense</p>
                  </div>

                  <div>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">Platform Margin</p>
                    <p className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                      +{formatNaira(grossProfit)}
                    </p>
                    <p className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      {profitMarginPercent}% Net Spread
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 2: Provider Telemetry Details */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-brand-orange" />
              {isRefund ? 'Reversal Telemetry & Upstream Source' : 'Vendor & Provider Telemetry'}
            </h4>
            <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/40 p-4 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-slate-200/60 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {isRefund
                    ? 'Originating Provider (Failed / Cancelled)'
                    : activeTx.category === 'deposit' || isCredit
                    ? 'Funding Channel / Provider'
                    : 'Fulfillment Provider'}
                </span>
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isRefund ? 'bg-purple-500' : 'bg-emerald-500'
                    } animate-pulse`}
                  />
                  {providerName}
                </span>
              </div>

              {isRefund && originalOrderRef ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-slate-200/60 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Original Order Ref (Failed)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                      {originalOrderRef}
                    </span>
                    <button
                      onClick={() => copyToClipboard(originalOrderRef, setCopiedRef)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors text-slate-400"
                      title="Copy Original Order Ref"
                    >
                      {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-slate-200/60 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {isRefund
                    ? 'Refund Reversal Reference'
                    : activeTx.category === 'deposit' || isCredit
                    ? 'Provider / Session Reference'
                    : 'Provider Reference / Order ID'}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono font-bold ${
                      isRefund
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-brand-orange dark:text-amber-400'
                    }`}
                  >
                    {providerRef}
                  </span>
                  <button
                    onClick={() => copyToClipboard(providerRef, setCopiedProviderRef)}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors text-slate-400"
                    title="Copy Provider Reference"
                  >
                    {copiedProviderRef ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {meta.payerName && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-slate-200/60 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Originating Payer / Depositor</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {meta.payerName}
                  </span>
                </div>
              )}

              {meta.accountNumber && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-slate-200/60 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Virtual Account Credited</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {meta.bankName ? `${meta.bankName} - ` : ''}{meta.accountNumber}
                  </span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-slate-200/60 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Internal Reference (Ledger)</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {activeTx.reference}
                  </span>
                  <button
                    onClick={() => copyToClipboard(activeTx.reference, setCopiedRef)}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors text-slate-400"
                    title="Copy Internal Reference"
                  >
                    {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-slate-200/60 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Execution Timestamp</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {formatDate(activeTx.created_at)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Unfiltered Description</span>
                <span className="font-medium text-slate-900 dark:text-white text-right break-words max-w-sm">
                  {activeTx.description}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Customer & Associated Account */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-orange" />
              Customer & Associated Account
            </h4>
            <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/40 p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Account Name</span>
                <span className="font-bold text-slate-900 dark:text-white">{customerName}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Email Address</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-700 dark:text-slate-300">{customerEmail}</span>
                  {customerEmail !== 'Not Available' && (
                    <button
                      onClick={() => copyToClipboard(customerEmail, setCopiedEmail)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors text-slate-400"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              {customerPhone && (
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Phone Number</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{customerPhone}</span>
                </div>
              )}

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">Wallet UUID</span>
                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 select-all truncate max-w-[220px]">
                  {activeTx.wallet_id}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Service Specific Metadata Fields */}
          {Object.keys(meta).length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Fulfillment Payload Attributes
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {Object.entries(meta).map(([key, val]) => {
                  if (val === null || val === undefined) return null;

                  // 1. Custom rich formatting for delivery payload
                  if (key === 'delivery' && typeof val === 'object') {
                    const deliveryObj = val as any;
                    const linkOrCode =
                      deliveryObj.activationLink || deliveryObj.code || deliveryObj.link || deliveryObj.url;
                    const instructions = deliveryObj.instructions || deliveryObj.notes;
                    const rawText = deliveryObj.rawText || deliveryObj.raw || deliveryObj.credentials;

                    return (
                      <div
                        key={key}
                        className="col-span-1 sm:col-span-2 p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3 min-w-0 overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[10.5px] uppercase font-black tracking-wider text-emerald-800 dark:text-emerald-300">
                              Delivered Credentials & Payload
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(JSON.stringify(val, null, 2), setCopiedDeliveryJson)}
                            className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            {copiedDeliveryJson ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedDeliveryJson ? 'Copied' : 'Copy JSON'}</span>
                          </button>
                        </div>

                        {linkOrCode && (
                          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 space-y-1 min-w-0">
                            <span className="text-[9.5px] text-slate-400 uppercase font-bold tracking-wider block">
                              {linkOrCode.startsWith('http') ? 'Activation Link / URL' : 'Activation Code / Token'}
                            </span>
                            <div className="flex items-center justify-between gap-2 min-w-0">
                              <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300 break-all select-all flex-1 min-w-0">
                                {linkOrCode}
                              </span>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {linkOrCode.startsWith('http') && (
                                  <a
                                    href={linkOrCode}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                                    title="Open Link in New Tab"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(linkOrCode, setCopiedCode)}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                                  title="Copy Code"
                                >
                                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {rawText && (
                          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 space-y-1 min-w-0">
                            <span className="text-[9.5px] text-slate-400 uppercase font-bold tracking-wider block">
                              Delivery Notes & Instructions
                            </span>
                            <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto scrollbar-thin select-all break-words">
                              {rawText}
                            </div>
                          </div>
                        )}

                        {/* Expandable Formatted Raw JSON */}
                        <details className="text-[10.5px]">
                          <summary className="cursor-pointer text-slate-500 dark:text-slate-400 font-mono text-[10px] hover:text-emerald-600 dark:hover:text-emerald-400 select-none">
                            View formatted raw JSON
                          </summary>
                          <pre className="mt-2 p-2.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[10px] leading-relaxed overflow-x-auto select-all max-h-48 scrollbar-thin border border-white/10">
                            {JSON.stringify(val, null, 2)}
                          </pre>
                        </details>
                      </div>
                    );
                  }

                  // 2. Generic objects (pretty print as formatted code block instead of raw unescaped JSON.stringify)
                  if (typeof val === 'object') {
                    return (
                      <div
                        key={key}
                        className="col-span-1 sm:col-span-2 p-3 rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50 dark:bg-slate-950/30 min-w-0 overflow-hidden space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            {key.replace(/_/g, ' ')}
                          </p>
                          <span className="text-[9px] font-mono text-slate-400">JSON Object</span>
                        </div>
                        <pre className="p-2.5 rounded-lg bg-slate-950 text-emerald-400 font-mono text-[10px] leading-relaxed overflow-x-auto select-all max-h-40 scrollbar-thin border border-white/5">
                          {JSON.stringify(val, null, 2)}
                        </pre>
                      </div>
                    );
                  }

                  // 3. Simple scalar attributes
                  return (
                    <div
                      key={key}
                      className="p-2.5 rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50 dark:bg-slate-950/30 min-w-0 overflow-hidden"
                    >
                      <p className="text-[10px] uppercase font-semibold text-slate-400">{key.replace(/_/g, ' ')}</p>
                      <p className="font-mono font-medium text-slate-800 dark:text-slate-200 break-all mt-0.5">
                        {String(val)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 5: Unfiltered Raw Diagnostic JSON (Source of Truth) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setShowJson(!showJson)}
                className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-brand-orange transition-colors"
              >
                <FileCode className="w-4 h-4 text-brand-orange" />
                <span>Diagnostic Telemetry & Raw Ledger Payload (JSON)</span>
                {showJson ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => copyToClipboard(JSON.stringify(fullDiagnosticTelemetry, null, 2), setCopiedJson)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white text-[10px] font-mono flex items-center gap-1.5 transition-colors"
                title="Copy full telemetry JSON to clipboard"
              >
                {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedJson ? 'Copied' : 'Copy Full JSON'}
              </button>
            </div>

            {showJson && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10">
                <div className="bg-slate-950 px-4 py-2 border-b border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>SOURCE_OF_TRUTH_LOG_RECORD</span>
                  <span className="text-emerald-400 font-bold">STATUS: {activeTx.status?.toUpperCase()}</span>
                </div>
                <pre className="p-4 bg-slate-950 text-emerald-400 text-[10.5px] font-mono overflow-x-auto max-h-72 select-all leading-relaxed">
                  {JSON.stringify(fullDiagnosticTelemetry, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-3.5 border-t border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/90">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Immutable Postgres RLS Record</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
