'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { FundWalletModal } from '@/components/modals/FundWalletModal';
import { SwapModal } from '@/components/modals/SwapModal';
import { AdminPinGate } from '@/components/admin/AdminPinGate';
import { ShieldAlert, X } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, isAdmin, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [isPinUnlocked, setIsPinUnlocked] = useState<boolean>(false);
  const [isCheckingPinAuth, setIsCheckingPinAuth] = useState<boolean>(true);

  // Check session storage for existing unlocked admin session
  useEffect(() => {
    if (!user?.id) {
      if (!loading) setIsCheckingPinAuth(false);
      return;
    }
    const unlockedKey = `zuvapay_admin_unlocked_${user.id}`;
    const unlockedAt = sessionStorage.getItem(unlockedKey);
    if (unlockedAt) {
      const elapsed = Date.now() - parseInt(unlockedAt, 10);
      // Valid for 2 hours
      if (elapsed < 2 * 60 * 60 * 1000) {
        setIsPinUnlocked(true);
      } else {
        sessionStorage.removeItem(unlockedKey);
        setIsPinUnlocked(false);
      }
    } else {
      setIsPinUnlocked(false);
    }
    setIsCheckingPinAuth(false);
  }, [user?.id, loading]);

  const handleUnlock = () => {
    if (user?.id) {
      sessionStorage.setItem(`zuvapay_admin_unlocked_${user.id}`, Date.now().toString());
    }
    setIsPinUnlocked(true);
  };

  const handleLockAdmin = () => {
    if (user?.id) {
      sessionStorage.removeItem(`zuvapay_admin_unlocked_${user.id}`);
    }
    setIsPinUnlocked(false);
  };

  if (loading || isCheckingPinAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white text-xs">
        Verifying administrative authorization...
      </div>
    );
  }

  const isAuthorizedAdmin =
    isAdmin ||
    profile?.role === 'admin' ||
    user?.user_metadata?.role === 'admin' ||
    user?.email === 'awogorm@gmail.com' ||
    user?.email === 'david@zuvapay.com';

  // Guard: Redirect non-admins back to dashboard
  if (!isAuthorizedAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center space-y-4 text-white">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <ShieldAlert className="w-10 h-10 mx-auto" />
        </div>
        <h2 className="text-xl font-black">Access Denied</h2>
        <p className="text-xs text-slate-400 max-w-sm">
          You do not have administrative privileges to access the ZuvaPay Admin Console.
        </p>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 rounded-xl bg-brand-orange text-slate-950 font-bold text-xs"
        >
          Return to Customer Dashboard
        </Link>
      </div>
    );
  }

  // Strict Transaction PIN Gate: Do not render any admin DOM or data until unlocked
  if (!isPinUnlocked) {
    return (
      <AdminPinGate
        onUnlock={handleUnlock}
        userEmail={user?.email}
        userName={profile?.first_name || user?.user_metadata?.first_name}
      />
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Desktop Admin Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <AdminSidebar onLockAdmin={handleLockAdmin} />
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
            <AdminSidebar
              onCloseMobile={() => setMobileMenuOpen(false)}
              onLockAdmin={handleLockAdmin}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenFundModal={() => setFundModalOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth bg-slate-50 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl space-y-8">
            {children}
          </div>
        </main>
        <BottomNav onOpenServicesDrawer={() => setMobileMenuOpen(true)} />
      </div>

      {/* Global Modals */}
      <FundWalletModal
        isOpen={fundModalOpen}
        onClose={() => setFundModalOpen(false)}
      />
      <SwapModal
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
      />
    </div>
  );
}
