'use client';

import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  ShieldCheck
} from 'lucide-react';
import { isMotionLite } from '@/lib/motion';

export default function HeroProductPreview() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (isMotionLite()) {
      setAnimated(true);
      return;
    }
    const timer = setTimeout(() => {
      setAnimated(true);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none">
      {/* Context Tag Chip */}
      <div className="absolute -top-3 left-4 z-20 bg-white border border-[#E4E1DC] shadow-sm px-3.5 py-1 rounded-full flex items-center gap-2 text-xs font-bold text-zinc-800">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Grounded Blueprint</span>
      </div>

      {/* Main Blueprint Preview Card (Crisp white floating card, static soft shadow, min text 12px) */}
      <div className="relative z-10 bg-white rounded-3xl border border-[#E4E1DC] shadow-2xl p-6 sm:p-7 space-y-4 text-zinc-900">
        
        {/* Card Header: Event Metadata */}
        <div className="flex items-start justify-between border-b border-zinc-100 pb-3.5 pt-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md">
                Wedding Demo
              </span>
              <span className="text-xs text-zinc-400 font-medium">180 Days to go</span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 mt-1">
              Anuj &amp; Priya&apos;s Wedding
            </h3>
            <p className="text-xs text-zinc-500">
              Awadhi Fusion Theme &bull; Total Budget: <strong className="text-zinc-900 font-bold">₹8,00,000</strong>
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-md block">
              Budget On Track
            </span>
          </div>
        </div>

        {/* Central Directive: Immediate Priority */}
        <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#E4E1DC] relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">
            <span className="flex items-center gap-1.5 text-rose-600">
              <Clock className="w-3.5 h-3.5" />
              Immediate Priority
            </span>
            <span className="text-zinc-600 font-bold">Urgent Milestone</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-zinc-900">
                Book Banquet Hall &amp; Secure Date Lock
              </p>
              <p className="text-xs text-zinc-600 mt-0.5">
                Target: ₹3,60,000 allocated &bull; Check generator backup &amp; sound curfew
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold shrink-0">
              Act Now
            </span>
          </div>
        </div>

        {/* Budget Allocation Progress Bars (Animated with scaleX) */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-600 font-medium">Itemized Allocation</span>
            <span className="text-zinc-900 font-bold">₹7,20,000 / ₹8,00,000 (90%)</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-zinc-600 mb-1">
                <span>Catering &amp; Royal Awadhi Banquet</span>
                <span className="font-semibold text-zinc-900">₹3,60,000 (45%)</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-600 rounded-full origin-left transition-transform duration-700 ease-out"
                  style={{
                    transform: animated ? 'scaleX(0.45)' : 'scaleX(0)',
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-zinc-600 mb-1">
                <span>Mandap &amp; Floral Decor</span>
                <span className="font-semibold text-zinc-900">₹1,60,000 (20%)</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full origin-left transition-transform duration-700 ease-out delay-100"
                  style={{
                    transform: animated ? 'scaleX(0.20)' : 'scaleX(0)',
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-zinc-600 mb-1">
                <span>Candid Photography &amp; Drone</span>
                <span className="font-semibold text-zinc-900">₹1,00,000 (12.5%)</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full origin-left transition-transform duration-700 ease-out delay-200"
                  style={{
                    transform: animated ? 'scaleX(0.125)' : 'scaleX(0)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Checklist Snapshot */}
        <div className="pt-2 border-t border-zinc-100">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-2 font-medium">
            <span>Critical Vendor Checklist</span>
            <span className="text-xs font-bold text-zinc-700">2 of 3 verified</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-zinc-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Taste Awadhi Galauti kebab and dessert samples</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Confirm 125 kVA generator backup with venue manager</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-900 font-semibold">
              <Circle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Verify Lucknow municipal sound curfew permission</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-2 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-100">
          <span className="flex items-center gap-1.5 text-zinc-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Schema-validated plan
          </span>
          <span className="font-semibold text-rose-600">
            Live Preview
          </span>
        </div>

      </div>
    </div>
  );
}
