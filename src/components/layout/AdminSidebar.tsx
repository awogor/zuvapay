'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Sliders,
  FileText,
  Zap,
  ShieldCheck,
  ArrowLeft,
  Activity,
  History,
  Lock,
  Mail,
} from 'lucide-react';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  const { profile } = useAuth();

  const navSections = [
    {
      label: 'Main Operations',
      items: [
        {
          name: 'Overview & Metrics',
          href: '/admin?tab=overview',
          tabId: 'overview',
          icon: LayoutDashboard,
        },
        {
          name: 'User Management',
          href: '/admin?tab=users',
          tabId: 'users',
          icon: Users,
          badge: 'Live',
        },
        {
          name: 'Wallet Adjustments',
          href: '/admin?tab=adjust',
          tabId: 'adjust',
          icon: Sliders,
        },
      ],
    },
    {
      label: 'Monitoring & Communication',
      items: [
        {
          name: 'Reports & Audit Logs',
          href: '/admin?tab=reports',
          tabId: 'reports',
          icon: FileText,
        },
        {
          name: 'Vendor Gateways',
          href: '/admin?tab=vendors',
          tabId: 'vendors',
          icon: Zap,
          badge: '5 Gateways',
        },
        {
          name: 'Email & Campaigns',
          href: '/admin?tab=email',
          tabId: 'email',
          icon: Mail,
          badge: 'SMTP',
        },
      ],
    },
    {
      label: 'Application Switch',
      items: [
        {
          name: 'Return to User App',
          href: '/dashboard',
          icon: ArrowLeft,
          highlight: true,
        },
      ],
    },
  ];

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/95 p-4 select-none transition-colors">
      {/* Brand logo */}
      <div className="flex items-center gap-3 px-2 py-4 mb-3 border-b border-slate-200 dark:border-white/10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-orange to-amber-500 font-black text-slate-950 shadow-md">
          KP
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
              Korrect<span className="text-brand-orange">Pay</span>
            </h1>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-brand-orange/15 text-brand-orange border border-brand-orange/30">
              Admin
            </span>
          </div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 mt-1">
            Operations Console
          </p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 space-y-6 overflow-y-auto pr-1">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {section.label}
            </p>
            {section.items.map((item: any) => {
              const Icon = item.icon;
              const isActive =
                item.tabId
                  ? pathname === '/admin' && currentTab === item.tabId
                  : pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-orange text-slate-950 shadow-sm font-bold'
                      : item.highlight
                      ? 'text-brand-orange hover:bg-brand-orange/10 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                        isActive
                          ? 'text-slate-950'
                          : item.highlight
                          ? 'text-brand-orange'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-slate-950/20 text-slate-950'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Admin Status Card */}
      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-white/10">
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/80 p-3.5 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                System Active
              </span>
            </div>
            <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
              99.9% Up
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2.5 pt-3 border-t border-slate-200/80 dark:border-white/5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-orange/15 border border-brand-orange/30 text-brand-orange font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-brand-orange" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {profile?.first_name || 'Admin'} {profile?.last_name || ''}
              </p>
              <p className="text-[10px] text-brand-orange font-semibold uppercase tracking-wider">
                Super Admin
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
