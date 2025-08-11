// src/api/preview.ts
import axios from "axios";

export interface SkillItem {
  category: string; // 例: "technology_skills" | "skills" | "knowledge"
  name: string;
  description: string;
}

export async function fetchFrameworkPreviewAll(codes: string[]): Promise<SkillItem[]> {
  const { data } = await axios.post(
    "https://apitest.sandbox-zipteam.us/framework-preview",
    { codes },
    { headers: { Accept: "application/json", "Content-Type": "application/json" } }
  );

  const out: SkillItem[] = [];
  for (const [key, value] of Object.entries<any>(data ?? {})) {
    if (Array.isArray(value)) {
      for (const it of value) {
        if (!it || typeof it.name !== "string" || typeof it.description !== "string") continue;
        out.push({ category: key, name: it.name, description: it.description });
      }
    }
  }
  return out;
}
