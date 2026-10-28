'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  floating?: boolean;
}

export default function ThemeToggle({
  className = '',
  floating = false,
}: ThemeToggleProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('planora_theme');
      if (
        saved === 'dark' ||
        (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      } else {
        setTheme('light');
        document.documentElement.classList.remove('dark');
      }
    } catch {
      setTheme('light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);

    try {
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('planora_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('planora_theme', 'light');
      }
    } catch (err) {
      console.warn('[theme] Could not persist theme preference:', err);
    }
  };

  if (!mounted) {
    if (floating) {
      return (
        <div
          className="fixed bottom-6 right-6 z-50 w-11 h-11 pointer-events-none"
          aria-hidden="true"
        />
      );
    }
    return null;
  }

  if (floating) {
    return (
      <aside aria-label="Theme Switcher">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          className={`fixed bottom-6 right-6 z-50 group flex items-center gap-2 px-3.5 py-2.5 rounded-full backdrop-blur-md shadow-xl border transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer ${
            theme === 'dark'
              ? 'bg-[#1c1614]/90 border-[#382d28] text-amber-300 shadow-amber-950/20'
              : 'bg-white/95 border-[#E4E1DC] text-zinc-800 shadow-zinc-950/10'
          } ${className}`}
        >
          <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-700 group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </div>
          <span className="text-xs font-bold select-none tracking-tight">
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </span>
        </button>
      </aside>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      className={`p-2 rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer ${
        theme === 'dark'
          ? 'bg-[#1c1614] border-[#382d28] text-amber-300 hover:bg-[#261e1b]'
          : 'bg-white border-[#E4E1DC] text-zinc-700 hover:bg-zinc-50'
      } ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-zinc-700" />
      )}
    </button>
  );
}
