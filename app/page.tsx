import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Container from '@/components/Container';
import HeroProductPreview from '@/components/landing/HeroProductPreview';
import BentoGrid from '@/components/landing/BentoGrid';
import Reveal from '@/components/motion/Reveal';
import { 
  ArrowRight, 
  ChevronRight, 
  Flame, 
  Cake, 
  Building2,
  Wallet,
  Clock,
  Store,
  Sparkles
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-zinc-900 selection:bg-rose-100 selection:text-rose-900">
      <Navbar />

      <main id="main-content" className="flex-1">
        {/* ============================================================ */}
        {/* HERO SECTION: Reference A Mood, Full-Bleed Photo & Overlay   */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden bg-[#140E0B] text-white min-h-[88svh] lg:min-h-[min(100svh,56rem)] flex flex-col justify-between">
          
          {/* LCP Art-Directed Background Image */}
          <picture className="absolute inset-0 w-full h-full pointer-events-none hero-photo-layer z-0">
            <source media="(min-width: 1024px)" srcSet="/images/hero-desktop.webp" width={1920} height={1080} />
            <source media="(max-width: 1023px)" srcSet="/images/hero-mobile.webp" width={828} height={1104} />
            <img
              src="/images/hero-desktop.webp"
              alt="Atmospheric Indian celebration decor with warm golden lighting and floral garlands"
              width={1920}
              height={1080}
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover object-right lg:object-center"
            />
          </picture>

          {/* Static Scrim 1: Top Scrim for Overlay Header Contrast */}
          <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none z-1" />

          {/* Static Scrim 2: Desktop Left-to-Right Scrim for Headline Readability */}
          <div className="absolute inset-0 hidden lg:block bg-gradient-to-r from-black/85 via-black/55 to-black/15 pointer-events-none z-1" />

          {/* Static Scrim 3: Mobile Bottom-Heavy Scrim for Bottom Text Stacking */}
          <div className="absolute inset-0 lg:hidden bg-gradient-to-b from-black/35 via-black/60 to-black/90 pointer-events-none z-1" />

          {/* Hero Content Container */}
          <div className="relative z-10 w-full flex-1 flex flex-col justify-center pt-24 pb-16 lg:pt-32 lg:pb-12">
            <Container>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
                
                {/* Left Column: Headline, Narrative & Primary Actions */}
                <div className="lg:col-span-6 space-y-6 text-left">
                  {/* Headline: Display Serif, Sentence 1 Pure White, Sentence 2 Dimmed 75% */}
                  <h1 className="font-display tracking-tight text-balance text-[clamp(2.1rem,8vw,3rem)] lg:text-[clamp(2.5rem,4.4vw,4.5rem)] leading-[1.08] font-bold">
                    <span className="block text-white">
                      Describe your event.
                    </span>
                    <span className="block text-white/75 mt-1.5">
                      Planora plans what happens next.
                    </span>
                  </h1>

                  {/* Supporting Narrative (Max 60ch, white/80) */}
                  <p className="text-sm sm:text-base lg:text-lg text-white/80 max-w-[60ch] leading-relaxed">
                    A context-aware celebration planning assistant that converts your initial guest count and budget into an itemized budget, reverse-scheduled timeline, vendor checklists, and personalized ideas.
                  </p>

                  {/* CTA Pill Buttons */}
                  <div className="pt-2">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                      {/* Primary CTA: Brand Gradient Pill */}
                      <Link
                        href="/events/new"
                        className="group inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-amber-600 hover:opacity-95 shadow-md shadow-black/40 active:scale-[0.98] transition-transform min-h-[48px]"
                      >
                        <span>Plan my event</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>

                      {/* Secondary Ghost Pill: White/40 border, hover bg-white/10 */}
                      <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-white border border-white/40 hover:bg-white/10 transition-colors min-h-[48px]"
                      >
                        <span>Explore demo workspace</span>
                        <ChevronRight className="w-4 h-4 text-white/70" />
                      </Link>
                    </div>

                    <p className="text-xs text-white/70 font-medium mt-3 pl-1">
                      No sign-in needed &bull; Instant generation
                    </p>
                  </div>
                </div>

                {/* Right Column: Floating White Blueprint Preview Card (Desktop >= 1024px) */}
                <div className="hidden lg:block lg:col-span-6">
                  <HeroProductPreview />
                </div>

              </div>

              {/* Bottom Info Bar (Reference A style, desktop >= 1024px, hidden when height < 760px) */}
              <div className="mt-14 pt-4 border-t border-white/10 hidden lg:block hero-info-bar">
                <div className="rounded-full bg-black/40 border border-white/15 px-8 py-3.5 shadow-lg backdrop-blur-md flex items-center justify-between text-xs text-white/90">
                  <div className="flex items-center gap-2.5">
                    <Wallet className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-semibold">Itemized Budgeting</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="font-semibold">Reverse Milestone Scheduling</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                  <div className="flex items-center gap-2.5">
                    <Store className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-semibold">Contract Verification Checklists</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="font-semibold">Culturally Tailored Concepts</span>
                  </div>
                </div>
              </div>

            </Container>
          </div>

          {/* Mobile Bottom Spacing Clearance */}
          <div className="h-16 lg:hidden" aria-hidden="true" />
        </section>

        {/* Mobile Blueprint Card: Positioned as bottom-sheet card overlapping photo by 40px (< 1024px) */}
        <div className="lg:hidden -mt-10 relative z-20 px-4 mb-8">
          <HeroProductPreview />
        </div>

        {/* ============================================================ */}
        {/* SECTION 1: What You Get (Overlapping Hero by 32px with Curves) */}
        {/* ============================================================ */}
        <section className="relative z-20 -mt-8 pt-16 pb-20 bg-white rounded-t-[2rem] sm:rounded-t-[2.5rem] border-t border-[#E4E1DC] shadow-sm content-visibility-auto">
          <Container className="space-y-12">
            <Reveal direction="up">
              <div className="max-w-2xl text-left">
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                  The Four Planning Pillars
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mt-1 tracking-tight font-display">
                  What Planora Produces for Your Celebration
                </h2>
                <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
                  Instead of generic conversation, Planora generates four concrete, schema-validated management tools customized to your city, cultural preferences, and budget constraints.
                </p>
              </div>
            </Reveal>

            <Reveal direction="up" delay={80}>
              <BentoGrid />
            </Reveal>
          </Container>
        </section>

        {/* ============================================================ */}
        {/* SECTION 2: How It Works (Sticky 2-Column Sequence) */}
        {/* ============================================================ */}
        <section className="py-24 bg-[#FAF8F5] content-visibility-auto">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Sticky Left Heading Column */}
              <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-4 text-left">
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                  Real Planning Sequence
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight font-display">
                  How Planora Works
                </h2>
                <p className="text-sm text-zinc-600 leading-relaxed max-w-md">
                  Planning life&apos;s biggest celebrations shouldn&apos;t feel like untangling an overwhelming spreadsheet. Follow a clear, three-stage path from initial thought to flawless execution.
                </p>

                <div className="pt-4">
                  <Link
                    href="/events/new"
                    className="inline-flex items-center gap-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:translate-x-1 transition-transform"
                  >
                    <span>Try the creation wizard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Column: 3 Sequential Numbered Steps */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Step 1 */}
                <Reveal direction="up" delay={0}>
                  <div className="p-7 rounded-3xl bg-white border border-[#E4E1DC] shadow-xs flex items-start gap-5 hover-shadow-fade">
                    <span className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 font-extrabold text-base flex items-center justify-center shrink-0 border border-rose-100">
                      01
                    </span>
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-bold text-zinc-900">
                        Describe Your Event Parameters
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                        Input your celebration type (Wedding, Birthday, or Community), target date, city location, guest count, and total budget in Indian Rupees. Optional dietary and theme preferences allow deeper cultural grounding.
                      </p>
                    </div>
                  </div>
                </Reveal>

                {/* Step 2 */}
                <Reveal direction="up" delay={80}>
                  <div className="p-7 rounded-3xl bg-white border border-[#E4E1DC] shadow-xs flex items-start gap-5 hover-shadow-fade">
                    <span className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 font-extrabold text-base flex items-center justify-center shrink-0 border border-amber-100">
                      02
                    </span>
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-bold text-zinc-900">
                        AI Synthesizes Your Complete Blueprint
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                        Gemini 1.5 Flash evaluates your parameters against mathematical constraints, reverse-schedules your milestones from the event date, divides funds across critical categories, and generates customized vendor checklists.
                      </p>
                    </div>
                  </div>
                </Reveal>

                {/* Step 3 */}
                <Reveal direction="up" delay={160}>
                  <div className="p-7 rounded-3xl bg-white border border-[#E4E1DC] shadow-xs flex items-start gap-5 hover-shadow-fade">
                    <span className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 font-extrabold text-base flex items-center justify-center shrink-0 border border-emerald-100">
                      03
                    </span>
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-bold text-zinc-900">
                        Execute with Confidence: &ldquo;What Should I Do Next?&rdquo;
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                        Whenever you log into your workspace, Planora provides one immediate priority directive. As actual vendor costs are entered, variance tracking keeps your budget on course until celebration day.
                      </p>
                    </div>
                  </div>
                </Reveal>

              </div>

            </div>
          </Container>
        </section>

        {/* ============================================================ */}
        {/* SECTION 3: Demo Scenarios Gallery */}
        {/* ============================================================ */}
        <section className="py-20 bg-white border-t border-[#E4E1DC] content-visibility-auto">
          <Container className="space-y-10">
            <Reveal direction="up">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="max-w-2xl text-left">
                  <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                    Interactive Proof of Concept
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mt-1 tracking-tight font-display">
                    Explore Ready-to-Test Demo Scenarios
                  </h2>
                  <p className="text-sm text-zinc-600 mt-2">
                    Click any celebration below to immediately launch its live budget tracker, reverse timeline, and vendor checklists.
                  </p>
                </div>

                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 shrink-0 hover:translate-x-1 transition-transform"
                >
                  <span>View All in Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Reveal>

            {/* Gallery Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 snap-x snap-mandatory">
              
              {/* Scenario 1: Wedding */}
              <Reveal direction="up" delay={0}>
                <div className="bg-[#FAF8F5] rounded-3xl border border-[#E4E1DC] overflow-hidden flex flex-col justify-between group snap-center min-w-[280px] hover-shadow-fade hover-lift">
                  <div>
                    <div className="relative aspect-4/5 w-full bg-rose-50 overflow-hidden">
                      <Image
                        src="/images/demo-wedding.svg"
                        alt="Anuj's Awadhi Wedding Sangeet & Banquet"
                        width={600}
                        height={750}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/90 text-rose-700 shadow-2xs">
                        Wedding &bull; ₹8,00,000
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-1.5 text-xs text-rose-600 font-bold mb-1">
                        <Flame className="w-3.5 h-3.5" />
                        <span>Lucknow &bull; 300 Guests</span>
                      </div>
                      <h3 className="text-lg font-bold text-zinc-900">
                        Anuj&apos;s Awadhi Wedding
                      </h3>
                      <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                        Awadhi royal banquet menu, floral mandap, acoustic shehnai entry, and candid photography verification lists.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <Link
                      href="/events/demo-wedding-1"
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-zinc-900 bg-white border border-[#E4E1DC] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-2xs"
                    >
                      <span>Open Wedding Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </Reveal>

              {/* Scenario 2: Birthday */}
              <Reveal direction="up" delay={80}>
                <div className="bg-[#FAF8F5] rounded-3xl border border-[#E4E1DC] overflow-hidden flex flex-col justify-between group snap-center min-w-[280px] hover-shadow-fade hover-lift">
                  <div>
                    <div className="relative aspect-4/5 w-full bg-amber-50 overflow-hidden">
                      <Image
                        src="/images/demo-birthday.svg"
                        alt="Aarav's 8th Birthday Galaxy Party"
                        width={600}
                        height={750}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/90 text-amber-700 shadow-2xs">
                        Birthday &bull; ₹50,000
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold mb-1">
                        <Cake className="w-3.5 h-3.5" />
                        <span>Bangalore &bull; 50 Guests</span>
                      </div>
                      <h3 className="text-lg font-bold text-zinc-900">
                        Aarav&apos;s 8th Birthday
                      </h3>
                      <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                        Outer space galaxy theme, DIY cardboard telescope craft station, centerpiece cake, and age-specific host checklists.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <Link
                      href="/events/demo-birthday-2"
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-zinc-900 bg-white border border-[#E4E1DC] hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-colors shadow-2xs"
                    >
                      <span>Open Birthday Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </Reveal>

              {/* Scenario 3: Community Mela */}
              <Reveal direction="up" delay={160}>
                <div className="bg-[#FAF8F5] rounded-3xl border border-[#E4E1DC] overflow-hidden flex flex-col justify-between group snap-center min-w-[280px] hover-shadow-fade hover-lift">
                  <div>
                    <div className="relative aspect-4/5 w-full bg-emerald-50 overflow-hidden">
                      <Image
                        src="/images/demo-community.svg"
                        alt="Gomti Nagar Diwali Community Mela"
                        width={600}
                        height={750}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/90 text-emerald-700 shadow-2xs">
                        Community &bull; ₹2,00,000
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mb-1">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Lucknow &bull; 700 Guests</span>
                      </div>
                      <h3 className="text-lg font-bold text-zinc-900">
                        Diwali Community Mela
                      </h3>
                      <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                        PA sound coverage, tent shamiana contracts, municipal permit checklists, chaat stalls, and volunteer rosters.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <Link
                      href="/events/demo-community-3"
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-zinc-900 bg-white border border-[#E4E1DC] hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors shadow-2xs"
                    >
                      <span>Open Community Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </Reveal>

            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
}
