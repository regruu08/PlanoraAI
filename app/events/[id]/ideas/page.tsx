'use client';

import React, { use, useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventHeader from '@/components/EventHeader';
import { PlanoraEvent, Idea, IdeaCategory } from '@/types';
import { getEventById, getIdeas, saveIdea } from '@/lib/storage';
import { 
  Lightbulb, 
  Bookmark, 
  BookmarkCheck, 
  Sparkles, 
  Filter, 
  Heart,
  Palette,
  Utensils,
  PartyPopper,
  Users
} from 'lucide-react';

export default function IdeasPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const eventId = unwrappedParams.id;

  const [event, setEvent] = useState<PlanoraEvent | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadData = () => {
    const evt = getEventById(eventId);
    if (evt) {
      setEvent(evt);
      setIdeas(getIdeas(eventId));
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  if (!event) {
    return <div className="p-8 text-center text-zinc-400">Loading ideas...</div>;
  }

  const toggleSaveIdea = (idea: Idea) => {
    const updated: Idea = { ...idea, is_saved: !idea.is_saved };
    saveIdea(updated);
    loadData();
  };

  const filteredIdeas = ideas.filter((idea) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'saved') return idea.is_saved;
    return idea.category === selectedCategory;
  });

  const categoryColor: Record<string, string> = {
    theme: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    decor: 'bg-rose-50 text-rose-700 border-rose-200',
    food: 'bg-amber-50 text-amber-700 border-amber-200',
    activity: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    entertainment: 'bg-purple-50 text-purple-700 border-purple-200',
    guest_experience: 'bg-pink-50 text-pink-700 border-pink-200',
    other: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50">
      <Navbar />
      <EventHeader event={event} onRefresh={loadData} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-zinc-900">Personalized Event Experience Engine</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
                Tailored for {event.location}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Unique celebration touches synthesized specifically for {event.guest_count} guests &amp; {event.theme || 'your theme'}.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              selectedCategory === 'all'
                ? 'bg-zinc-900 text-white'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            All Ideas ({ideas.length})
          </button>
          <button
            onClick={() => setSelectedCategory('saved')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              selectedCategory === 'saved'
                ? 'bg-rose-600 text-white'
                : 'bg-white border border-zinc-200 text-rose-700 hover:bg-rose-50'
            }`}
          >
            Saved Bookmarks ({ideas.filter((i) => i.is_saved).length})
          </button>
          <button
            onClick={() => setSelectedCategory('guest_experience')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              selectedCategory === 'guest_experience'
                ? 'bg-pink-600 text-white'
                : 'bg-white border border-zinc-200 text-pink-700 hover:bg-pink-50'
            }`}
          >
            Guest Experience
          </button>
          <button
            onClick={() => setSelectedCategory('food')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              selectedCategory === 'food'
                ? 'bg-amber-600 text-white'
                : 'bg-white border border-zinc-200 text-amber-700 hover:bg-amber-50'
            }`}
          >
            Food & Dining
          </button>
          <button
            onClick={() => setSelectedCategory('entertainment')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              selectedCategory === 'entertainment'
                ? 'bg-purple-600 text-white'
                : 'bg-white border border-zinc-200 text-purple-700 hover:bg-purple-50'
            }`}
          >
            Entertainment
          </button>
          <button
            onClick={() => setSelectedCategory('decor')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              selectedCategory === 'decor'
                ? 'bg-rose-600 text-white'
                : 'bg-white border border-zinc-200 text-rose-700 hover:bg-rose-50'
            }`}
          >
            Decor & Photobooth
          </button>
        </div>

        {/* Ideas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredIdeas.map((idea) => {
            const badgeClass = categoryColor[idea.category] || categoryColor.other;

            return (
              <div
                key={idea.id}
                className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 pb-3">
                    <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border uppercase tracking-wider ${badgeClass}`}>
                      {idea.category.replace('_', ' ')}
                    </span>

                    <button
                      onClick={() => toggleSaveIdea(idea)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        idea.is_saved
                          ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                          : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'
                      }`}
                      title={idea.is_saved ? 'Remove Bookmark' : 'Save to Favorites'}
                    >
                      {idea.is_saved ? (
                        <BookmarkCheck className="w-5 h-5 fill-rose-100" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-900 group-hover:text-rose-600 transition-colors">
                    {idea.title}
                  </h3>

                  <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
                    {idea.description}
                  </p>
                </div>

                {/* Reason why it matches */}
                <div className="mt-5 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-700 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Why This Fits Your Celebration</span>
                  </div>
                  <p className="text-zinc-600 leading-normal">
                    {idea.reason}
                  </p>
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
