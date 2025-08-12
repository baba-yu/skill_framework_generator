// src/store/search.ts
import { defineStore } from "pinia";
import type { Occupation } from "@/api/occupations";

const storage =
  typeof window !== "undefined" ? window.sessionStorage : undefined;

export const useSearchStore = defineStore("search", {
  state: () => ({
    keywords: [] as string[],          // ← 配列で保持
    results: [] as Occupation[],       // ← 検索結果も保持
  }),
  actions: {
    setKeywords(k: string[]) { this.keywords = k.slice(0, 3); },
    setResults(r: Occupation[]) { this.results = r; },
    clear() { this.keywords = []; this.results = []; },
  },
  persist: {
    key: "search-cache",
    storage,
    paths: ["keywords", "results"],    // ← 配列keywordsと結果を永続化
  },
});
