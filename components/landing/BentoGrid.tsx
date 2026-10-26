'use client';

import React from 'react';
import Spotlight from '@/components/motion/Spotlight';
import { 
  Wallet, 
  Clock, 
  Store, 
  Lightbulb, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function BentoGrid() {
  return (
    <Spotlight className="rounded-3xl border border-[#E4E1DC] bg-white p-6 sm:p-8 shadow-xs">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tile 1: Itemized Budget Allocator (Spans 2 columns on desktop) */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-[#FAF8F5] border border-[#E4E1DC] flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E1DC]">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                  <Wallet className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Pillar 01 &bull; Budget Architecture
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                ₹ INR Precision
              </span>
            </div>

            <h3 className="text-lg font-bold text-zinc-900 mt-4">
              Itemized Budgeting with Live Variance Tracking
            </h3>
            <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
              Never let hidden banquet charges cause financial stress. Planora divides your total budget into priority categories with real-time actual vs. planned tracking.
            </p>

            {/* Real UI Fragment: Mini Budget Table */}
            <div className="mt-5 space-y-2 bg-white rounded-xl p-4 border border-[#E4E1DC] text-xs">
              <div className="flex justify-between font-bold text-zinc-700 pb-2 border-b border-zinc-100">
                <span>Category</span>
                <span>Planned</span>
                <span>Actual</span>
                <span>Variance</span>
              </div>

              <div className="flex justify-between items-center text-zinc-600">
                <span className="font-medium text-zinc-900">Banquet &amp; Catering</span>
                <span>₹3,60,000</span>
                <span>₹3,50,000</span>
                <span className="text-emerald-600 font-bold">+₹10,000 Saved</span>
              </div>

              <div className="flex justify-between items-center text-zinc-600">
                <span className="font-medium text-zinc-900">Mandap &amp; Lighting</span>
                <span>₹1,60,000</span>
                <span>₹1,60,000</span>
                <span className="text-zinc-500 font-medium">On Target</span>
              </div>

              <div className="flex justify-between items-center text-zinc-600">
                <span className="font-medium text-zinc-900">Photography &amp; Drone</span>
                <span>₹1,00,000</span>
                <span>₹1,10,000</span>
                <span className="text-rose-600 font-bold">-₹10,000 Over</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-zinc-200/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500">AI Cost Optimizer identifies surplus reallocation opportunities</span>
            <Link
              href="/events/demo-wedding-1/budget"
              className="font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
            >
              <span>Explore Budget Engine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Tile 2: Reverse-Scheduled Timeline (Spans 1 column on desktop) */}
        <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E4E1DC] flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E1DC]">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Clock className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Pillar 02 &bull; Timeline
                </span>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                Reverse Flow
              </span>
            </div>

            <h3 className="text-lg font-bold text-zinc-900 mt-4">
              Reverse Milestone Scheduling
            </h3>
            <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
              Count backwards from your date so venue deposits and government permits are locked on time.
            </p>

            {/* Real UI Fragment: Countdown Milestone Stack */}
            <div className="mt-5 space-y-2.5">
              <div className="p-3 bg-white rounded-xl border border-[#E4E1DC] text-xs">
                <div className="flex items-center justify-between font-bold text-zinc-900">
                  <span>Lock Venue Contract</span>
                  <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">6 Months Out</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">Critical for prime wedding muhurats</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E4E1DC] text-xs">
                <div className="flex items-center justify-between font-bold text-zinc-900">
                  <span>Catering Menu Tasting</span>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">90 Days Out</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">Finalize starter counts and regional sweets</p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-zinc-200/80">
            <Link
              href="/events/demo-wedding-1/timeline"
              className="text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
            >
              <span>View Timeline Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Tile 3: Smart Vendor Verification (Spans 1 column on desktop) */}
        <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E4E1DC] flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E1DC]">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <Store className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Pillar 03 &bull; Vendors
                </span>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                Verification
              </span>
            </div>

            <h3 className="text-lg font-bold text-zinc-900 mt-4">
              Contract Verification Checklists
            </h3>
            <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
              Don&apos;t just book vendors—verify critical operational criteria before transferring deposits.
            </p>

            {/* Real UI Fragment: Vendor Verification Items */}
            <div className="mt-5 space-y-2 bg-white rounded-xl p-3.5 border border-[#E4E1DC] text-xs">
              <div className="flex items-start gap-2 text-zinc-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Verify backup diesel generator wattage during peak lighting load</span>
              </div>
              <div className="flex items-start gap-2 text-zinc-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Confirm raw footage delivery timeline in photography contract</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-zinc-200/80">
            <Link
              href="/events/demo-wedding-1/vendors"
              className="text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
            >
              <span>View Vendor Rules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Tile 4: Personalized Idea Engine (Spans 2 columns on desktop) */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-[#FAF8F5] border border-[#E4E1DC] flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E1DC]">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <Lightbulb className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Pillar 04 &bull; Signature Concepts
                </span>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                Culturally Grounded
              </span>
            </div>

            <h3 className="text-lg font-bold text-zinc-900 mt-4">
              Culturally Tailored Experience Concepts
            </h3>
            <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
              Every celebration has unique character. Planora crafts signature touches grounded in your location, budget, and guest count.
            </p>

            {/* Real UI Fragment: Concept Card with Grounding Explanation */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white rounded-xl p-4 border border-[#E4E1DC]">
                <div className="flex items-center gap-1.5 font-bold text-zinc-900 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Royal Awadhi Itar Welcome Bar</span>
                </div>
                <p className="text-zinc-600 leading-relaxed text-[11px]">
                  Traditional brass perfume dispensers greeting guests with authentic Mitti and Gulab fragrances upon entrance in Lucknow.
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                  Why it fits: Matches Lucknow heritage &bull; ₹15k cost
                </span>
              </div>

              <div className="bg-white rounded-xl p-4 border border-[#E4E1DC]">
                <div className="flex items-center gap-1.5 font-bold text-zinc-900 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Discovery Telescope Craft Station</span>
                </div>
                <p className="text-zinc-600 leading-relaxed text-[11px]">
                  DIY cardboard telescope building activity keeping 7-9 year old kids engaged without noisy digital screens.
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded">
                  Why it fits: Aarav&apos;s 8th Birthday theme
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-zinc-200/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Bookmark ideas directly into your celebration workspace</span>
            <Link
              href="/events/demo-wedding-1/ideas"
              className="font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
            >
              <span>Explore Idea Engine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </Spotlight>
  );
}
