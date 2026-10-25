'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Sparkles, 
  CalendarDays, 
  PlusCircle, 
  LayoutDashboard, 
  Gift, 
  Menu, 
  X,
  ChevronDown,
  User,
  LogOut,
  LogIn,
  CheckCircle2
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('planora_user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      } else {
        // Default guest user for seamless demoing
        setCurrentUser({ name: 'Anuj (Demo)', email: 'anuj@hackathon.dev' });
      }
    } catch {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('planora_user');
    setCurrentUser(null);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-rose-100/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-rose-200 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
                  Planora AI
                </span>
                <span className="text-[10px] text-zinc-500 hidden sm:inline -mt-0.5 tracking-tight font-medium">
                  Challenge 5: Celebration & Event Planner
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                pathname === '/dashboard'
                  ? 'bg-rose-50 text-rose-700'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            {/* Quick Demo Switcher */}
            <div className="relative">
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
              >
                <Gift className="w-4 h-4 text-amber-500" />
                <span>Demo Events</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {demoDropdownOpen && (
                <div 
                  className="absolute left-0 mt-2 w-64 rounded-xl bg-white shadow-xl border border-zinc-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setDemoDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Ready-to-Test Scenarios
                  </div>
                  <Link
                    href="/events/demo-wedding-1"
                    className="flex flex-col px-3 py-2 text-sm text-zinc-700 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <span className="font-medium">💍 Anuj&apos;s Wedding</span>
                    <span className="text-xs text-zinc-400">Lucknow • 300 guests • ₹8L</span>
                  </Link>
                  <Link
                    href="/events/demo-birthday-2"
                    className="flex flex-col px-3 py-2 text-sm text-zinc-700 hover:bg-amber-50 hover:text-amber-700"
                  >
                    <span className="font-medium">🎂 Aarav&apos;s 8th Birthday</span>
                    <span className="text-xs text-zinc-400">Bangalore • 50 guests • ₹50k</span>
                  </Link>
                  <Link
                    href="/events/demo-community-3"
                    className="flex flex-col px-3 py-2 text-sm text-zinc-700 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <span className="font-medium">🎪 Diwali Community Mela</span>
                    <span className="text-xs text-zinc-400">Lucknow • 700 guests • ₹2L</span>
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/events/new"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm hover:from-rose-600 hover:to-pink-600 transition-all shadow-rose-200 hover:shadow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Event</span>
            </Link>

            {/* User Pill / Login */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 ml-1 border-l border-zinc-200">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="max-w-[100px] truncate">{currentUser.name || 'User'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-50"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {currentUser && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-medium truncate max-w-[110px]">
                {currentUser.name}
              </span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-600 hover:bg-zinc-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-100 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-700 hover:bg-rose-50"
          >
            <LayoutDashboard className="w-4 h-4 text-rose-500" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/events/new"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 font-semibold bg-rose-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Create New Event</span>
          </Link>
          <div className="border-t border-zinc-100 pt-2">
            <div className="px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Demo Events
            </div>
            <Link
              href="/events/demo-wedding-1"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-1.5 text-sm text-zinc-600"
            >
              💍 Anuj&apos;s Wedding (Lucknow, ₹8L)
            </Link>
            <Link
              href="/events/demo-birthday-2"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-1.5 text-sm text-zinc-600"
            >
              🎂 Aarav&apos;s 8th Birthday (Bangalore, ₹50k)
            </Link>
            <Link
              href="/events/demo-community-3"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-1.5 text-sm text-zinc-600"
            >
              🎪 Diwali Community Mela (700 guests, ₹2L)
            </Link>
          </div>
          <div className="border-t border-zinc-100 pt-2 flex items-center justify-between px-3">
            {currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="text-xs text-red-600 font-semibold flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out ({currentUser.name})</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs text-rose-600 font-semibold"
              >
                Sign In / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
