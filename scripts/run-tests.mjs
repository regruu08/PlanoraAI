import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

// Load the actual TypeScript modules without emitting files or calling live services.
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cache = new Map();
process.env.GEMINI_API_KEY = "";
process.env.NEXT_PUBLIC_SUPABASE_URL = "";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";
function load(relative) {
  const filename = path.resolve(root, relative);
  if (cache.has(filename)) return cache.get(filename).exports;
  const sandboxModule = { exports: {} };
  cache.set(filename, sandboxModule);
  const source = fs.readFileSync(filename, "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;
  const localRequire = (name) =>
    name === "server-only"
      ? {}
      : name.startsWith("@/")
        ? load(`${name.slice(2)}.ts`)
        : name.startsWith(".")
          ? load(`${path.resolve(path.dirname(filename), name)}.ts`)
          : require(name);
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`, {
    filename,
  })(localRequire, sandboxModule, sandboxModule.exports);
  return sandboxModule.exports;
}
const validation = load("lib/validation/event.ts");
const ai = load("lib/gemini.ts");
const utils = load("lib/utils.ts");
let passed = 0,
  failed = 0;
async function test(name, run) {
  try {
    await run();
    console.log(`PASS ${name}`);
    passed++;
  } catch (error) {
    console.error(`FAIL ${name}: ${error.message}`);
    failed++;
  }
}
const later = new Date();
later.setDate(later.getDate() + 90);
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const base = {
  id: "test-event",
  name: "A lovely celebration",
  event_type: "wedding",
  event_date: utils.localDateString(later),
  location: "Lucknow",
  guest_count: 300,
  total_budget: 800000,
  created_at: new Date().toISOString(),
};
for (const [name, patch] of [
  ["zero budget", { total_budget: 0 }],
  ["negative budget", { total_budget: -1 }],
  ["zero guests", { guest_count: 0 }],
  ["negative guests", { guest_count: -1 }],
  ["fractional guests", { guest_count: 1.5 }],
  ["too many guests", { guest_count: 100001 }],
  ["past date", { event_date: "2000-01-01" }],
  ["impossible date", { event_date: "2099-02-30" }],
  ["blank name", { name: "  " }],
  ["blank city", { location: "  " }],
  ["invalid event type", { event_type: "other" }],
  ["infinite budget", { total_budget: Infinity }],
])
  await test(`Form rejects ${name}`, () =>
    assert.equal(
      validation.eventFormSchema.safeParse({ ...base, ...patch }).success,
      false,
    ));
await test("Form accepts missing optional fields", () =>
  assert.ok(validation.eventFormSchema.safeParse(base).success));
await test("Form accepts 100000 guests", () =>
  assert.ok(
    validation.eventFormSchema.safeParse({ ...base, guest_count: 100000 })
      .success,
  ));
await test("Form trims required text", () =>
  assert.equal(
    validation.eventFormSchema.parse({ ...base, name: "  Wedding  " }).name,
    "Wedding",
  ));
for (const type of ["wedding", "birthday", "community"]) {
  for (const budget of [1000, 9999.99, 50000, 800000]) {
    const event = { ...base, event_type: type, total_budget: budget };
    await test(`${type} blueprint valid and within INR ${budget}`, () => {
      const plan = validation.validateBlueprintForEvent(
        ai.generateProceduralBlueprint(event),
        event,
      );
      assert.ok(
        plan.budgetPlan.reduce((s, b) => s + b.allocatedAmount, 0) <=
          budget + 0.01,
      );
      assert.ok(plan.vendors.every((v) => v.checklist.length > 0));
      assert.ok(plan.personalizedIdeas.length > 0);
    });
  }
  await test(`${type} tomorrow has no deadlines after the event`, () => {
    const event = {
      ...base,
      event_type: type,
      event_date: utils.localDateString(tomorrow),
    };
    assert.ok(
      ai
        .generateProceduralBlueprint(event)
        .timeline.every(
          (t) =>
            t.dueDate <= event.event_date &&
            t.dueDate >= utils.localDateString(),
        ),
    );
  });
}
const plan = ai.generateProceduralBlueprint(base);
await test("AI validator rejects over-budget allocation", () => {
  const bad = structuredClone(plan);
  bad.budgetPlan[0].allocatedAmount = 900000;
  assert.throws(() => validation.validateBlueprintForEvent(bad, base));
});
await test("AI validator rejects invalid task date", () => {
  const bad = structuredClone(plan);
  bad.timeline[0].dueDate = "not-a-date";
  assert.throws(() => validation.validateBlueprintForEvent(bad, base));
});
await test("AI validator rejects task after event", () => {
  const bad = structuredClone(plan);
  bad.timeline[0].dueDate = "2099-12-31";
  assert.throws(() => validation.validateBlueprintForEvent(bad, base));
});
await test("AI validator rejects empty checklist", () => {
  const bad = structuredClone(plan);
  bad.vendors[0].checklist = [];
  assert.throws(() => validation.validateBlueprintForEvent(bad, base));
});
await test("AI validator rejects no ideas", () => {
  const bad = structuredClone(plan);
  bad.personalizedIdeas = [];
  assert.throws(() => validation.validateBlueprintForEvent(bad, base));
});
await test("AI validator rejects malformed JSON object", () =>
  assert.throws(() => validation.validateBlueprintForEvent({}, base)));
const context = { budgets: [], tasks: [], vendors: [], ideas: [] };
await test("Copilot uses actual guest count for catering advice", async () => {
  const reply = await ai.askAICopilot(
    { ...base, guest_count: 50 },
    context,
    "food",
  );
  assert.ok(reply.includes("50 guests"));
  assert.ok(!reply.includes("300 guests"));
});
await test("Task urgency prioritizes overdue work", () => {
  const task = {
    id: "t",
    event_id: base.id,
    title: "Task",
    description: "",
    created_at: base.created_at,
    status: "pending",
  };
  const sorted = utils.sortTasksByUrgency([
    { ...task, priority: "critical", due_date: base.event_date },
    { ...task, priority: "medium", due_date: "2000-01-01" },
  ]);
  assert.equal(sorted[0].due_date, "2000-01-01");
});
await test("Percent calculations handle zero and overflow", () => {
  assert.equal(utils.calculatePercentage(1, 0), 0);
  assert.equal(utils.calculatePercentage(200, 100), 100);
});
const memory = new Map();
globalThis.window = {};
globalThis.localStorage = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => memory.set(key, value),
  removeItem: (key) => memory.delete(key),
};
const storage = load("lib/storage.ts");
storage.saveEvent(base);
storage.applyBlueprintToEvent(base.id, plan);
const budget = storage.getBudgets(base.id)[0];
storage.saveBudgetItem({ ...budget, actual_amount: 12345 });
const task = storage.getTasks(base.id)[0];
storage.saveTask({ ...task, status: "completed" });
const vendor = storage.getVendors(base.id)[0];
storage.saveVendor({
  ...vendor,
  status: "confirmed",
  checklist: vendor.checklist.map((c) => ({ ...c, is_completed: true })),
});
const idea = storage.getIdeas(base.id)[0];
storage.saveIdea({ ...idea, is_saved: true });
await test("Storage preserves expenses after reload", () =>
  assert.equal(storage.getBudgets(base.id)[0].actual_amount, 12345));
storage.applyBlueprintToEvent(base.id, plan);
await test("Refresh preserves actual spending", () =>
  assert.equal(storage.getBudgets(base.id)[0].actual_amount, 12345));
await test("Refresh preserves completed tasks", () =>
  assert.equal(storage.getTasks(base.id)[0].status, "completed"));
await test("Refresh preserves vendor status and checklist", () => {
  const v = storage.getVendors(base.id)[0];
  assert.equal(v.status, "confirmed");
  assert.ok(v.checklist.every((c) => c.is_completed));
});
await test("Refresh preserves saved ideas", () =>
  assert.equal(storage.getIdeas(base.id)[0].is_saved, true));
await test("Refresh does not duplicate tasks", () =>
  assert.equal(storage.getTasks(base.id).length, plan.timeline.length));
await test("Invalid blueprint does not replace saved data", () => {
  assert.throws(() => storage.applyBlueprintToEvent(base.id, {}));
  assert.equal(storage.getBudgets(base.id)[0].actual_amount, 12345);
});
await test("Deletion removes event and all child data", () => {
  storage.deleteEvent(base.id);
  assert.equal(storage.getEventById(base.id), undefined);
  assert.deepEqual(storage.getBudgets(base.id), []);
  assert.deepEqual(storage.getTasks(base.id), []);
  assert.deepEqual(storage.getVendors(base.id), []);
  assert.deepEqual(storage.getIdeas(base.id), []);
});
const generate = load("app/api/events/[id]/generate-plan/route.ts");
const params = { params: Promise.resolve({ id: base.id }) };
await test("Generation route rejects invalid event input", async () =>
  assert.equal(
    (
      await generate.POST(
        { json: async () => ({ event: { ...base, total_budget: -1 } }) },
        params,
      )
    ).status,
    400,
  ));
await test("Generation route rejects mismatched ID", async () =>
  assert.equal(
    (
      await generate.POST(
        { json: async () => ({ event: { ...base, id: "other" } }) },
        params,
      )
    ).status,
    400,
  ));
await test("Generation route rejects malformed JSON", async () =>
  assert.equal(
    (
      await generate.POST(
        {
          json: async () => {
            throw new SyntaxError();
          },
        },
        params,
      )
    ).status,
    400,
  ));
await test("Generation route returns validated demo blueprint", async () => {
  const response = await generate.POST(
    { json: async () => ({ event: base }) },
    params,
  );
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.mode, "demo");
  validation.validateBlueprintForEvent(body.blueprint, base);
});
const chat = load("app/api/events/[id]/ai/chat/route.ts");
await test("Chat route rejects empty message", async () =>
  assert.equal(
    (
      await chat.POST(
        { json: async () => ({ event: base, message: " " }) },
        params,
      )
    ).status,
    400,
  ));
await test("Chat route rejects non-string message", async () =>
  assert.equal(
    (
      await chat.POST(
        { json: async () => ({ event: base, message: {} }) },
        params,
      )
    ).status,
    400,
  ));
await test("Chat route returns contextual response", async () => {
  const response = await chat.POST(
    { json: async () => ({ event: base, message: "budget" }) },
    params,
  );
  assert.equal(response.status, 200);
  assert.ok((await response.json()).reply.includes(base.name));
});

// --- Calendar .ics & Budget .csv Export Tests ---
await test("Calendar .ics generation produces valid RFC 5545 calendar", () => {
  const sampleTasks = [
    {
      id: "task-1",
      title: "Confirm caterer tasting",
      description: "Sample description",
      due_date: "2026-11-20",
      priority: "critical",
      status: "pending",
    },
    {
      id: "task-2",
      title: "Book DJ",
      description: "Music setup",
      due_date: "2026-11-25",
      priority: "high",
      status: "completed",
    },
  ];
  const ics = utils.generateCalendarICS(base, sampleTasks);
  assert.ok(ics.includes("BEGIN:VCALENDAR"));
  assert.ok(ics.includes("VERSION:2.0"));
  assert.ok(ics.includes("END:VCALENDAR"));
  assert.ok(ics.includes("BEGIN:VEVENT"));
  assert.ok(ics.includes(base.location));
  assert.ok(ics.includes("Confirm caterer tasting"));
  assert.ok(ics.includes("TRIGGER:-P1D"));
  assert.ok(ics.includes("STATUS:COMPLETED"));
});

await test("Calendar .ics generation safely escapes special characters", () => {
  const dirtyEvent = {
    ...base,
    name: "Rohan & Priya, Lucknow; Grand Celebration\nPart 2",
    location: "Hotel Taj, Gomti Nagar; Hall A",
  };
  const ics = utils.generateCalendarICS(dirtyEvent, []);
  assert.ok(ics.includes("Rohan & Priya\\, Lucknow\\; Grand Celebration\\nPart 2"));
  assert.ok(ics.includes("Hotel Taj\\, Gomti Nagar\\; Hall A"));
});

await test("Budget .csv generation exports correct headers and variance", () => {
  const sampleBudgets = [
    {
      category: "Catering",
      allocated_amount: 250000,
      actual_amount: 240000,
      priority: "critical",
      reason: "Buffet for 300 guests",
    },
    {
      category: "Decor, Lighting & Stage",
      allocated_amount: 80000,
      actual_amount: 90000,
      priority: "high",
      reason: "Extra floral setup",
    },
  ];
  const csv = utils.generateBudgetCSV(base, sampleBudgets);
  assert.ok(csv.includes("Category,Allocated (INR),Actual Spent (INR),Variance (INR),Priority,Reason / Notes"));
  assert.ok(csv.includes('"Catering",250000,240000,10000,"critical","Buffet for 300 guests"'));
  assert.ok(csv.includes('"Decor, Lighting & Stage",80000,90000,-10000,"high","Extra floral setup"'));
  assert.ok(csv.includes('"Total Event Budget",800000'));
});

await test("Storage vendor quote tracking persists actual quotes", () => {
  const sampleVendor = {
    id: "vend-test-1",
    event_id: base.id,
    vendor_type: "Photography",
    name: "Pixel Studios",
    estimated_budget: 90000,
    actual_quote: 85000,
    status: "quote_received",
    checklist: [{ id: "vc-1", vendor_id: "vend-test-1", label: "Drone clearance", is_completed: true }],
    created_at: new Date().toISOString(),
  };
  storage.saveVendor(sampleVendor);
  const loaded = storage.getVendors(base.id).find((v) => v.id === "vend-test-1");
  assert.ok(loaded);
  assert.equal(loaded.actual_quote, 85000);
  assert.equal(loaded.name, "Pixel Studios");
  assert.equal(loaded.status, "quote_received");
});

const readiness = load("lib/readiness.ts");
const simulation = load("lib/simulation.ts");
const critique = load("lib/ai/critique.ts");

await test("calculateEventReadiness returns bounded 0-100 score and detects high-risk alerts", () => {
  const testBudgets = [
    { id: "b1", event_id: base.id, category: "Venue Rental", allocated_amount: 300000, actual_amount: 250000, priority: "critical" },
    { id: "b2", event_id: base.id, category: "Catering", allocated_amount: 250000, actual_amount: 200000, priority: "critical" },
    { id: "b3", event_id: base.id, category: "Contingency Buffer", allocated_amount: 60000, actual_amount: 0, priority: "low" },
  ];
  const testTasks = [
    { id: "t1", event_id: base.id, title: "Book Hall", due_date: "2020-01-01", priority: "critical", status: "pending" },
    { id: "t2", event_id: base.id, title: "Tasting", due_date: base.event_date, priority: "high", status: "completed" },
  ];
  const testVendors = [
    { id: "v1", event_id: base.id, vendor_type: "Banquet Venue", status: "needed", checklist: [{ id: "c1", label: "Check generator", is_completed: true }] },
  ];

  const report = readiness.calculateEventReadiness(base, testBudgets, testTasks, testVendors);
  assert.ok(report.overallScore >= 0 && report.overallScore <= 100);
  assert.ok(report.breakdown.budgetHealth <= 25);
  assert.ok(report.breakdown.timelineHealth <= 25);
  assert.ok(report.breakdown.vendorHealth <= 25);
  assert.ok(report.breakdown.checklistHealth <= 25);
  assert.ok(report.detectedRisks.some((r) => r.id === "risk-overdue-critical"));
});

await test("simulateEventScenario scales catering and normalizes rebalanced budget", () => {
  const sampleBudgets = [
    { id: "b1", event_id: base.id, category: "Catering & Dining", allocated_amount: 300000, actual_amount: 0, priority: "critical" },
    { id: "b2", event_id: base.id, category: "Photography", allocated_amount: 100000, actual_amount: 0, priority: "high" },
    { id: "b3", event_id: base.id, category: "Venue", allocated_amount: 400000, actual_amount: 0, priority: "critical" },
  ];
  const result = simulation.simulateEventScenario(base, sampleBudgets, { guestDelta: 50, budgetDeltaPercent: 10 });
  assert.equal(result.simulatedGuests, 350);
  assert.equal(result.simulatedBudget, 880000);
  assert.ok(result.cateringCostPerPlate > 0);
  const sum = result.categories.reduce((acc, c) => acc + c.simulatedAllocated, 0);
  assert.equal(sum, result.simulatedBudget);
});

await test("simulateEventScenario triggers capacity warning on high guest surge", () => {
  const sampleBudgets = [
    { id: "b1", event_id: base.id, category: "Catering", allocated_amount: 300000, actual_amount: 0, priority: "critical" },
  ];
  const result = simulation.simulateEventScenario(base, sampleBudgets, { guestDelta: 120, budgetDeltaPercent: 0 });
  assert.ok(result.capacityWarning && result.capacityWarning.includes("exceeds typical hall buffer"));
});

await test("evaluateAndCritiqueBlueprint executes 5-phase loop and auto-refines blueprint", () => {
  const unrefined = {
    budgetPlan: [
      { category: "Venue", allocatedAmount: 500000, priority: "critical", reason: "Hall" },
      { category: "Catering", allocatedAmount: 400000, priority: "critical", reason: "Food" }, // Sum = 900k > 800k total
    ],
    timeline: [
      { title: "Old Task", description: "Desc", dueDate: "2019-01-01", priority: "critical" },
    ],
    vendors: [],
    personalizedIdeas: [],
    nextActions: [],
  };

  const { refinedBlueprint, critiqueTrace, evaluationScore } = critique.evaluateAndCritiqueBlueprint(unrefined, base);
  assert.ok(critiqueTrace.length >= 4);
  assert.ok(evaluationScore >= 70);
  const sum = refinedBlueprint.budgetPlan.reduce((acc, b) => acc + b.allocatedAmount, 0);
  assert.ok(sum <= base.total_budget);
  assert.ok(refinedBlueprint.budgetPlan.some((b) => b.category.toLowerCase().includes("contingency") || b.category.toLowerCase().includes("buffer")));
  assert.ok(refinedBlueprint.timeline[0].dueDate >= utils.localDateString());
  assert.ok(refinedBlueprint.vendors.length > 0);
});

await test("Storage saveBudgets persists multiple budget items in batch", () => {
  const batch = [
    { id: "bgt-batch-1", event_id: base.id, category: "Band & Dhol", allocated_amount: 25000, actual_amount: 0, priority: "medium" },
    { id: "bgt-batch-2", event_id: base.id, category: "Lighting", allocated_amount: 15000, actual_amount: 0, priority: "low" },
  ];
  storage.saveBudgets(base.id, batch);
  const loaded = storage.getBudgets(base.id);
  assert.ok(loaded.some((b) => b.id === "bgt-batch-1"));
  assert.ok(loaded.some((b) => b.id === "bgt-batch-2"));
});

console.log(
  `\n${passed} passed, ${failed} failed. Tests run against application modules with no live API calls.`,
);
if (failed) process.exitCode = 1;
