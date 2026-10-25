'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Sparkles, 
  ArrowRight, 
  Wallet, 
  Calendar, 
  Store, 
  Lightbulb, 
  Bot, 
  CheckCircle2, 
  ShieldCheck, 
  Flame,
  Cake,
  Building2,
  HeartHandshake
} from 'lucide-react';
import { DEMO_EVENTS } from '@/lib/demo-data';
import { formatINR } from '@/lib/utils';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-rose-50/40 via-white to-zinc-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/80 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-rose-600 animate-spin" />
            <span>PromptWars Virtual — Challenge 5: Celebration & Event Planner</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-zinc-950 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Plan smarter. <br />
            <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
              Celebrate better.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            Describe your celebration in seconds. Planora AI synthesizes complete 
            budgets, reverse timelines, vendor verification checklists, and personalized ideas.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/events/new"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-lg shadow-rose-200 transition-all hover:-translate-y-0.5"
            >
              <Sparkles className="w-5 h-5" />
              <span>Plan My Event with AI</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-sm"
            >
              <span>Explore Dashboard & Demos</span>
            </Link>
          </div>

          {/* Core Principle Callout */}
          <div className="mt-12 p-4 max-w-xl mx-auto rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-sm flex items-center gap-3 text-left">
            <div className="p-2 rounded-xl bg-amber-200/60 text-amber-800 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold block">Core Product Principle:</span>
              <span className="text-amber-800/90 text-xs sm:text-sm">
                Always answers: <em>&ldquo;Given my current event context, what should I do next?&rdquo;</em>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Event Types */}
      <section className="py-12 bg-white border-y border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs uppercase tracking-wider font-bold text-rose-600">
              Tailored Cultural & Logistics Engines
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-1">
              Purpose-Built for Three Core Event Categories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Wedding Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-50/70 to-white border border-rose-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-rose-500 text-white flex items-center justify-center mb-4 shadow-sm shadow-rose-200">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900">Weddings & Sangeet</h3>
              <p className="text-sm text-zinc-600 mt-2">
                Multi-day coordination, Awadhi & regional banquets, mandap floristry, candid photography lists, and RSVP guest room logistics.
              </p>
              <Link
                href="/events/demo-wedding-1"
                className="mt-4 inline-flex items-center text-sm font-semibold text-rose-600 hover:text-rose-700"
              >
                <span>View Anuj&apos;s Wedding Demo (₹8L)</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* Birthday Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/70 to-white border border-amber-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-4 shadow-sm shadow-amber-200">
                <Cake className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900">Birthdays & Milestones</h3>
              <p className="text-sm text-zinc-600 mt-2">
                Age-specific game hosts, customized centerpiece cakes, interactive Discovery DIY stations, and curated return gift favors.
              </p>
              <Link
                href="/events/demo-birthday-2"
                className="mt-4 inline-flex items-center text-sm font-semibold text-amber-600 hover:text-amber-700"
              >
                <span>View Aarav&apos;s 8th Birthday Demo (₹50k)</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* Community Event Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-white border border-emerald-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-sm shadow-emerald-200">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900">Community & Festivals</h3>
              <p className="text-sm text-zinc-600 mt-2">
                PA sound coverage, tent/shamiana logistics, crowd management, municipal permission checklists, and volunteer scheduling.
              </p>
              <Link
                href="/events/demo-community-3"
                className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700"
              >
                <span>View Diwali Mela Demo (700 Guests)</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 6 AI Evaluation Pillars Breakdown */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-wider font-bold text-zinc-400">
            Challenge 5 Feature Architecture
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 mt-1">
            How Planora Solves Fragmented Event Planning
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-900 text-lg">AI Event Blueprint</h3>
            <p className="text-sm text-zinc-600 mt-2">
              Gemini converts event type, date, location, budget, and cultural preferences into a complete multi-layered plan.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-900 text-lg">Smart Budget Allocator</h3>
            <p className="text-sm text-zinc-600 mt-2">
              Itemized budget categories with actual spend tracking, overspending indicators, and variance analysis in ₹ INR.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-900 text-lg">Reverse Timeline & Tasks</h3>
            <p className="text-sm text-zinc-600 mt-2">
              Deadlines automatically scheduled backwards from your celebration date with priority badges (Critical, High, Medium).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-900 text-lg">Vendor Checklists</h3>
            <p className="text-sm text-zinc-600 mt-2">
              Know exactly what critical questions to ask banquet managers, caterers, and photographers before signing contracts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-900 text-lg">Personalized Idea Engine</h3>
            <p className="text-sm text-zinc-600 mt-2">
              Context-tailored experiences (e.g. Lucknowi Itar bars, Discovery craft tables) matching your budget and guest count.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center mb-3">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-900 text-lg">Context-Aware AI Copilot</h3>
            <p className="text-sm text-zinc-600 mt-2">
              Ask questions in English or Hinglish. Planora reads your live event data to tell you what is most urgent next.
            </p>
          </div>

        </div>
      </section>

      {/* Ready to start CTA */}
      <section className="mt-auto py-12 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Start Planning Your Celebration Today
          </h2>
          <p className="mt-3 text-rose-100 text-base max-w-xl mx-auto">
            Create an event in 30 seconds and let Gemini synthesize your personalized blueprint.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/events/new"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-white text-rose-700 shadow-lg hover:bg-rose-50 transition-colors"
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
