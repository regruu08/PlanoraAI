'use client';

import React, { use, useCallback, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventHeader from '@/components/EventHeader';
import { PlanoraEvent, Idea } from '@/types';
import { getEventById, getIdeas, saveIdea } from '@/lib/storage';
import { 
  Lightbulb, 
  Sparkles, 
  Bookmark, 
  BookmarkCheck, 
  Search, 
  ArrowRight,
  Palette,
  UtensilsCrossed,
  Music,
  HeartHandshake,
  PartyPopper,
  Layers,
  Bot
} from 'lucide-react';

export default function IdeasPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const eventId = unwrappedParams.id;

  const [event, setEvent] = useState<PlanoraEvent | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(() => {
    const evt = getEventById(eventId);
    if (evt) {
      setEvent(evt);
      setIdeas(getIdeas(eventId));
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleSaveIdea = (idea: Idea) => {
    const updated: Idea = { ...idea, is_saved: !idea.is_saved };
    saveIdea(updated);
    setIdeas(prev => prev.map(i => i.id === idea.id ? updated : i));
  };

  const categories = [
    { id: 'all', label: 'All Ideas', icon: Layers },
    { id: 'saved', label: 'Saved Bookmarks', icon: Bookmark },
    { id: 'theme', label: 'Theme & Concept', icon: Palette },
    { id: 'decor', label: 'Decor & Ambience', icon: Sparkles },
    { id: 'food', label: 'Food & Dining', icon: UtensilsCrossed },
    { id: 'entertainment', label: 'Entertainment', icon: Music },
    { id: 'guest_experience', label: 'Guest Experience', icon: HeartHandshake },
    { id: 'activity', label: 'Activities & Games', icon: PartyPopper },
  ];

  const categoryColor: Record<string, { badge: string; border: string; accent: string }> = {
    theme: {
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      border: 'hover:border-indigo-300',
      accent: 'text-indigo-600',
    },
    decor: {
      badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
      border: 'hover:border-rose-300',
      accent: 'text-rose-600',
    },
    food: {
      badge: 'bg-amber-50 text-amber-800 border-amber-200/80',
      border: 'hover:border-amber-300',
      accent: 'text-amber-600',
    },
    entertainment: {
      badge: 'bg-purple-50 text-purple-700 border-purple-200/80',
      border: 'hover:border-purple-300',
      accent: 'text-purple-600',
    },
    guest_experience: {
      badge: 'bg-pink-50 text-pink-700 border-pink-200/80',
      border: 'hover:border-pink-300',
      accent: 'text-pink-600',
    },
    activity: {
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      border: 'hover:border-emerald-300',
      accent: 'text-emerald-600',
    },
    other: {
      badge: 'bg-zinc-100 text-zinc-700 border-zinc-200/80',
      border: 'hover:border-zinc-300',
      accent: 'text-zinc-600',
    },
  };

  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      // Category match
      let matchCat = true;
      if (selectedCategory === 'saved') matchCat = !!idea.is_saved;
      else if (selectedCategory !== 'all') matchCat = idea.category === selectedCategory;

      // Query match
      let matchQuery = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        matchQuery = 
          idea.title.toLowerCase().includes(q) ||
          idea.description.toLowerCase().includes(q) ||
          idea.reason.toLowerCase().includes(q) ||
          idea.category.toLowerCase().includes(q);
      }

      return matchCat && matchQuery;
    });
  }, [ideas, selectedCategory, searchQuery]);

  const savedCount = useMemo(() => ideas.filter(i => i.is_saved).length, [ideas]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50/50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-zinc-400 text-sm font-medium">Curating personalized ideas...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50/50">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-zinc-900">Event Not Found</h2>
          <p className="text-sm text-zinc-500 mt-2">The requested celebration plan could not be located.</p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-bold shadow-md hover:bg-rose-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50">
      <Navbar />
      <EventHeader event={event} onRefresh={loadData} />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 rounded-3xl p-6 sm:p-8 border border-amber-200/60 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-rose-200/40 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-xs border border-amber-200 text-amber-800 text-xs font-bold mb-3 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Synthesized for {event.location} &bull; {event.guest_count} Guests</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                Celebration Inspiration &amp; Signature Concepts
              </h2>
              <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
                Curated by Planora AI specifically for your <span className="font-semibold text-zinc-800">{event.theme || 'custom themed'}</span> event. Bookmark concepts you love, share them with decorators, or discuss them with your AI Copilot.
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
              <div className="text-right">
                <span className="text-2xl font-black text-rose-600">{savedCount}</span>
                <span className="text-xs font-semibold text-zinc-500 block">Ideas Saved</span>
              </div>
              <Link
                href={`/events/${event.id}/copilot`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold shadow-sm transition-colors"
              >
                <Bot className="w-3.5 h-3.5 text-rose-400" />
                <span>Brainstorm More</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Controls: Search and Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search ideas (e.g. entry, photobooth, mocktail, lighting)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="text-xs text-zinc-500 font-medium self-end sm:self-center">
              Showing <span className="font-bold text-zinc-800">{filteredIdeas.length}</span> of {ideas.length} ideas
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              const count = cat.id === 'all' 
                ? ideas.length 
                : cat.id === 'saved' 
                  ? savedCount 
                  : ideas.filter(i => i.category === cat.id).length;

              if (cat.id !== 'all' && cat.id !== 'saved' && count === 0) return null;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-zinc-400'}`} />
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Empty State */}
        {filteredIdeas.length === 0 && (
          <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">No matching concepts found</h3>
            <p className="text-xs text-zinc-500 mt-1">
              {searchQuery 
                ? `No ideas matched "${searchQuery}". Try different keywords or reset your filters.`
                : selectedCategory === 'saved'
                  ? 'You haven\'t bookmarked any ideas yet. Click the bookmark icon on any card to save it.'
                  : 'Try selecting a different category or ask the Copilot to generate fresh ideas.'}
            </p>
            <div className="mt-5 flex justify-center gap-3">
              {(searchQuery || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-semibold hover:bg-zinc-200 transition-colors"
                >
                  Reset Filters
                </button>
              )}
              <Link
                href={`/events/${event.id}/copilot`}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors inline-flex items-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5" />
                Ask Copilot for Ideas
              </Link>
            </div>
          </div>
        )}

        {/* Ideas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredIdeas.map((idea) => {
            const style = categoryColor[idea.category] || categoryColor.other;

            return (
              <div
                key={idea.id}
                className={`bg-white rounded-3xl border border-zinc-200/80 shadow-xs hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between group ${style.border}`}
              >
                <div>
                  {/* Card Header: Category & Save button */}
                  <div className="flex items-center justify-between gap-3 pb-3">
                    <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border uppercase tracking-wider ${style.badge}`}>
                      {idea.category.replace('_', ' ')}
                    </span>

                    <button
                      onClick={() => toggleSaveIdea(idea)}
                      className={`p-2 rounded-xl transition-all ${
                        idea.is_saved
                          ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 shadow-2xs'
                          : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'
                      }`}
                      title={idea.is_saved ? 'Remove Bookmark' : 'Save to Favorites'}
                    >
                      {idea.is_saved ? (
                        <BookmarkCheck className="w-4 h-4 fill-rose-600 text-rose-600" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-zinc-900 group-hover:text-rose-600 transition-colors leading-snug">
                    {idea.title}
                  </h3>

                  <p className="text-sm text-zinc-600 mt-2.5 leading-relaxed">
                    {idea.description}
                  </p>
                </div>

                {/* Grounding Callout & Action Bar */}
                <div className="mt-6 space-y-3">
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Why This Fits Your Celebration</span>
                    </div>
                    <p className="text-amber-800/90 leading-relaxed">
                      {idea.reason}
                    </p>
                  </div>

                  {/* Action Link to Copilot with pre-filled context */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[11px] text-zinc-400 font-medium">
                      Status: {idea.is_saved ? '⭐ Saved to Favorites' : 'Idea Suggestion'}
                    </span>
                    <Link
                      href={`/events/${event.id}/copilot`}
                      className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-700 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Discuss with Copilot</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
