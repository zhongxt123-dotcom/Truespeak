export type DialogueVersionLabel = "best" | "raw" | "sarcastic" | "concise" | "cinematic";

export type DialogueInput = {
  sourceText: string;
  targetLocale: "US" | "UK" | "AU" | "CA";
  genre: string;
  character: {
    name: string;
    age: string;
    identity: string;
    personality: string;
    speechStyle: string;
  };
  scene: {
    context: string;
    relationship: string;
    powerDynamic: string;
    stakes: string;
  };
  emotion: {
    primary: string;
    secondary: string;
    intensity: number;
  };
  outputPreferences: {
    profanityLevel: number;
    slangLevel: number;
    literalness: number;
    versions: DialogueVersionLabel[];
  };
};

export type RagReference = {
  id: string;
  text: string;
  meaning: string;
  region: string;
  tone: string[];
  sceneType: string;
  formality: string;
  intensity: number;
  notes: string;
};

export type DialogueVersion = {
  label: DialogueVersionLabel;
  line: string;
  tone: string;
  whyItWorks: string;
  literalness: number;
  intensity: number;
  qa?: DialogueQaResult;
};

export type DialogueQaResult = {
  pass: boolean;
  score: number;
  backTranslation: string;
  lostMeaning: string[];
  addedMeaning: string[];
  naturalnessScore: number;
  emotionMatchScore: number;
  plotAccuracyScore: number;
  revisionInstruction: string;
};

export type DialogueGeneration = {
  id: string;
  provider: string;
  model: string;
  best: DialogueVersion;
  alternatives: DialogueVersion[];
  slangNotes: Array<{
    phrase: string;
    meaning: string;
    risk: string;
  }>;
  meaningPreserved: string[];
  meaningChanged: string[];
  warnings: string[];
  references: RagReference[];
  createdAt: string;
};

export type FeedbackPayload = {
  generationId: string;
  chosenLine: string;
  editedLine?: string;
  rating: number;
  note?: string;
};
