import { NextRequest, NextResponse } from "next/server";
import { askAICopilotWithFallback } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { chatRequestSchema } from "@/lib/validation/event";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  // Rate limiting (60 requests / minute per IP)
  const clientIp =
    req.headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers?.get?.("x-real-ip") ||
    "127.0.0.1";

  const rateCheck = checkRateLimit(`ai-chat:${clientIp}`, 60, 60 * 1000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many messages sent. Please slow down and try again shortly." },
      { status: 429 },
    );
  }

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
  if (!parsed.success || parsed.data.event.id !== id) {
    return NextResponse.json(
      { error: "Check your message and event details, then try again." },
      { status: 400 },
    );
  }

  const { event, message, ...planning } = parsed.data;
  if (
    [
      ...planning.budgets,
      ...planning.tasks,
      ...planning.vendors,
      ...planning.ideas,
    ].some((item) => item.event_id !== id)
  ) {
    return NextResponse.json(
      { error: "Planning items must belong to this event." },
      { status: 400 },
    );
  }

  try {
    const result = await askAICopilotWithFallback(event, planning, message);

    return NextResponse.json({
      success: true,
      eventId: id,
      reply: result.reply,
      mode: result.mode,
      modelUsed: result.modelUsed,
    });
  } catch (err) {
    console.error("[ai/chat] Unhandled chat response error:", err);
    return NextResponse.json(
      { error: "Your planning companion could not respond. Please try again." },
      { status: 502 },
    );
  }
}
