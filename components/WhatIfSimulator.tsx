'use client';

import React, { useState } from 'react';
import { BudgetItem, PlanoraEvent } from '@/types';
import { formatINR } from '@/lib/utils';
import { simulateEventScenario, SimulationResult } from '@/lib/simulation';
import { saveBudgets, saveEvent } from '@/lib/storage';
import { 
  Sliders, 
  Users, 
  Wallet, 
  AlertTriangle, 
  Check, 
  Sparkles, 
  RotateCcw,
  ArrowRight
} from 'lucide-react';

interface WhatIfSimulatorProps {
  event: PlanoraEvent;
  budgets: BudgetItem[];
  onApplied?: () => void;
}

export default function WhatIfSimulator({ event, budgets, onApplied }: WhatIfSimulatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [guestDelta, setGuestDelta] = useState<number>(0);
  const [budgetDeltaPercent, setBudgetDeltaPercent] = useState<number>(0);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const simulation: SimulationResult = simulateEventScenario(event, budgets, {
    guestDelta,
    budgetDeltaPercent,
  });

  const handleReset = () => {
    setGuestDelta(0);
    setBudgetDeltaPercent(0);
    setAppliedSuccess(false);
  };

  const handleApplyChanges = () => {
    // 1. Update event
    const updatedEvent: PlanoraEvent = {
      ...event,
      guest_count: simulation.simulatedGuests,
      total_budget: simulation.simulatedBudget,
      updated_at: new Date().toISOString(),
    };
    saveEvent(updatedEvent);

    // 2. Update all budget items
    const updatedBudgets: BudgetItem[] = budgets.map((b) => {
      const match = simulation.categories.find((c) => c.id === b.id);
      return {
        ...b,
        allocated_amount: match ? match.simulatedAllocated : b.allocated_amount,
      };
    });
    saveBudgets(event.id, updatedBudgets);

    setAppliedSuccess(true);
    setTimeout(() => {
      setAppliedSuccess(false);
      setIsOpen(false);
      onApplied?.();
    }, 1200);
  };

  return (
    <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xs">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-zinc-900 tracking-tight">
                AI What-If Scenario Simulator
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                Stress-Test
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Simulate guest count shifts and budget cuts to project instant financial impact.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
            isOpen
              ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{isOpen ? 'Close Simulator' : 'Launch Simulation'}</span>
        </button>
      </div>

      {isOpen && (
        <div className="mt-6 space-y-6 animate-in fade-in duration-200">
          {/* Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50/70 p-5 rounded-2xl border border-zinc-200/60">
            {/* 1. Guest Delta Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  Guest Count Adjustment:
                </span>
                <span className="font-extrabold text-indigo-700 text-sm">
                  {guestDelta > 0 ? `+${guestDelta}` : guestDelta} guests ({simulation.simulatedGuests} total)
                </span>
              </div>
              <input
                type="range"
                min={-Math.floor(event.guest_count * 0.5)}
                max={Math.floor(event.guest_count * 1.0)}
                step={5}
                value={guestDelta}
                onChange={(e) => {
                  setGuestDelta(Number(e.target.value));
                  setAppliedSuccess(false);
                }}
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-zinc-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                <span>-50% guests</span>
                <span>Current: {event.guest_count}</span>
                <span>+100% guests</span>
              </div>
            </div>

            {/* 2. Budget Delta Percent Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-700 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                  Budget Shift Percentage:
                </span>
                <span className="font-extrabold text-emerald-700 text-sm">
                  {budgetDeltaPercent > 0 ? `+${budgetDeltaPercent}%` : `${budgetDeltaPercent}%`} ({formatINR(simulation.simulatedBudget)})
                </span>
              </div>
              <input
                type="range"
                min={-30}
                max={50}
                step={5}
                value={budgetDeltaPercent}
                onChange={(e) => {
                  setBudgetDeltaPercent(Number(e.target.value));
                  setAppliedSuccess(false);
                }}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-zinc-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                <span>-30% cut</span>
                <span>Current: {formatINR(event.total_budget)}</span>
                <span>+50% stretch</span>
              </div>
            </div>
          </div>

          {/* Warning Banner if capacity triggered */}
          {simulation.capacityWarning && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-amber-900 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Capacity & Logistics Notice:</span>
                <p className="mt-0.5 leading-relaxed text-amber-800">{simulation.capacityWarning}</p>
              </div>
            </div>
          )}

          {/* Projected KPI Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs">
              <span className="text-[10px] font-bold text-zinc-400 uppercase block">Simulated Total</span>
              <div className="text-lg font-black text-zinc-900 mt-0.5">{formatINR(simulation.simulatedBudget)}</div>
              <span className="text-[11px] text-zinc-500 font-medium">
                {simulation.simulatedBudget >= simulation.originalBudget ? 'Stretched budget' : 'Constrained budget'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs">
              <span className="text-[10px] font-bold text-zinc-400 uppercase block">Cost / Guest</span>
              <div className="text-lg font-black text-indigo-700 mt-0.5">
                {formatINR(simulation.simulatedCostPerGuest)}
              </div>
              <span className="text-[11px] text-zinc-500 font-medium">
                vs {formatINR(simulation.originalCostPerGuest)} base
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs">
              <span className="text-[10px] font-bold text-zinc-400 uppercase block">Catering Plate</span>
              <div className="text-lg font-black text-amber-700 mt-0.5">
                {formatINR(simulation.cateringCostPerPlate)}
              </div>
              <span className="text-[11px] text-zinc-500 font-medium">projected per attendee</span>
            </div>
          </div>

          {/* Simulated Categories Table */}
          <div className="border border-zinc-200/80 rounded-2xl overflow-hidden">
            <div className="bg-zinc-50/80 px-4 py-2.5 border-b border-zinc-200 text-[11px] font-extrabold uppercase text-zinc-500 grid grid-cols-12 gap-2">
              <span className="col-span-5">Category</span>
              <span className="col-span-3 text-right">Current</span>
              <span className="col-span-4 text-right">Simulated</span>
            </div>

            <div className="divide-y divide-zinc-100 max-h-60 overflow-y-auto">
              {simulation.categories.map((cat) => (
                <div key={cat.id} className="px-4 py-2.5 text-xs grid grid-cols-12 gap-2 items-center hover:bg-zinc-50/50">
                  <span className="col-span-5 font-bold text-zinc-800 truncate">{cat.category}</span>
                  <span className="col-span-3 text-right text-zinc-400 font-medium">
                    {formatINR(cat.currentAllocated)}
                  </span>
                  <div className="col-span-4 text-right flex items-center justify-end gap-1.5">
                    <span className="font-extrabold text-zinc-900">{formatINR(cat.simulatedAllocated)}</span>
                    {cat.difference !== 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        cat.difference > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {cat.difference > 0 ? `+${formatINR(cat.difference)}` : formatINR(cat.difference)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sliders</span>
            </button>

            <button
              onClick={handleApplyChanges}
              disabled={appliedSuccess || (guestDelta === 0 && budgetDeltaPercent === 0)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                appliedSuccess
                  ? 'bg-emerald-600 text-white'
                  : guestDelta === 0 && budgetDeltaPercent === 0
                    ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95'
              }`}
            >
              {appliedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Applied Scenario to Plan!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Apply Scenario to Event Budget</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
