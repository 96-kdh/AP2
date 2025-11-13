import type { Part } from "./a2aTypes";

export function extractTextParts(parts: Part[]): string[] {
  return parts
    .filter((p) => p.text_part)
    .map((p) => p.text_part!.text);
}

export function extractDataParts(parts: Part[]): Array<Record<string, unknown>> {
  return parts
    .filter((p) => p.data_part)
    .map((p) => {
      const d = p.data_part!;
      return { [d.key]: d.data };
    });
}

export function findDataPart<T>(
  key: string,
  dataParts: Array<Record<string, unknown>>,
): T | undefined {
  for (const part of dataParts) {
    if (key in part) {
      return part[key] as T;
    }
  }
  return undefined;
}
