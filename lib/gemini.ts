import { GoogleGenerativeAI } from '@google/generative-ai';
import { PlanoraEvent, EventBlueprint, BudgetItem, Task, Vendor, Idea } from '@/types';
import { eventBlueprintSchema } from './validation/event';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const BLUEPRINT_SYSTEM_PROMPT = `
You are Planora, an expert AI celebration and event planning architect.
You help users plan:
- weddings
- birthdays
- community events

Your job is to create a realistic, culturally tailored, and actionable event blueprint based strictly on the supplied event context.

You must produce:
1. "budgetPlan": Realistic category budget allocations that SUM UP TO NO MORE THAN the total budget. Include category, allocatedAmount, priority ('critical' | 'high' | 'medium' | 'low'), and detailed reason.
2. "timeline": A reverse-planned task list with realistic dueDates leading up to the event date. Each task must have title, description, dueDate (YYYY-MM-DD), and priority.
3. "vendors": The specific vendor types needed for this event type and city. Each vendor must have vendorType, estimatedBudget, and a specific checklist of at least 3-4 actionable verification items.
4. "personalizedIdeas": At least 3 creative, high-impact ideas specifically personalized to the event type, city/location, budget, guest count, and theme. Categories can be: 'theme', 'decor', 'food', 'activity', 'entertainment', 'guest_experience'.
5. "nextActions": An ordered list of the top 3-4 critical next steps the user should complete immediately.

CRITICAL RULES:
- The sum of all allocatedAmount in budgetPlan MUST NOT exceed the total_budget.
- Format all due dates as YYYY-MM-DD.
- Tailor the ideas and vendors to the event location (e.g. Lucknow, Delhi, Bangalore) and cultural preferences.
- Respond with STRICT JSON ONLY conforming to the schema. No markdown formatting, no code blocks, just raw JSON.
`;

/**
 * Generate AI Event Blueprint
 */
