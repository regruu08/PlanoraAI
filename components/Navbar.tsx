'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Sparkles, 
  ChevronDown, 
  Flame, 
  Cake, 
  Building2, 
  X, 
  ArrowRight,
  LayoutDashboard
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const isLanding = pathname === '/';

  const [scrolled, setScrolled] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTriggerRef = useRef<HTMLButtonElement>(null);
  const dropdownItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const drawerTriggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // 1px Sentinel with IntersectionObserver for zero-jank scroll detection
  useEffect(() => {
    let sentinel = document.getElementById('navbar-sentinel');
    if (!sentinel) {
      sentinel = document.createElement('div');
      sentinel.id = 'navbar-sentinel';
      sentinel.style.position = 'absolute';
      sentinel.style.top = '0';
      sentinel.style.left = '0';
      sentinel.style.width = '100%';
      sentinel.style.height = '24px';
      sentinel.style.pointerEvents = 'none';
      sentinel.style.visibility = 'hidden';
      document.body.prepend(sentinel);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolled(!entry.isIntersecting);
      },
      { root: null, threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Keyboard navigation & Esc return for Demo Scenarios dropdown
  useEffect(() => {
    if (!demoDropdownOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const items = dropdownItemsRef.current.filter(Boolean) as HTMLAnchorElement[];
      const currentIndex = items.findIndex((item) => item === document.activeElement);

      if (e.key === 'Escape') {
        e.preventDefault();
        setDemoDropdownOpen(false);
        dropdownTriggerRef.current?.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        items[nextIndex]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        items[prevIndex]?.focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        items[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        items[items.length - 1]?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDemoDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [demoDropdownOpen]);

  // Mobile drawer scroll lock, focus trap & keyboard handler
  useEffect(() => {
    if (!mobileDrawerOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Set page content inert for screen readers
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.setAttribute('inert', '');
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMobileDrawerOpen(false);
        drawerTriggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      if (mainContent) {
        mainContent.removeAttribute('inert');
      }
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileDrawerOpen]);

  const closeDropdown = useCallback(() => {
    setDemoDropdownOpen(false);
  }, []);

  const closeDrawer = useCallback(() => {
    setMobileDrawerOpen(false);
    drawerTriggerRef.current?.focus();
  }, []);

  // Determine visual mode: Overlay on top of landing page; Solid on scroll or other routes
  const isSolid = scrolled || !isLanding;

  return (
    <>
      {/* Spacer only on non-landing pages to reserve 80px fixed header height */}
      {!isLanding && <div className="h-20 w-full shrink-0 print:hidden" aria-hidden="true" />}

      <header
        data-scrolled={scrolled}
        className={`fixed top-0 left-0 right-0 z-40 w-full transition-[height] duration-200 print:hidden ${
          scrolled ? 'h-16' : 'h-20'
        }`}
      >
        {/* Solid background cross-fader (Fades in <= 200ms without layout shift) */}
        <div
          className={`absolute inset-0 transition-opacity duration-200 pointer-events-none ${
            isSolid
              ? 'opacity-100 bg-[#FAF8F5]/90 border-b border-[#E4E1DC] shadow-xs lg:backdrop-blur-xs'
              : 'opacity-0 bg-transparent'
          }`}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative z-10 flex items-center justify-between">
          
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 transition-colors duration-200"
          >
            <div
              className={`rounded-xl flex items-center justify-center transition-all duration-200 shadow-2xs ${
                scrolled ? 'w-8 h-8' : 'w-9 h-9'
              } ${
                isSolid 
                  ? 'bg-rose-600 text-white' 
                  : 'bg-white/15 text-white border border-white/25'
              }`}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span
              className={`font-extrabold text-lg tracking-tight transition-colors duration-200 ${
                isSolid ? 'text-zinc-900' : 'text-white'
              }`}
            >
              Planora AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Main Navigation">
            {/* Dashboard Link with scaleX underline */}
            <Link
              href="/dashboard"
              className={`relative py-1 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 rounded ${
                pathname === '/dashboard'
                  ? isSolid ? 'text-rose-600 font-bold' : 'text-white font-bold'
                  : isSolid ? 'text-zinc-600 hover:text-zinc-950' : 'text-white/85 hover:text-white'
              }`}
            >
              <span>Dashboard</span>
              <span
                className={`absolute bottom-0 left-0 h-0.5 w-full origin-left transition-transform duration-200 ${
                  isSolid ? 'bg-rose-600' : 'bg-white'
                } ${
                  pathname === '/dashboard' ? 'scale-x-100' : 'scale-x-0 hover:scale-x-100'
                }`}
              />
            </Link>

            {/* Demo Scenarios Accessible Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                ref={dropdownTriggerRef}
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' && !demoDropdownOpen) {
                    e.preventDefault();
                    setDemoDropdownOpen(true);
                  }
                }}
                aria-haspopup="true"
                aria-expanded={demoDropdownOpen}
                aria-controls="demo-scenarios-menu"
                className={`inline-flex items-center gap-1.5 py-1 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 rounded transition-colors duration-200 ${
                  isSolid ? 'text-zinc-600 hover:text-zinc-950' : 'text-white/85 hover:text-white'
                }`}
              >
                <span>Demo Scenarios</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-160 ${
                    demoDropdownOpen ? 'rotate-180' : ''
                  } ${isSolid ? 'text-zinc-500' : 'text-white/70'}`}
                />
              </button>

              {/* Dropdown Menu (16px radius, hairline border, soft shadow, 160ms entrance) */}
              <div
                id="demo-scenarios-menu"
                role="menu"
                aria-hidden={!demoDropdownOpen}
                className={`absolute left-0 mt-2 w-80 rounded-2xl bg-white border border-[#E4E1DC] shadow-lg p-2 z-50 transition-[opacity,transform] duration-160 ease-out origin-top-left ${
                  demoDropdownOpen
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}
              >
                <div className="px-3 py-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Instant Demo Blueprints
                </div>

                <Link
                  ref={(el) => { dropdownItemsRef.current[0] = el; }}
                  href="/events/demo-wedding-1"
                  role="menuitem"
                  onClick={closeDropdown}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#FAF8F5] transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
                >
                  <div className="p-2 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-100 transition-colors">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-zinc-900 block group-hover:text-rose-600">
                      Anuj&apos;s Wedding
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Lucknow &bull; 300 guests &bull; ₹8,00,000
                    </span>
                  </div>
                </Link>

                <Link
                  ref={(el) => { dropdownItemsRef.current[1] = el; }}
                  href="/events/demo-birthday-2"
                  role="menuitem"
                  onClick={closeDropdown}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#FAF8F5] transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
                >
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                    <Cake className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-zinc-900 block group-hover:text-amber-600">
                      Aarav&apos;s 8th Birthday
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Bangalore &bull; 50 guests &bull; ₹50,000
                    </span>
                  </div>
                </Link>

                <Link
                  ref={(el) => { dropdownItemsRef.current[2] = el; }}
                  href="/events/demo-community-3"
                  role="menuitem"
                  onClick={closeDropdown}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#FAF8F5] transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
                >
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-zinc-900 block group-hover:text-emerald-600">
                      Diwali Community Mela
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Lucknow &bull; 700 guests &bull; ₹2,00,000
                    </span>
                  </div>
                </Link>
              </div>
            </div>

            {/* CTA Pill: Solid white pill on overlay; Brand-gradient on solid */}
            <Link
              href="/events/new"
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 active:scale-[0.98] ${
                isSolid
                  ? 'text-white bg-gradient-to-r from-rose-600 to-amber-600 hover:opacity-95 shadow-xs'
                  : 'text-zinc-950 bg-white hover:bg-zinc-100 shadow-sm'
              }`}
            >
              <span>Plan my event</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </nav>

          {/* Mobile Menu Button with morphing hamburger icon (< 1024px) */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              ref={drawerTriggerRef}
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              aria-label={mobileDrawerOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileDrawerOpen}
              aria-controls="mobile-nav-drawer"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 ${
                isSolid
                  ? 'border border-[#E4E1DC] bg-white text-zinc-800'
                  : 'border border-white/20 bg-white/10 text-white'
              }`}
            >
              <div className="w-4 h-3.5 flex flex-col justify-between relative">
                <span
                  className={`w-full h-0.5 rounded transition-transform duration-200 origin-center ${
                    isSolid ? 'bg-zinc-800' : 'bg-white'
                  } ${mobileDrawerOpen ? 'rotate-45 translate-y-[6px]' : ''}`}
                />
                <span
                  className={`w-full h-0.5 rounded transition-opacity duration-200 ${
                    isSolid ? 'bg-zinc-800' : 'bg-white'
                  } ${mobileDrawerOpen ? 'opacity-0' : 'opacity-100'}`}
                />
                <span
                  className={`w-full h-0.5 rounded transition-transform duration-200 origin-center ${
                    isSolid ? 'bg-zinc-800' : 'bg-white'
                  } ${mobileDrawerOpen ? '-rotate-45 -translate-y-[6px]' : ''}`}
                />
              </div>
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer Rendered Outside Header for clean viewport clipping & z-index */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation drawer"
          id="mobile-nav-drawer"
        >
          {/* Backdrop with fade */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity duration-250 ease-out"
            onClick={closeDrawer}
          />

          {/* Right-side Sliding Panel */}
          <div
            ref={drawerRef}
            className="fixed top-0 right-0 bottom-0 w-[min(86vw,360px)] bg-white shadow-2xl p-6 flex flex-col justify-between transition-transform duration-250 ease-out translate-x-0"
          >
            <div>
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-5 border-b border-[#E4E1DC]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-extrabold text-base text-zinc-900">Planora AI</span>
                </div>
                <button
                  onClick={closeDrawer}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
                  aria-label="Close navigation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Items with 40ms stagger */}
              <div className="py-5 space-y-1">
                <Link
                  href="/dashboard"
                  onClick={closeDrawer}
                  style={{ animationDelay: '0ms' }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-zinc-800 hover:bg-rose-50 hover:text-rose-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
                >
                  <LayoutDashboard className="w-4 h-4 text-zinc-400" />
                  <span>Dashboard</span>
                </Link>

                <div className="pt-4 border-t border-[#E4E1DC] mt-4">
                  <span className="px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                    Demo Scenarios
                  </span>

                  <Link
                    href="/events/demo-wedding-1"
                    onClick={closeDrawer}
                    style={{ animationDelay: '40ms' }}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-[#FAF8F5] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
                  >
                    <Flame className="w-3.5 h-3.5 text-rose-500" />
                    <span>Anuj&apos;s Wedding (₹8L)</span>
                  </Link>

                  <Link
                    href="/events/demo-birthday-2"
                    onClick={closeDrawer}
                    style={{ animationDelay: '80ms' }}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-[#FAF8F5] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
                  >
                    <Cake className="w-3.5 h-3.5 text-amber-500" />
                    <span>Aarav&apos;s 8th Birthday (₹50k)</span>
                  </Link>

                  <Link
                    href="/events/demo-community-3"
                    onClick={closeDrawer}
                    style={{ animationDelay: '120ms' }}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-[#FAF8F5] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
                  >
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Diwali Community Mela (₹2L)</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Pinned Primary CTA at Bottom of Drawer above safe area */}
            <div className="pt-4 border-t border-[#E4E1DC] pb-[env(safe-area-inset-bottom,0.75rem)]">
              <Link
                href="/events/new"
                onClick={closeDrawer}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-sm text-white bg-gradient-to-r from-rose-600 to-amber-600 shadow-sm active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2"
              >
                <span>Plan my event</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-center text-[11px] text-zinc-400 mt-2 font-medium">
                No sign-in needed &bull; Instant generation
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
