import { NextRequest, NextResponse } from 'next/server';
import { eventFormSchema } from '@/lib/validation/event';
import { PlanoraEvent } from '@/types';

// Mock in-memory store for server-side if database isn't connected
const serverEvents: PlanoraEvent[] = [];

export async function GET() {
  return NextResponse.json({ events: serverEvents });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = eventFormSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.format() },
        { status: 400 }
      );
    }

    const data = validated.data;
    const newEvent: PlanoraEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: data.name,
      event_type: data.event_type,
      event_date: data.event_date,
      location: data.location,
      guest_count: data.guest_count,
      total_budget: data.total_budget,
      theme: data.theme,
      food_preference: data.food_preference,
      venue_type: data.venue_type,
      cultural_preference: data.cultural_preference,
      special_requirements: data.special_requirements,
      notes: data.notes,
      created_at: new Date().toISOString(),
    };

    serverEvents.unshift(newEvent);

    return NextResponse.json({ success: true, event: newEvent }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
