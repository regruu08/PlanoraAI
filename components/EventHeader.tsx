'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlanoraEvent } from '@/types';
import { formatINR, getDaysRemaining, formatDate } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { 
  Calendar, 
  MapPin, 
  Users, 
  IndianRupee, 
  Sparkles, 
  LayoutDashboard, 
  Wallet, 
  Clock, 
  Store, 
  Lightbulb, 
  Bot,
  RefreshCw,
  Printer,
  ChevronRight
} from 'lucide-react';
import { applyBlueprintToEvent } from '@/lib/storage';

interface EventHeaderProps {
  event: PlanoraEvent;
  onRefresh?: () => void;
}

export default function EventHeader({ event, onRefresh }: EventHeaderProps) {
  const pathname = usePathname();
  const [isGenerating, setIsGenerating] = useState(false);

  const daysRemaining = getDaysRemaining(event.event_date);
  const isPast = daysRemaining < 0;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleRegeneratePlan = async () => {
    if (!confirm('Regenerate AI plan? Gemini will recalculate budget allocations, reverse timelines, and ideas based on current event context.')) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/events/${event.id}/generate-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event }),
      });
      const data = await res.json();
      if (data.success && data.blueprint) {
        applyBlueprintToEvent(event.id, data.blueprint);
        triggerConfetti();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Plan generation failed', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const navTabs = [
    { label: 'Overview', href: `/events/${event.id}`, icon: LayoutDashboard },
    { label: 'Budget Planner', href: `/events/${event.id}/budget`, icon: Wallet },
    { label: 'Timeline & Tasks', href: `/events/${event.id}/timeline`, icon: Clock },
    { label: 'Vendors & Checklists', href: `/events/${event.id}/vendors`, icon: Store },
    { label: 'Personalized Ideas', href: `/events/${event.id}/ideas`, icon: Lightbulb },
    { label: 'AI Copilot', href: `/events/${event.id}/copilot`, icon: Bot, highlight: true },
  ];

  const typeColorMap = {
    wedding: 'bg-rose-50 text-rose-700 border-rose-200',
    birthday: 'bg-amber-50 text-amber-700 border-amber-200',
    community: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <div className="bg-white border-b border-zinc-200 print:border-none shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-3 print:hidden">
          <Link href="/dashboard" className="hover:text-zinc-700 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
          <span className="text-zinc-600 font-semibold truncate max-w-[200px]">
            {event.name}
          </span>
        </div>

        {/* Top Info Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full border uppercase tracking-wider ${typeColorMap[event.event_type] || 'bg-zinc-100 text-zinc-700'}`}>
                {event.event_type}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                {event.name}
              </h1>
            </div>

            <div className="flex items-center gap-4 mt-2 text-sm text-zinc-600 flex-wrap">
              <span className="flex items-center gap-1.5 font-semibold text-zinc-800">
                <Calendar className="w-4 h-4 text-zinc-400" />
                {formatDate(event.event_date)}
                <span className={`ml-1 text-xs px-2 py-0.5 rounded-full font-bold print:hidden ${
                  isPast 
                    ? 'bg-zinc-100 text-zinc-600' 
                    : daysRemaining <= 7 
                      ? 'bg-red-50 text-red-600 animate-pulse' 
                      : 'bg-blue-50 text-blue-700'
                }`}>
                  {isPast ? 'Event Passed' : `${daysRemaining} days to go`}
                </span>
              </span>

              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-zinc-400" />
                {event.location}
              </span>

              <span className="flex items-center gap-1.5 font-medium">
                <Users className="w-4 h-4 text-zinc-400" />
                {event.guest_count} guests
              </span>

              <span className="flex items-center gap-1.5 font-extrabold text-emerald-700">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
                {formatINR(event.total_budget)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 transition-colors shadow-xs"
              title="Print or Save PDF"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-500" />
              <span>Export PDF / Print</span>
            </button>

            <button
              onClick={handleRegeneratePlan}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-sm shadow-rose-200 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Regenerate AI Plan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pt-2 scrollbar-none border-t border-zinc-100 print:hidden">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-bold rounded-t-xl border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-rose-600 text-rose-600 bg-rose-50/60'
                    : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.highlight && !isActive ? 'text-amber-500' : ''}`} />
                <span>{tab.label}</span>
                {tab.highlight && (
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-amber-100 text-amber-700 rounded-full">
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
