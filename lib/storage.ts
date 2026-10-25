"use client";

import {
  AIMessage,
  BudgetItem,
  EventBlueprint,
  Idea,
  PlanoraEvent,
  Task,
  Vendor,
} from "@/types";
import {
  DEMO_BUDGETS,
  DEMO_EVENTS,
  DEMO_IDEAS,
  DEMO_TASKS,
  DEMO_VENDORS,
} from "./demo-data";
import {
  saveSupabaseAIMessage,
  saveSupabaseBudgetItem,
  saveSupabaseEvent,
  saveSupabaseIdea,
  saveSupabaseTask,
  saveSupabaseVendor,
} from "./supabase/db";
import { validateBlueprintForEvent } from "./validation/event";

const STORAGE_KEYS = {
  EVENTS: "planora_events_v1",
  BUDGETS: "planora_budgets_v1",
  TASKS: "planora_tasks_v1",
  VENDORS: "planora_vendors_v1",
  IDEAS: "planora_ideas_v1",
  MESSAGES: "planora_ai_messages_v1",
};

// Initialize default storage with demo data if empty
export function initLocalStorage(): void {
  if (typeof window === "undefined") return;

  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(DEMO_EVENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BUDGETS)) {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(DEMO_BUDGETS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEMO_TASKS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.VENDORS)) {
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(DEMO_VENDORS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.IDEAS)) {
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(DEMO_IDEAS));
  }
}

export function getEvents(): PlanoraEvent[] {
  if (typeof window === "undefined") return DEMO_EVENTS;
  initLocalStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    return raw ? JSON.parse(raw) : DEMO_EVENTS;
  } catch {
    return DEMO_EVENTS;
  }
}

export function getEventById(id: string): PlanoraEvent | undefined {
  const events = getEvents();
  return events.find((e) => e.id === id);
}

export function saveEvent(event: PlanoraEvent): void {
  if (typeof window === "undefined") return;
  const events = getEvents();
  const existingIdx = events.findIndex((e) => e.id === event.id);
  if (existingIdx >= 0) {
    events[existingIdx] = {
      ...events[existingIdx],
      ...event,
      updated_at: new Date().toISOString(),
    };
  } else {
    events.unshift(event);
  }
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));

  // Async sync to Supabase if configured
  saveSupabaseEvent(event).catch((err) =>
    console.warn("Supabase sync background notice:", err),
  );
}

export function deleteEvent(id: string): void {
  if (typeof window === "undefined") return;
  const events = getEvents().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  for (const key of [
    STORAGE_KEYS.BUDGETS,
    STORAGE_KEYS.TASKS,
    STORAGE_KEYS.VENDORS,
    STORAGE_KEYS.IDEAS,
    STORAGE_KEYS.MESSAGES,
  ]) {
    const raw = localStorage.getItem(key);
    const map = raw ? JSON.parse(raw) : {};
    delete map[id];
    localStorage.setItem(key, JSON.stringify(map));
  }
}

export function getBudgets(eventId: string): BudgetItem[] {
  if (typeof window === "undefined") return DEMO_BUDGETS[eventId] || [];
  initLocalStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    const map = raw ? JSON.parse(raw) : DEMO_BUDGETS;
    return map[eventId] || [];
  } catch {
    return DEMO_BUDGETS[eventId] || [];
  }
}

export function saveBudgetItem(item: BudgetItem): void {
  if (typeof window === "undefined") return;
  initLocalStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.BUDGETS);
  const map = raw ? JSON.parse(raw) : { ...DEMO_BUDGETS };
  const items: BudgetItem[] = map[item.event_id] || [];
  const idx = items.findIndex((b) => b.id === item.id);
  if (idx >= 0) {
    items[idx] = item;
  } else {
    items.push(item);
  }
  map[item.event_id] = items;
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(map));

  // Async sync to Supabase if configured
  saveSupabaseBudgetItem(item).catch(() => {});
}

