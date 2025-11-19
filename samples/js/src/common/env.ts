import fs from "fs";
import path from "path";
import dotenv from "dotenv";

function resolveCandidatePaths(): string[] {
  const cwd = process.cwd();
  const here = __dirname;

  return [
    path.resolve(cwd, ".env"),
    path.resolve(here, "../../.env"),
    path.resolve(here, "../.env"),
  ];
}

function loadFirstEnv(): void {
  const candidates = resolveCandidatePaths();
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      dotenv.config({ path: candidate });
      return;
    }
  }
}

function applyKeyAliases(): void {
  // Accept GOOGLE_API_KEY but map to the names expected by the Gemini SDKs.
  if (!process.env.GOOGLE_GENAI_API_KEY && process.env.GOOGLE_API_KEY) {
    process.env.GOOGLE_GENAI_API_KEY = process.env.GOOGLE_API_KEY;
  }

  if (!process.env.GEMINI_API_KEY && process.env.GOOGLE_GENAI_API_KEY) {
    process.env.GEMINI_API_KEY = process.env.GOOGLE_GENAI_API_KEY;
  }
}

export function loadEnv(): void {
  loadFirstEnv();
  applyKeyAliases();
}