export async function generateAIEventBlueprint(event: PlanoraEvent): Promise<EventBlueprint> {
  if (GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      // Try gemini-1.5-flash or gemini-2.0-flash
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
        systemInstruction: BLUEPRINT_SYSTEM_PROMPT,
      });

      const prompt = `Generate a comprehensive event planning blueprint for the following event:
${JSON.stringify(event, null, 2)}

Today's date is: ${new Date().toISOString().split('T')[0]}
Event Date: ${event.event_date}
Budget: ₹${event.total_budget}
Guest Count: ${event.guest_count}
Location: ${event.location}
Type: ${event.event_type}
Theme: ${event.theme || 'Custom celebration'}
Food: ${event.food_preference || 'Standard'}
Special Notes: ${event.special_requirements || 'None'}

Return valid JSON adhering to the schema.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);

      const validated = eventBlueprintSchema.safeParse(parsed);
      if (validated.success) {
        return validated.data as EventBlueprint;
      } else {
        console.warn('AI blueprint validation failed, repairing with intelligent generator', validated.error);
      }
    } catch (err) {
      console.error('Gemini API call failed or timed out:', err);
    }
  }

  // Fallback intelligent generator (works offline or without API key for reliable demo!)
  return generateProceduralBlueprint(event);
}

/**
 * Procedural fallback blueprint generator tailored specifically to event context
 */
export function generateProceduralBlueprint(event: PlanoraEvent): EventBlueprint {
  const budget = event.total_budget || 100000;
  const isWedding = event.event_type === 'wedding';
  const isBirthday = event.event_type === 'birthday';
  const isCommunity = event.event_type === 'community';

  const eventDate = new Date(event.event_date);
  const now = new Date();

  // Helper to get dates before event
  const getSubDate = (daysBefore: number) => {
    const d = new Date(eventDate);
    d.setDate(d.getDate() - daysBefore);
    if (d < now) {
      const futureFromNow = new Date();
      futureFromNow.setDate(futureFromNow.getDate() + 3);
      return futureFromNow.toISOString().split('T')[0];
    }
    return d.toISOString().split('T')[0];
  };

  if (isWedding) {
    const venueBudget = Math.round(budget * 0.32);
    const cateringBudget = Math.round(budget * 0.30);
    const photoBudget = Math.round(budget * 0.12);
    const decorBudget = Math.round(budget * 0.11);
    const attireBudget = Math.round(budget * 0.08);
    const musicBudget = Math.round(budget * 0.04);
    const contingency = budget - (venueBudget + cateringBudget + photoBudget + decorBudget + attireBudget + musicBudget);

    return {
      budgetPlan: [
        {
          category: 'Banquet Hall & Venue Rental',
          allocatedAmount: venueBudget,
          priority: 'critical',
          reason: `Prime venue booking in ${event.location} to accommodate ${event.guest_count} guests with adequate parking and bridal rooms.`,
        },
        {
          category: 'Catering & Dining Experience',
          allocatedAmount: cateringBudget,
          priority: 'critical',
          reason: `Full meal service for ${event.guest_count} guests matching preferences (${event.food_preference || 'Curated buffet'}).`,
        },
        {
          category: 'Photography & Cinematic Video',
          allocatedAmount: photoBudget,
          priority: 'high',
          reason: 'Candid photography, traditional videography, drone coverage, and highlights reel.',
        },
        {
          category: 'Stage, Mandap & Floral Decor',
          allocatedAmount: decorBudget,
          priority: 'high',
          reason: `Themed floral styling matching ${event.theme || 'traditional elegance'} with entrance lighting.`,
        },
        {
          category: 'Bridal/Groom Styling & Makeup',
          allocatedAmount: attireBudget,
          priority: 'medium',
          reason: 'Professional bridal artistry, hair styling, and groom accessories.',
        },
        {
          category: 'DJ, Sound & Cultural Music',
          allocatedAmount: musicBudget,
          priority: 'medium',
          reason: 'Sound engineering, party lighting, and dance floor music.',
        },
        {
          category: 'Contingency & Hospitality Pool',
          allocatedAmount: Math.max(5000, contingency),
          priority: 'low',
          reason: 'Buffer fund for transport, guest gifts, extra plates, and tips.',
        },
      ],
      timeline: [
        {
          title: 'Finalize & Reserve Banquet Venue',
          description: `Confirm dates, advance payment, and licensing with venue management in ${event.location}.`,
          dueDate: getSubDate(45),
          priority: 'critical',
        },
        {
          title: 'Catering Tasting & Menu Selection',
          description: 'Conduct food tasting with close family; confirm welcome drinks, live counters, and desserts.',
          dueDate: getSubDate(35),
          priority: 'critical',
        },
        {
          title: 'Book Photographer & Confirm Shot List',
          description: 'Sign contract with lead photographer and list essential family portrait groupings.',
          dueDate: getSubDate(28),
          priority: 'high',
        },
        {
          title: 'Dispatch Digital & Physical Invitations',
          description: 'Share RSVP tracking links and coordinate room allocations for outstation guests.',
          dueDate: getSubDate(20),
          priority: 'high',
        },
        {
          title: 'Decor & Floral Blueprint Walkthrough',
          description: 'Review 3D render/layout of stage, photobooth, and varmala exchange podium.',
          dueDate: getSubDate(12),
          priority: 'medium',
        },
        {
          title: 'Final Vendor Run-Through & Timeline Sync',
          description: 'Distribute minute-by-minute day schedule to caterer, DJ, priest/celebrant, and bridal coordinator.',
          dueDate: getSubDate(3),
          priority: 'critical',
        },
      ],
      vendors: [
        {
          vendorType: 'Banquet & Venue',
          estimatedBudget: venueBudget,
          checklist: [
            { label: `Verify capacity for ${event.guest_count} guests with clear dining flow` },
            { label: 'Check power backup generator capacity (minimum 60kVA)' },
            { label: 'Confirm sound curfew and decibel regulations' },
            { label: 'Inspect bridal suite AC, mirrors, and security lock' },
          ],
        },
        {
          vendorType: 'Catering Services',
          estimatedBudget: cateringBudget,
          checklist: [
            { label: 'Sign agreement on exact per-plate cost and waste policy' },
            { label: 'Verify ratio of servers to guests (at least 1 per 15 guests)' },
            { label: 'Ensure dedicated supervisor for live counters' },
            { label: 'Confirm branded bottled water and hygienic ice cubes' },
          ],
        },
        {
          vendorType: 'Cinematography & Photo',
          estimatedBudget: photoBudget,
          checklist: [
            { label: 'Confirm drone flying permission over venue property' },
            { label: 'Check delivery timeline for 1-minute highlight reel (< 5 days)' },
            { label: 'Ensure backup camera bodies and dual SD card slots' },
          ],
        },
        {
          vendorType: 'Floral & Thematic Decor',
          estimatedBudget: decorBudget,
          checklist: [
            { label: 'Verify fresh floral delivery timing on morning of event' },
            { label: 'Confirm stage background dimensions and stability' },
            { label: 'Test spotlighting on couple seating area' },
          ],
        },
      ],
      personalizedIdeas: [
        {
          category: 'guest_experience',
          title: `Personalized ${event.location} Heritage Welcome Bar`,
          description: `Set up a custom welcome drink and artisanal fragrance corner reflecting ${event.location}'s local cultural specialties.`,
          reason: `Gives ${event.guest_count} attendees an authentic sensory memory right upon arrival without inflating catering costs.`,
        },
        {
          category: 'entertainment',
          title: 'Acoustic Folk or Sitar Pre-Dinner Set',
          description: 'Subtle live acoustic instrumentals playing soothing melodies while guests arrive and mingle.',
          reason: 'Fosters warm conversational energy for elders and family before the high-energy dance party begins.',
        },
        {
          category: 'decor',
          title: 'Memory Lane Photo Tunnel',
          description: `A warm fairy-lit walkway with polaroids showing the couple's journey, childhood portraits, and family moments.`,
          reason: 'Creates the #1 most photographed backdrop for guests at an ultra-low material cost.',
        },
      ],
      nextActions: [
        `Book venue in ${event.location} to lock down the date (Critical)`,
        'Schedule food tasting session with caterer',
        'Finalize photography shot list and advance deposit',
      ],
    };
  } else if (isBirthday) {
    const venueBudget = Math.round(budget * 0.25);
    const foodBudget = Math.round(budget * 0.40);
    const entertainmentBudget = Math.round(budget * 0.15);
    const decorBudget = Math.round(budget * 0.12);
    const cakeAndFavors = budget - (venueBudget + foodBudget + entertainmentBudget + decorBudget);

    return {
      budgetPlan: [
        {
          category: 'Party Venue / Club House',
          allocatedAmount: venueBudget,
          priority: 'critical',
          reason: `Rental for party hall or garden area in ${event.location} for ${event.guest_count} guests.`,
        },
        {
          category: 'Food, Snacks & Refreshments',
          allocatedAmount: foodBudget,
          priority: 'critical',
          reason: `Child & adult friendly snacks, pizzas/sliders, fruit mocktails, and finger foods.`,
        },
        {
          category: 'Magic Show / Games Host & Music',
          allocatedAmount: entertainmentBudget,
          priority: 'high',
          reason: 'Professional host for 90 minutes of age-appropriate party games and balloon sculpting.',
        },
        {
          category: 'Theme Decor & Photo Backdrop',
          allocatedAmount: decorBudget,
          priority: 'medium',
          reason: `Balloon arch, banners, and cutouts themed around "${event.theme || 'Celebration'}".`,
        },
        {
          category: 'Custom Designer Cake & Return Favors',
          allocatedAmount: Math.max(3000, cakeAndFavors),
          priority: 'high',
          reason: 'Multi-flavor centerpiece cake and thoughtful curated return gift bags.',
        },
      ],
      timeline: [
        {
          title: 'Reserve Party Area & Secure Time Slot',
          description: 'Confirm 3-hour booking with buffer for 1 hour setup and 30 mins cleanup.',
          dueDate: getSubDate(21),
          priority: 'critical',
        },
        {
          title: 'Order Custom Themed Cake',
          description: `Confirm flavor, tier design, and allergy-friendly ingredients matching ${event.theme || 'the party theme'}.`,
          dueDate: getSubDate(14),
          priority: 'high',
        },
        {
          title: 'Hire Party Host / Magician / DJ',
          description: 'Confirm game schedule, prizes, and music playlist.',
          dueDate: getSubDate(10),
          priority: 'high',
        },
        {
          title: 'Send RSVP Invitations',
          description: 'Send digital animated invites via messaging with guest count deadline.',
          dueDate: getSubDate(7),
          priority: 'medium',
        },
        {
          title: 'Assemble Curated Return Gift Packs',
          description: 'Pack themed goodies, educational kits, and thank-you notes.',
          dueDate: getSubDate(2),
          priority: 'low',
        },
      ],
      vendors: [
        {
          vendorType: 'Bakery / Cake Designer',
          estimatedBudget: Math.round(cakeAndFavors * 0.5),
          checklist: [
            { label: 'Confirm delivery 2 hours prior to cake cutting' },
            { label: 'Check allergy requirements (eggless/nut-free options)' },
            { label: 'Confirm sturdy cake stand and cutting knife' },
          ],
        },
        {
          vendorType: 'Party Host / Entertainer',
          estimatedBudget: entertainmentBudget,
          checklist: [
            { label: 'Review party game schedule and music speaker availability' },
            { label: 'Confirm age-appropriate activities' },
            { label: 'Check duration and arrival 30 mins before showtime' },
          ],
        },
        {
          vendorType: 'Themed Decorator',
          estimatedBudget: decorBudget,
          checklist: [
            { label: 'Verify balloon arch color palette matches theme' },
            { label: 'Inspect table centerpieces and cutlery matching theme' },
          ],
        },
      ],
      personalizedIdeas: [
        {
          category: 'activity',
          title: 'Interactive DIY Craft & Discovery Station',
          description: `A supervised craft table where children create their own customized souvenir matching ${event.theme || 'the theme'} to take home.`,
          reason: 'Keeps kids engaged simultaneously while giving parents relaxed time to socialize.',
        },
        {
          category: 'food',
          title: 'Gourmet Mini-Slider & Mocktail Station',
          description: 'Bite-sized sliders, crinkle-cut fries with dips, and colorful fizzy mocktails named after party themes.',
          reason: 'Zero wastage, easy for guests to eat while standing or mingling.',
        },
        {
          category: 'entertainment',
          title: 'Polaroid Instant Print Frame Wall',
          description: 'Instant film photos taken of each child with the birthday star, pinned onto a souvenir board.',
          reason: 'Heartwarming takeaway gift for parents that doubles as festive decor.',
        },
      ],
      nextActions: [
        'Confirm venue slot and deposit',
        'Book the theme designer cake',
        'Send digital invitations to parent group',
      ],
    };
  } else {
    // Community Event
    const venueLogistics = Math.round(budget * 0.30);
    const soundLighting = Math.round(budget * 0.25);
    const refreshments = Math.round(budget * 0.25);
    const securitySafety = Math.round(budget * 0.10);
    const publicityContingency = budget - (venueLogistics + soundLighting + refreshments + securitySafety);

    return {
      budgetPlan: [
        {
          category: 'Stage, Seating & Venue Setup',
          allocatedAmount: venueLogistics,
          priority: 'critical',
          reason: `Stage erection, canopy/shamiana, and seating for ${event.guest_count} community members.`,
        },
        {
          category: 'Sound System & Stage Lighting',
          allocatedAmount: soundLighting,
          priority: 'critical',
          reason: 'Public address (PA) system, wireless microphones, monitors, and stage floodlights.',
        },
        {
          category: 'Community Refreshments & Water',
          allocatedAmount: refreshments,
          priority: 'high',
          reason: `Hygienic snacks, tea/coffee counters, and clean drinking water stations for ${event.guest_count} attendees.`,
        },
        {
          category: 'Crowd Safety, First Aid & Waste Management',
          allocatedAmount: securitySafety,
          priority: 'high',
          reason: 'First aid paramedic post, waste segregation bins, and volunteer marshals.',
        },
        {
          category: 'Publicity, Banners & Contingency',
          allocatedAmount: Math.max(5000, publicityContingency),
          priority: 'medium',
          reason: 'Flyers, directional signs, volunteer t-shirts, and power generator backup.',
        },
      ],
      timeline: [
        {
          title: 'Secure Local Permissions & Civic Clearances',
          description: `Submit intimation to local municipality/RWA for community gathering in ${event.location}.`,
          dueDate: getSubDate(30),
          priority: 'critical',
        },
        {
          title: 'Hire Stage, Shamiana & PA System Contractor',
          description: `Ensure sound engineer understands decibel limits and mic schedule for speakers.`,
          dueDate: getSubDate(20),
          priority: 'critical',
        },
        {
          title: 'Form Volunteer Teams & Task Allocation',
          description: 'Assign leaders for parking, guest reception, stage timing, and first aid.',
          dueDate: getSubDate(14),
          priority: 'high',
        },
        {
          title: 'Community Announcements & WhatsApp Broadcast',
          description: 'Share digital flyers, schedule of events, and safety notices.',
          dueDate: getSubDate(7),
          priority: 'medium',
        },
        {
          title: 'Dry Run & Sound Check',
          description: 'Test all microphones, emergency generator kick-in, and stage illumination.',
          dueDate: getSubDate(1),
          priority: 'critical',
        },
      ],
      vendors: [
        {
          vendorType: 'Sound & Stage Lighting Contractor',
          estimatedBudget: soundLighting,
          checklist: [
            { label: 'Check 4 cordless microphones with fresh lithium batteries' },
            { label: 'Confirm automatic transfer switch for generator backup' },
            { label: 'Test speaker throw distance across entire seating ground' },
          ],
        },
        {
          vendorType: 'Shamiana, Tent & Seating Supplier',
          estimatedBudget: venueLogistics,
          checklist: [
            { label: `Verify clean chair covers and carpet for ${event.guest_count} guests` },
            { label: 'Ensure weatherproof covered stage setup' },
            { label: 'Provide illuminated emergency exit pathways' },
          ],
        },
        {
          vendorType: 'Snack & Tea Stalls Provider',
          estimatedBudget: refreshments,
          checklist: [
            { label: 'Set up multiple quick-dispense queues to avoid crowding' },
            { label: 'Ensure separate biodegradable waste bins near each counter' },
          ],
        },
      ],
      personalizedIdeas: [
        {
          category: 'activity',
          title: 'Community Talent Showcase & Elder Felicitation',
          description: 'A 45-minute segment honoring neighborhood senior citizens and showcasing youth cultural performances.',
          reason: 'Significantly boosts community pride and engagement across generations.',
        },
        {
          category: 'decor',
          title: 'Eco-Friendly Earthen & Fabric Installations',
          description: 'Zero-plastic decor utilizing reusable jute banners, terracotta planters, and warm fairy bulbs.',
          reason: 'Exemplifies civic leadership, sustainability, and high visual warmth on a budget.',
        },
        {
          category: 'guest_experience',
          title: 'Digital Live Photobooth & QR Community Gallery',
          description: 'A QR code posted at entrance where attendees upload candid photos directly to a shared community live slideshow.',
          reason: 'Creates tremendous social buzz and real-time community bonding.',
        },
      ],
      nextActions: [
        'Secure local ground/park permissions and police intimation',
        'Book stage tent and sound technician',
        'Convene volunteer committee meeting',
      ],
    };
  }
}

