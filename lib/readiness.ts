import type { BudgetItem, PlanoraEvent, Task, Vendor } from "@/types";
import { getDaysRemaining, localDateString } from "./utils";

export interface RiskAlert {
  id: string;
  level: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  actionUrl: string;
  actionLabel: string;
}

export interface EventReadinessReport {
  overallScore: number; // 0 to 100
  status: "critical" | "moderate" | "optimal";
  breakdown: {
    budgetHealth: number; // 0 to 25
    timelineHealth: number; // 0 to 25
    vendorHealth: number; // 0 to 25
    checklistHealth: number; // 0 to 25
  };
  detectedRisks: RiskAlert[];
  daysRemaining: number;
}

/**
 * Calculates a 0-100 composite Event Readiness Health Score and detects active operational risks
 */
export function calculateEventReadiness(
  event: PlanoraEvent,
  budgets: BudgetItem[],
  tasks: Task[],
  vendors: Vendor[],
): EventReadinessReport {
  const daysRemaining = getDaysRemaining(event.event_date);
  const today = localDateString();

  // 1. Budget Health (max 25)
  const totalAllocated = budgets.reduce((acc, b) => acc + (b.allocated_amount || 0), 0);
  const totalActual = budgets.reduce((acc, b) => acc + (b.actual_amount || 0), 0);

  let budgetHealth = 0;
  // Allocation solvency (up to 10 pts)
  if (event.total_budget > 0) {
    if (totalAllocated <= event.total_budget) {
      budgetHealth += 10;
    } else {
      const overRatio = (totalAllocated - event.total_budget) / event.total_budget;
      budgetHealth += Math.max(0, Math.round(10 * (1 - overRatio * 2)));
    }
  }

  // Contingency buffer (up to 10 pts)
  const contingencyItem = budgets.find(
    (b) =>
      b.category.toLowerCase().includes("contingency") ||
      b.category.toLowerCase().includes("buffer") ||
      b.category.toLowerCase().includes("hospitality pool"),
  );
  const contingencyAmount = contingencyItem
    ? contingencyItem.allocated_amount
    : Math.max(0, event.total_budget - totalAllocated);
  const contingencyPct = event.total_budget > 0 ? (contingencyAmount / event.total_budget) * 100 : 0;
  if (contingencyPct >= 7) {
    budgetHealth += 10;
  } else if (contingencyPct >= 4) {
    budgetHealth += 7;
  } else if (contingencyPct > 0) {
    budgetHealth += 4;
  }

  // Actual spending control (up to 5 pts)
  if (totalActual <= event.total_budget) {
    budgetHealth += 5;
  } else {
    budgetHealth += 0;
  }

  // 2. Timeline Health (max 25)
  let timelineHealth = 0;
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const overdueTasks = tasks.filter((t) => t.status !== "completed" && t.due_date < today);
  const criticalOverdue = overdueTasks.filter((t) => t.priority === "critical");

  if (tasks.length > 0) {
    const taskCompletionRatio = completedTasks.length / tasks.length;
    timelineHealth += Math.round(taskCompletionRatio * 15);
  } else {
    timelineHealth += 10;
  }

  if (criticalOverdue.length === 0) {
    timelineHealth += 10;
  } else if (criticalOverdue.length === 1) {
    timelineHealth += 4;
  }

  // 3. Vendor Health (max 25)
  let vendorHealth = 0;
  const confirmedVendors = vendors.filter((v) => v.status === "confirmed" || v.status === "completed");
  const quotesLogged = vendors.filter((v) => typeof v.actual_quote === "number" && v.actual_quote > 0);

  if (vendors.length > 0) {
    const confirmedRatio = confirmedVendors.length / vendors.length;
    vendorHealth += Math.round(confirmedRatio * 15);

    const quoteRatio = quotesLogged.length / vendors.length;
    vendorHealth += Math.round(quoteRatio * 10);
  } else {
    vendorHealth += 10;
  }

  // 4. Checklist Compliance (max 25)
  let checklistHealth = 0;
  const allChecklistItems = vendors.flatMap((v) => v.checklist || []);
  const completedChecklistItems = allChecklistItems.filter((c) => c.is_completed);

  if (allChecklistItems.length > 0) {
    const checkRatio = completedChecklistItems.length / allChecklistItems.length;
    checklistHealth += Math.round(checkRatio * 25);
  } else {
    checklistHealth += 12;
  }

  // Bound each component
  budgetHealth = Math.min(25, Math.max(0, budgetHealth));
  timelineHealth = Math.min(25, Math.max(0, timelineHealth));
  vendorHealth = Math.min(25, Math.max(0, vendorHealth));
  checklistHealth = Math.min(25, Math.max(0, checklistHealth));

  const overallScore = Math.min(100, Math.max(0, budgetHealth + timelineHealth + vendorHealth + checklistHealth));

  // Determine overall status
  let status: "critical" | "moderate" | "optimal" = "moderate";
  if (overallScore >= 75) status = "optimal";
  else if (overallScore < 50) status = "critical";

  // Detect Risks
  const detectedRisks: RiskAlert[] = [];

  // Overdue Critical Milestones
  if (criticalOverdue.length > 0) {
    detectedRisks.push({
      id: "risk-overdue-critical",
      level: "critical",
      title: `${criticalOverdue.length} Critical Milestone${criticalOverdue.length > 1 ? "s" : ""} Overdue`,
      description: `Immediate action required: "${criticalOverdue[0].title}" was due on ${criticalOverdue[0].due_date}.`,
      actionUrl: `/events/${event.id}/timeline`,
      actionLabel: "View Timeline",
    });
  }

  // Budget Deficit Risk
  if (totalActual > event.total_budget) {
    const deficit = totalActual - event.total_budget;
    detectedRisks.push({
      id: "risk-budget-deficit",
      level: "critical",
      title: "Actual Expenses Exceed Budget",
      description: `You are currently ₹${deficit.toLocaleString("en-IN")} over your ₹${event.total_budget.toLocaleString("en-IN")} total budget limit.`,
      actionUrl: `/events/${event.id}/budget`,
      actionLabel: "Review Budget",
    });
  } else if (totalAllocated > event.total_budget) {
    detectedRisks.push({
      id: "risk-budget-overallocated",
      level: "high",
      title: "Category Allocations Exceed Budget",
      description: `Planned allocations exceed total budget by ₹${(totalAllocated - event.total_budget).toLocaleString("en-IN")}.`,
      actionUrl: `/events/${event.id}/budget`,
      actionLabel: "Rebalance Allocations",
    });
  }

  // Unconfirmed Venue Risk
  const venueVendor = vendors.find(
    (v) =>
      v.vendor_type.toLowerCase().includes("venue") ||
      v.vendor_type.toLowerCase().includes("hall") ||
      v.vendor_type.toLowerCase().includes("banquet"),
  );
  if (venueVendor && venueVendor.status !== "confirmed" && venueVendor.status !== "completed" && daysRemaining <= 60) {
    detectedRisks.push({
      id: "risk-unconfirmed-venue",
      level: daysRemaining <= 30 ? "critical" : "high",
      title: "Primary Venue Not Confirmed",
      description: `Your event is in ${daysRemaining} days, but the venue contract is still ${venueVendor.status.replace("_", " ")}. Dates fill up quickly.`,
      actionUrl: `/events/${event.id}/vendors`,
      actionLabel: "Confirm Venue",
    });
  }

  // Unconfirmed Catering Risk
  const cateringVendor = vendors.find(
    (v) =>
      v.vendor_type.toLowerCase().includes("catering") ||
      v.vendor_type.toLowerCase().includes("food") ||
      v.vendor_type.toLowerCase().includes("dining"),
  );
  if (cateringVendor && cateringVendor.status !== "confirmed" && cateringVendor.status !== "completed" && daysRemaining <= 45) {
    detectedRisks.push({
      id: "risk-unconfirmed-catering",
      level: daysRemaining <= 21 ? "high" : "medium",
      title: "Catering Menu & Tasting Not Locked",
      description: `Guest count is ${event.guest_count}. Finalize tasting and booking before caterer calendar locks.`,
      actionUrl: `/events/${event.id}/vendors`,
      actionLabel: "Manage Catering",
    });
  }

  // Low Contingency Buffer Risk
  if (contingencyPct < 5 && event.total_budget > 0) {
    detectedRisks.push({
      id: "risk-low-contingency",
      level: "medium",
      title: `Low Contingency Buffer (${contingencyPct.toFixed(0)}%)`,
      description: "Indian events experience an average 7-10% in unexpected logistics, extra plates, or overtime charges.",
      actionUrl: `/events/${event.id}/budget`,
      actionLabel: "Adjust Buffer",
    });
  }

  return {
    overallScore,
    status,
    breakdown: {
      budgetHealth,
      timelineHealth,
      vendorHealth,
      checklistHealth,
    },
    detectedRisks,
    daysRemaining,
  };
}
