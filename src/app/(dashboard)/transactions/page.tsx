'use client';

import React from 'react';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { History, Download } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';

export default function TransactionsPage() {
  const { transactions } = useWallet();

  const handleExportCSV = () => {
    if (!transactions.length) return;
    const headers = ['Reference', 'Date', 'Type', 'Category', 'Description', 'Amount', 'Status'];
    const rows = transactions.map((t) => [
      t.reference,
      t.created_at,
      t.type,
      t.category,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.amount,
      t.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zuvapay_statement_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-brand-orange" />
            Transaction History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time transaction logs from web and mobile ZuvaPay activities.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4 text-brand-orange" />
          Export Statement (CSV)
        </button>
      </div>

      <RecentTransactions limit={100} showFilters={true} />
    </div>
  );
}
