import { NextRequest, NextResponse } from "next/server";
import { generateAIBlueprintWithFallback } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import {
  eventContextSchema,
  validateBlueprintForEvent,
} from "@/lib/validation/event";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  // Rate limiting (30 requests / minute per IP)
  const clientIp =
    req.headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers?.get?.("x-real-ip") ||
    "127.0.0.1";

  const rateCheck = checkRateLimit(`gen-plan:${clientIp}`, 30, 60 * 1000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many plan generation requests. Please wait a moment." },
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
  const parsed = eventContextSchema.safeParse(body?.event);
  if (!parsed.success || parsed.data.id !== id) {
    return NextResponse.json(
      { error: "Check your event details and try again." },
      { status: 400 },
    );
  }

  try {
    const result = await generateAIBlueprintWithFallback(parsed.data);
    const validatedBlueprint = validateBlueprintForEvent(
      result.blueprint,
      parsed.data,
    );

    return NextResponse.json({
      success: true,
      eventId: id,
      blueprint: validatedBlueprint,
      mode: process.env.GEMINI_API_KEY ? "ai" : "demo",
      aiStatus: result.mode,
      modelUsed: result.modelUsed,
    });
  } catch (err) {
    console.error("[generate-plan] Unhandled blueprint generation error:", err);
    return NextResponse.json(
      { error: "We could not prepare a valid plan. Please try again." },
      { status: 502 },
    );
  }
}
