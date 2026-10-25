import { NextRequest, NextResponse } from 'next/server';
import { generateAIEventBlueprint } from '@/lib/gemini';
import { PlanoraEvent } from '@/types';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const event = body.event as PlanoraEvent;

    if (!event) {
      return NextResponse.json({ error: 'Event data is required in request body' }, { status: 400 });
    }

    // Call Gemini Blueprint Generator
    const blueprint = await generateAIEventBlueprint(event);

    return NextResponse.json({
      success: true,
      eventId: id,
      blueprint,
    });
  } catch (error) {
    console.error('Error generating AI plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate event blueprint' },
      { status: 500 }
    );
  }
}
