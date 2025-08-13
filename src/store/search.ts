// src/store/search.ts
import { defineStore } from "pinia";
import type { Occupation } from "@/api/occupations";

const storage =
  typeof window !== "undefined" ? window.sessionStorage : undefined;

export const useSearchStore = defineStore("search", {
  state: () => ({
    keywords: [] as string[],          // キーワードタグを永続化
    results: [] as Occupation[],       // 検索結果も保持
  }),
  actions: {
    setKeywords(k: string[]) { 
      this.keywords = k.slice(0, 3); // 最大3つまで
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
    paths: ["keywords", "results"],    // キーワードと結果を永続化
  },
});