'use client';

import React, { useState, useEffect, useId, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Container from '@/components/Container';
import { eventFormSchema, EventFormValues } from '@/lib/validation/event';
import { saveEvent, applyBlueprintToEvent } from '@/lib/storage';
import { PlanoraEvent, EventType } from '@/types';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Flame, 
  Cake, 
  Building2, 
  Wand2,
  RefreshCw,
  Gift,
  Check
} from 'lucide-react';

const EVENT_METADATA: Record<EventType, { title: string; subtitle: string; image: string }> = {
  wedding: {
    title: 'Wedding',
    subtitle: 'Sangeet, Reception, Mandap',
    image: '/images/event-wedding.webp',
  },
  birthday: {
    title: 'Birthday',
    subtitle: 'Theme party, Games, Favors',
    image: '/images/event-birthday.webp',
  },
  community: {
    title: 'Community',
    subtitle: 'Festival, Mela, Gathering',
    image: '/images/event-community.webp',
  },
};

export default function NewEventPage() {
  const router = useRouter();

  // Unique accessible IDs
  const nameErrorId = useId();
  const dateErrorId = useId();
  const locationErrorId = useId();
  const guestsErrorId = useId();
  const budgetErrorId = useId();

  // Form State (Preserving all exact field names and types)
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

  // UI State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mountedImages, setMountedImages] = useState<Record<EventType, boolean>>({
    wedding: true, // Only active mounted initially
    birthday: false,
    community: false,
  });

  // Track event-type selector highlight indicator position
  const radioGroupRef = useRef<HTMLDivElement>(null);

  // Lazy-mount other event preview images after idle or first interaction
  const preloadAllImages = useCallback(() => {
    setMountedImages((prev) => {
      if (prev.birthday && prev.community) return prev;
      return { wedding: true, birthday: true, community: true };
    });
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        const idleId = (window as unknown as { requestIdleCallback: (cb: () => void, opts: { timeout: number }) => number }).requestIdleCallback(() => preloadAllImages(), { timeout: 2500 });
        return () => {
          (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
        };
      } else {
        const timer = setTimeout(() => preloadAllImages(), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [preloadAllImages]);

  // Indian digit formatting helper for Total Budget
  const formatIndianNumber = (val: number | string): string => {
    if (val === '' || val === undefined || val === null) return '';
    const num = typeof val === 'number' ? val : Number(String(val).replace(/,/g, ''));
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/,/g, '').trim();
    if (rawVal === '') {
      setTotalBudget('');
      return;
    }
    const cleanNum = Number(rawVal);
    if (!isNaN(cleanNum)) {
      setTotalBudget(cleanNum);
    }
  };

  // 1-Click Quick Demo Pre-fillers (Preserving exact existing logic)
  const loadDemo = (type: EventType) => {
    setEventType(type);
    preloadAllImages();
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

  // Keyboard navigation for RadioGroup
  const handleRadioKeyDown = (e: React.KeyboardEvent) => {
    const types: EventType[] = ['wedding', 'birthday', 'community'];
    const currentIndex = types.indexOf(eventType);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % types.length;
      setEventType(types[nextIndex]);
      preloadAllImages();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + types.length) % types.length;
      setEventType(types[prevIndex]);
      preloadAllImages();
    }
  };

  // Form submission handler (Preserving exact logic and endpoints)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
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

    try {
      const eventId = `evt-${Date.now()}`;
      const newEvent: PlanoraEvent = {
        id: eventId,
        ...formData,
        created_at: new Date().toISOString(),
      };

      // Save initial event
      saveEvent(newEvent);

      // Call API to generate blueprint
      const response = await fetch(`/api/events/${eventId}/generate-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: newEvent }),
      });

      const resData = await response.json();

      if (resData.success && resData.blueprint) {
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
      setErrors({ form: 'We could not prepare a valid plan right now. Please check your parameters and retry.' });
      setIsSubmitting(false);
    }
  };

  // Validation sequence state
  const isSection1Valid = true;
  const isSection2Valid = 
    name.trim().length > 0 && 
    eventDate.length > 0 && 
    location.trim().length > 0 && 
    Number(guestCount) > 0 && 
    Number(totalBudget) >= 1000;
  const isSection3Valid = true;

  // Active event highlight translation percentage (0%, 100%, 200%)
  const activeHighlightIndex = eventType === 'wedding' ? 0 : eventType === 'birthday' ? 1 : 2;

  if (isSubmitting) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
        <Navbar />

        <main id="main-content" className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="space-y-6">
            <div className="text-center py-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold mb-3 shadow-2xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-600" />
                <span>Planning your event...</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight font-display">
                Synthesizing your personalized celebration blueprint
              </h2>
              <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
                Gemini is structuring your itemized ₹ INR budget, reverse milestone timeline, and vendor checklists.
              </p>
            </div>

            {/* Mirror Skeleton Layout with Translated Shimmer Overlay */}
            <div className="bg-white rounded-3xl border border-[#E4E1DC] p-6 space-y-6 shadow-xs relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-zinc-100/70 to-transparent pointer-events-none" />
              
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <div className="space-y-2">
                  <div className="h-6 w-48 bg-zinc-100 rounded-lg" />
                  <div className="h-3.5 w-64 bg-zinc-100 rounded-md" />
                </div>
                <div className="h-8 w-24 bg-zinc-100 rounded-xl" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="h-20 bg-[#FAF8F5] rounded-2xl border border-zinc-100" />
                <div className="h-20 bg-[#FAF8F5] rounded-2xl border border-zinc-100" />
                <div className="h-20 bg-[#FAF8F5] rounded-2xl border border-zinc-100" />
                <div className="h-20 bg-[#FAF8F5] rounded-2xl border border-zinc-100" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="h-44 bg-[#FAF8F5] rounded-2xl border border-zinc-100" />
                <div className="h-44 bg-[#FAF8F5] rounded-2xl border border-zinc-100" />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main id="main-content" className="flex-1 py-8 sm:py-12">
        <Container>
          
          {/* Header & Quick Autofill */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Event Planning Wizard</span>
            </div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight sm:text-4xl font-display">
              Create Your Celebration Plan
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Provide the details and Gemini AI will construct an itemized budget, reverse timeline, and vendor checklists.
            </p>

            {/* 1-Click Quick Demo Pre-fillers */}
            <div className="mt-5 p-3 rounded-2xl bg-white border border-[#E4E1DC] shadow-xs inline-flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Gift className="w-3.5 h-3.5 text-amber-500" />
                1-Click Autofill:
              </span>
              <button
                type="button"
                onClick={() => loadDemo('wedding')}
                className="px-3 py-1 text-xs font-bold rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
              >
                💍 Wedding (Lucknow, ₹8L)
              </button>
              <button
                type="button"
                onClick={() => loadDemo('birthday')}
                className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
              >
                🎂 Birthday (Space, ₹50k)
              </button>
              <button
                type="button"
                onClick={() => loadDemo('community')}
                className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                🎪 Community (Diwali, ₹2L)
              </button>
            </div>
          </div>

          {/* 12-Column Responsive Layout: 7 cols Form + 5 cols Sticky Preview on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ============================================================ */}
            {/* Form Column (7/12 on Desktop)                                */}
            {/* ============================================================ */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl border border-[#E4E1DC] shadow-sm p-6 sm:p-10 space-y-10"
              >
                {errors.form && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm"
                  >
                    {errors.form}
                  </div>
                )}

                {/* SEQUENCE STEP 1: Select Event Type */}
                <div className="relative pl-9 sm:pl-11">
                  {/* Vertical connecting line */}
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-zinc-200 -z-0" />
                  
                  {/* Step Marker Circle */}
                  <div className="absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-150 z-10 bg-rose-600 text-white shadow-xs">
                    {isSection1Valid ? <Check className="w-4 h-4 animate-scale-pop" /> : '1'}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h2 className="text-base font-extrabold text-zinc-900 tracking-tight">
                        Select Event Type <span className="text-rose-500">*</span>
                      </h2>
                    </div>

                    {/* Radio Group with Accessible Keyboard Support & Sliding Highlight */}
                    <div
                      ref={radioGroupRef}
                      role="radiogroup"
                      aria-label="Event Type"
                      onKeyDown={handleRadioKeyDown}
                      onMouseEnter={preloadAllImages}
                      onFocus={preloadAllImages}
                      className="relative grid grid-cols-3 gap-2 p-1.5 bg-[#FAF8F5] rounded-2xl border border-[#E4E1DC]"
                    >
                      {/* Sliding highlight indicator */}
                      <div
                        className="absolute top-1.5 bottom-1.5 rounded-xl bg-white border border-[#E4E1DC] shadow-xs pointer-events-none transition-transform duration-250 ease-out"
                        style={{
                          width: 'calc((100% - 1.25rem) / 3)',
                          transform: `translateX(calc(${activeHighlightIndex} * (100% + 0.5rem)))`,
                        }}
                      />

                      {/* Tile 1: Wedding */}
                      <label
                        className={`relative z-10 p-3 sm:p-3.5 rounded-xl cursor-pointer select-none flex flex-col sm:flex-row items-center sm:items-start gap-2.5 transition-colors focus-within:ring-2 focus-within:ring-rose-600 ${
                          eventType === 'wedding' ? 'text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        <input
                          type="radio"
                          name="eventType"
                          value="wedding"
                          checked={eventType === 'wedding'}
                          onChange={() => setEventType('wedding')}
                          className="sr-only"
                        />
                        <div
                          className={`p-2 rounded-lg shrink-0 transition-transform duration-200 ${
                            eventType === 'wedding'
                              ? 'bg-rose-500 text-white shadow-xs scale-100'
                              : 'bg-zinc-100 text-zinc-500 scale-90'
                          }`}
                        >
                          <Flame className="w-4 h-4" />
                        </div>
                        <div className="text-center sm:text-left min-w-0">
                          <span className="font-bold text-xs sm:text-sm block truncate">Wedding</span>
                          <span className="text-[11px] text-zinc-500 hidden sm:block truncate">
                            Sangeet, Reception
                          </span>
                        </div>
                      </label>

                      {/* Tile 2: Birthday */}
                      <label
                        className={`relative z-10 p-3 sm:p-3.5 rounded-xl cursor-pointer select-none flex flex-col sm:flex-row items-center sm:items-start gap-2.5 transition-colors focus-within:ring-2 focus-within:ring-rose-600 ${
                          eventType === 'birthday' ? 'text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        <input
                          type="radio"
                          name="eventType"
                          value="birthday"
                          checked={eventType === 'birthday'}
                          onChange={() => setEventType('birthday')}
                          className="sr-only"
                        />
                        <div
                          className={`p-2 rounded-lg shrink-0 transition-transform duration-200 ${
                            eventType === 'birthday'
                              ? 'bg-amber-500 text-white shadow-xs scale-100'
                              : 'bg-zinc-100 text-zinc-500 scale-90'
                          }`}
                        >
                          <Cake className="w-4 h-4" />
                        </div>
                        <div className="text-center sm:text-left min-w-0">
                          <span className="font-bold text-xs sm:text-sm block truncate">Birthday</span>
                          <span className="text-[11px] text-zinc-500 hidden sm:block truncate">
                            Theme party, Games
                          </span>
                        </div>
                      </label>

                      {/* Tile 3: Community */}
                      <label
                        className={`relative z-10 p-3 sm:p-3.5 rounded-xl cursor-pointer select-none flex flex-col sm:flex-row items-center sm:items-start gap-2.5 transition-colors focus-within:ring-2 focus-within:ring-rose-600 ${
                          eventType === 'community' ? 'text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        <input
                          type="radio"
                          name="eventType"
                          value="community"
                          checked={eventType === 'community'}
                          onChange={() => setEventType('community')}
                          className="sr-only"
                        />
                        <div
                          className={`p-2 rounded-lg shrink-0 transition-transform duration-200 ${
                            eventType === 'community'
                              ? 'bg-emerald-600 text-white shadow-xs scale-100'
                              : 'bg-zinc-100 text-zinc-500 scale-90'
                          }`}
                        >
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="text-center sm:text-left min-w-0">
                          <span className="font-bold text-xs sm:text-sm block truncate">Community</span>
                          <span className="text-[11px] text-zinc-500 hidden sm:block truncate">
                            Festival, Mela
                          </span>
                        </div>
                      </label>

                    </div>
                  </div>
                </div>

                {/* SEQUENCE STEP 2: Core Celebration Details */}
                <div className="relative pl-9 sm:pl-11">
                  {/* Vertical connecting line */}
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-zinc-200 -z-0" />
                  
                  {/* Step Marker Circle (Transforms to check icon when required fields valid) */}
                  <div
                    className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-200 z-10 shadow-xs ${
                      isSection2Valid
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-100 text-zinc-700 border border-zinc-300'
                    }`}
                  >
                    {isSection2Valid ? (
                      <Check className="w-4 h-4 transition-transform duration-150 scale-100" />
                    ) : (
                      '2'
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h2 className="text-base font-extrabold text-zinc-900 tracking-tight">
                        Core Celebration Details
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Event Name */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Event Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          autoComplete="off"
                          enterKeyHint="next"
                          placeholder="e.g. Anuj's Wedding"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          aria-describedby={errors.name ? nameErrorId : undefined}
                          className={`w-full min-h-[48px] px-4 rounded-xl border text-sm transition-[border-color] duration-150 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 ${
                            errors.name ? 'border-red-500 bg-red-50/20' : 'border-[#E4E1DC]'
                          }`}
                        />
                        {errors.name && (
                          <p id={nameErrorId} aria-live="polite" className="text-xs text-red-600 mt-1.5">
                            {errors.name}
                          </p>
                        )}
                      </div>

                      {/* Event Date */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Event Date <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          enterKeyHint="next"
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          aria-describedby={errors.event_date ? dateErrorId : undefined}
                          className={`w-full min-h-[48px] px-4 rounded-xl border text-sm transition-[border-color] duration-150 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white ${
                            errors.event_date ? 'border-red-500 bg-red-50/20' : 'border-[#E4E1DC]'
                          }`}
                        />
                        {errors.event_date && (
                          <p id={dateErrorId} aria-live="polite" className="text-xs text-red-600 mt-1.5">
                            {errors.event_date}
                          </p>
                        )}
                      </div>

                      {/* Location / City */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Location / City <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          autoComplete="address-level2"
                          enterKeyHint="next"
                          placeholder="e.g. Lucknow, UP"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          aria-describedby={errors.location ? locationErrorId : undefined}
                          className={`w-full min-h-[48px] px-4 rounded-xl border text-sm transition-[border-color] duration-150 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 ${
                            errors.location ? 'border-red-500 bg-red-50/20' : 'border-[#E4E1DC]'
                          }`}
                        />
                        {errors.location && (
                          <p id={locationErrorId} aria-live="polite" className="text-xs text-red-600 mt-1.5">
                            {errors.location}
                          </p>
                        )}
                      </div>

                      {/* Expected Guests */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Expected Guests <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          inputMode="numeric"
                          enterKeyHint="next"
                          placeholder="e.g. 300"
                          value={guestCount}
                          onChange={(e) => setGuestCount(e.target.value)}
                          aria-describedby={errors.guest_count ? guestsErrorId : undefined}
                          className={`w-full min-h-[48px] px-4 rounded-xl border text-sm transition-[border-color] duration-150 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 ${
                            errors.guest_count ? 'border-red-500 bg-red-50/20' : 'border-[#E4E1DC]'
                          }`}
                        />
                        {errors.guest_count && (
                          <p id={guestsErrorId} aria-live="polite" className="text-xs text-red-600 mt-1.5">
                            {errors.guest_count}
                          </p>
                        )}
                      </div>

                      {/* Total Budget (Indian Digit Grouping, Hidden Spinners) */}
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                          Total Budget (₹ INR) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold select-none text-base">
                            ₹
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            enterKeyHint="next"
                            required
                            placeholder="e.g. 8,00,000"
                            value={formatIndianNumber(totalBudget)}
                            onChange={handleBudgetChange}
                            aria-describedby={errors.total_budget ? budgetErrorId : undefined}
                            className={`w-full min-h-[48px] pl-9 pr-4 rounded-xl border text-sm font-bold tracking-wide transition-[border-color] duration-150 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 ${
                              errors.total_budget ? 'border-red-500 bg-red-50/20' : 'border-[#E4E1DC]'
                            }`}
                          />
                        </div>
                        {errors.total_budget && (
                          <p id={budgetErrorId} aria-live="polite" className="text-xs text-red-600 mt-1.5">
                            {errors.total_budget}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SEQUENCE STEP 3: Creative Context & Preferences */}
                <div className="relative pl-9 sm:pl-11">
                  {/* Step Marker Circle */}
                  <div className="absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-200 z-10 bg-emerald-600 text-white shadow-xs">
                    {isSection3Valid ? <Check className="w-4 h-4 animate-scale-pop" /> : '3'}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h2 className="text-base font-extrabold text-zinc-900 tracking-tight">
                        Creative Context &amp; Preferences <span className="text-xs font-normal text-zinc-400">(Optional)</span>
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Theme / Style */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Theme / Style</label>
                        <input
                          type="text"
                          enterKeyHint="next"
                          placeholder="e.g. Traditional Awadhi + Modern Elegance"
                          value={theme}
                          onChange={(e) => setTheme(e.target.value)}
                          className="w-full min-h-[48px] px-4 rounded-xl border border-[#E4E1DC] text-sm transition-[border-color] duration-150 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        />
                      </div>

                      {/* Food Preference */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Food Preference</label>
                        <input
                          type="text"
                          enterKeyHint="next"
                          placeholder="e.g. Vegetarian Awadhi Spread, Live Kulfi"
                          value={foodPreference}
                          onChange={(e) => setFoodPreference(e.target.value)}
                          className="w-full min-h-[48px] px-4 rounded-xl border border-[#E4E1DC] text-sm transition-[border-color] duration-150 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        />
                      </div>

                      {/* Venue Type */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Venue Type</label>
                        <select
                          value={venueType}
                          onChange={(e) => setVenueType(e.target.value as 'indoor' | 'outdoor' | 'hybrid')}
                          className="w-full min-h-[48px] px-4 rounded-xl border border-[#E4E1DC] text-sm transition-[border-color] duration-150 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
                        >
                          <option value="indoor">Indoor Banquet / Hall</option>
                          <option value="outdoor">Outdoor Lawn / Farmhouse</option>
                          <option value="hybrid">Hybrid (Indoor + Lawn)</option>
                        </select>
                      </div>

                      {/* Cultural Preferences */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Cultural Preferences</label>
                        <input
                          type="text"
                          enterKeyHint="next"
                          placeholder="e.g. North Indian Hindu, Lucknowi Tehzeeb"
                          value={culturalPreference}
                          onChange={(e) => setCulturalPreference(e.target.value)}
                          className="w-full min-h-[48px] px-4 rounded-xl border border-[#E4E1DC] text-sm transition-[border-color] duration-150 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        />
                      </div>

                      {/* Special Requirements */}
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Special Requirements</label>
                        <input
                          type="text"
                          enterKeyHint="next"
                          placeholder="e.g. Eco-friendly varmala, elderly seating, drone permitted"
                          value={specialRequirements}
                          onChange={(e) => setSpecialRequirements(e.target.value)}
                          className="w-full min-h-[48px] px-4 rounded-xl border border-[#E4E1DC] text-sm transition-[border-color] duration-150 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        />
                      </div>

                      {/* Additional Notes */}
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Additional Notes</label>
                        <textarea
                          rows={2}
                          enterKeyHint="done"
                          placeholder="Any other specific requests or ideas..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full p-4 rounded-xl border border-[#E4E1DC] text-sm transition-[border-color] duration-150 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Action: Full Width, 52px height, Hover nudge, Press scale-[0.98] */}
                <div className="pt-6 border-t border-zinc-100">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                    className="w-full h-[52px] rounded-xl text-base font-bold text-white bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:opacity-95 shadow-md shadow-rose-950/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Planning your event...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                        <span>Generate AI Event Blueprint</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-zinc-400 mt-2.5 font-medium">
                    Gemini will synthesize an itemized budget, reverse timeline, vendor checklist, and personalized ideas.
                  </p>
                </div>

              </form>
            </div>

            {/* ============================================================ */}
            {/* Sticky Context Panel (5/12 on Desktop >= 1024px)              */}
            {/* ============================================================ */}
            <div className="hidden lg:block lg:col-span-5 sticky top-28 space-y-4">
              <div className="relative aspect-3/4 w-full rounded-3xl overflow-hidden border border-[#E4E1DC] shadow-lg bg-[#FAF8F5]">
                {/* Cross-fading Event Type Images (Opacity only, 300ms) */}
                {(['wedding', 'birthday', 'community'] as EventType[]).map((type) => {
                  const isActive = eventType === type;
                  const isMounted = mountedImages[type];
                  if (!isMounted) return null;

                  return (
                    <div
                      key={type}
                      className={`absolute inset-0 transition-opacity duration-300 ease-out ${
                        isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                      }`}
                    >
                      <Image
                        src={EVENT_METADATA[type].image}
                        alt={`${EVENT_METADATA[type].title} celebration atmosphere`}
                        fill
                        sizes="(min-width: 1024px) 450px, 100vw"
                        loading="lazy"
                        className="object-cover"
                      />
                      {/* Gradient overlay for caption contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
                      
                      {/* Caption with existing title & subtitle */}
                      <div className="absolute bottom-6 left-6 right-6 text-white z-20">
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-1">
                          Celebration Context
                        </span>
                        <h3 className="text-2xl font-black font-display text-white">
                          {EVENT_METADATA[type].title}
                        </h3>
                        <p className="text-sm text-white/80 mt-1">
                          {EVENT_METADATA[type].subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Supporting info card below image */}
              <div className="p-5 rounded-2xl bg-white border border-[#E4E1DC] shadow-xs text-xs space-y-2">
                <div className="flex items-center gap-2 text-zinc-900 font-bold">
                  <Sparkles className="w-4 h-4 text-rose-600" />
                  <span>Real-time Blueprint Guidance</span>
                </div>
                <p className="text-zinc-600 leading-relaxed">
                  As you modify parameters, Gemini prepares culture-specific vendor verification checklists and reverse milestones tailored to Indian celebrations.
                </p>
              </div>
            </div>

          </div>

        </Container>
      </main>

      <Footer />
    </div>
  );
}
