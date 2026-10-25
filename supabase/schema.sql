-- Planora AI: Supabase PostgreSQL Database Schema
-- PromptWars Virtual Challenge 5: Celebration & Event Planner

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read/write their own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- 2. Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY DEFAULT ('evt_' || uuid_generate_v4()::TEXT),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('wedding', 'birthday', 'community')),
  event_date DATE NOT NULL,
  location TEXT NOT NULL,
  guest_count INTEGER NOT NULL CHECK (guest_count > 0),
  total_budget NUMERIC NOT NULL CHECK (total_budget >= 0),
  theme TEXT,
  food_preference TEXT,
  venue_type TEXT CHECK (venue_type IN ('indoor', 'outdoor', 'hybrid')),
  cultural_preference TEXT,
  special_requirements TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and manage their own events" ON public.events
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- 3. Budget Items Table
CREATE TABLE IF NOT EXISTS public.budget_items (
  id TEXT PRIMARY KEY DEFAULT ('bgt_' || uuid_generate_v4()::TEXT),
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  allocated_amount NUMERIC NOT NULL DEFAULT 0,
  actual_amount NUMERIC NOT NULL DEFAULT 0,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and manage their event budget items" ON public.budget_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = budget_items.event_id
      AND (events.user_id = auth.uid() OR events.user_id IS NULL)
    )
  );

-- 4. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY DEFAULT ('tsk_' || uuid_generate_v4()::TEXT),
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and manage their event tasks" ON public.tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = tasks.event_id
      AND (events.user_id = auth.uid() OR events.user_id IS NULL)
    )
  );

-- 5. Vendors Table
CREATE TABLE IF NOT EXISTS public.vendors (
  id TEXT PRIMARY KEY DEFAULT ('vnd_' || uuid_generate_v4()::TEXT),
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  vendor_type TEXT NOT NULL,
  name TEXT,
  estimated_budget NUMERIC DEFAULT 0,
  actual_quote NUMERIC,
  status TEXT DEFAULT 'needed' CHECK (status IN ('needed', 'shortlisted', 'contacted', 'quote_received', 'confirmed', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and manage their event vendors" ON public.vendors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = vendors.event_id
      AND (events.user_id = auth.uid() OR events.user_id IS NULL)
    )
  );

-- 6. Vendor Checklist Items Table
CREATE TABLE IF NOT EXISTS public.vendor_checklist_items (
  id TEXT PRIMARY KEY DEFAULT ('vnc_' || uuid_generate_v4()::TEXT),
  vendor_id TEXT REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vendor_checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage vendor checklists" ON public.vendor_checklist_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.vendors
      JOIN public.events ON events.id = vendors.event_id
      WHERE vendors.id = vendor_checklist_items.vendor_id
      AND (events.user_id = auth.uid() OR events.user_id IS NULL)
    )
  );

-- 7. Ideas Table
CREATE TABLE IF NOT EXISTS public.ideas (
  id TEXT PRIMARY KEY DEFAULT ('ida_' || uuid_generate_v4()::TEXT),
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('theme', 'decor', 'food', 'activity', 'entertainment', 'guest_experience', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reason TEXT NOT NULL,
  is_saved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage event ideas" ON public.ideas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = ideas.event_id
      AND (events.user_id = auth.uid() OR events.user_id IS NULL)
    )
  );

-- 8. AI Messages Table
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id TEXT PRIMARY KEY DEFAULT ('msg_' || uuid_generate_v4()::TEXT),
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view event AI conversations" ON public.ai_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = ai_messages.event_id
      AND (events.user_id = auth.uid() OR events.user_id IS NULL)
    )
  );
