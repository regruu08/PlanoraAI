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
    name.startsWith("@/")
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
console.log(
  `\n${passed} passed, ${failed} failed. Tests run against application modules with no live API calls.`,
);
if (failed) process.exitCode = 1;
