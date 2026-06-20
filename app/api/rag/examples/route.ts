import { NextResponse } from "next/server";
import { defaultDialogueInput } from "@/lib/defaults";
import { retrieveRagExamples } from "@/lib/rag";
import { dialogueInputSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ examples: retrieveRagExamples(defaultDialogueInput, "angry disbelief confrontation", 8) });
}

export async function POST(request: Request) {
  const input = dialogueInputSchema.parse(await request.json());
  return NextResponse.json({ examples: retrieveRagExamples(input, input.sourceText, 8) });
}
