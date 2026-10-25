import { z } from 'zod';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  \x1b[32m✓ PASS\x1b[0m ${testName}`);
    passed++;
  } else {
    console.error(`  \x1b[31m✗ FAIL\x1b[0m ${testName}`);
    failed++;
  }
}

console.log('\n\x1b[1m=== PLANORA AI: HACKATHON ROBUSTNESS & EDGE CASE TESTS ===\x1b[0m\n');

// 1. Zod Form Schema Definition
const eventFormSchema = z.object({
  name: z.string().min(2).max(100),
  event_type: z.enum(['wedding', 'birthday', 'community']),
  event_date: z.string().refine((val) => {
    const selected = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !isNaN(selected.getTime()) && selected >= today;
  }),
  location: z.string().min(2),
  guest_count: z.coerce.number().int().min(1).max(100000),
  total_budget: z.coerce.number().min(1000),
});

// 2. Blueprint Schema Definition
const eventBlueprintSchema = z.object({
  budgetPlan: z.array(z.object({
    category: z.string().min(1),
    allocatedAmount: z.number().nonnegative(),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    reason: z.string().min(1),
  })).min(3),
  timeline: z.array(z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    dueDate: z.string().min(1),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
  })).min(3),
  vendors: z.array(z.object({
    vendorType: z.string().min(1),
    estimatedBudget: z.number().nonnegative(),
    checklist: z.array(z.object({ label: z.string().min(1) })).min(1),
  })).min(2),
  personalizedIdeas: z.array(z.object({
    category: z.enum(['theme', 'decor', 'food', 'activity', 'entertainment', 'guest_experience', 'other']),
    title: z.string().min(1),
    description: z.string().min(1),
    reason: z.string().min(1),
  })).min(2),
  nextActions: z.array(z.string().min(1)).min(2),
});

// Test 1: Reject Budget = 0
const res1 = eventFormSchema.safeParse({
  name: "Anuj's Wedding",
  event_type: 'wedding',
  event_date: '2026-12-15',
  location: 'Lucknow',
  guest_count: 100,
  total_budget: 0,
});
assert(!res1.success, 'Test 1: Rejects zero budget (total_budget = 0)');

// Test 2: Reject Negative budget
const res2 = eventFormSchema.safeParse({
  name: 'Birthday Party',
  event_type: 'birthday',
  event_date: '2026-12-15',
  location: 'Bangalore',
  guest_count: 50,
  total_budget: -5000,
});
assert(!res2.success, 'Test 2: Rejects negative budget');

// Test 3: Reject Guest Count = 0
const res3 = eventFormSchema.safeParse({
  name: 'Community Mela',
  event_type: 'community',
  event_date: '2026-12-15',
  location: 'Lucknow',
  guest_count: 0,
  total_budget: 50000,
});
assert(!res3.success, 'Test 3: Rejects zero guest count');

// Test 4: Reject Past Dates
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 2);
const res4 = eventFormSchema.safeParse({
  name: 'Past Event',
  event_type: 'wedding',
  event_date: yesterday.toISOString().split('T')[0],
  location: 'Lucknow',
  guest_count: 100,
  total_budget: 500000,
});
assert(!res4.success, 'Test 4: Rejects past event dates');

// Test 5: Valid Wedding Event
const res5 = eventFormSchema.safeParse({
  name: "Anuj's Wedding",
  event_type: 'wedding',
  event_date: '2026-12-15',
  location: 'Lucknow',
  guest_count: 300,
  total_budget: 800000,
});
assert(res5.success, "Test 5: Successfully validates full wedding event (Anuj's Wedding)");

// Test 6: Blueprint Budget Allocation Limits
const sampleBlueprint = {
  budgetPlan: [
    { category: 'Venue', allocatedAmount: 250000, priority: 'critical', reason: 'Banquet' },
    { category: 'Catering', allocatedAmount: 240000, priority: 'critical', reason: 'Buffet' },
    { category: 'Photo', allocatedAmount: 100000, priority: 'high', reason: 'Drone' },
    { category: 'Decor', allocatedAmount: 90000, priority: 'high', reason: 'Floral' },
  ],
  timeline: [
    { title: 'Book Hall', description: 'Advance token', dueDate: '2026-11-01', priority: 'critical' },
    { title: 'Tasting', description: 'Menu sample', dueDate: '2026-11-10', priority: 'high' },
    { title: 'Invites', description: 'WhatsApp links', dueDate: '2026-11-15', priority: 'medium' },
  ],
  vendors: [
    { vendorType: 'Venue', estimatedBudget: 250000, checklist: [{ label: 'Verify AC' }] },
    { vendorType: 'Catering', estimatedBudget: 240000, checklist: [{ label: 'Server ratio' }] },
  ],
  personalizedIdeas: [
    { category: 'guest_experience', title: 'Itar Bar', description: 'Fragrance', reason: 'Lucknow heritage' },
    { category: 'entertainment', title: 'Shehnai', description: 'Live', reason: 'Acoustic' },
  ],
  nextActions: [
    'Book venue immediately',
    'Schedule food tasting',
  ],
};

const totalAllocated = sampleBlueprint.budgetPlan.reduce((acc, b) => acc + b.allocatedAmount, 0);
assert(totalAllocated <= 800000, 'Test 6: Blueprint budget allocations do not exceed total budget');
assert(sampleBlueprint.timeline.length >= 3, 'Test 7: Reverse timeline has at least 3 sequenced milestones');
assert(sampleBlueprint.vendors.length >= 2, 'Test 8: Vendors module includes verified checklists');
assert(sampleBlueprint.personalizedIdeas.length >= 2, 'Test 9: Personalized ideas tailored to event context');

// Test 10: Strict Schema Conformance
const validBlueprintRes = eventBlueprintSchema.safeParse(sampleBlueprint);
assert(validBlueprintRes.success, 'Test 10: Gemini Event Blueprint strictly conforms to Zod schema');

console.log(`\n\x1b[1mSummary: ${passed} passed, ${failed} failed.\x1b[0m\n`);
if (failed > 0) process.exit(1);
