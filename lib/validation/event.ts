import { z } from 'zod';

export const eventFormSchema = z.object({
  name: z.string().min(2, 'Event name must be at least 2 characters').max(100),
  event_type: z.enum(['wedding', 'birthday', 'community'], {
    errorMap: () => ({ message: 'Please select an event type' }),
  }),
  event_date: z.string().refine((val) => {
    const selected = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !isNaN(selected.getTime()) && selected >= today;
  }, {
    message: 'Event date must be today or in the future',
  }),
  location: z.string().min(2, 'Location is required (e.g. city or venue)'),
  guest_count: z.coerce.number().int().min(1, 'Guest count must be at least 1').max(100000),
  total_budget: z.coerce.number().min(1000, 'Total budget must be at least ₹1,000'),
  theme: z.string().optional(),
  food_preference: z.string().optional(),
  venue_type: z.enum(['indoor', 'outdoor', 'hybrid']).optional(),
  cultural_preference: z.string().optional(),
  special_requirements: z.string().optional(),
  notes: z.string().optional(),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

export const blueprintBudgetItemSchema = z.object({
  category: z.string().min(1),
  allocatedAmount: z.number().nonnegative(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  reason: z.string().min(1),
});

export const blueprintTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  dueDate: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
});

export const blueprintVendorSchema = z.object({
  vendorType: z.string().min(1),
  estimatedBudget: z.number().nonnegative(),
  checklist: z.array(z.object({
    label: z.string().min(1),
  })).min(1),
});

export const blueprintIdeaSchema = z.object({
  category: z.enum(['theme', 'decor', 'food', 'activity', 'entertainment', 'guest_experience', 'other']),
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
