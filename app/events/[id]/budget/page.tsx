'use client';

import React, { use, useCallback, useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventHeader from '@/components/EventHeader';
import { PlanoraEvent, BudgetItem, Priority } from '@/types';
import { getEventById, getBudgets, saveBudgetItem } from '@/lib/storage';
import { formatINR, calculatePercentage } from '@/lib/utils';
import { 
  Plus, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp,
  Edit2,
  Save,
  X,
  Lightbulb
} from 'lucide-react';

export default function BudgetPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const eventId = unwrappedParams.id;

  const [event, setEvent] = useState<PlanoraEvent | null>(null);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editActual, setEditActual] = useState<number>(0);
  
  // New item modal
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newAllocated, setNewAllocated] = useState<number | string>('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newReason, setNewReason] = useState('');

  const loadData = useCallback(() => {
    const evt = getEventById(eventId);
    if (evt) {
      setEvent(evt);
      setBudgets(getBudgets(eventId));
    }
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!event) {
    return <div className="p-8 text-center text-zinc-400 font-medium">Loading budget planner...</div>;
  }

  // Calculations
  const totalAllocated = budgets.reduce((acc, b) => acc + (b.allocated_amount || 0), 0);
  const totalActual = budgets.reduce((acc, b) => acc + (b.actual_amount || 0), 0);
  const remaining = event.total_budget - totalActual;
  const isOverAllocated = totalAllocated > event.total_budget;
  const isOverSpent = totalActual > event.total_budget;

  const startEdit = (item: BudgetItem) => {
    setEditingId(item.id);
    setEditActual(item.actual_amount);
  };

  const saveEdit = (item: BudgetItem) => {
    const updated: BudgetItem = {
      ...item,
      actual_amount: Number(editActual),
    };
    saveBudgetItem(updated);
    setEditingId(null);
    loadData();
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory || !newAllocated) return;

    const newItem: BudgetItem = {
      id: `bgt-${Date.now()}`,
      event_id: event.id,
      category: newCategory,
      allocated_amount: Number(newAllocated),
      actual_amount: 0,
      priority: newPriority,
      reason: newReason || 'Custom user expense',
      created_at: new Date().toISOString(),
    };

    saveBudgetItem(newItem);
    setShowAddForm(false);
    setNewCategory('');
    setNewAllocated('');
    setNewReason('');
    loadData();
  };

  const priorityColors: Record<Priority, string> = {
    critical: 'bg-red-50 text-red-700 border-red-200',
    high: 'bg-orange-50 text-orange-700 border-orange-200',
    medium: 'bg-blue-50 text-blue-700 border-blue-200',
    low: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  };

  // Slices for visual distribution
  const categoryColors = [
    'bg-rose-500',
    'bg-amber-500',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50">
      <Navbar />
      <EventHeader event={event} onRefresh={loadData} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Budget KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-sm">
            <span className="text-xs uppercase font-extrabold tracking-wider text-zinc-400 block mb-1">
              Total Budget
            </span>
            <div className="text-2xl font-black text-zinc-900 tracking-tight">
              {formatINR(event.total_budget)}
            </div>
            <p className="text-xs text-zinc-500 mt-1 font-medium">Set during event planning</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-sm">
            <span className="text-xs uppercase font-extrabold tracking-wider text-zinc-400 block mb-1">
              Allocated by AI
            </span>
            <div className={`text-2xl font-black tracking-tight ${isOverAllocated ? 'text-red-600' : 'text-blue-600'}`}>
              {formatINR(totalAllocated)}
            </div>
            <p className="text-xs text-zinc-500 mt-1 font-medium">
              {calculatePercentage(totalAllocated, event.total_budget)}% of total budget
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-sm">
            <span className="text-xs uppercase font-extrabold tracking-wider text-zinc-400 block mb-1">
              Actual Expenses
            </span>
            <div className={`text-2xl font-black tracking-tight ${isOverSpent ? 'text-red-600' : 'text-zinc-900'}`}>
              {formatINR(totalActual)}
            </div>
            <p className="text-xs text-zinc-500 mt-1 font-medium">
              {calculatePercentage(totalActual, event.total_budget)}% spent so far
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-sm">
            <span className="text-xs uppercase font-extrabold tracking-wider text-zinc-400 block mb-1">
              Remaining Balance
            </span>
            <div className={`text-2xl font-black tracking-tight ${remaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {formatINR(remaining)}
            </div>
            <p className="text-xs text-zinc-500 mt-1 font-medium">
              {remaining < 0 ? 'Budget deficit!' : 'Available for buffers'}
            </p>
          </div>

        </div>

        {/* Visual Allocation Distribution Bar */}
        <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-700">
            <span>Visual Category Allocation</span>
            <span>{calculatePercentage(totalAllocated, event.total_budget)}% Allocated</span>
          </div>

          <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden flex">
            {budgets.map((b, idx) => {
              const pct = (b.allocated_amount / (totalAllocated || 1)) * 100;
              const color = categoryColors[idx % categoryColors.length];
              return (
                <div
                  key={b.id}
                  className={`${color} h-full transition-all`}
                  style={{ width: `${pct}%` }}
                  title={`${b.category}: ${formatINR(b.allocated_amount)}`}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-zinc-500 font-medium">
            {budgets.slice(0, 5).map((b, idx) => (
              <span key={b.id} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${categoryColors[idx % categoryColors.length]}`} />
                <span>{b.category}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Overspending Warning Alert */}
        {isOverSpent && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-800 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
            <div>
              <span className="font-bold">Overspending Alert:</span> You have exceeded your total budget by {formatINR(Math.abs(remaining))}. Ask the AI Copilot to suggest cost optimizations in Decor or Catering!
            </div>
          </div>
        )}

        {/* Action Header & Add Expense */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight">Category Allocations &amp; Spend Log</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Click &quot;Edit Actual&quot; on any item to log verified vendor payments and quotes.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Expense</span>
          </button>
        </div>

        {/* Add Custom Item Modal */}
        {showAddForm && (
          <form onSubmit={handleAddItem} className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-sm space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-bold text-sm text-zinc-900">Add New Category Expense</h3>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Guest Transport"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Allocated Budget (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 25000"
                  value={newAllocated}
                  onChange={(e) => setNewAllocated(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 bg-white"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-zinc-700 mb-1">Reason / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. 2 tempo travellers for airport pickup and venue drop"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700"
              >
                Save Category
              </button>
            </div>
          </form>
        )}

        {/* Budget Table */}
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase font-extrabold text-zinc-500">
                <tr>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Priority</th>
                  <th className="py-4 px-6">Allocated</th>
                  <th className="py-4 px-6">Actual Spend</th>
                  <th className="py-4 px-6">Variance</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {budgets.map((item) => {
                  const variance = item.allocated_amount - item.actual_amount;
                  const isOver = variance < 0;
                  const isEditing = editingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-bold text-zinc-900 block">{item.category}</span>
                        {item.reason && (
                          <span className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{item.reason}</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-0.5 text-[11px] font-extrabold rounded-full border uppercase tracking-wider ${priorityColors[item.priority]}`}>
                          {item.priority}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-extrabold text-zinc-900">
                        {formatINR(item.allocated_amount)}
                      </td>

                      <td className="py-4 px-6">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-zinc-400 font-bold">₹</span>
                            <input
                              type="number"
                              value={editActual}
                              onChange={(e) => setEditActual(Number(e.target.value))}
                              className="w-28 px-2.5 py-1 rounded-lg border border-zinc-300 text-sm font-bold"
                            />
                          </div>
                        ) : (
                          <span className="font-semibold text-zinc-800">
                            {formatINR(item.actual_amount)}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          isOver ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {isOver ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {isOver ? `+${formatINR(Math.abs(variance))}` : `-${formatINR(variance)}`}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => saveEdit(item)}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              title="Save"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(item)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit Actual</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Cost Optimizer Callout */}
        <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3.5 text-xs text-amber-900">
          <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-extrabold uppercase tracking-wider block">AI Budget Optimizer Strategy</span>
            <p className="leading-relaxed text-amber-800">
              For <strong>{event.name}</strong> ({event.guest_count} guests), Venue and Catering account for ~62% of allocated funds. 
              To avoid overruns, negotiate packaged rates for indoor lighting with the banquet hall, and verify with your caterer that live counters (e.g. kulfi/jalebi) include waste buffer policies.
            </p>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
