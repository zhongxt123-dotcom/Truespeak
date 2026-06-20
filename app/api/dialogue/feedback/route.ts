import { NextResponse } from "next/server";
import { toErrorMessage } from "@/lib/errors";
import { appendJsonl } from "@/lib/storage";
import { feedbackSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = feedbackSchema.parse(await request.json());
    await appendJsonl("feedback.jsonl", {
      ...payload,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: toErrorMessage(error) }, { status: 500 });
  }
}
