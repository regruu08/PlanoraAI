import { supabase, isSupabaseConfigured } from './client';
import { PlanoraEvent, BudgetItem, Task, Vendor, VendorChecklistItem, Idea, AIMessage, EventBlueprint } from '@/types';

/**
 * Supabase Data Access Layer
 * Automatically gracefully fallbacks to false/null if Supabase is not configured
 */

export async function fetchSupabaseEvents(): Promise<PlanoraEvent[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as PlanoraEvent[];
  } catch (err) {
    console.warn('Error fetching events from Supabase:', err);
    return null;
  }
}

export async function saveSupabaseEvent(event: PlanoraEvent): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('events').upsert({
      id: event.id,
      name: event.name,
      event_type: event.event_type,
      event_date: event.event_date,
      location: event.location,
      guest_count: event.guest_count,
      total_budget: event.total_budget,
      theme: event.theme,
      food_preference: event.food_preference,
      venue_type: event.venue_type,
      cultural_preference: event.cultural_preference,
      special_requirements: event.special_requirements,
      notes: event.notes,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Error saving event to Supabase:', err);
    return false;
  }
}

export async function fetchSupabaseBudgets(eventId: string): Promise<BudgetItem[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('budget_items')
      .select('*')
      .eq('event_id', eventId);
    if (error) throw error;
    return data as BudgetItem[];
  } catch (err) {
    return null;
  }
}

export async function saveSupabaseBudgetItem(item: BudgetItem): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('budget_items').upsert({
      id: item.id,
      event_id: item.event_id,
      category: item.category,
      allocated_amount: item.allocated_amount,
      actual_amount: item.actual_amount,
      priority: item.priority,
      reason: item.reason,
      notes: item.notes,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}

export async function fetchSupabaseTasks(eventId: string): Promise<Task[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('event_id', eventId)
      .order('due_date', { ascending: true });
    if (error) throw error;
    return data as Task[];
  } catch {
    return null;
  }
}

export async function saveSupabaseTask(task: Task): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('tasks').upsert({
      id: task.id,
      event_id: task.event_id,
      title: task.title,
      description: task.description,
      due_date: task.due_date,
      priority: task.priority,
      status: task.status,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}

export async function fetchSupabaseVendors(eventId: string): Promise<Vendor[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data: vendorsData, error: vErr } = await supabase
      .from('vendors')
      .select('*')
      .eq('event_id', eventId);
    if (vErr || !vendorsData) return null;

    // Fetch checklists for all vendors
    const vendorIds = vendorsData.map((v) => v.id);
    const { data: checkData } = await supabase
      .from('vendor_checklist_items')
      .select('*')
      .in('vendor_id', vendorIds);

    const checklistMap: Record<string, VendorChecklistItem[]> = {};
    (checkData || []).forEach((c) => {
      if (!checklistMap[c.vendor_id]) checklistMap[c.vendor_id] = [];
      checklistMap[c.vendor_id].push(c as VendorChecklistItem);
    });

    return vendorsData.map((v) => ({
      ...v,
      checklist: checklistMap[v.id] || [],
    })) as Vendor[];
  } catch {
    return null;
  }
}

export async function saveSupabaseVendor(vendor: Vendor): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error: vErr } = await supabase.from('vendors').upsert({
      id: vendor.id,
      event_id: vendor.event_id,
      vendor_type: vendor.vendor_type,
      name: vendor.name,
      estimated_budget: vendor.estimated_budget,
      actual_quote: vendor.actual_quote,
      status: vendor.status,
      notes: vendor.notes,
      updated_at: new Date().toISOString(),
    });
    if (vErr) return false;

    // Upsert checklist items
    if (vendor.checklist && vendor.checklist.length > 0) {
      for (const item of vendor.checklist) {
        await supabase.from('vendor_checklist_items').upsert({
          id: item.id,
          vendor_id: vendor.id,
          label: item.label,
          is_completed: item.is_completed,
          updated_at: new Date().toISOString(),
        });
      }
    }
    return true;
  } catch {
    return false;
  }
}

export async function fetchSupabaseIdeas(eventId: string): Promise<Idea[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('event_id', eventId);
    if (error) return null;
    return data as Idea[];
  } catch {
    return null;
  }
}

export async function saveSupabaseIdea(idea: Idea): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('ideas').upsert({
      id: idea.id,
      event_id: idea.event_id,
      category: idea.category,
      title: idea.title,
      description: idea.description,
      reason: idea.reason,
      is_saved: idea.is_saved,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function saveSupabaseAIMessage(msg: AIMessage): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('ai_messages').insert({
      id: msg.id,
      event_id: msg.event_id,
      role: msg.role,
      content: msg.content,
      created_at: msg.created_at,
    });
    return !error;
  } catch {
    return false;
  }
}
