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

/**
 * Generates an RFC 5545 compliant iCalendar (.ics) string
 * Compatible with Google Calendar, Apple Calendar, and Microsoft Outlook
 */
export function generateCalendarICS(
  event: { id: string; name: string; event_date: string; location: string; event_type?: string; total_budget?: number },
  tasks: Array<{ id: string; title: string; description?: string; due_date: string; priority?: string; status?: string }> = []
): string {
  const sanitize = (text: string) =>
    (text || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

  const formatDateICS = (dateStr: string) => dateStr.replace(/-/g, "");

  const eventDateFormatted = formatDateICS(event.event_date);
  const now = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Planora AI//Celebration Planner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${sanitize(`${event.name} Timeline`)}`,
    "BEGIN:VEVENT",
    `UID:planora-main-${event.id}@planora.ai`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${eventDateFormatted}`,
    `DTEND;VALUE=DATE:${eventDateFormatted}`,
    `SUMMARY:${sanitize(`🎉 ${event.name} (${event.event_type || "Event"})`)}`,
    `LOCATION:${sanitize(event.location)}`,
    `DESCRIPTION:${sanitize(`Celebration Day! Total Budget: INR ${event.total_budget || 0}. Planned with Planora AI.`)}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
  ];

  for (const task of tasks) {
    const taskDate = formatDateICS(task.due_date);
    const isCompleted = task.status === "completed";
    ics.push(
      "BEGIN:VEVENT",
      `UID:planora-task-${task.id}@planora.ai`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${taskDate}`,
      `DTEND;VALUE=DATE:${taskDate}`,
      `SUMMARY:${sanitize(`${isCompleted ? "✓ " : ""}[${(task.priority || "Task").toUpperCase()}] ${task.title}`)}`,
      `DESCRIPTION:${sanitize(`${task.description || ""} (Status: ${task.status || "pending"})`)}`,
      isCompleted ? "STATUS:COMPLETED" : "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "DESCRIPTION:Task Due Reminder",
      "TRIGGER:-P1D",
      "END:VALARM",
      "END:VEVENT"
    );
  }

  ics.push("END:VCALENDAR");
  return ics.join("\r\n");
}

/**
 * Generates CSV string for budget breakdown
 */
export function generateBudgetCSV(
  event: { name: string; total_budget: number },
  budgets: Array<{ category: string; allocated_amount: number; actual_amount: number; priority: string; reason?: string }>
): string {
  const escapeCsv = (str: string) => {
    const val = (str || "").replace(/"/g, '""');
    return `"${val}"`;
  };

  const headers = ["Category", "Allocated (INR)", "Actual Spent (INR)", "Variance (INR)", "Priority", "Reason / Notes"];
  const rows = budgets.map((b) => {
    const variance = b.allocated_amount - (b.actual_amount || 0);
    return [
      escapeCsv(b.category),
      b.allocated_amount,
      b.actual_amount || 0,
      variance,
      escapeCsv(b.priority),
      escapeCsv(b.reason || ""),
    ].join(",");
  });

  const summary = [
    "",
    `"Total Event Budget",${event.total_budget}`,
    `"Total Allocated",${budgets.reduce((sum, b) => sum + b.allocated_amount, 0)}`,
    `"Total Spent",${budgets.reduce((sum, b) => sum + (b.actual_amount || 0), 0)}`,
  ];

  return [headers.join(","), ...rows, ...summary].join("\r\n");
}

/**
 * Client-side file downloader
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
