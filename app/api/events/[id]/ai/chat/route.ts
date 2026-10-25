import { NextRequest, NextResponse } from "next/server";
import { askAICopilot } from "@/lib/gemini";
import { chatRequestSchema } from "@/lib/validation/event";
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Send a valid JSON request." },
      { status: 400 },
    );
  }
  const { id } = await context.params;
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success || parsed.data.event.id !== id)
    return NextResponse.json(
      { error: "Check your message and event details, then try again." },
      { status: 400 },
    );
  const { event, message, ...planning } = parsed.data;
  if (
    [
      ...planning.budgets,
      ...planning.tasks,
      ...planning.vendors,
      ...planning.ideas,
    ].some((item) => item.event_id !== id)
  )
    return NextResponse.json(
      { error: "Planning items must belong to this event." },
      { status: 400 },
    );
  try {
    return NextResponse.json({
      success: true,
      eventId: id,
      reply: await askAICopilot(event, planning, message),
    });
  } catch {
    return NextResponse.json(
      { error: "Your planning companion could not respond. Please try again." },
      { status: 502 },
    );
  }
}
