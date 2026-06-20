import type { DialogueGeneration, DialogueInput, DialogueQaResult, RagReference } from "@/types/dialogue";

export const dialogueOutputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    best: {
      type: "object",
      additionalProperties: false,
      properties: {
        label: { type: "string" },
        line: { type: "string" },
        tone: { type: "string" },
        whyItWorks: { type: "string" },
        literalness: { type: "number" },
        intensity: { type: "number" }
      },
      required: ["label", "line", "tone", "whyItWorks", "literalness", "intensity"]
    },
    alternatives: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string" },
          line: { type: "string" },
          tone: { type: "string" },
          whyItWorks: { type: "string" },
          literalness: { type: "number" },
          intensity: { type: "number" }
        },
        required: ["label", "line", "tone", "whyItWorks", "literalness", "intensity"]
      }
    },
    slangNotes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          phrase: { type: "string" },
          meaning: { type: "string" },
          risk: { type: "string" }
        },
        required: ["phrase", "meaning", "risk"]
      }
    },
    meaningPreserved: { type: "array", items: { type: "string" } },
    meaningChanged: { type: "array", items: { type: "string" } },
    warnings: { type: "array", items: { type: "string" } }
  },
  required: ["best", "alternatives", "slangNotes", "meaningPreserved", "meaningChanged", "warnings"]
} as const;

export const qaOutputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    pass: { type: "boolean" },
    score: { type: "number" },
    backTranslation: { type: "string" },
    lostMeaning: { type: "array", items: { type: "string" } },
    addedMeaning: { type: "array", items: { type: "string" } },
    naturalnessScore: { type: "number" },
    emotionMatchScore: { type: "number" },
    plotAccuracyScore: { type: "number" },
    revisionInstruction: { type: "string" }
  },
  required: ["pass", "score", "backTranslation", "lostMeaning", "addedMeaning", "naturalnessScore", "emotionMatchScore", "plotAccuracyScore", "revisionInstruction"]
} as const;

export function buildSearchQueryPrompt(input: DialogueInput) {
  return `Turn this Chinese dialogue task into an English semantic retrieval query. Return one compact paragraph only.\n\nChinese line: ${input.sourceText}\nCharacter: ${JSON.stringify(input.character)}\nScene: ${JSON.stringify(input.scene)}\nEmotion: ${JSON.stringify(input.emotion)}\nTarget locale: ${input.targetLocale}\nGenre: ${input.genre}`;
}

export function buildGenerationSystemPrompt() {
  return `You are a senior dialogue localization writer for contemporary English-language film, streaming series, and narrative games.

Your job is not literal translation. Rewrite the Chinese line into natural spoken English that a native speaker would plausibly say in the scene.

Preserve:
- dramatic intention
- emotional beat
- power dynamic
- character personality
- core plot information

You may change sentence structure, idioms, word order, directness, and implied phrasing. Avoid stiff translationese, formal textbook English, unnatural idioms, over-explaining inside dialogue, copying retrieved examples verbatim, or changing plot facts.

Return JSON only matching the requested schema.`;
}

export function buildGenerationUserPrompt(input: DialogueInput, references: RagReference[]) {
  return `Source Chinese Line:\n${input.sourceText}\n\nTarget Locale:\n${input.targetLocale}\n\nGenre:\n${input.genre}\n\nCharacter:\n${JSON.stringify(input.character, null, 2)}\n\nScene Context:\n${JSON.stringify(input.scene, null, 2)}\n\nEmotion:\n${JSON.stringify(input.emotion, null, 2)}\n\nOutput Preferences:\n${JSON.stringify(input.outputPreferences, null, 2)}\n\nRetrieved Native Reference Expressions. Use these only as style and phrase references; do not copy them verbatim unless they are generic expressions:\n${JSON.stringify(references, null, 2)}\n\nProduce one best version and at least three alternatives. Labels should reflect the requested versions when possible, such as raw, sarcastic, concise, wounded, restrained, or cinematic.`;
}

export function buildQaSystemPrompt() {
  return `You are a bilingual script QA reviewer. Compare the original Chinese line with an English localized line.

Check meaning accuracy, emotional intent, power dynamic, natural spoken English, added facts, and lost meaning.

Scoring rules:
- score must be an integer from 1 to 100.
- naturalnessScore, emotionMatchScore, and plotAccuracyScore must each be an integer from 1 to 5.
- backTranslation must be readable Simplified Chinese.
- pass should be true only when score is 80 or higher and no core plot meaning is lost.

Return JSON only matching the requested schema.`;
}

export function buildQaUserPrompt(input: DialogueInput, englishLine: string) {
  return `Original Chinese:\n${input.sourceText}\n\nScene Context:\n${input.scene.context}\n\nCharacter:\n${JSON.stringify(input.character)}\n\nEmotion:\n${JSON.stringify(input.emotion)}\n\nEnglish localized line:\n${englishLine}`;
}

export function attachQa(output: DialogueGeneration, qaResults: DialogueQaResult[]) {
  const allVersions = [output.best, ...output.alternatives];
  allVersions.forEach((version, index) => {
    version.qa = qaResults[index];
  });
}
