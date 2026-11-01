'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PlanoraEvent, BudgetItem, Task, Vendor } from '@/types';
import { calculateEventReadiness, EventReadinessReport } from '@/lib/readiness';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Zap, 
  Calendar, 
  Wallet, 
  Store, 
  CheckSquare 
} from 'lucide-react';

interface EventReadinessCardProps {
  event: PlanoraEvent;
  budgets: BudgetItem[];
  tasks: Task[];
  vendors: Vendor[];
}

export default function EventReadinessCard({
  event,
  budgets,
  tasks,
  vendors,
}: EventReadinessCardProps) {
  const [showRisks, setShowRisks] = useState(true);
  const report: EventReadinessReport = calculateEventReadiness(event, budgets, tasks, vendors);

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getBarColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 75) return 'bg-emerald-500';
    if (pct >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-7 shadow-sm space-y-6">
      {/* Top Banner: Score + Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
        <div className="flex items-center gap-4">
          {/* Radial Score Indicator */}
          <div className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center font-black shrink-0 ${getScoreColor(report.overallScore)}`}>
            <span className="text-2xl leading-none">{report.overallScore}</span>
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 mt-0.5">/ 100</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-zinc-900 tracking-tight">
                Event Readiness & Health Score
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold capitalize ${
                report.status === 'optimal'
                  ? 'bg-emerald-100 text-emerald-800'
                  : report.status === 'moderate'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
              }`}>
                {report.status === 'optimal' ? 'Ready to Celebrate' : report.status === 'moderate' ? 'Moderate Buffer' : 'Action Required'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Multi-vector evaluation across budgets, timeline deadlines, vendor quotes, and verification checklists.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Link
            href={`/events/${event.id}/copilot`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Health Audit</span>
          </Link>
        </div>
      </div>

      {/* 4 Health Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Budget Health */}
        <div className="p-4 rounded-2xl bg-zinc-50/70 border border-zinc-200/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-700 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-600" />
              Budget Health
            </span>
            <span className="font-extrabold text-zinc-900">{report.breakdown.budgetHealth} / 25</span>
          </div>
          <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getBarColor(report.breakdown.budgetHealth, 25)}`}
              style={{ width: `${(report.breakdown.budgetHealth / 25) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-zinc-400 block font-medium">Solvency & contingency reserve</span>
        </div>

        {/* 2. Timeline Health */}
        <div className="p-4 rounded-2xl bg-zinc-50/70 border border-zinc-200/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Timeline Velocity
            </span>
            <span className="font-extrabold text-zinc-900">{report.breakdown.timelineHealth} / 25</span>
          </div>
          <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getBarColor(report.breakdown.timelineHealth, 25)}`}
              style={{ width: `${(report.breakdown.timelineHealth / 25) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-zinc-400 block font-medium">Milestones & overdue protection</span>
        </div>

        {/* 3. Vendor Security */}
        <div className="p-4 rounded-2xl bg-zinc-50/70 border border-zinc-200/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-700 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-amber-600" />
              Vendor Security
            </span>
            <span className="font-extrabold text-zinc-900">{report.breakdown.vendorHealth} / 25</span>
          </div>
          <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getBarColor(report.breakdown.vendorHealth, 25)}`}
              style={{ width: `${(report.breakdown.vendorHealth / 25) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-zinc-400 block font-medium">Confirmed bookings & quote logs</span>
        </div>

        {/* 4. Checklist Compliance */}
        <div className="p-4 rounded-2xl bg-zinc-50/70 border border-zinc-200/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-700 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-purple-600" />
              Checklist Compliance
            </span>
            <span className="font-extrabold text-zinc-900">{report.breakdown.checklistHealth} / 25</span>
          </div>
          <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getBarColor(report.breakdown.checklistHealth, 25)}`}
              style={{ width: `${(report.breakdown.checklistHealth / 25) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-zinc-400 block font-medium">Verified contract & safety points</span>
        </div>
      </div>

      {/* Active Operational Risks Section */}
      <div className="pt-2">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
              Active Operational Risks ({report.detectedRisks.length})
            </span>
            {report.detectedRisks.length === 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" /> All clear
              </span>
            )}
          </div>

          {report.detectedRisks.length > 0 && (
            <button
              onClick={() => setShowRisks(!showRisks)}
              className="text-xs font-bold text-zinc-400 hover:text-zinc-700 flex items-center gap-1 transition-colors"
            >
              <span>{showRisks ? 'Hide Risks' : 'Show Risks'}</span>
              {showRisks ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {showRisks && report.detectedRisks.length > 0 && (
          <div className="space-y-2.5">
            {report.detectedRisks.map((risk) => (
              <div
                key={risk.id}
                className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                  risk.level === 'critical'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                    : risk.level === 'high'
                      ? 'bg-orange-50/70 border-orange-200 text-orange-900'
                      : 'bg-amber-50/70 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                    risk.level === 'critical' ? 'text-rose-600' : risk.level === 'high' ? 'text-orange-600' : 'text-amber-600'
                  }`} />
                  <div>
                    <span className="font-extrabold text-zinc-900 block">{risk.title}</span>
                    <p className="text-zinc-600 mt-0.5 leading-relaxed">{risk.description}</p>
                  </div>
                </div>

                <Link
                  href={risk.actionUrl}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold bg-white text-zinc-800 hover:bg-zinc-50 border border-zinc-200/80 shadow-2xs shrink-0 self-start sm:self-center transition-colors"
                >
                  <span>{risk.actionLabel}</span>
                  <ArrowRight className="w-3 h-3 text-zinc-400" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
