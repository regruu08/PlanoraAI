'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Sparkles, 
  PlusCircle, 
  LayoutDashboard, 
  Gift, 
  Menu, 
  X,
  ChevronDown,
  Flame,
  Cake,
  Building2
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-rose-100/80 bg-white/90 backdrop-blur-md print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Challenge 5 Tagline */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-rose-200 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent tracking-tight">
                  Planora AI
                </span>
                <span className="text-[10px] text-zinc-400 hidden sm:inline -mt-0.5 font-medium tracking-tight">
                  PromptWars Virtual • Challenge 5
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all ${
                pathname === '/dashboard'
                  ? 'bg-rose-50 text-rose-700 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-rose-500" />
              <span>Dashboard</span>
            </Link>

            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all"
              >
                <Gift className="w-4 h-4 text-amber-500" />
                <span>Demo Scenarios</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {demoDropdownOpen && (
                <div 
                  className="absolute left-0 mt-2 w-72 rounded-2xl bg-white shadow-xl border border-zinc-100 py-2.5 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setDemoDropdownOpen(false)}
                >
                  <div className="px-4 py-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Ready-to-Test Hackathon Demos
                  </div>
                  <Link
                    href="/events/demo-wedding-1"
                    className="flex items-start gap-2.5 px-4 py-2.5 text-sm text-zinc-700 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                  >
                    <Flame className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Anuj&apos;s Wedding</span>
                      <span className="text-xs text-zinc-400">Lucknow • 300 guests • ₹8L</span>
                    </div>
                  </Link>
                  <Link
                    href="/events/demo-birthday-2"
                    className="flex items-start gap-2.5 px-4 py-2.5 text-sm text-zinc-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                  >
                    <Cake className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Aarav&apos;s 8th Birthday</span>
                      <span className="text-xs text-zinc-400">Bangalore • 50 guests • ₹50k</span>
                    </div>
                  </Link>
                  <Link
                    href="/events/demo-community-3"
                    className="flex items-start gap-2.5 px-4 py-2.5 text-sm text-zinc-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  >
                    <Building2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Diwali Community Mela</span>
                      <span className="text-xs text-zinc-400">Lucknow • 700 guests • ₹2L</span>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Live AI Status Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>Gemini 1.5 Flash Active</span>
            </div>

            {/* Create Event CTA */}
            <Link
              href="/events/new"
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-md shadow-rose-200 transition-all hover:scale-102"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Event</span>
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/events/new"
              className="p-2 rounded-xl bg-rose-500 text-white shadow-xs"
              title="Create Event"
            >
              <PlusCircle className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-zinc-600 hover:bg-zinc-100"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-100 bg-white px-4 pt-3 pb-6 space-y-2 animate-in fade-in">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-zinc-800 font-semibold hover:bg-rose-50"
          >
            <LayoutDashboard className="w-4 h-4 text-rose-500" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/events/new"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Create New Event</span>
          </Link>
          <div className="border-t border-zinc-100 pt-3">
            <span className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              Explore Demo Events
            </span>
            <Link
              href="/events/demo-wedding-1"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-zinc-700 hover:bg-rose-50 rounded-lg"
            >
              💍 Anuj&apos;s Wedding (Lucknow, ₹8L)
            </Link>
            <Link
              href="/events/demo-birthday-2"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-zinc-700 hover:bg-amber-50 rounded-lg"
            >
              🎂 Aarav&apos;s 8th Birthday (Bangalore, ₹50k)
            </Link>
            <Link
              href="/events/demo-community-3"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-zinc-700 hover:bg-emerald-50 rounded-lg"
            >
              🎪 Diwali Community Mela (700 guests, ₹2L)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
