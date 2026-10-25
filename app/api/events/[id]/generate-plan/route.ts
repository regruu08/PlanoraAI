import { NextRequest, NextResponse } from "next/server";
import { generateAIEventBlueprint } from "@/lib/gemini";
import {
  eventContextSchema,
  validateBlueprintForEvent,
} from "@/lib/validation/event";
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
  const parsed = eventContextSchema.safeParse(body?.event);
  if (!parsed.success || parsed.data.id !== id)
    return NextResponse.json(
      { error: "Check your event details and try again." },
      { status: 400 },
    );
  try {
    const blueprint = validateBlueprintForEvent(
      await generateAIEventBlueprint(parsed.data),
      parsed.data,
    );
    return NextResponse.json({
      success: true,
      eventId: id,
      blueprint,
      mode: process.env.GEMINI_API_KEY ? "ai" : "demo",
    });
  } catch {
    return NextResponse.json(
      { error: "We could not prepare a valid plan. Please try again." },
      { status: 502 },
    );
  }
}
