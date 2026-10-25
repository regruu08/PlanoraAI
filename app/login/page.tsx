'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Sparkles, ArrowRight, Lock, Mail, UserCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
        router.push('/dashboard');
      } catch (err: any) {
        setError(err.message || 'Failed to sign in');
      } finally {
        setLoading(false);
      }
    } else {
      // Offline/Demo Mode login
      localStorage.setItem('planora_user', JSON.stringify({ email, name: email.split('@')[0] }));
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    }
  };

  const handleDemoLogin = () => {
    localStorage.setItem(
      'planora_user',
      JSON.stringify({ email: 'anuj.demo@hack2skill.com', name: 'Anuj (Hackathon Demo)' })
    );
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-50/50 via-white to-zinc-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-zinc-200 shadow-xl p-8 space-y-6">
        
        {/* Brand */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-rose-200">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
              Planora AI
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Welcome Back</h1>
          <p className="text-xs text-zinc-500 mt-1">Sign in to access your event plans &amp; AI blueprints</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Demo Login for Evaluators */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-center">
          <span className="text-xs font-bold text-amber-900 block mb-1">
            ⚡ Hackathon Evaluator Quick Access
          </span>
          <p className="text-[11px] text-amber-700 mb-3">
            Skip manual signup and test the full event workspace instantly.
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <UserCheck className="w-4 h-4" />
            <span>1-Click Evaluator Guest Sign In</span>
          </button>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-zinc-200"></div>
          <span className="flex-shrink mx-4 text-xs uppercase text-zinc-400 font-semibold tracking-wider">
            or email
          </span>
          <div className="flex-grow border-t border-zinc-200"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-md shadow-rose-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-semibold text-rose-600 hover:text-rose-700">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}
