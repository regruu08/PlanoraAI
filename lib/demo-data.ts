import { BudgetItem, Idea, PlanoraEvent, Task, Vendor } from "@/types";

export const DEMO_EVENTS: PlanoraEvent[] = [
  {
    id: "demo-wedding-1",
    name: "Anuj's Wedding",
    event_type: "wedding",
    event_date: "2026-12-15",
    location: "Lucknow",
    guest_count: 300,
    total_budget: 800000,
    theme: "Traditional + Modern Awadhi Fusion",
    food_preference: "Vegetarian (Awadhi Royal Spread)",
    venue_type: "indoor",
    cultural_preference: "North Indian Hindu",
    special_requirements:
      "Eco-friendly varmala, drone photography allowed, separate elderly seating",
    notes:
      "Focus on warm lighting, acoustic shehnai entrance, and personalized dessert counter.",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-birthday-2",
    name: "Aarav's 8th Birthday",
    event_type: "birthday",
    event_date: "2026-11-20",
    location: "Bangalore",
    guest_count: 50,
    total_budget: 50000,
    theme: "Outer Space Galaxy Explorer",
    food_preference: "Finger foods, Mini Burgers, Star Pizzas, Galaxy Cupcakes",
    venue_type: "indoor",
    special_requirements:
      "DIY Telescope craft station, Space trivia quiz, Planetarium projection corner",
    notes: "Kids aged 7-9. Avoid nuts in cake.",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-community-3",
    name: "Gomti Nagar Diwali Mela & Cultural Night",
    event_type: "community",
    event_date: "2026-11-08",
    location: "Lucknow",
    guest_count: 700,
    total_budget: 200000,
    theme: "Earthen Lamps & Heritage Craft",
    food_preference: "Chaat counters, Traditional Mithai, Masala Chai stalls",
    venue_type: "hybrid",
    special_requirements:
      "Emergency first-aid counter, LED stage lighting, green crackers only, volunteer jackets",
    notes:
      "Free entry for all society residents. Rangoli competition in the afternoon.",
    created_at: new Date().toISOString(),
  },
];

export const DEMO_BUDGETS: Record<string, BudgetItem[]> = {
  "demo-wedding-1": [
    {
      id: "b-1",
      event_id: "demo-wedding-1",
      category: "Venue & Banquet Hall",
      allocated_amount: 250000,
      actual_amount: 240000,
      priority: "critical",
      reason:
        "Indoor banquet hall with AC, basic sound setup, and bridal suite in Gomti Nagar.",
      created_at: new Date().toISOString(),
    },
    {
      id: "b-2",
      event_id: "demo-wedding-1",
      category: "Catering & Beverages",
      allocated_amount: 240000,
      actual_amount: 250000,
      priority: "critical",
      reason:
        "300 guests @ ₹800/plate including mocktail bar and Awadhi live dessert counters.",
      created_at: new Date().toISOString(),
    },
    {
      id: "b-3",
      event_id: "demo-wedding-1",
      category: "Photography & Cinematic Video",
      allocated_amount: 100000,
      actual_amount: 95000,
      priority: "high",
      reason:
        "2-day coverage, drone aerials, candid photographer, and 4K teaser reel.",
      created_at: new Date().toISOString(),
    },
    {
      id: "b-4",
      event_id: "demo-wedding-1",
      category: "Decor & Floral Styling",
      allocated_amount: 90000,
      actual_amount: 85000,
      priority: "high",
      reason:
        "Marigold and jasmine florals, fairy lights walkway, and royal mandap setup.",
      created_at: new Date().toISOString(),
    },
    {
      id: "b-5",
      event_id: "demo-wedding-1",
      category: "Bridal & Groom Attire / Makeup",
      allocated_amount: 60000,
      actual_amount: 55000,
      priority: "medium",
      reason: "HD bridal makeup, groom safa styling, and matching dupattas.",
      created_at: new Date().toISOString(),
    },
    {
      id: "b-6",
      event_id: "demo-wedding-1",
      category: "DJ, Sound & Shehnai Troupe",
      allocated_amount: 35000,
      actual_amount: 35000,
      priority: "medium",
      reason:
        "Traditional live shehnai welcome followed by energetic Sangeet & wedding DJ.",
      created_at: new Date().toISOString(),
    },
    {
      id: "b-7",
      event_id: "demo-wedding-1",
      category: "Contingency & Incidentals",
      allocated_amount: 25000,
      actual_amount: 5000,
      priority: "low",
      reason:
        "Last-minute travel, extra sweets, tip pool, and generator fuel reserve.",
      created_at: new Date().toISOString(),
    },
  ],
};

