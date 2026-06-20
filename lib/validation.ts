import { z } from "zod";
import type { DialogueInput } from "@/types/dialogue";

export const dialogueInputSchema = z.object({
  sourceText: z.string().min(1),
  targetLocale: z.enum(["US", "UK", "AU", "CA"]),
  genre: z.string().min(1),
  character: z.object({
    name: z.string(),
    age: z.string(),
    identity: z.string(),
    personality: z.string(),
    speechStyle: z.string()
  }),
  scene: z.object({
    context: z.string(),
    relationship: z.string(),
    powerDynamic: z.string(),
    stakes: z.string()
  }),
  emotion: z.object({
    primary: z.string(),
    secondary: z.string(),
    intensity: z.number().min(1).max(5)
  }),
  outputPreferences: z.object({
    versions: z.array(z.enum(["best", "raw", "sarcastic", "concise", "cinematic"])).min(1),
    profanityLevel: z.number().min(0).max(5),
    slangLevel: z.number().min(0).max(5),
    literalness: z.number().min(1).max(5)
  })
}) satisfies z.ZodType<DialogueInput>;

export const feedbackSchema = z.object({
  generationId: z.string(),
  chosenLine: z.string(),
  editedLine: z.string().optional(),
  rating: z.number().min(1).max(5),
  note: z.string().optional()
});
