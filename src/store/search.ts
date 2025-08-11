import { defineStore } from "pinia";
import type { Occupation } from "@/api/occupations";

const safeSession: Storage | undefined =
  typeof window !== "undefined" ? window.sessionStorage : undefined;

export const useSearchStore = defineStore("search", {
  state: () => ({
    keywords: [] as string[],
    results: [] as Occupation[],
  }),
  actions: {
    setKeywords(k: string[]) { this.keywords = k; },
    setResults(r: Occupation[]) { this.results = r; },
    clear() { this.keywords = []; this.results = []; },
  },
  persist: {
    key: "search-cache",
    storage: safeSession,
    paths: ["keywords", "results"],
  },
});
