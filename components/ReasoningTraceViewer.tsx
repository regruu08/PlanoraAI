'use client';

import React, { useState } from 'react';
import { AgentReasoningStep } from '@/lib/ai/types';
import { Sparkles, ChevronDown, ChevronUp, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface ReasoningTraceViewerProps {
  trace?: AgentReasoningStep[];
  evaluationScore?: number;
  title?: string;
  defaultExpanded?: boolean;
}

export default function ReasoningTraceViewer({
  trace = [],
  evaluationScore,
  title = "Planora AI Agent Reasoning & Critique Trace",
  defaultExpanded = false,
}: ReasoningTraceViewerProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!trace || trace.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-zinc-200/80 p-5 shadow-xs transition-all">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider">
                {title}
              </h4>
              {evaluationScore !== undefined && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">
                  {evaluationScore}/100 Quality
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Multi-step planner-evaluator critique loop ({trace.length} reasoning steps logged)
            </p>
          </div>
        </div>

        <button
          type="button"
          className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-zinc-100 space-y-3">
          {trace.map((step, idx) => {
            const isPassed = step.status === 'passed';
            const isCritiqued = step.status === 'critiqued';
            const isRevised = step.status === 'revised';

            return (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-zinc-50/70 border border-zinc-200/60 flex items-start gap-3 text-xs"
              >
                <div className="mt-0.5 shrink-0">
                  {isPassed && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                  {isCritiqued && <AlertCircle className="w-4 h-4 text-amber-500" />}
                  {isRevised && <RefreshCw className="w-4 h-4 text-blue-500" />}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-extrabold text-zinc-800">{step.phase}</span>
                    <span
                      className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
                        isPassed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isCritiqued
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>
                  <p className="text-zinc-600 leading-relaxed">{step.details}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
