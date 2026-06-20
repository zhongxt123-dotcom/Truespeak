import type { DialogueInput, RagReference } from "@/types/dialogue";

export const seedExamples: RagReference[] = [
  {
    id: "anger-disbelief-1",
    text: "Are you kidding me right now?",
    meaning: "Expresses sudden disbelief mixed with anger.",
    region: "US",
    tone: ["angry", "disbelief", "casual"],
    sceneType: "confrontation",
    formality: "casual",
    intensity: 4,
    notes: "Good for a sharp first reaction."
  },
  {
    id: "command-1",
    text: "Fix it. Now.",
    meaning: "A blunt command under pressure.",
    region: "US",
    tone: ["angry", "commanding", "impatient"],
    sceneType: "power_conflict",
    formality: "casual",
    intensity: 5,
    notes: "Short sentences feel more performable in anger."
  },
  {
    id: "threat-work-1",
    text: "Make it happen, or find another job.",
    meaning: "Threatens someone's job if they do not solve the problem.",
    region: "US",
    tone: ["threatening", "entitled", "commanding"],
    sceneType: "workplace_conflict",
    formality: "casual",
    intensity: 5,
    notes: "Useful for boss-to-assistant power dynamics."
  },
  {
    id: "sarcasm-1",
    text: "Wow. Great timing.",
    meaning: "Sarcastically criticizes timing.",
    region: "US",
    tone: ["sarcastic", "hurt", "annoyed"],
    sceneType: "relationship_conflict",
    formality: "casual",
    intensity: 3,
    notes: "Compact and actor-friendly."
  },
  {
    id: "hurt-1",
    text: "You really waited until now to tell me?",
    meaning: "Shows hurt and disbelief about a delayed confession.",
    region: "US",
    tone: ["hurt", "disbelief", "restrained"],
    sceneType: "relationship_conflict",
    formality: "casual",
    intensity: 3,
    notes: "Good when vulnerability is present but controlled."
  },
  {
    id: "betrayal-1",
    text: "So I was the last to know.",
    meaning: "Signals betrayal and humiliation after discovering hidden information.",
    region: "US",
    tone: ["hurt", "bitter", "quiet"],
    sceneType: "revelation",
    formality: "casual",
    intensity: 3,
    notes: "Useful when the subtext matters more than the facts."
  },
  {
    id: "defensive-1",
    text: "That's not what I said.",
    meaning: "Defensive correction in a tense conversation.",
    region: "US",
    tone: ["defensive", "controlled", "tense"],
    sceneType: "argument",
    formality: "casual",
    intensity: 2,
    notes: "Common spoken rhythm."
  },
  {
    id: "dismissive-1",
    text: "I don't have time for this.",
    meaning: "Dismisses the situation or person impatiently.",
    region: "US",
    tone: ["dismissive", "impatient", "cold"],
    sceneType: "conflict",
    formality: "casual",
    intensity: 3,
    notes: "Works across workplace and relationship scenes."
  }
];

function scoreExample(input: DialogueInput, example: RagReference, query: string) {
  const haystack = [example.text, example.meaning, example.notes, example.sceneType, example.formality, example.region, ...example.tone].join(" ").toLowerCase();
  const needles = [
    input.targetLocale,
    input.emotion.primary,
    input.emotion.secondary,
    input.scene.relationship,
    input.scene.powerDynamic,
    input.character.identity,
    input.character.personality,
    query
  ].join(" ").toLowerCase().split(/[^a-z0-9']+/).filter(Boolean);

  let score = 0;
  for (const needle of needles) {
    if (needle.length > 2 && haystack.includes(needle)) score += 1;
  }
  if (example.region === input.targetLocale) score += 3;
  score += Math.max(0, 5 - Math.abs(example.intensity - input.emotion.intensity));
  return score;
}

export function retrieveRagExamples(input: DialogueInput, query: string, limit = 6) {
  return [...seedExamples]
    .map((example) => ({ example, score: scoreExample(input, example, query) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ example }) => example);
}
