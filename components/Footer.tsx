'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight } from 'lucide-react';
import Container from '@/components/Container';
import Reveal from '@/components/motion/Reveal';

export default function Footer() {
  return (
    <footer className="mt-28 relative bg-[#FAF8F5] pt-12 pb-6 print:hidden footer-content-visibility">
      <Container className="relative">
        <Reveal direction="up">
          {/* ============================================================ */}
          {/* Overlapping Brand CTA Card (Reference B Style)               */}
          {/* ============================================================ */}
          <div className="relative -top-24 -mb-16 z-20 rounded-3xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 p-6 sm:p-10 text-white shadow-xl shadow-rose-950/15 overflow-visible">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Image Breaking Out Above Card (Large screens >= 1024px) */}
              <div className="lg:col-span-5 relative flex justify-center lg:justify-start">
                {/* Arch mask breakout extending above top boundary */}
                <div className="relative -mt-14 sm:-mt-20 lg:-mt-24 w-44 sm:w-56 lg:w-64 aspect-3/4 rounded-t-full rounded-b-2xl overflow-hidden shadow-2xl border-4 border-white/90 bg-amber-950/40 shrink-0">
                  <Image
                    src="/images/hero-mobile.webp"
                    alt="Celebration floral decor and ambient lights"
                    fill
                    sizes="(max-width: 1024px) 180px, 260px"
                    loading="lazy"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Right Column: Existing Tagline Headline, CTA Button & Subline */}
              <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-display leading-tight">
                  Describe your event. Planora plans what happens next.
                </h2>
                
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link
                    href="/events/new"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold text-zinc-950 bg-white hover:bg-zinc-100 shadow-md active:scale-[0.98] transition-transform min-h-[48px]"
                  >
                    <span>Plan my event</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <span className="text-xs text-white/85 font-medium">
                    No sign-in needed &bull; Instant generation
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* ============================================================ */}
          {/* Main Rounded White Footer Panel                              */}
          {/* ============================================================ */}
          <div className="bg-white rounded-t-[2rem] sm:rounded-t-[2.5rem] rounded-b-3xl border border-[#E4E1DC] shadow-sm pt-20 pb-10 px-6 sm:px-12 space-y-12">
            
            {/* 12-Column Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Left Column (5 cols): Logo, Description & Attribution lines */}
              <div className="lg:col-span-5 space-y-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2.5 text-zinc-900 font-extrabold text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 rounded"
                >
                  <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-2xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span>Planora AI</span>
                </Link>

                <p className="text-zinc-600 max-w-sm leading-relaxed text-sm">
                  A context-aware celebration assistant converting event ideas into itemized budgets, reverse-scheduled milestones, vendor verification checklists, and signature experiences.
                </p>

                <div className="pt-2 text-[13px] text-zinc-600 space-y-1.5 border-t border-zinc-100">
                  <p>
                    Built for <strong className="text-zinc-900 font-semibold">PromptWars Virtual &bull; Challenge 5 (Celebration &amp; Event Planner)</strong>.
                  </p>
                  <p>
                    Powered by <strong className="text-zinc-900 font-semibold">Gemini 1.5 Flash</strong> &bull; Developed with Google Antigravity.
                  </p>
                </div>
              </div>

              {/* Right Column (7 cols): Link Columns (2 Columns) */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
                
                {/* Column 1: Planning Workspaces */}
                <div>
                  <h3 className="font-semibold text-zinc-900 text-[15px] mb-4">
                    Planning Workspaces
                  </h3>
                  <ul className="space-y-2.5">
                    <li>
                      <Link
                        href="/events/new"
                        className="text-sm text-zinc-600 hover:text-rose-600 transition-[color,transform] duration-150 inline-flex items-center hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 rounded"
                      >
                        Plan My Event
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard"
                        className="text-sm text-zinc-600 hover:text-rose-600 transition-[color,transform] duration-150 inline-flex items-center hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 rounded"
                      >
                        Events Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/events/demo-wedding-1"
                        className="text-sm text-zinc-600 hover:text-rose-600 transition-[color,transform] duration-150 inline-flex items-center hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 rounded"
                      >
                        Wedding Blueprint Hub
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/events/demo-wedding-1/copilot"
                        className="text-sm text-zinc-600 hover:text-rose-600 transition-[color,transform] duration-150 inline-flex items-center hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 rounded"
                      >
                        AI Copilot Command Center
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 2: Demo Scenarios */}
                <div>
                  <h3 className="font-semibold text-zinc-900 text-[15px] mb-4">
                    Demo Scenarios
                  </h3>
                  <ul className="space-y-2.5">
                    <li>
                      <Link
                        href="/events/demo-wedding-1"
                        className="text-sm text-zinc-600 hover:text-rose-600 transition-[color,transform] duration-150 inline-flex items-center hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 rounded"
                      >
                        Anuj&apos;s Wedding (Lucknow, ₹8L)
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/events/demo-birthday-2"
                        className="text-sm text-zinc-600 hover:text-rose-600 transition-[color,transform] duration-150 inline-flex items-center hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 rounded"
                      >
                        Aarav&apos;s 8th Birthday (Bangalore, ₹50k)
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/events/demo-community-3"
                        className="text-sm text-zinc-600 hover:text-rose-600 transition-[color,transform] duration-150 inline-flex items-center hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 rounded"
                      >
                        Diwali Community Mela (700 Guests, ₹2L)
                      </Link>
                    </li>
                  </ul>
                </div>

              </div>

            </div>

            {/* Hairline Divider & Bottom Bar */}
            <div className="pt-8 border-t border-[#E4E1DC] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-zinc-500 text-center sm:text-left">
                &copy; {new Date().getFullYear()} Planora AI. All rights reserved. Zero sign-in friction &bull; Client-first architecture.
              </p>
            </div>

            {/* Decorative Closing Wordmark: Low-contrast gradient fade clipped by bottom edge */}
            <div className="relative overflow-hidden pt-4 pb-0 text-center select-none pointer-events-none" aria-hidden="true">
              <span className="block text-[clamp(3.5rem,12vw,9rem)] font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#E4E1DC] via-[#E4E1DC]/40 to-transparent font-display leading-none -mb-4 sm:-mb-6 lg:-mb-10">
                PLANORA
              </span>
            </div>

          </div>
        </Reveal>
      </Container>
    </footer>
  );
}
