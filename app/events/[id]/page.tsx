'use client';

import React, { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventHeader from '@/components/EventHeader';
import { PlanoraEvent, BudgetItem, Task, Vendor, Idea } from '@/types';
import { getEventById, getBudgets, getTasks, getVendors, getIdeas, saveTask } from '@/lib/storage';
import { formatINR, calculatePercentage } from '@/lib/utils';
import { 
  Wallet, 
  Clock, 
  Store, 
  Lightbulb, 
  Bot, 
  ArrowRight, 
  CheckCircle2, 
  Circle, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function EventOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const eventId = unwrappedParams.id;

  const [event, setEvent] = useState<PlanoraEvent | null>(null);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    const evt = getEventById(eventId);
    if (evt) {
      setEvent(evt);
      setBudgets(getBudgets(eventId));
      setTasks(getTasks(eventId));
      setVendors(getVendors(eventId));
      setIdeas(getIdeas(eventId));
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50/50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-zinc-400 text-sm font-medium">Loading event workspace...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50/50">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-zinc-900">Event Not Found</h2>
          <p className="text-sm text-zinc-500 mt-2">The requested celebration plan could not be located.</p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-bold shadow-md hover:bg-rose-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculations
  const totalAllocated = budgets.reduce((acc, b) => acc + (b.allocated_amount || 0), 0);
  const totalActual = budgets.reduce((acc, b) => acc + (b.actual_amount || 0), 0);
  const remainingBudget = event.total_budget - totalActual;

  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const criticalTasks = pendingTasks.filter((t) => t.priority === 'critical');
  const taskProgressPct = calculatePercentage(completedTasks.length, tasks.length);

  const confirmedVendors = vendors.filter((v) => v.status === 'confirmed');
  const totalChecklistItems = vendors.reduce((acc, v) => acc + (v.checklist?.length || 0), 0);
  const completedChecklistItems = vendors.reduce(
    (acc, v) => acc + (v.checklist?.filter((c) => c.is_completed).length || 0),
    0
  );

  const toggleTask = (task: Task) => {
    const updated: Task = {
      ...task,
      status: task.status === 'completed' ? 'pending' : 'completed',
    };
    saveTask(updated);
    loadData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50">
      <Navbar />
      <EventHeader event={event} onRefresh={loadData} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Core Section: "WHAT SHOULD I DO NEXT?" */}
        <section className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 rounded-3xl p-1 text-white shadow-lg shadow-rose-200/50">
          <div className="bg-white rounded-[22px] p-6 sm:p-7 text-zinc-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-rose-600 uppercase tracking-wider block">
                    Planora AI Directive
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
                    What Should I Do Next?
                  </h2>
                </div>
              </div>

              <Link
                href={`/events/${event.id}/copilot`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors w-fit shadow-xs"
              >
                <Bot className="w-4 h-4" />
                <span>Ask AI Copilot</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Directive items list */}
            <div className="mt-5 space-y-3">
              {criticalTasks.length > 0 ? (
                criticalTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 flex items-start justify-between gap-3 hover:bg-rose-50/40 transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <button
                        onClick={() => toggleTask(task)}
                        className="mt-0.5 text-zinc-300 hover:text-rose-600 transition-colors"
                        title="Mark Completed"
                      >
                        <Circle className="w-4 h-4" />
                      </button>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-zinc-900">{task.title}</span>
                          <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-red-100 text-red-700 uppercase tracking-wider">
                            Critical
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{task.description}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Due by</span>
                      <span className="text-xs font-extrabold text-rose-600">{task.due_date}</span>
                    </div>
                  </div>
                ))
              ) : pendingTasks.length > 0 ? (
                pendingTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3.5">
                      <button
                        onClick={() => toggleTask(task)}
                        className="mt-0.5 text-zinc-300 hover:text-rose-600 transition-colors"
                        title="Mark Completed"
                      >
                        <Circle className="w-4 h-4" />
                      </button>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-zinc-900">{task.title}</span>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700 uppercase">
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{task.description}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Due by</span>
                      <span className="text-xs font-bold text-zinc-700">{task.due_date}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-semibold">All prioritized tasks completed! Review your vendor verification checklists next.</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 4 Planning Metric Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* 1. Budget Card */}
          <Link
            href={`/events/${event.id}/budget`}
            className="p-6 rounded-3xl bg-white border border-zinc-200 hover:border-emerald-300 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Budget</span>
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
                <Wallet className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-black text-zinc-900 tracking-tight">
                {formatINR(totalActual)}
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                spent of {formatINR(event.total_budget)} total budget
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-zinc-100 flex items-center justify-between text-xs">
              <span className="text-zinc-500">Allocated: {formatINR(totalAllocated)}</span>
              <span className="font-bold text-emerald-600 flex items-center">
                Manage <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </Link>

          {/* 2. Tasks Card */}
          <Link
            href={`/events/${event.id}/timeline`}
            className="p-6 rounded-3xl bg-white border border-zinc-200 hover:border-blue-300 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Timeline</span>
              <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-black text-zinc-900 tracking-tight">
                {completedTasks.length} <span className="text-sm font-normal text-zinc-400">/ {tasks.length}</span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                {pendingTasks.length} pending ({criticalTasks.length} critical)
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-zinc-100 flex items-center justify-between text-xs">
              <span className="text-zinc-500">{taskProgressPct}% completed</span>
              <span className="font-bold text-blue-600 flex items-center">
                View Tasks <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </Link>

          {/* 3. Vendors Card */}
          <Link
            href={`/events/${event.id}/vendors`}
            className="p-6 rounded-3xl bg-white border border-zinc-200 hover:border-amber-300 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Vendors</span>
              <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
                <Store className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-black text-zinc-900 tracking-tight">
                {confirmedVendors.length} <span className="text-sm font-normal text-zinc-400">/ {vendors.length}</span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                {completedChecklistItems} of {totalChecklistItems} checklist items verified
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-zinc-100 flex items-center justify-between text-xs">
              <span className="text-zinc-500">Checklists Ready</span>
              <span className="font-bold text-amber-600 flex items-center">
                Verify <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </Link>

          {/* 4. Ideas Card */}
          <Link
            href={`/events/${event.id}/ideas`}
            className="p-6 rounded-3xl bg-white border border-zinc-200 hover:border-purple-300 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Ideas</span>
              <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
                <Lightbulb className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-black text-zinc-900 tracking-tight">
                {ideas.length}
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                Personalized cultural experiences
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-zinc-100 flex items-center justify-between text-xs">
              <span className="text-zinc-500">Theme, Decor, Food</span>
              <span className="font-bold text-purple-600 flex items-center">
                Explore <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </Link>

        </section>

        {/* Split Section: Budget Snapshot + Vendor Verification */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Budget Snapshot */}
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-7 shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <Wallet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-zinc-900 text-base">Budget Allocations</h3>
              </div>
              <Link
                href={`/events/${event.id}/budget`}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <span>Full Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-zinc-100 mt-2 flex-1">
              {budgets.slice(0, 4).map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-bold text-zinc-800 block">{item.category}</span>
                    <span className="text-xs text-zinc-400 capitalize">{item.priority} priority</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-zinc-900 block">{formatINR(item.allocated_amount)}</span>
                    <span className="text-xs text-zinc-500">Spent: {formatINR(item.actual_amount)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-100 bg-zinc-50/80 -mx-6 -mb-6 p-6 rounded-b-3xl flex items-center justify-between text-xs">
              <span className="text-zinc-600 font-medium">Remaining Buffer / Unallocated:</span>
              <span className="font-extrabold text-emerald-700 text-sm">{formatINR(remainingBudget)}</span>
            </div>
          </div>

          {/* Vendors & Checklists Snapshot */}
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-7 shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <Store className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-zinc-900 text-base">Vendor Verification Progress</h3>
              </div>
              <Link
                href={`/events/${event.id}/vendors`}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <span>All Checklists</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-zinc-100 mt-2 flex-1">
              {vendors.slice(0, 4).map((vendor) => {
                const completedItems = vendor.checklist?.filter((c) => c.is_completed).length || 0;
                const totalItems = vendor.checklist?.length || 0;

                return (
                  <div key={vendor.id} className="py-3.5 flex items-center justify-between text-sm">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-800">{vendor.vendor_type}</span>
                        {vendor.name && (
                          <span className="text-xs text-zinc-500 font-medium">({vendor.name})</span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-400">
                        {completedItems} of {totalItems} verification items checked
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full capitalize ${
                      vendor.status === 'confirmed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : vendor.status === 'contacted'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                    }`}>
                      {vendor.status.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-100 bg-zinc-50/80 -mx-6 -mb-6 p-6 rounded-b-3xl flex items-center justify-between text-xs">
              <span className="text-zinc-600 font-medium">Verification Progress:</span>
              <span className="font-extrabold text-amber-800 text-sm">
                {calculatePercentage(completedChecklistItems, totalChecklistItems)}% verified
              </span>
            </div>
          </div>

        </section>

      </main>

      <Footer />
    </div>
  );
}
