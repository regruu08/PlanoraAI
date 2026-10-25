import type { EventBlueprint, PlanoraEvent } from "@/types";
import { z } from "zod";
import { localDateString } from "../utils";

export const calendarDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return (
      Number.isFinite(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  }, "Choose a valid calendar date");

export const eventFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Event name must be at least 2 characters")
    .max(100),
  event_type: z.enum(["wedding", "birthday", "community"], {
    errorMap: () => ({ message: "Please select an event type" }),
  }),
  event_date: calendarDateSchema.refine(
    (value) => value >= localDateString(),
    "Event date must be today or in the future",
  ),
  location: z
    .string()
    .trim()
    .min(2, "Location is required (e.g. city or venue)"),
  guest_count: z.coerce
    .number()
    .int()
    .min(1, "Guest count must be at least 1")
    .max(100000),
  total_budget: z.coerce
    .number()
    .finite()
    .min(1000, "Total budget must be at least ₹1,000"),
  theme: z.string().optional(),
  food_preference: z.string().optional(),
  venue_type: z.enum(["indoor", "outdoor", "hybrid"]).optional(),
  cultural_preference: z.string().optional(),
  special_requirements: z.string().optional(),
  notes: z.string().optional(),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

export const blueprintBudgetItemSchema = z.object({
  category: z.string().min(1),
  allocatedAmount: z.number().nonnegative(),
  priority: z.enum(["low", "medium", "high", "critical"]),
  reason: z.string().min(1),
});

export const blueprintTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  dueDate: calendarDateSchema,
  priority: z.enum(["low", "medium", "high", "critical"]),
});

export const blueprintVendorSchema = z.object({
  vendorType: z.string().min(1),
  estimatedBudget: z.number().nonnegative(),
  checklist: z
    .array(
      z.object({
        label: z.string().min(1),
      }),
    )
    .min(1),
});

export const blueprintIdeaSchema = z.object({
  category: z.enum([
    "theme",
    "decor",
    "food",
    "activity",
    "entertainment",
    "guest_experience",
    "other",
  ]),
  title: z.string().min(1),
  description: z.string().min(1),
  reason: z.string().min(1),
});

export const eventBlueprintSchema = z.object({
  budgetPlan: z.array(blueprintBudgetItemSchema).min(3),
  timeline: z.array(blueprintTaskSchema).min(3),
  vendors: z.array(blueprintVendorSchema).min(2),
  personalizedIdeas: z.array(blueprintIdeaSchema).min(2),
  nextActions: z.array(z.string().min(1)).min(2),
});

export function validateBlueprintForEvent(
  blueprint: unknown,
  event: Pick<PlanoraEvent, "total_budget" | "event_date">,
): EventBlueprint {
  const parsed = eventBlueprintSchema.parse(blueprint);
  const allocated = parsed.budgetPlan.reduce(
    (sum, item) => sum + item.allocatedAmount,
    0,
  );
  if (allocated > event.total_budget + 0.01)
    throw new Error(
      "Plan allocations exceed your event budget. Please try again.",
    );
  if (parsed.timeline.some((task) => task.dueDate > event.event_date))
    throw new Error(
      "A planning task is scheduled after your event. Please try again.",
    );
  return parsed;
}

export const eventContextSchema = eventFormSchema.extend({
  id: z.string().min(1).max(120),
  event_date: calendarDateSchema,
  created_at: z
    .string()
    .optional()
    .default(() => new Date().toISOString()),
});
export const chatRequestSchema = z.object({
  event: eventContextSchema,
  message: z.string().trim().min(1).max(4000),
  budgets: z
    .array(
      z.object({
        id: z.string(),
        event_id: z.string(),
        category: z.string(),
        allocated_amount: z.number().finite().nonnegative(),
        actual_amount: z.number().finite().nonnegative(),
        priority: z.enum(["low", "medium", "high", "critical"]),
        created_at: z.string(),
      }),
    )
    .max(200)
    .default([]),
  tasks: z
    .array(
      z.object({
        id: z.string(),
        event_id: z.string(),
        title: z.string(),
        description: z.string(),
        due_date: calendarDateSchema,
        priority: z.enum(["low", "medium", "high", "critical"]),
        status: z.enum(["pending", "completed", "overdue"]),
        created_at: z.string(),
      }),
    )
    .max(500)
    .default([]),
  vendors: z
    .array(
      z.object({
        id: z.string(),
        event_id: z.string(),
        vendor_type: z.string(),
        estimated_budget: z.number().finite().nonnegative(),
        status: z.enum([
          "needed",
          "shortlisted",
          "contacted",
          "quote_received",
          "confirmed",
          "completed",
        ]),
        checklist: z
          .array(
            z.object({
              id: z.string(),
              vendor_id: z.string(),
              label: z.string(),
              is_completed: z.boolean(),
            }),
          )
          .max(100),
        created_at: z.string(),
      }),
    )
    .max(200)
    .default([]),
  ideas: z
    .array(
      z.object({
        id: z.string(),
        event_id: z.string(),
        category: blueprintIdeaSchema.shape.category,
        title: z.string(),
        description: z.string(),
        reason: z.string(),
        is_saved: z.boolean(),
        created_at: z.string(),
      }),
    )
    .max(200)
    .default([]),
});
