import { NextResponse } from "next/server";
import { callDeepSeekJson, callDeepSeekText, getModelProvider } from "@/lib/deepseek";
import { toErrorMessage } from "@/lib/errors";
import {
  attachQa,
  buildGenerationSystemPrompt,
  buildGenerationUserPrompt,
  buildQaSystemPrompt,
  buildQaUserPrompt,
  buildSearchQueryPrompt,
  dialogueOutputSchema,
  qaOutputSchema
} from "@/lib/prompts";
import { retrieveRagExamples } from "@/lib/rag";
import { appendJsonl } from "@/lib/storage";
import { dialogueInputSchema } from "@/lib/validation";
import type { DialogueGeneration, DialogueQaResult } from "@/types/dialogue";

export const runtime = "nodejs";
export const maxDuration = 60;

function generationId() {
  return `gen_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const input = dialogueInputSchema.parse(payload);

    const semanticQuery = await callDeepSeekText([
      { role: "system", content: "You write concise English semantic retrieval queries for dialogue localization RAG." },
      { role: "user", content: buildSearchQueryPrompt(input) }
    ]);

    const references = retrieveRagExamples(input, semanticQuery, 6);

    const generated = await callDeepSeekJson<Omit<DialogueGeneration, "id" | "provider" | "model" | "references" | "createdAt">>(
      [
        { role: "system", content: buildGenerationSystemPrompt() },
        { role: "user", content: buildGenerationUserPrompt(input, references) }
      ],
      dialogueOutputSchema
    );

    const versions = [generated.best];
    const qaResults = await Promise.all(
      versions.map((version) =>
        callDeepSeekJson<DialogueQaResult>(
          [
            { role: "system", content: buildQaSystemPrompt() },
            { role: "user", content: buildQaUserPrompt(input, version.line) }
          ],
          qaOutputSchema
        )
      )
    );

    const modelProvider = getModelProvider();
    const output: DialogueGeneration = {
      ...generated,
      id: generationId(),
      provider: modelProvider.provider,
      model: modelProvider.model,
      references,
      createdAt: new Date().toISOString()
    };

    attachQa(output, qaResults);
    await appendJsonl("generations.jsonl", { input, output, semanticQuery });

    return NextResponse.json(output);
  } catch (error) {
    console.error("/api/dialogue/generate 生成失败", error);
    return NextResponse.json({ error: toErrorMessage(error) }, { status: 500 });
  }
}
