export type EventType = 'wedding' | 'birthday' | 'community';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type TaskStatus = 'pending' | 'completed' | 'overdue';

export type VendorStatus = 
  | 'needed' 
  | 'shortlisted' 
  | 'contacted' 
  | 'quote_received' 
  | 'confirmed' 
  | 'completed';

export type IdeaCategory = 
  | 'theme' 
  | 'decor' 
  | 'food' 
  | 'activity' 
  | 'entertainment' 
  | 'guest_experience' 
  | 'other';

export interface PlanoraEvent {
  id: string;
  user_id?: string;
  name: string;
  event_type: EventType;
  event_date: string; // YYYY-MM-DD
  location: string;
  guest_count: number;
  total_budget: number;
  theme?: string;
  food_preference?: string;
  venue_type?: 'indoor' | 'outdoor' | 'hybrid';
  cultural_preference?: string;
  special_requirements?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface BudgetItem {
  id: string;
  event_id: string;
  category: string;
  allocated_amount: number;
  actual_amount: number;
  priority: Priority;
  reason?: string;
  notes?: string;
  created_at: string;
}

export interface Task {
  id: string;
  event_id: string;
  title: string;
  description: string;
  due_date: string; // YYYY-MM-DD
  priority: Priority;
  status: TaskStatus;
  created_at: string;
}

export interface VendorChecklistItem {
  id: string;
  vendor_id: string;
  label: string;
  is_completed: boolean;
  created_at?: string;
}

export interface Vendor {
  id: string;
  event_id: string;
  vendor_type: string;
  name?: string;
  estimated_budget: number;
  actual_quote?: number;
  status: VendorStatus;
  notes?: string;
  checklist: VendorChecklistItem[];
  created_at: string;
}

export interface Idea {
  id: string;
  event_id: string;
  category: IdeaCategory;
  title: string;
  description: string;
  reason: string;
  is_saved: boolean;
  created_at: string;
}

export interface AIMessage {
  id: string;
  event_id: string;
  user_id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

// AI Blueprint types (from Gemini structured generation)
export interface BlueprintBudgetItem {
  category: string;
  allocatedAmount: number;
  priority: Priority;
  reason: string;
}

export interface BlueprintTask {
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
}

export interface BlueprintVendorItem {
  vendorType: string;
  estimatedBudget: number;
  checklist: { label: string }[];
}

export interface BlueprintIdea {
  category: IdeaCategory;
  title: string;
  description: string;
  reason: string;
}

export interface EventBlueprint {
  budgetPlan: BlueprintBudgetItem[];
  timeline: BlueprintTask[];
  vendors: BlueprintVendorItem[];
  personalizedIdeas: BlueprintIdea[];
  nextActions: string[];
}