export function getTasks(eventId: string): Task[] {
  if (typeof window === "undefined") return DEMO_TASKS[eventId] || [];
  initLocalStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    const map = raw ? JSON.parse(raw) : DEMO_TASKS;
    return map[eventId] || [];
  } catch {
    return DEMO_TASKS[eventId] || [];
  }
}

export function saveTask(task: Task): void {
  if (typeof window === "undefined") return;
  initLocalStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
  const map = raw ? JSON.parse(raw) : { ...DEMO_TASKS };
  const items: Task[] = map[task.event_id] || [];
  const idx = items.findIndex((t) => t.id === task.id);
  if (idx >= 0) {
    items[idx] = task;
  } else {
    items.push(task);
  }
  map[task.event_id] = items;
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(map));

  // Async sync to Supabase if configured
  saveSupabaseTask(task).catch(() => {});
}

export function getVendors(eventId: string): Vendor[] {
  if (typeof window === "undefined") return DEMO_VENDORS[eventId] || [];
  initLocalStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VENDORS);
    const map = raw ? JSON.parse(raw) : DEMO_VENDORS;
    return map[eventId] || [];
  } catch {
    return DEMO_VENDORS[eventId] || [];
  }
}

export function saveVendor(vendor: Vendor): void {
  if (typeof window === "undefined") return;
  initLocalStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.VENDORS);
  const map = raw ? JSON.parse(raw) : { ...DEMO_VENDORS };
  const items: Vendor[] = map[vendor.event_id] || [];
  const idx = items.findIndex((v) => v.id === vendor.id);
  if (idx >= 0) {
    items[idx] = vendor;
  } else {
    items.push(vendor);
  }
  map[vendor.event_id] = items;
  localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(map));

  // Async sync to Supabase if configured
  saveSupabaseVendor(vendor).catch(() => {});
}

export function getIdeas(eventId: string): Idea[] {
  if (typeof window === "undefined") return DEMO_IDEAS[eventId] || [];
  initLocalStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.IDEAS);
    const map = raw ? JSON.parse(raw) : DEMO_IDEAS;
    return map[eventId] || [];
  } catch {
    return DEMO_IDEAS[eventId] || [];
  }
}

export function saveIdea(idea: Idea): void {
  if (typeof window === "undefined") return;
  initLocalStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.IDEAS);
  const map = raw ? JSON.parse(raw) : { ...DEMO_IDEAS };
  const items: Idea[] = map[idea.event_id] || [];
  const idx = items.findIndex((i) => i.id === idea.id);
  if (idx >= 0) {
    items[idx] = idea;
  } else {
    items.push(idea);
  }
  map[idea.event_id] = items;
  localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(map));

  // Async sync to Supabase if configured
  saveSupabaseIdea(idea).catch(() => {});
}

export function getAIMessages(eventId: string): AIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const map = raw ? JSON.parse(raw) : {};
    return map[eventId] || [];
  } catch {
    return [];
  }
}

export function saveAIMessage(msg: AIMessage): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const map = raw ? JSON.parse(raw) : {};
    const items: AIMessage[] = map[msg.event_id] || [];
    items.push(msg);
    map[msg.event_id] = items;
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(map));

    // Async sync to Supabase if configured
    saveSupabaseAIMessage(msg).catch(() => {});
  } catch {}
}

export function clearAIMessages(eventId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const map = raw ? JSON.parse(raw) : {};
    delete map[eventId];
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(map));
  } catch {}
}

/**
 * Apply generated blueprint to storage for a given event
 */
