import { defineStore } from "pinia";
import type { Occupation } from "@/api/occupations";

const storage = typeof window !== "undefined" ? window.sessionStorage : undefined;

export const useSearchStore = defineStore("search", {
  state: () => ({
    keywords: [] as string[],
    results: [] as Occupation[],
  }),
  actions: {
    setKeywords(k: string[]) { 
      this.keywords = k.slice(0, 3);
    },
    addKeyword(keyword: string) {
      const trimmed = keyword.trim();
      if (trimmed && !this.keywords.includes(trimmed) && this.keywords.length < 3) {
        this.keywords.push(trimmed);
      }
    },
    removeKeyword(index: number) {
      if (index >= 0 && index < this.keywords.length) {
        this.keywords.splice(index, 1);
      }
    },
    clearKeywords() {
      this.keywords = [];
    },
    setResults(r: Occupation[]) { 
      this.results = r; 
    },
    clear() { 
      this.keywords = []; 
      this.results = []; 
    },
  },
  persist: {
    key: "search-cache",
    storage,
  },
});