/**
 * AI Copilot Context-Aware Chat
 */
export async function askAICopilot(
  event: PlanoraEvent,
  context: {
    budgets: BudgetItem[];
    tasks: Task[];
    vendors: Vendor[];
    ideas: Idea[];
  },
  userMessage: string
): Promise<string> {
  const totalAllocated = context.budgets.reduce((acc, b) => acc + (b.allocated_amount || 0), 0);
  const totalActual = context.budgets.reduce((acc, b) => acc + (b.actual_amount || 0), 0);
  const remainingBudget = event.total_budget - totalActual;
  const pendingTasks = context.tasks.filter((t) => t.status === 'pending');
  const criticalTasks = pendingTasks.filter((t) => t.priority === 'critical');
  const confirmedVendors = context.vendors.filter((v) => v.status === 'confirmed');

  const systemContext = `
You are Planora AI, an intelligent event planning copilot.
You have direct real-time access to the user's active event details:

EVENT PROFILE:
- Name: "${event.name}" (${event.event_type})
- Date: ${event.event_date} (Location: ${event.location})
- Guest Count: ${event.guest_count}
- Total Budget: ₹${event.total_budget.toLocaleString('en-IN')}
- Allocated Budget: ₹${totalAllocated.toLocaleString('en-IN')}
- Actual Spent: ₹${totalActual.toLocaleString('en-IN')}
- Remaining Funds: ₹${remainingBudget.toLocaleString('en-IN')}
- Theme: ${event.theme || 'Not specified'}
- Preferences: ${event.food_preference || 'None'} / ${event.special_requirements || 'None'}

ACTIVE PLANNING METRICS:
- Total Tasks: ${context.tasks.length} (${pendingTasks.length} pending, ${criticalTasks.length} critical)
- Critical Pending Tasks: ${criticalTasks.map((t) => `"${t.title}" (Due: ${t.due_date})`).join('; ') || 'None'}
- Vendors: ${context.vendors.length} total, ${confirmedVendors.length} confirmed.
- Vendor Types: ${context.vendors.map((v) => `${v.vendor_type} (${v.status})`).join(', ')}

GUIDELINES FOR YOUR RESPONSE:
- Be concise, direct, and exceptionally actionable.
- Support both English and Hinglish seamlessly (e.g. if the user asks in Hindi/Hinglish like "Mere event me sabse urgent kya hai?", respond in natural, friendly Hinglish!).
- Reference exact numbers, task names, and vendors from the user's event data.
- Never invent data not in the event.
- If suggesting cost savings or critical steps, always conclude with: "👉 **Next Step**: [Clear action]".
`;

  if (GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemContext,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500,
        },
      });

      const response = await model.generateContent(userMessage);
      return response.response.text();
    } catch (err) {
      console.warn('Gemini chat error, using context-aware local response engine:', err);
    }
  }

  // Intelligent Context-Aware Local Engine (fallback when offline or no API key)
  const lowerMsg = userMessage.toLowerCase();

  if (lowerMsg.includes('urgent') || lowerMsg.includes('next') || lowerMsg.includes('kya karu') || lowerMsg.includes('miss')) {
    if (criticalTasks.length > 0) {
      const topTask = criticalTasks[0];
      return `Aapke **${event.name}** me abhi sabse urgent step hai: **${topTask.title}** (Due Date: ${topTask.due_date}).\n\n📌 **Description**: ${topTask.description}\n\nIske alawa aapke paas abhi ${pendingTasks.length} pending tasks hain aur ${context.vendors.length - confirmedVendors.length} vendors confirm hone baaki hain.\n\n👉 **Next Step**: Timeline tab me jaakar is critical task ko review karein aur vendor se baat karein!`;
    } else if (pendingTasks.length > 0) {
      return `Aapke saare critical tasks complete hain! Next upcoming task hai: **${pendingTasks[0].title}** (Due: ${pendingTasks[0].due_date}).\n\n👉 **Next Step**: ${pendingTasks[0].description}`;
    } else {
      return `Badhai ho! Aapke event ke saare tasks complete dikh rahe hain. Ab aap vendor checklists review kar sakte hain.`;
    }
  }

  if (lowerMsg.includes('budget') || lowerMsg.includes('paisa') || lowerMsg.includes('reduce') || lowerMsg.includes('overspending')) {
    return `**Budget Status for ${event.name}**:\n- Total Budget: ₹${event.total_budget.toLocaleString('en-IN')}\n- Allocated: ₹${totalAllocated.toLocaleString('en-IN')}\n- Actual Spent so far: ₹${totalActual.toLocaleString('en-IN')}\n- Remaining: ₹${remainingBudget.toLocaleString('en-IN')}\n\n💡 **Tip to Optimize**: Agar budget optimize karna hai, toh Decor aur Catering buffers me negotiation karein. Catering me live counters optimize karke ₹15,000–₹30,000 bachaye ja sakte hain.\n\n👉 **Next Step**: Budget tab me jaakar Category limits ko adjust karein.`;
  }

  if (lowerMsg.includes('photographer') || lowerMsg.includes('photo')) {
    return `**Photographer Book Karne Se Pehle Ye Zaroor Poochein**:\n1. Kya package me drone coverage aur raw 4K footage included hai?\n2. Teaser reel kitne din me deliver hogi (72 hours ideal hai)?\n3. Night lighting aur indoor hall shoots ka recent sample dekhna hai.\n4. Advance payment kitna hai aur balance kab pay karna hai?\n\n👉 **Next Step**: Vendors tab me jakar Photography checklist verify karein!`;
  }

  if (lowerMsg.includes('caterer') || lowerMsg.includes('food') || lowerMsg.includes('khana')) {
    return `**Caterer se discuss karne wale key points**:\n1. 300 guests ke liye per-plate rate me taxes aur service staff included hai ya nahi?\n2. Server ratio: Kam se kam 1 server per 15 guests hona chahiye.\n3. Extra 25 unannounced guests ke liye buffer arrangement kya hai?\n4. Live dessert counter (e.g. kulfi/jalebi) fresh banega ya pre-made?\n\n👉 **Next Step**: Tasting session schedule karein aur menu finalize karein!`;
  }

  return `Planora AI is actively monitoring **${event.name}** (Location: ${event.location}, Guests: ${event.guest_count}).\n\nAapka total budget ₹${event.total_budget.toLocaleString('en-IN')} hai jisme se ₹${totalAllocated.toLocaleString('en-IN')} allocated hai. Aapke paas ${pendingTasks.length} pending tasks hain.\n\nAap mujhse kisi bhi vendor checklist, budget optimization ya timeline planning ke baare me pooch sakte hain!\n\n👉 **Next Step**: Timeline ya Vendors tab check karein.`;
}
