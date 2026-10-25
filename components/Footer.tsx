import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200/80 bg-zinc-50/50 py-8 text-zinc-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              Planora AI
            </span>
            <span className="text-zinc-400">|</span>
            <span className="text-zinc-500">
              PromptWars Virtual — Challenge 5: Celebration & Event Planner
            </span>
          </div>

          <div className="flex items-center gap-1 text-zinc-500">
            <span>Powered by</span>
            <span className="font-medium text-zinc-800">Google Gemini</span>
            <span>&</span>
            <span className="font-medium text-zinc-800">Google Antigravity</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-500">
            <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">
              Dashboard
            </Link>
            <Link href="/events/new" className="hover:text-zinc-900 transition-colors">
              Create Event
            </Link>
            <a 
              href="https://hack2skill.com/event/pwvirtual1/dashboard/challenges?utm_source=hack2skill&utm_medium=homepage"
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-rose-600 transition-colors"
            >
              Hackathon Portal ↗
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}
