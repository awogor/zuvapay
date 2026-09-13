'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { FundWalletModal } from '@/components/modals/FundWalletModal';
import { SwapModal } from '@/components/modals/SwapModal';
import { PinSetupModal } from '@/components/modals/PinSetupModal';
import { useWallet } from '@/context/WalletContext';
import { useAuth } from '@/context/AuthContext';
import { X, Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isFundModalOpen, openFundModal, closeFundModal } = useWallet();
  const { user, profile, loading: authLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);

  // Authentication guard & URL sanitizer
  useEffect(() => {
    // Strip any unwanted query parameters (like ?reason=...) from dashboard URL immediately
    if (typeof window !== 'undefined' && window.location.search.includes('reason=')) {
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (!authLoading && !user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      } else {
        router.replace('/login');
      }
    }
  }, [authLoading, user, router]);

  // Mandatory PIN setup: If user is authenticated and is_pin_set is false, show locked modal
  const needsPinSetup = Boolean(!authLoading && user && profile && profile.is_pin_set === false);

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-brand-orange animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Verifying ZuvaPay Session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar
          onOpenFundModal={openFundModal}
        />
      </div>

      {/* Mobile Drawer Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 flex w-72 flex-col bg-white dark:bg-slate-950 shadow-2xl">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar
              onOpenFundModal={() => {
                setMobileMenuOpen(false);
                openFundModal();
              }}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenFundModal={openFundModal}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-14 md:pb-8 bg-slate-50 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav onOpenServicesDrawer={() => setMobileMenuOpen(true)} />
      </div>

      {/* Modals */}
      <FundWalletModal
        isOpen={isFundModalOpen}
        onClose={closeFundModal}
      />
      <SwapModal
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
      />
      <PinSetupModal
        isOpen={needsPinSetup}
      />
    </div>
  );
}
