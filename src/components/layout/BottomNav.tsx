'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Zap,
  History,
  MessageSquareCode,
  User,
} from 'lucide-react';

interface BottomNavProps {
  onOpenServicesDrawer?: () => void;
}

export function BottomNav({ onOpenServicesDrawer }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Services', href: '#services', icon: Zap, isAction: true },
    { name: 'SMS / OTP', href: '/services/sms', icon: MessageSquareCode },
    { name: 'History', href: '/transactions', icon: History },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-11 w-full items-center justify-around border-t border-slate-200/70 dark:border-white/5 bg-white/95 dark:bg-slate-950/95 px-1 backdrop-blur-md md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        if (item.isAction) {
          return (
            <button
              key={item.name}
              type="button"
              onClick={onOpenServicesDrawer}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-slate-400 hover:text-brand-orange dark:text-slate-400 dark:hover:text-brand-orange transition-colors"
            >
              <div className="flex items-center justify-center rounded-md p-1 bg-amber-500/10 text-brand-orange">
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-[9px] font-medium tracking-tight text-brand-orange">{item.name}</span>
            </button>
          );
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-colors ${
              isActive
                ? 'text-brand-orange font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="text-[9px] tracking-tight">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