export const DEMO_TASKS: Record<string, Task[]> = {
  "demo-wedding-1": [
    {
      id: "t-1",
      event_id: "demo-wedding-1",
      title: "Pay Advance to Banquet Venue",
      description:
        "Sign contract and transfer 25% token booking for Lucknow banquet hall.",
      due_date: "2026-10-28",
      priority: "critical",
      status: "completed",
      created_at: new Date().toISOString(),
    },
    {
      id: "t-2",
      event_id: "demo-wedding-1",
      title: "Finalize Catering Menu Tasting",
      description:
        "Taste Awadhi biryani, paneer tikka, and dessert options with chef.",
      due_date: "2026-11-05",
      priority: "critical",
      status: "pending",
      created_at: new Date().toISOString(),
    },
    {
      id: "t-3",
      event_id: "demo-wedding-1",
      title: "Book Candid Photographer & Drone Pilot",
      description:
        "Review portfolio for traditional night lighting and confirm shoot timing.",
      due_date: "2026-11-10",
      priority: "high",
      status: "pending",
      created_at: new Date().toISOString(),
    },
    {
      id: "t-4",
      event_id: "demo-wedding-1",
      title: "Send Digital WhatsApp Save-The-Dates",
      description:
        "Share personalized digital video invites with RSVP tracking link.",
      due_date: "2026-11-12",
      priority: "high",
      status: "completed",
      created_at: new Date().toISOString(),
    },
    {
      id: "t-5",
      event_id: "demo-wedding-1",
      title: "Coordinate Mandap Floral Colors with Decorator",
      description: "Ensure color scheme aligns with bride and groom outfits.",
      due_date: "2026-11-20",
      priority: "medium",
      status: "pending",
      created_at: new Date().toISOString(),
    },
    {
      id: "t-6",
      event_id: "demo-wedding-1",
      title: "Book Guest Accommodation & Airport Transport",
      description:
        "Reserve 15 hotel rooms near venue for outstation relatives.",
      due_date: "2026-11-25",
      priority: "medium",
      status: "pending",
      created_at: new Date().toISOString(),
    },
  ],
};

