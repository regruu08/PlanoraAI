'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Sparkles, 
  ArrowRight, 
  Wallet, 
  Clock, 
  Store, 
  Lightbulb, 
  Bot, 
  Flame,
  Cake,
  Building2,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-rose-50/40 via-white to-zinc-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Hackathon Challenge Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/80 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold mb-6 shadow-xs animate-in fade-in">
            <Sparkles className="w-4 h-4 text-rose-600 animate-spin" />
            <span>PromptWars Virtual — Challenge 5: Celebration &amp; Event Planner</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-zinc-950 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Describe your event. <br />
            <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
              Planora plans what happens next.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            A context-aware GenAI planning assistant that converts basic celebration details 
            into an itemized budget, reverse-scheduled timeline, vendor checklists, and personalized ideas.
          </p>

          {/* Direct CTAs (Zero Sign-in Wall!) */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/events/new"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 shadow-lg shadow-rose-200 transition-all hover:-translate-y-0.5"
            >
              <Sparkles className="w-5 h-5" />
              <span>Start Planning (No Sign-in Required)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-xs"
            >
              <span>Explore Demos &amp; Workspace</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Core Product Principle Directive */}
          <div className="mt-12 p-5 max-w-xl mx-auto rounded-3xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-sm flex items-center gap-3.5 text-left shadow-xs">
            <div className="p-2.5 rounded-2xl bg-amber-200/70 text-amber-800 shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold block text-xs uppercase tracking-wider text-amber-950">
                Core Planning Principle:
              </span>
              <span className="text-amber-900 font-medium text-sm">
                Always answers: <em>&ldquo;Given my current event, what should I do next?&rdquo;</em>
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 3 Supported Event Categories */}
      <section className="py-16 bg-white border-y border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-wider font-extrabold text-rose-600">
              Tailored Logistics &amp; Cultural Engines
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 mt-1.5 tracking-tight">
              Purpose-Built for Three Core Event Categories
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Wedding Card */}
            <div className="p-7 rounded-3xl bg-gradient-to-br from-rose-50/60 to-white border border-rose-100/90 hover:shadow-lg transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center mb-5 shadow-sm shadow-rose-200 group-hover:scale-105 transition-transform">
                  <Flame className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900">Weddings &amp; Sangeet</h3>
                <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
                  Multi-day coordination, Awadhi &amp; regional banquets, mandap floristry, candid photography lists, and RSVP guest room logistics.
                </p>
              </div>
              <Link
                href="/events/demo-wedding-1"
                className="mt-6 inline-flex items-center text-sm font-bold text-rose-600 hover:text-rose-700"
              >
                <span>View Anuj&apos;s Wedding Demo (₹8L)</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>

            {/* 2. Birthday Card */}
            <div className="p-7 rounded-3xl bg-gradient-to-br from-amber-50/60 to-white border border-amber-100/90 hover:shadow-lg transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-5 shadow-sm shadow-amber-200 group-hover:scale-105 transition-transform">
                  <Cake className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900">Birthdays &amp; Milestones</h3>
                <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
                  Age-specific game hosts, customized centerpiece cakes, interactive Discovery DIY stations, and curated return gift favors.
                </p>
              </div>
              <Link
                href="/events/demo-birthday-2"
                className="mt-6 inline-flex items-center text-sm font-bold text-amber-600 hover:text-amber-700"
              >
                <span>View Aarav&apos;s 8th Birthday Demo (₹50k)</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>

            {/* 3. Community Event Card */}
            <div className="p-7 rounded-3xl bg-gradient-to-br from-emerald-50/60 to-white border border-emerald-100/90 hover:shadow-lg transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-5 shadow-sm shadow-emerald-200 group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900">Community &amp; Festivals</h3>
                <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
                  PA sound coverage, tent/shamiana logistics, crowd management, municipal permission checklists, and volunteer scheduling.
                </p>
              </div>
              <Link
                href="/events/demo-community-3"
                className="mt-6 inline-flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-700"
              >
                <span>View Diwali Mela Demo (700 Guests)</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 5 Core Feature Pillars */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-wider font-extrabold text-zinc-400">
            Challenge 5 Feature Architecture
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 mt-1.5 tracking-tight">
            How Planora Solves Fragmented Event Planning
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="p-7 rounded-3xl bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-900 text-lg">AI Event Blueprint</h3>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              Gemini synthesizes event details, budget limits, city context, and dates into a multi-layered plan with validated JSON schemas.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-900 text-lg">Smart Budget Allocator</h3>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              Itemized budget categories with actual spend tracking, overspending indicators, and variance analysis in Indian Rupees (₹ INR).
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-900 text-lg">Reverse Milestone Timeline</h3>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              Deadlines automatically scheduled backwards from your celebration date with priority badges and overdue detection.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-900 text-lg">Vendor Checklists</h3>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              Know exactly what critical questions to verify with banquet managers, caterers, and photographers before signing contracts.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-900 text-lg">Personalized Idea Engine</h3>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              Context-tailored experiences (Lucknowi Itar bar, Discovery craft tables) matching your budget and guest count.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mb-4">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-900 text-lg">Context-Aware AI Copilot</h3>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              Ask questions in English or Hinglish. Planora reads your live event data to tell you what is most urgent next.
            </p>
          </div>

        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mt-auto py-14 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight">
            Start Planning Your Celebration Today
          </h2>
          <p className="mt-3 text-rose-100 text-base max-w-xl mx-auto">
            Create an event in 30 seconds and let Gemini synthesize your personalized blueprint.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/events/new"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold bg-white text-rose-700 shadow-lg hover:bg-rose-50 transition-colors"
            >
              <span>Create New Event</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
