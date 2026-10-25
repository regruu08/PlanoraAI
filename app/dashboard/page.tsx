'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PlanoraEvent } from '@/types';
import { getEvents, deleteEvent, getBudgets, getTasks, getVendors } from '@/lib/storage';
import { formatINR, getDaysRemaining, formatDate, calculatePercentage } from '@/lib/utils';
import { 
  PlusCircle, 
  Calendar, 
  MapPin, 
  Users, 
  IndianRupee, 
  ArrowRight, 
  Sparkles, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Flame,
  Cake,
  Building2,
  Gift
} from 'lucide-react';

export default function DashboardPage() {
  const [events, setEvents] = useState<PlanoraEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    const list = getEvents();
    setEvents(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteEvent(id);
      loadData();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'wedding':
        return <Flame className="w-5 h-5 text-rose-500" />;
      case 'birthday':
        return <Cake className="w-5 h-5 text-amber-500" />;
      default:
        return <Building2 className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'wedding':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'birthday':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                Event Planning Dashboard
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold">
                {events.length} {events.length === 1 ? 'Event' : 'Events'}
              </span>
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              Select an event below to manage its AI blueprint, budget, timeline, vendors, and ideas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/events/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-md shadow-rose-200 transition-all hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Event</span>
            </Link>
          </div>
        </div>

        {/* Global Quick Action / Urgent Next Steps banner */}
        {events.length > 0 && (
          <div className="my-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-rose-50 to-orange-50 border border-amber-200/80 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 shadow-sm">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-amber-900">
                  Planora AI Priority Directive
                </span>
                <p className="text-sm text-zinc-800 font-medium mt-0.5">
                  &ldquo;Finalize banquet hall advance for Anuj&apos;s Wedding (Critical) &bull; Taste Awadhi catering menu&rdquo;
                </p>
              </div>
            </div>

            <Link
              href={`/events/${events[0].id}/copilot`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-zinc-800 border border-zinc-200 hover:bg-zinc-50 transition-colors shadow-xs shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Ask AI Copilot for Next Steps</span>
            </Link>
          </div>
        )}

        {/* Event Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-zinc-400">Loading your events...</div>
        ) : events.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-zinc-200 p-8 my-8">
            <Gift className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-zinc-800">No events found</h3>
            <p className="text-sm text-zinc-500 max-w-sm mx-auto mt-1">
              Start by creating your first celebration or exploring our ready-to-test demo events.
            </p>
            <Link
              href="/events/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create My First Event</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
            {events.map((evt) => {
              const days = getDaysRemaining(evt.event_date);
              const isPast = days < 0;
              const budgets = getBudgets(evt.id);
              const tasks = getTasks(evt.id);
              const vendors = getVendors(evt.id);

              const completedTasks = tasks.filter((t) => t.status === 'completed').length;
              const taskPct = calculatePercentage(completedTasks, tasks.length);

              const totalAllocated = budgets.reduce((acc, b) => acc + (b.allocated_amount || 0), 0);
              const budgetPct = calculatePercentage(totalAllocated, evt.total_budget);

              const confirmedVendors = vendors.filter((v) => v.status === 'confirmed').length;

              return (
                <div
                  key={evt.id}
                  className="bg-white rounded-2xl border border-zinc-200/90 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
                >
                  {/* Top Bar */}
                  <div className="p-5 pb-4 border-b border-zinc-100 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 group-hover:scale-105 transition-transform">
                        {getTypeIcon(evt.event_type)}
                      </div>
                      <div>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider ${getTypeBadge(evt.event_type)}`}>
                          {evt.event_type}
                        </span>
                        <h2 className="text-lg font-bold text-zinc-900 mt-1 line-clamp-1 group-hover:text-rose-600 transition-colors">
                          {evt.name}
                        </h2>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(evt.id, evt.name)}
                      className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-4 flex-1">
                    
                    {/* Meta info */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{formatDate(evt.event_date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span className={isPast ? 'text-zinc-500' : days <= 7 ? 'text-red-600 font-semibold' : 'text-zinc-700'}>
                          {isPast ? 'Past Event' : `${days} days left`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{evt.guest_count} guests</span>
                      </div>
                    </div>

                    {/* Budget Overview */}
                    <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-zinc-500">Total Budget</span>
                        <span className="font-bold text-zinc-900">{formatINR(evt.total_budget)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                        <span>Allocated: {formatINR(totalAllocated)}</span>
                        <span>{budgetPct}%</span>
                      </div>
                      <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, budgetPct)}%` }}
                        />
                      </div>
                    </div>

                    {/* Progress Metrics */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-2.5 rounded-xl border border-zinc-100 text-xs">
                        <span className="text-zinc-400 block text-[10px] uppercase font-bold">Tasks Done</span>
                        <span className="font-bold text-zinc-800 text-sm mt-0.5 block">
                          {completedTasks} / {tasks.length}
                        </span>
                        <div className="w-full bg-zinc-100 h-1 rounded-full mt-1.5 overflow-hidden">
                          <div 
                            className="bg-blue-500 h-full rounded-full"
                            style={{ width: `${taskPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl border border-zinc-100 text-xs">
                        <span className="text-zinc-400 block text-[10px] uppercase font-bold">Vendors</span>
                        <span className="font-bold text-zinc-800 text-sm mt-0.5 block">
                          {confirmedVendors} / {vendors.length} Confirmed
                        </span>
                        <div className="w-full bg-zinc-100 h-1 rounded-full mt-1.5 overflow-hidden">
                          <div 
                            className="bg-amber-500 h-full rounded-full"
                            style={{ width: `${calculatePercentage(confirmedVendors, vendors.length)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Footer Action */}
                  <div className="p-4 bg-zinc-50/80 border-t border-zinc-100 mt-auto">
                    <Link
                      href={`/events/${evt.id}`}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-zinc-200 text-zinc-800 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-xs"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