export const DEMO_VENDORS: Record<string, Vendor[]> = {
  "demo-wedding-1": [
    {
      id: "v-1",
      event_id: "demo-wedding-1",
      vendor_type: "Venue & Banquet",
      name: "The Awadh Grand Palace",
      estimated_budget: 250000,
      actual_quote: 240000,
      status: "confirmed",
      notes:
        "Includes 2 complimentary changing suites and generator power backup.",
      created_at: new Date().toISOString(),
      checklist: [
        {
          id: "vc-1",
          vendor_id: "v-1",
          label: "Check air-conditioning capacity for 300 guests",
          is_completed: true,
        },
        {
          id: "vc-2",
          vendor_id: "v-1",
          label: "Confirm sound decibel limit and curfew timings (11 PM)",
          is_completed: true,
        },
        {
          id: "vc-3",
          vendor_id: "v-1",
          label: "Verify valet parking space for 60+ cars",
          is_completed: true,
        },
        {
          id: "vc-4",
          vendor_id: "v-1",
          label: "Ensure in-house backup generator on standby",
          is_completed: false,
        },
      ],
    },
    {
      id: "v-2",
      event_id: "demo-wedding-1",
      vendor_type: "Catering Service",
      name: "Nawabi Zaika Caterers",
      estimated_budget: 240000,
      actual_quote: 250000,
      status: "contacted",
      notes:
        "Quoted ₹800 per plate for 300 guests. Live jalebi and kulfi counters included.",
      created_at: new Date().toISOString(),
      checklist: [
        {
          id: "vc-5",
          vendor_id: "v-2",
          label: "Schedule tasting session with 4 family members",
          is_completed: true,
        },
        {
          id: "vc-6",
          vendor_id: "v-2",
          label:
            "Confirm uniformed service staff ratio (1 server per 15 guests)",
          is_completed: false,
        },
        {
          id: "vc-7",
          vendor_id: "v-2",
          label: "Check mineral water dispenser setup and eco-cutlery",
          is_completed: false,
        },
        {
          id: "vc-8",
          vendor_id: "v-2",
          label: "Verify buffer policy for additional 25 unannounced guests",
          is_completed: false,
        },
      ],
    },
    {
      id: "v-3",
      event_id: "demo-wedding-1",
      vendor_type: "Cinematography & Photography",
      name: "Lucknow Wedding Tales",
      estimated_budget: 100000,
      actual_quote: 95000,
      status: "shortlisted",
      notes:
        "Package: 2 candid + 2 traditional photographers, 1 drone, raw footage + album.",
      created_at: new Date().toISOString(),
      checklist: [
        {
          id: "vc-9",
          vendor_id: "v-3",
          label: "Review full unedited gallery of a previous night wedding",
          is_completed: true,
        },
        {
          id: "vc-10",
          vendor_id: "v-3",
          label: "Clarify turnaround time for teaser video (within 72 hours)",
          is_completed: false,
        },
        {
          id: "vc-11",
          vendor_id: "v-3",
          label: "Confirm drone flying permission from banquet venue",
          is_completed: false,
        },
      ],
    },
    {
      id: "v-4",
      event_id: "demo-wedding-1",
      vendor_type: "Floral & Decorator",
      name: "Rupali Decor & Botanicals",
      estimated_budget: 90000,
      actual_quote: 85000,
      status: "shortlisted",
      notes:
        "Theme: Mogra and Marigold fragrance entrance with brass diya urns.",
      created_at: new Date().toISOString(),
      checklist: [
        {
          id: "vc-12",
          vendor_id: "v-4",
          label: "Inspect sample brass urns and mandap fabric swatches",
          is_completed: true,
        },
        {
          id: "vc-13",
          vendor_id: "v-4",
          label: "Set delivery completion deadline by 3 PM on wedding day",
          is_completed: false,
        },
        {
          id: "vc-14",
          vendor_id: "v-4",
          label: "Confirm photobooth backdrop branding with hashtag",
          is_completed: false,
        },
      ],
    },
  ],
};

export const DEMO_IDEAS: Record<string, Idea[]> = {
  "demo-wedding-1": [
    {
      id: "i-1",
      event_id: "demo-wedding-1",
      category: "guest_experience",
      title: "Itar (Attar) Bar & Royal Rosewater Spritz",
      description:
        "Set up an antique brass attar station at the banquet entrance where guests can choose custom Lucknowi scents (Ruh Gulab, Majmua, Shamama) in miniature glass bottles.",
      reason:
        "Perfect homage to Lucknow heritage that provides an unforgettable, fragrant tactile welcome for 300 guests on a modest ₹8k expense.",
      is_saved: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "i-2",
      event_id: "demo-wedding-1",
      category: "entertainment",
      title: "Live Acoustic Shehnai & Sitar Jugalbandi",
      description:
        "Instead of loud pre-recorded music during dinner, invite two local classical musicians to play subtle ragas (Pilu, Yaman) while family dines.",
      reason:
        "Creates a warm, refined atmosphere where elder guests can comfortably converse without shouting over blaring speakers.",
      is_saved: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "i-3",
      event_id: "demo-wedding-1",
      category: "food",
      title: "Live Awadhi Kulfi-Falooda Cart",
      description:
        "A traditional brass bell hand-pulled matka kulfi cart featuring Rabdi-Falooda and Paan Kulfi freshly sliced for guests.",
      reason:
        "High delight factor for both children and elders, fitting the vegetarian menu perfectly while staying within catering limits.",
      is_saved: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "i-4",
      event_id: "demo-wedding-1",
      category: "decor",
      title: "Warm Fairy-Light Tunnel with Hanging Polaroid Memories",
      description:
        "A 20-foot entry tunnel woven with micro fairy lights and fairy-pinned childhood photographs of bride and groom with friends and cousins.",
      reason:
        "Highly photogenic spot for Instagram reels that costs under ₹6,000 to construct.",
      is_saved: false,
      created_at: new Date().toISOString(),
    },
  ],
};
