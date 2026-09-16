'use client';

import React from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Wifi,
  Zap,
  Tv,
  MessageSquareCode,
  TrendingUp,
  ShoppingBag,
  Sparkles,
  CreditCard,
} from 'lucide-react';

export function ServicesGrid() {
  const services = [
    {
      title: 'Airtime',
      icon: Smartphone,
      href: '/services/airtime',
    },
    {
      title: 'Data',
      icon: Wifi,
      href: '/services/data',
    },
    {
      title: 'Electricity',
      icon: Zap,
      href: '/services/power',
    },
    {
      title: 'Pay TV',
      icon: Tv,
      href: '/services/tv',
    },
    {
      title: 'Card',
      icon: CreditCard,
      href: '/services/cards',
    },
    {
      title: 'Number',
      icon: MessageSquareCode,
      href: '/services/sms',
    },
    {
      title: 'AI Tools',
      icon: Sparkles,
      href: '/services/marketplace',
    },
    {
      title: 'Accounts',
      icon: ShoppingBag,
      href: '/services/logs/all',
    },
    {
      title: 'Social',
      icon: TrendingUp,
      href: '/services/social/youtube',
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/80 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Quick Services
        </h2>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-y-5 gap-x-2 sm:gap-4">
        {services.map((svc) => {
          const Icon = svc.icon;
          return (
            <Link
              key={svc.title}
              href={svc.href}
              className="group flex flex-col items-center text-center focus:outline-none"
            >
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80 shadow-xs group-hover:scale-105 group-hover:shadow-md group-hover:border-brand-orange/50 group-hover:bg-brand-orange/10 dark:group-hover:bg-brand-orange/20 transition-all duration-200">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-brand-orange group-hover:scale-110 transition-transform stroke-[2]" />
              </div>
              <span className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-brand-orange transition-colors truncate max-w-full">
                {svc.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
