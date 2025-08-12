import { defineStore } from "pinia";

const safeSession: Storage | undefined =
  typeof window !== "undefined" ? window.sessionStorage : undefined;

export const useSearchStore = defineStore("search", {
  state: () => ({
    k1: "" as string,
    k2: "" as string,
    k3: "" as string,
    // 必要なら結果も保持したい場合は↓を有効化
    // results: [] as Occupation[],
  }),
  actions: {
    setKeywords(k1: string, k2: string, k3: string) {
      this.k1 = k1; this.k2 = k2; this.k3 = k3;
    },
    clearKeywords() {
      this.k1 = this.k2 = this.k3 = "";
    },
  },
  persist: {
    key: "search-keywords",
    storage: safeSession,        // タブごとに独立。タブを閉じると消える
    paths: ["k1", "k2", "k3"],   // 結果は永続化しない（必要なら paths に追加）
  },
});