export function applyBlueprintToEvent(
  eventId: string,
  blueprint: EventBlueprint,
): void {
  if (typeof window === "undefined") return;
  initLocalStorage();

  const event = getEventById(eventId);
  if (!event) throw new Error("This event could not be found.");
  validateBlueprintForEvent(blueprint, event);
  const previousBudgets = getBudgets(eventId);
  const previousTasks = getTasks(eventId);
  const previousVendors = getVendors(eventId);
  const previousIdeas = getIdeas(eventId);

  // Convert budget items
  const newBudgets: BudgetItem[] = blueprint.budgetPlan.map((b, idx) => ({
    id: `bp-b-${Date.now()}-${idx}`,
    event_id: eventId,
    category: b.category,
    allocated_amount: b.allocatedAmount,
    actual_amount: 0,
    priority: b.priority,
    reason: b.reason,
    created_at: new Date().toISOString(),
  }));

  // Convert tasks
  const newTasks: Task[] = blueprint.timeline.map((t, idx) => ({
    id: `bp-t-${Date.now()}-${idx}`,
    event_id: eventId,
    title: t.title,
    description: t.description,
    due_date: t.dueDate,
    priority: t.priority,
    status: "pending",
    created_at: new Date().toISOString(),
  }));

  // Convert vendors
  const newVendors: Vendor[] = blueprint.vendors.map((v, idx) => {
    const vendorId = `bp-v-${Date.now()}-${idx}`;
    return {
      id: vendorId,
      event_id: eventId,
      vendor_type: v.vendorType,
      estimated_budget: v.estimatedBudget,
      status: "needed",
      checklist: v.checklist.map((c, cIdx) => ({
        id: `bp-vc-${Date.now()}-${idx}-${cIdx}`,
        vendor_id: vendorId,
        label: c.label,
        is_completed: false,
      })),
      created_at: new Date().toISOString(),
    };
  });

  // Convert ideas
  const newIdeas: Idea[] = blueprint.personalizedIdeas.map((i, idx) => ({
    id: `bp-i-${Date.now()}-${idx}`,
    event_id: eventId,
    category: i.category,
    title: i.title,
    description: i.description,
    reason: i.reason,
    is_saved: false,
    created_at: new Date().toISOString(),
  }));

  // Merge by identity and keep user-created records and recorded progress.
  const merge = <T extends { id: string }>(
    previous: T[],
    generated: T[],
    key: (item: T) => string,
  ): T[] => {
    const merged = [...previous];
    for (const item of generated) {
      const index = merged.findIndex(
        (old) => key(old).toLowerCase() === key(item).toLowerCase(),
      );
      if (index < 0) merged.push(item);
      // Existing records are deliberately preserved: user edits and payments take precedence.
    }
    return merged;
  };
  const budgets = previousBudgets.length ? previousBudgets : newBudgets;
  const tasks = merge(previousTasks, newTasks, (item) => item.title);
  const vendors = merge(
    previousVendors,
    newVendors,
    (item) => item.vendor_type,
  );
  const ideas = merge(previousIdeas, newIdeas, (item) => item.title);

  // Save each into local map
  try {
    const bRaw = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    const bMap = bRaw ? JSON.parse(bRaw) : {};
    bMap[eventId] = budgets;
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(bMap));

    const tRaw = localStorage.getItem(STORAGE_KEYS.TASKS);
    const tMap = tRaw ? JSON.parse(tRaw) : {};
    tMap[eventId] = tasks;
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tMap));

    const vRaw = localStorage.getItem(STORAGE_KEYS.VENDORS);
    const vMap = vRaw ? JSON.parse(vRaw) : {};
    vMap[eventId] = vendors;
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vMap));

    const iRaw = localStorage.getItem(STORAGE_KEYS.IDEAS);
    const iMap = iRaw ? JSON.parse(iRaw) : {};
    iMap[eventId] = ideas;
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(iMap));

    // Also trigger Supabase sync in background
    budgets.forEach((b) => saveSupabaseBudgetItem(b).catch(() => {}));
    tasks.forEach((t) => saveSupabaseTask(t).catch(() => {}));
    vendors.forEach((v) => saveSupabaseVendor(v).catch(() => {}));
    ideas.forEach((i) => saveSupabaseIdea(i).catch(() => {}));
  } catch (err) {
    throw new Error(
      err instanceof Error
        ? err.message
        : "Could not save your plan. Check browser storage and try again.",
    );
  }
}
