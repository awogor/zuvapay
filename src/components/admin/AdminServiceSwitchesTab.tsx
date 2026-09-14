'use client';

import React, { useState, useEffect } from 'react';
import {
  Power,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Smartphone,
  Wifi,
  Zap,
  Tv,
  MessageSquareCode,
  TrendingUp,
  ShoppingBag,
  Sparkles,
  Save,
  Info,
} from 'lucide-react';
import { useToast } from '@/components/common/Toast';
import { ServiceSwitch } from '@/lib/services/serviceStatusStore';

const SERVICE_ICONS: Record<string, any> = {
  airtime: Smartphone,
  data: Wifi,
  power: Zap,
  tv: Tv,
  sms: MessageSquareCode,
  social: TrendingUp,
  logs: ShoppingBag,
  marketplace: Sparkles,
};

export function AdminServiceSwitchesTab() {
  const { success, error, info } = useToast();
  const [services, setServices] = useState<ServiceSwitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  // Maintenance message editing state
  const [editingMessages, setEditingMessages] = useState<Record<string, string>>({});
  const [savingMsgKey, setSavingMsgKey] = useState<string | null>(null);

  const fetchSwitches = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/service-switches');
      const data = await res.json();
      if (data.success) {
        setServices(data.services || []);
        const msgMap: Record<string, string> = {};
        (data.services || []).forEach((s: ServiceSwitch) => {
          msgMap[s.key] = s.maintenanceMessage || '';
        });
        setEditingMessages(msgMap);
      } else {
        error('Load Error', data.error || 'Failed to load service switches');
      }
    } catch (err: any) {
      error('Network Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwitches();
  }, []);

  const handleToggle = async (service: ServiceSwitch) => {
    const nextState = !service.enabled;
    setTogglingKey(service.key);
    try {
      const res = await fetch('/api/admin/service-switches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceKey: service.key,
          enabled: nextState,
          maintenanceMessage: editingMessages[service.key],
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (nextState) {
          success('Service Enabled', `${service.name} is now LIVE for all users.`);
        } else {
          info('Kill Switch Activated', `${service.name} is now OFFLINE. Users will receive the maintenance notice.`);
        }
        setServices((prev) =>
          prev.map((s) => (s.key === service.key ? data.service : s))
        );
      } else {
        error('Toggle Failed', data.error);
      }
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setTogglingKey(null);
    }
  };

  const handleSaveMessage = async (service: ServiceSwitch) => {
    setSavingMsgKey(service.key);
    try {
      const res = await fetch('/api/admin/service-switches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceKey: service.key,
          enabled: service.enabled,
          maintenanceMessage: editingMessages[service.key],
        }),
      });
      const data = await res.json();
      if (data.success) {
        success('Notice Updated', `Downtime notice updated for ${service.name}.`);
        setServices((prev) =>
          prev.map((s) => (s.key === service.key ? data.service : s))
        );
      } else {
        error('Save Failed', data.error);
      }
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setSavingMsgKey(null);
    }
  };

  const activeCount = services.filter((s) => s.enabled).length;
  const offlineCount = services.filter((s) => !s.enabled).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-black text-[10px] uppercase tracking-wider border border-rose-500/30">
              Operations Control
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Service Emergency Kill Switches
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Service Availability & Maintenance Switchboard
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Instantly halt individual services during telco downtime, stock replenishment, or vendor maintenance. Paused services reject orders safely with an explanatory message.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSwitches}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Registered Services</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{services.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
            <Power className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Live Operational Services</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{activeCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">Paused / Under Maintenance</p>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">{offlineCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => {
          const Icon = SERVICE_ICONS[service.key] || Power;
          const isToggling = togglingKey === service.key;
          const isSavingMsg = savingMsgKey === service.key;

          return (
            <div
              key={service.key}
              className={`p-5 rounded-3xl border transition-all shadow-sm ${
                service.enabled
                  ? 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-white/10'
                  : 'bg-rose-500/[0.03] dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 ring-1 ring-rose-500/20'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-2xl border ${
                      service.enabled
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {service.name}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({service.category})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Endpoint: <code className="font-mono text-amber-600 dark:text-brand-orange">/api/services/{service.key}</code>
                    </p>
                  </div>
                </div>

                {/* Kill Switch Toggle Button */}
                <button
                  onClick={() => handleToggle(service)}
                  disabled={isToggling}
                  className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                    service.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  title={service.enabled ? 'Click to deactivate service (Emergency Kill Switch)' : 'Click to resume service'}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      service.enabled ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Status Badge */}
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      service.enabled
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${service.enabled ? 'bg-emerald-500' : 'bg-rose-500 animate-ping'}`} />
                    {service.enabled ? 'LIVE ACCEPTING ORDERS' : 'OFFLINE (ORDERS BLOCKED)'}
                  </span>
                </div>

                <span className="text-[10px] text-slate-400 font-mono">
                  Key: {service.key}
                </span>
              </div>

              {/* Maintenance Notice Editor */}
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  <span>Custom User-Facing Notice (Shown on 503):</span>
                  <button
                    onClick={() => handleSaveMessage(service)}
                    disabled={isSavingMsg}
                    className="text-brand-orange hover:text-amber-500 font-bold flex items-center gap-1 text-[10px]"
                  >
                    <Save className="w-3 h-3" />
                    {isSavingMsg ? 'Saving...' : 'Update Notice'}
                  </button>
                </div>
                <input
                  type="text"
                  value={editingMessages[service.key] || ''}
                  onChange={(e) =>
                    setEditingMessages({
                      ...editingMessages,
                      [service.key]: e.target.value,
                    })
                  }
                  placeholder="e.g. Service is temporarily undergoing scheduled maintenance..."
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-brand-orange"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
