'use client';

import React, { use, useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventHeader from '@/components/EventHeader';
import { PlanoraEvent, Vendor, VendorStatus, VendorChecklistItem } from '@/types';
import { getEventById, getVendors, saveVendor } from '@/lib/storage';
import { formatINR, calculatePercentage } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { 
  Store, 
  CheckCircle2, 
  Circle, 
  Plus, 
  IndianRupee, 
  FileText, 
  CheckSquare, 
  Square, 
  ShieldCheck,
  ChevronDown,
  X
} from 'lucide-react';

export default function VendorsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const eventId = unwrappedParams.id;

  const [event, setEvent] = useState<PlanoraEvent | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  
  // Add vendor modal
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [newVendorType, setNewVendorType] = useState('');
  const [newVendorName, setNewVendorName] = useState('');
  const [newBudget, setNewBudget] = useState<number | string>('');
  const [newChecklistRaw, setNewChecklistRaw] = useState('');

  // Add checklist item state for a specific vendor
  const [activeVendorForChecklist, setActiveVendorForChecklist] = useState<string | null>(null);
  const [newChecklistLabel, setNewChecklistLabel] = useState('');

  const loadData = () => {
    const evt = getEventById(eventId);
    if (evt) {
      setEvent(evt);
      setVendors(getVendors(eventId));
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  if (!event) {
    return <div className="p-8 text-center text-zinc-400">Loading vendors...</div>;
  }

  const handleStatusChange = (vendor: Vendor, status: VendorStatus) => {
    const updated: Vendor = { ...vendor, status };
    saveVendor(updated);
    if (status === 'confirmed') {
      try {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.6 },
        });
      } catch {}
    }
    loadData();
  };

  const toggleChecklistItem = (vendor: Vendor, itemIndex: number) => {
    const updatedChecklist = [...vendor.checklist];
    updatedChecklist[itemIndex].is_completed = !updatedChecklist[itemIndex].is_completed;

    const updatedVendor: Vendor = {
      ...vendor,
      checklist: updatedChecklist,
    };

    saveVendor(updatedVendor);
    loadData();
  };

  const handleAddChecklistItem = (vendor: Vendor) => {
    if (!newChecklistLabel.trim()) return;

    const newItem: VendorChecklistItem = {
      id: `vc-${Date.now()}`,
      vendor_id: vendor.id,
      label: newChecklistLabel.trim(),
      is_completed: false,
    };

    const updatedVendor: Vendor = {
      ...vendor,
      checklist: [...vendor.checklist, newItem],
    };

    saveVendor(updatedVendor);
    setNewChecklistLabel('');
    setActiveVendorForChecklist(null);
    loadData();
  };

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorType) return;

    const items: VendorChecklistItem[] = newChecklistRaw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((label, idx) => ({
        id: `vc-${Date.now()}-${idx}`,
        vendor_id: `vnd-${Date.now()}`,
        label,
        is_completed: false,
      }));

    const newVendor: Vendor = {
      id: `vnd-${Date.now()}`,
      event_id: event.id,
      vendor_type: newVendorType,
      name: newVendorName || undefined,
      estimated_budget: Number(newBudget) || 0,
      status: 'needed',
      checklist: items.length > 0 ? items : [
        { id: `vc-1-${Date.now()}`, vendor_id: `vnd-${Date.now()}`, label: 'Verify portfolio and previous client reviews', is_completed: false },
        { id: `vc-2-${Date.now()}`, vendor_id: `vnd-${Date.now()}`, label: 'Negotiate advance payment terms and refund clauses', is_completed: false },
      ],
      created_at: new Date().toISOString(),
    };

    saveVendor(newVendor);
    setShowAddVendor(false);
    setNewVendorType('');
    setNewVendorName('');
    setNewBudget('');
    setNewChecklistRaw('');
    loadData();
  };

  const statusOptions: { label: string; value: VendorStatus; color: string }[] = [
    { label: 'Needed', value: 'needed', color: 'bg-zinc-100 text-zinc-700' },
    { label: 'Shortlisted', value: 'shortlisted', color: 'bg-amber-50 text-amber-700' },
    { label: 'Contacted', value: 'contacted', color: 'bg-blue-50 text-blue-700' },
    { label: 'Quote Received', value: 'quote_received', color: 'bg-purple-50 text-purple-700' },
    { label: 'Confirmed', value: 'confirmed', color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Completed', value: 'completed', color: 'bg-zinc-800 text-white' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50">
      <Navbar />
      <EventHeader event={event} onRefresh={loadData} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Vendors & Smart Verification Checklists</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Review critical verification questions before hiring vendors or paying advances.
            </p>
          </div>

          <button
            onClick={() => setShowAddVendor(!showAddVendor)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vendor Category</span>
          </button>
        </div>

        {/* Add Vendor Modal */}
        {showAddVendor && (
          <form onSubmit={handleCreateVendor} className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-bold text-sm text-zinc-900">Add New Vendor Category</h3>
              <button
                type="button"
                onClick={() => setShowAddVendor(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Vendor Type</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DJ / Sound Troupe"
                  value={newVendorType}
                  onChange={(e) => setNewVendorType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Vendor / Business Name</label>
                <input
                  type="text"
                  placeholder="e.g. DJ Sahil Lucknow"
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Estimated Budget (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 35000"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Verification Checklist (1 item per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Verify sound permission license&#10;Check backup amplifier setup&#10;Confirm wireless mic count"
                  value={newChecklistRaw}
                  onChange={(e) => setNewChecklistRaw(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddVendor(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700"
              >
                Add Vendor
              </button>
            </div>
          </form>
        )}

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {vendors.map((vendor) => {
            const completedCount = vendor.checklist?.filter((c) => c.is_completed).length || 0;
            const totalCount = vendor.checklist?.length || 0;
            const pct = calculatePercentage(completedCount, totalCount);

            return (
              <div
                key={vendor.id}
                className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 flex flex-col justify-between"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-100">
                    <div>
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                        Category
                      </span>
                      <h3 className="text-lg font-bold text-zinc-900 mt-0.5">
                        {vendor.vendor_type}
                      </h3>
                      {vendor.name && (
                        <span className="text-xs font-semibold text-zinc-500 block">
                          Partner: {vendor.name}
                        </span>
                      )}
                    </div>

                    {/* Status Dropdown */}
                    <div className="relative">
                      <select
                        value={vendor.status}
                        onChange={(e) => handleStatusChange(vendor, e.target.value as VendorStatus)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 bg-zinc-50 uppercase tracking-wider cursor-pointer"
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Financial context */}
                  <div className="flex items-center justify-between text-xs py-3 border-b border-zinc-100 text-zinc-600">
                    <span>Estimated: <strong className="text-zinc-900">{formatINR(vendor.estimated_budget)}</strong></span>
                    {vendor.actual_quote ? (
                      <span>Quote: <strong className="text-emerald-700">{formatINR(vendor.actual_quote)}</strong></span>
                    ) : (
                      <span className="text-zinc-400">No quote finalized</span>
                    )}
                  </div>

                  {/* Checklist Section */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-zinc-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Verification Checklist ({completedCount}/{totalCount})
                      </span>
                      <span className="text-zinc-400 font-semibold">{pct}%</span>
                    </div>

                    <div className="w-full bg-zinc-100 h-1 rounded-full mb-3 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="space-y-2 mt-3">
                      {vendor.checklist?.map((item, idx) => (
                        <div
                          key={item.id}
                          onClick={() => toggleChecklistItem(vendor, idx)}
                          className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer text-xs transition-colors ${
                            item.is_completed
                              ? 'bg-emerald-50/50 border-emerald-200/70 text-zinc-700'
                              : 'bg-zinc-50/60 border-zinc-200/80 text-zinc-800 hover:bg-zinc-100'
                          }`}
                        >
                          <button
                            type="button"
                            className={`mt-0.5 shrink-0 ${item.is_completed ? 'text-emerald-600' : 'text-zinc-300'}`}
                          >
                            {item.is_completed ? (
                              <CheckSquare className="w-4 h-4 fill-emerald-100" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                          <span className={item.is_completed ? 'line-through text-zinc-400' : ''}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Add quick item */}
                    {activeVendorForChecklist === vendor.id ? (
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Ask for power generator backup"
                          value={newChecklistLabel}
                          onChange={(e) => setNewChecklistLabel(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
                        />
                        <button
                          onClick={() => handleAddChecklistItem(vendor)}
                          className="px-3 py-1.5 text-xs font-semibold bg-zinc-900 text-white rounded-xl"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setActiveVendorForChecklist(null)}
                          className="px-2 py-1.5 text-xs text-zinc-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveVendorForChecklist(vendor.id)}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Checklist Item</span>
                      </button>
                    )}
                  </div>
                </div>

                {vendor.notes && (
                  <p className="mt-4 pt-3 border-t border-zinc-100 text-xs text-zinc-500 italic">
                    Note: {vendor.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>

      </main>

      <Footer />
    </div>
  );
}
