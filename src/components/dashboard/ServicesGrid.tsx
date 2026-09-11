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
  ArrowUpRight,
} from 'lucide-react';

export function ServicesGrid() {
  const services = [
    {
      title: 'Airtime Recharge',
      desc: 'MTN, Airtel, Glo, 9mobile with 2% discount',
      icon: Smartphone,
      href: '/services/airtime',
      badge: 'Instant',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      color: 'from-amber-500/20 to-orange-500/10 border-orange-500/30 text-amber-400',
      iconBg: 'bg-amber-500/20 text-amber-400',
    },
    {
      title: 'Internet Data Bundles',
      desc: 'SME, Gifting & Corporate high-speed data',
      icon: Wifi,
      href: '/services/data',
      badge: 'Best Rates',
      badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20',
      color: 'from-blue-500/20 to-sky-500/10 border-blue-500/30 text-sky-400',
      iconBg: 'bg-blue-500/20 text-sky-400',
    },
    {
      title: 'Electricity Token',
      desc: 'Instant prepaid token & postpaid Disco bill pay',
      icon: Zap,
      href: '/services/power',
      badge: 'Zero Fee',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      title: 'Cable TV Subscription',
      desc: 'DSTV, GOTV, StarTimes instant bouquet renewal',
      icon: Tv,
      href: '/services/tv',
      badge: 'Auto-Renew',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
      color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400',
      iconBg: 'bg-purple-500/20 text-purple-400',
    },
    {
      title: 'Virtual SMS / OTP Numbers',
      desc: 'Temporary phone numbers for WhatsApp, Telegram & 500+ apps',
      icon: MessageSquareCode,
      href: '/services/sms',
      badge: 'Global',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
      color: 'from-rose-500/20 to-orange-500/10 border-rose-500/30 text-rose-400',
      iconBg: 'bg-rose-500/20 text-rose-400',
      featured: true,
    },
    {
      title: 'Social Media Growth',
      desc: 'Boost YouTube, Instagram, Facebook, X, TikTok & Telegram accounts',
      icon: TrendingUp,
      href: '/services/social/youtube',
      badge: 'Trending',
      badgeColor: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20',
      color: 'from-pink-500/20 to-rose-500/10 border-pink-500/30 text-pink-400',
      iconBg: 'bg-pink-500/20 text-pink-400',
    },
    {
      title: 'Account Logs & Software',
      desc: 'Aged social accounts, VPNs, developer keys & streaming logs',
      icon: ShoppingBag,
      href: '/services/logs/all',
      badge: 'Instant',
      badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20',
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400',
      iconBg: 'bg-cyan-500/20 text-cyan-400',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">Digital Services & Utilities</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Instant Automated Delivery & 24/7 Service Fulfillment
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {services.map((svc) => {
          const Icon = svc.icon;
          return (
            <Link
              key={svc.title}
              href={svc.href}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <div className={`rounded-xl p-3 shadow-inner ${svc.iconBg}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${svc.badgeColor}`}>
                    {svc.badge}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-900 dark:group-hover:text-white" />
                </div>
              </div>

              <div className="mt-5 space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-orange transition-colors">
                  {svc.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{svc.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
