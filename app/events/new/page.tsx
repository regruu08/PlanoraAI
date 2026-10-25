'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { eventFormSchema, EventFormValues } from '@/lib/validation/event';
import { saveEvent, applyBlueprintToEvent } from '@/lib/storage';
import { PlanoraEvent, EventType } from '@/types';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Flame, 
  Cake, 
  Building2, 
  Calendar, 
  MapPin, 
  Users, 
  IndianRupee, 
  FileText, 
  Utensils, 
  Home, 
  HeartHandshake,
  CheckCircle2,
  RefreshCw,
  Wand2
} from 'lucide-react';

export default function NewEventPage() {
  const router = useRouter();

  // Form State
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [name, setName] = useState('');
  const [eventDate, setEventDate] = useState('2026-12-15');
  const [location, setLocation] = useState('Lucknow');
  const [guestCount, setGuestCount] = useState<number | string>(300);
  const [totalBudget, setTotalBudget] = useState<number | string>(800000);
  const [theme, setTheme] = useState('Traditional + Modern Awadhi Fusion');
  const [foodPreference, setFoodPreference] = useState('Vegetarian (Awadhi Royal Spread)');
  const [venueType, setVenueType] = useState<'indoor' | 'outdoor' | 'hybrid'>('indoor');
  const [culturalPreference, setCulturalPreference] = useState('North Indian Hindu');
  const [specialRequirements, setSpecialRequirements] = useState('Eco-friendly varmala, drone allowed, elderly seating');
  const [notes, setNotes] = useState('Focus on warm lighting, acoustic shehnai welcome.');

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressStep, setProgressStep] = useState<string>('');

  // Quick Demo Pre-fillers
  const loadDemo = (type: EventType) => {
    setEventType(type);
    if (type === 'wedding') {
      setName("Anuj's Wedding");
      setEventDate('2026-12-15');
      setLocation('Lucknow');
      setGuestCount(300);
      setTotalBudget(800000);
      setTheme('Traditional + Modern Awadhi Fusion');
      setFoodPreference('Vegetarian (Awadhi Royal Spread)');
      setVenueType('indoor');
      setCulturalPreference('North Indian Hindu');
      setSpecialRequirements('Eco-friendly varmala, drone allowed, elderly seating');
      setNotes('Focus on warm lighting, acoustic shehnai entrance, and personalized dessert counter.');
    } else if (type === 'birthday') {
      setName("Aarav's 8th Birthday");
      setEventDate('2026-11-20');
      setLocation('Bangalore');
      setGuestCount(50);
      setTotalBudget(50000);
      setTheme('Outer Space Galaxy Explorer');
      setFoodPreference('Mini burgers, star pizzas, galaxy cupcakes');
      setVenueType('indoor');
      setCulturalPreference('Kids themed party');
      setSpecialRequirements('DIY telescope craft station, planetarium projection corner');
      setNotes('Kids aged 7-9. Avoid nuts in cake.');
    } else {
      setName('Gomti Nagar Diwali Mela & Cultural Night');
      setEventDate('2026-11-08');
      setLocation('Lucknow');
      setGuestCount(700);
      setTotalBudget(200000);
      setTheme('Earthen Lamps & Heritage Craft');
      setFoodPreference('Chaat counters, traditional mithai, masala chai stalls');
      setVenueType('hybrid');
      setCulturalPreference('Diwali Community Festival');
      setSpecialRequirements('First-aid counter, LED stage lighting, green crackers only');
      setNotes('Free entry for all society residents. Rangoli competition in afternoon.');
    }
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData: EventFormValues = {
      name,
      event_type: eventType,
      event_date: eventDate,
      location,
      guest_count: Number(guestCount),
      total_budget: Number(totalBudget),
      theme,
      food_preference: foodPreference,
      venue_type: venueType,
      cultural_preference: culturalPreference,
      special_requirements: specialRequirements,
      notes,
    };

    const validation = eventFormSchema.safeParse(formData);
    if (!validation.success) {
      const errMap: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          errMap[err.path[0] as string] = err.message;
        }
      });
      setErrors(errMap);
      return;
    }

    setIsSubmitting(true);
    setProgressStep('Creating event structure...');

    try {
      const eventId = `evt-${Date.now()}`;
      const newEvent: PlanoraEvent = {
        id: eventId,
        ...formData,
        created_at: new Date().toISOString(),
      };

      // Save initial event
      saveEvent(newEvent);

      setProgressStep('Consulting Gemini AI Event Planning Engine...');

      // Call API to generate blueprint
      const response = await fetch(`/api/events/${eventId}/generate-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: newEvent }),
      });

      const resData = await response.json();

      if (resData.success && resData.blueprint) {
        setProgressStep('Synthesizing budgets, timeline, and vendor checklists...');
        applyBlueprintToEvent(eventId, resData.blueprint);

        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}

        router.push(`/events/${eventId}`);
      } else {
        throw new Error(resData.error || 'Failed to generate plan');
      }
    } catch (err: unknown) {
      console.error(err);
      setErrors({ form: 'An error occurred while generating your plan. Please retry.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Planning Wizard</span>
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Create Your Celebration
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Provide the essentials and Planora AI will construct an itemized budget, reverse timeline, and vendor checklists.
          </p>

          {/* 1-Click Quick Demo Pre-fillers */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-zinc-400 font-medium">Quick Demo Autofill:</span>
            <button
              type="button"
              onClick={() => loadDemo('wedding')}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors"
            >
              💍 Wedding (Lucknow, ₹8L)
            </button>
            <button
              type="button"
              onClick={() => loadDemo('birthday')}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors"
            >
              🎂 Birthday (Space, ₹50k)
            </button>
            <button
              type="button"
              onClick={() => loadDemo('community')}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              🎪 Community (Diwali, ₹2L)
            </button>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 sm:p-10 space-y-8">
          
          {errors.form && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {errors.form}
            </div>
          )}

          {/* 1. Event Type Selector */}
          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-3">
              1. Select Event Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              <button
                type="button"
                onClick={() => setEventType('wedding')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  eventType === 'wedding'
                    ? 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-200'
                    : 'border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${eventType === 'wedding' ? 'bg-rose-500 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm block text-zinc-900">Wedding</span>
                  <span className="text-xs text-zinc-500">Sangeet, Reception, Mandap</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEventType('birthday')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  eventType === 'birthday'
                    ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-200'
                    : 'border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${eventType === 'birthday' ? 'bg-amber-500 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                  <Cake className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm block text-zinc-900">Birthday</span>
                  <span className="text-xs text-zinc-500">Theme party, Games, Favors</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEventType('community')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  eventType === 'community'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-200'
                    : 'border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${eventType === 'community' ? 'bg-emerald-600 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm block text-zinc-900">Community</span>
                  <span className="text-xs text-zinc-500">Festival, Mela, Gathering</span>
                </div>
              </button>

            </div>
          </div>

          {/* 2. Primary Details */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-zinc-900">2. Core Celebration Details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Event Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anuj's Wedding"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Event Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
                {errors.event_date && <p className="text-xs text-red-500 mt-1">{errors.event_date}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Location / City <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lucknow, UP"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
                {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Expected Guests <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 300"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
                {errors.guest_count && <p className="text-xs text-red-500 mt-1">{errors.guest_count}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Total Budget (₹ INR) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-zinc-400 font-medium">₹</span>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    required
                    placeholder="e.g. 800000"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-semibold"
                  />
                </div>
                {errors.total_budget && <p className="text-xs text-red-500 mt-1">{errors.total_budget}</p>}
              </div>
            </div>
          </div>

          {/* 3. Optional Context for Hyper-Personalization */}
          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-900">
                3. Creative Context & Preferences <span className="text-xs font-normal text-zinc-400">(Optional)</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Theme / Style</label>
                <input
                  type="text"
                  placeholder="e.g. Traditional Awadhi + Modern Elegance"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Food Preference</label>
                <input
                  type="text"
                  placeholder="e.g. Vegetarian Awadhi Spread, Live Kulfi"
                  value={foodPreference}
                  onChange={(e) => setFoodPreference(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Venue Type</label>
                <select
                  value={venueType}
                  onChange={(e) => setVenueType(e.target.value as 'indoor' | 'outdoor' | 'hybrid')}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
                >
                  <option value="indoor">Indoor Banquet / Hall</option>
                  <option value="outdoor">Outdoor Lawn / Farmhouse</option>
                  <option value="hybrid">Hybrid (Indoor + Lawn)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Cultural Preferences</label>
                <input
                  type="text"
                  placeholder="e.g. North Indian Hindu, Lucknowi Tehzeeb"
                  value={culturalPreference}
                  onChange={(e) => setCulturalPreference(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Special Requirements</label>
                <input
                  type="text"
                  placeholder="e.g. Eco-friendly varmala, elderly seating, drone permitted"
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Additional Notes</label>
                <textarea
                  rows={2}
                  placeholder="Any other specific requests or ideas..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-zinc-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 shadow-lg shadow-rose-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{progressStep || 'Synthesizing Event Blueprint...'}</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>Generate AI Event Blueprint</span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-zinc-400 mt-2">
              Gemini will generate your itemized budget, reverse timeline, vendor checklist, and personalized ideas.
            </p>
          </div>

        </form>

      </main>

      <Footer />
    </div>
  );
}
