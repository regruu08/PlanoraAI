import { NextRequest, NextResponse } from 'next/server';
import { askAICopilot } from '@/lib/gemini';
import { PlanoraEvent, BudgetItem, Task, Vendor, Idea } from '@/types';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const {
      event,
      budgets = [],
      tasks = [],
      vendors = [],
      ideas = [],
      message,
    } = body as {
      event: PlanoraEvent;
      budgets: BudgetItem[];
      tasks: Task[];
      vendors: Vendor[];
      ideas: Idea[];
      message: string;
    };

    if (!message || !event) {
      return NextResponse.json({ error: 'Message and event context are required' }, { status: 400 });
    }

    const reply = await askAICopilot(
      event,
      { budgets, tasks, vendors, ideas },
      message
    );

    return NextResponse.json({
      success: true,
      eventId: id,
      reply,
    });
  } catch (error) {
    console.error('Error in AI copilot chat:', error);
    return NextResponse.json({ error: 'Failed to process AI chat message' }, { status: 500 });
  }
}
