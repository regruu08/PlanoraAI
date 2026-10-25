import type { Task } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format amounts into Indian Rupees (INR)
 * e.g., 800000 -> ₹8,00,000 or ₹8L
 */
export function formatINR(amount: number, compact: boolean = false): string {
  if (compact) {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} Lakh`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}k`;
    }
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate days remaining until event date
 */
export function getDaysRemaining(eventDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(`${eventDateStr}T00:00:00`);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Format date in friendly human-readable format
 */
export function formatDate(dateStr: string): string {
  try {
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Calculate percentage safely
 */
export function calculatePercentage(part: number, total: number): number {
  if (!total || total <= 0) return 0;
  const pct = Math.round((part / total) * 100);
  return Math.min(100, Math.max(0, pct));
}

export function sortTasksByUrgency<T extends Task>(tasks: T[]): T[] {
  const rank = { critical: 0, high: 1, medium: 2, low: 3 };
  const today = localDateString();
  return [...tasks].sort((a, b) => {
    const overdueA = a.status !== "completed" && a.due_date < today;
    const overdueB = b.status !== "completed" && b.due_date < today;
    return (
      Number(overdueB) - Number(overdueA) ||
      rank[a.priority] - rank[b.priority] ||
      a.due_date.localeCompare(b.due_date)
    );
  });
}

export function localDateString(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
