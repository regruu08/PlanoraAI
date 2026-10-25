import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Sparkles, ArrowRight, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-24 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 shadow-xs border border-rose-100">
          <Sparkles className="w-8 h-8 text-rose-500" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 mb-3">
          404 &bull; Page Not Found
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
          This celebration page could not be found
        </h1>
        <p className="text-sm text-zinc-600 max-w-md mt-3 leading-relaxed">
          The event or planning workspace you are looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 text-white text-xs font-bold shadow-md hover:bg-rose-700 transition-colors"
          >
            <span>Go to Event Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-zinc-200 text-zinc-700 text-xs font-bold shadow-2xs hover:bg-zinc-50 transition-colors"
          >
            <Home className="w-4 h-4 text-zinc-400" />
            <span>Home</span>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
