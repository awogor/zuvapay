'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  FileText,
  UserCheck,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';
import { AgentApplication } from '@/lib/data/agentApplicationStore';

export function AdminAgentReviewTab() {
  const { success, error, info } = useToast();
  const [applications, setApplications] = useState<AgentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [businessFilter, setBusinessFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [selectedApp, setSelectedApp] = useState<AgentApplication | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/agent-requests');
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications || []);
      } else {
        error('Error', data.error || 'Failed to fetch agent applications');
      }
    } catch (err: any) {
      error('Network Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: AgentApplication['status'], notes?: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/agent-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: newStatus,
          adminNotes: notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        success('Status Updated', data.message);
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? data.application : a))
        );
        if (selectedApp && selectedApp.id === id) {
          setSelectedApp(data.application);
        }
      } else {
        error('Update Failed', data.error);
      }
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered applications
  const filtered = applications.filter((app) => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesBusiness = businessFilter === 'all' || app.businessType === businessFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      app.fullName.toLowerCase().includes(q) ||
      app.phone.toLowerCase().includes(q) ||
      (app.email || '').toLowerCase().includes(q) ||
      app.state.toLowerCase().includes(q);
    return matchesStatus && matchesBusiness && matchesSearch;
  });

  const getCleanPhone = (p: string) => {
    const digits = p.replace(/\D/g, '');
    if (digits.startsWith('0')) return '234' + digits.slice(1);
    if (digits.startsWith('234')) return digits;
    return '234' + digits;
  };

  const getWhatsAppLink = (app: AgentApplication) => {
    const cleanNumber = getCleanPhone(app.phone);
    const msg = encodeURIComponent(
      'Hello ' + app.fullName + ', this is ZuvaPay Merchant Onboarding regarding your request to become a ZuvaPay ' + app.businessType + ' partner in ' + app.state + '. How can we assist you today?'
    );
    return 'https://wa.me/' + cleanNumber + '?text=' + msg;
  };

  // Status badge style
  const getStatusBadge = (status: AgentApplication['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            Pending Review
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <MessageCircle className="w-3 h-3" />
            Contacted
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Approved Partner
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" />
            Declined
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-brand-orange/15 text-brand-orange font-black text-[10px] uppercase tracking-wider border border-brand-orange/30">
              Merchant Operations
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Partner Onboarding Queue
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Agent & API Reseller Applications
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Review merchant requests submitted via the public /agent portal, verify business types, and initiate 1-click WhatsApp onboarding.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchApplications}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Applicants</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{applications.length}</p>
          <p className="text-[10px] text-slate-400">All submissions</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Pending Review</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {applications.filter((a) => a.status === 'pending').length}
          </p>
          <p className="text-[10px] text-slate-400">Needs contact</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">In Contact</p>
          <p className="text-2xl font-black text-sky-600 dark:text-sky-400">
            {applications.filter((a) => a.status === 'contacted').length}
          </p>
          <p className="text-[10px] text-slate-400">Follow-up underway</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Approved Partners</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {applications.filter((a) => a.status === 'approved').length}
          </p>
          <p className="text-[10px] text-slate-400">Active merchant agents</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, email, or state..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-brand-orange"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-orange"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="contacted">Contacted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Declined</option>
          </select>

          <select
            value={businessFilter}
            onChange={(e) => setBusinessFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-orange"
          >
            <option value="all">All Business Types</option>
            <option value="POS Shop / Kiosk">POS Shop / Kiosk</option>
            <option value="API Reseller / Developer Integration">API Reseller</option>
            <option value="Sub-dealer / Aggregator">Sub-dealer / Aggregator</option>
            <option value="Online Vendor / Social Merchant">Online Vendor</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/60 uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-3.5 px-4 font-bold">Applicant / Contact</th>
              <th className="py-3.5 px-4 font-bold">Location</th>
              <th className="py-3.5 px-4 font-bold">Business Model</th>
              <th className="py-3.5 px-4 font-bold">Est. Daily Volume</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
              <th className="py-3.5 px-4 font-bold">Submitted</th>
              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  Loading agent applications queue...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  No applications match your current filters.
                </td>
              </tr>
            ) : (
              filtered.map((app) => {
                const waLink = getWhatsAppLink(app);

                return (
                  <tr
                    key={app.id}
                    onClick={() => {
                      setSelectedApp(app);
                      setNoteInput(app.adminNotes || '');
                    }}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-xs">{app.fullName}</p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {app.phone}
                          </span>
                          {app.email && (
                            <span className="flex items-center gap-1">
                              • {app.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {app.state}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        <Briefcase className="w-3 h-3 text-brand-orange" />
                        {app.businessType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                      {app.dailyVolume}
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(app.status)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {formatDate(app.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            if (app.status === 'pending') {
                              handleUpdateStatus(app.id, 'contacted');
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold transition-all"
                          title="Open WhatsApp chat with prefilled merchant welcome message"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Chat WhatsApp
                        </a>

                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setNoteInput(app.adminNotes || '');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-all"
                        >
                          Review
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedApp(null);
          }}
        >
          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-orange">Merchant Application Details</span>
                <h3 className="text-lg font-black text-white">{selectedApp.fullName}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedApp.phone} • {selectedApp.state}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950 border border-white/5 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block">Business Model</span>
                <span className="text-white font-bold">{selectedApp.businessType}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Expected Daily Volume</span>
                <span className="text-white font-bold">{selectedApp.dailyVolume}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Email Address</span>
                <span className="text-white font-mono">{selectedApp.email || 'None specified'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Current Status</span>
                <div className="mt-0.5">{getStatusBadge(selectedApp.status)}</div>
              </div>
            </div>

            {selectedApp.message && (
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Applicant Note / Message</span>
                <p className="text-xs text-slate-300 leading-relaxed italic">{selectedApp.message}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Internal Admin Follow-up Notes
              </label>
              <textarea
                rows={2}
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="e.g. Contacted via phone, interested in API docs for student portal..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-orange"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
              <a
                href={getWhatsAppLink(selectedApp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Open WhatsApp
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedApp.id, 'rejected', noteInput);
                    setSelectedApp(null);
                  }}
                  disabled={updatingId === selectedApp.id}
                  className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-all"
                >
                  Decline
                </button>
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedApp.id, 'contacted', noteInput);
                    setSelectedApp(null);
                  }}
                  disabled={updatingId === selectedApp.id}
                  className="px-3 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-bold transition-all"
                >
                  Mark Contacted
                </button>
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedApp.id, 'approved', noteInput);
                    setSelectedApp(null);
                  }}
                  disabled={updatingId === selectedApp.id}
                  className="px-4 py-2 rounded-xl bg-brand-orange hover:bg-amber-500 text-slate-950 font-bold text-xs transition-all shadow-md"
                >
                  Approve Partner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
