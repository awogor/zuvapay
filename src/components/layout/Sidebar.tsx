'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { formatNaira } from '@/lib/utils';
import {
  LayoutDashboard,
  Smartphone,
  Wifi,
  Zap,
  Tv,
  MessageSquareCode,
  TrendingUp,
  ShoppingBag,
  History,
  UserCheck,
  PlusCircle,
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { useSupport } from '@/components/modals/SupportModal';

interface SidebarProps {
  onOpenFundModal?: () => void;
  onCloseMobile?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

export function Sidebar({ onOpenFundModal, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { wallet, formatBalance } = useWallet();
  const { isAdmin } = useAuth();
  const { openSupport } = useSupport();

  const navSections: NavSection[] = [
    {
      label: 'Main',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Transactions', href: '/transactions', icon: History },
      ],
    },
    {
      label: 'Bills & Utilities',
      items: [
        { name: 'Buy Airtime', href: '/services/airtime', icon: Smartphone },
        { name: 'Internet Data', href: '/services/data', icon: Wifi },
        { name: 'Electricity Bill', href: '/services/power', icon: Zap },
        { name: 'Cable TV', href: '/services/tv', icon: Tv },
        { name: 'Virtual Phone Number', href: '/services/sms', icon: MessageSquareCode, badge: 'Global' },
        { name: 'Virtual Dollar Card', href: '/services/cards', icon: CreditCard, badge: 'USD', highlight: true },
      ],
    },
    {
      label: 'Digital Marketplace',
      items: [
        { name: 'AI Marketplace', href: '/services/marketplace', icon: Sparkles, badge: 'Hot', highlight: true },
        { name: 'Log Market', href: '/services/logs/all', icon: ShoppingBag, badge: 'Instant' },
        { name: 'Social Boost', href: '/services/social/youtube', icon: TrendingUp },
      ],
    },
    {
      label: 'Account',
      items: [
        { name: 'Profile & Security', href: '/profile', icon: UserCheck },
        ...(isAdmin
          ? [
              {
                name: 'Admin Portal',
                href: '/admin',
                icon: ShieldCheck,
                badge: 'Admin',
                highlight: true,
              },
            ]
          : []),
      ],
    },
  ];

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/95 p-4 select-none transition-colors">
      {/* Brand logo */}
      <div className="flex items-center gap-3 px-2 py-4 mb-3 border-b border-slate-200 dark:border-white/10">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-zuva-solar via-zuva-amber to-zuva-gold font-black text-lg text-slate-950 shadow-md shadow-orange-500/20">
          ZP
        </div>
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
            Zuva<span className="text-brand-orange">Pay</span>
          </h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase">
            Fintech & Digital Hub
          </p>
        </div>
      </div>

      {/* Navigation links */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-brand-orange/15 text-brand-orange border border-brand-orange/30 shadow-sm font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-brand-orange' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                          isActive
                            ? 'bg-brand-orange text-slate-950'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 24/7 Support Quick Action */}
      <div className="pt-2 pb-1">
        <button
          type="button"
          onClick={() => {
            onCloseMobile?.();
            openSupport({
              service: 'General Inquiry',
              issue: 'Customer requested assistance from Sidebar',
            });
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:border-brand-orange/40 hover:bg-brand-orange/10 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-brand-orange" />
            <span>Help & Support</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider">
            24/7
          </span>
        </button>
      </div>

      {/* Bottom Mini Wallet Card */}
      <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">Balance</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">● Synchronized</span>
        </div>
        <p suppressHydrationWarning className="font-mono text-base font-black text-slate-900 dark:text-white">
          {formatBalance(wallet?.balance || 0)}
        </p>
        <button
          onClick={onOpenFundModal}
          className="w-full mt-2.5 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-brand-orange hover:bg-amber-500 text-slate-950 text-xs font-bold transition-all shadow-md"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Fund Wallet
        </button>
      </div>
    </aside>
  );
}
