import type { BudgetItem, PlanoraEvent } from "@/types";

export interface SimulationParams {
  guestDelta: number; // e.g. +50 or -30
  budgetDeltaPercent: number; // e.g. +10 (for +10%) or -15 (for -15%)
}

export interface SimulatedCategory {
  id: string;
  category: string;
  currentAllocated: number;
  simulatedAllocated: number;
  difference: number;
  priority: string;
  notes?: string;
}

export interface SimulationResult {
  originalGuests: number;
  simulatedGuests: number;
  originalBudget: number;
  simulatedBudget: number;
  originalCostPerGuest: number;
  simulatedCostPerGuest: number;
  cateringCostPerPlate: number;
  capacityWarning?: string;
  categories: SimulatedCategory[];
}

/**
 * Simulates the impact of guest count and budget changes on an event
 * Pro-rates costs intelligently: catering and venue scale with guests, fixed services scale with budget
 */
export function simulateEventScenario(
  event: PlanoraEvent,
  budgets: BudgetItem[],
  params: SimulationParams,
): SimulationResult {
  const originalGuests = Math.max(1, event.guest_count);
  const simulatedGuests = Math.max(1, originalGuests + (params.guestDelta || 0));

  const budgetMultiplier = 1 + (params.budgetDeltaPercent || 0) / 100;
  const simulatedBudget = Math.max(1000, Math.round(event.total_budget * budgetMultiplier));

  const guestRatio = simulatedGuests / originalGuests;
  const originalCostPerGuest = Math.round(event.total_budget / originalGuests);
  const simulatedCostPerGuest = Math.round(simulatedBudget / simulatedGuests);

  // Capacity warnings
  let capacityWarning: string | undefined;
  if (params.guestDelta > 0) {
    const pctIncrease = Math.round((params.guestDelta / originalGuests) * 100);
    if (pctIncrease >= 30) {
      capacityWarning = `+${params.guestDelta} guests (+${pctIncrease}%) exceeds typical hall buffer. Confirm secondary hall seating and fire safety clearances with your venue.`;
    } else if (pctIncrease >= 15) {
      capacityWarning = `+${params.guestDelta} guests will require at least 4-5 additional dining tables and extra valet parking capacity.`;
    }
  }

  // Scale categories
  const categories: SimulatedCategory[] = budgets.map((b) => {
    const catLower = b.category.toLowerCase();
    const isGuestVariable =
      catLower.includes("catering") ||
      catLower.includes("food") ||
      catLower.includes("dining") ||
      catLower.includes("hospitality") ||
      catLower.includes("gift");

    let simulatedAllocated: number;
    if (isGuestVariable) {
      // Scales with guests, adjusted by budget multiplier
      simulatedAllocated = Math.round(b.allocated_amount * guestRatio * (budgetMultiplier > 0 ? 1 : 0.9));
    } else {
      // Fixed items (photo, music, decor) scale primarily with overall budget
      simulatedAllocated = Math.round(b.allocated_amount * budgetMultiplier);
    }

    return {
      id: b.id,
      category: b.category,
      currentAllocated: b.allocated_amount,
      simulatedAllocated,
      difference: simulatedAllocated - b.allocated_amount,
      priority: b.priority,
      notes: b.reason,
    };
  });

  // Re-normalize categories so sum matches simulatedBudget
  const totalSimulated = categories.reduce((sum, c) => sum + c.simulatedAllocated, 0);
  if (totalSimulated > 0 && totalSimulated !== simulatedBudget) {
    const scale = simulatedBudget / totalSimulated;
    let runningSum = 0;
    for (let i = 0; i < categories.length - 1; i++) {
      categories[i].simulatedAllocated = Math.round(categories[i].simulatedAllocated * scale);
      categories[i].difference = categories[i].simulatedAllocated - categories[i].currentAllocated;
      runningSum += categories[i].simulatedAllocated;
    }
    const last = categories[categories.length - 1];
    if (last) {
      last.simulatedAllocated = Math.max(0, simulatedBudget - runningSum);
      last.difference = last.simulatedAllocated - last.currentAllocated;
    }
  }

  // Projected catering cost per plate
  const simulatedFood = categories.find(
    (c) =>
      c.category.toLowerCase().includes("catering") ||
      c.category.toLowerCase().includes("food") ||
      c.category.toLowerCase().includes("dining"),
  );
  const cateringCostPerPlate = simulatedFood
    ? Math.round(simulatedFood.simulatedAllocated / simulatedGuests)
    : Math.round((simulatedBudget * 0.3) / simulatedGuests);

  return {
    originalGuests,
    simulatedGuests,
    originalBudget: event.total_budget,
    simulatedBudget,
    originalCostPerGuest,
    simulatedCostPerGuest,
    cateringCostPerPlate,
    capacityWarning,
    categories,
  };
}
