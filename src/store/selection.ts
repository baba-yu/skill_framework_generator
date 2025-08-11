import { defineStore } from "pinia";

const safeSession: Storage | undefined =
  typeof window !== "undefined" ? window.sessionStorage : undefined;
// ずっと残したければ localStorage に差し替え可
// const safeLocal: Storage | undefined = typeof window !== "undefined" ? window.localStorage : undefined;

export const useSelectionStore = defineStore("selection", {
  state: () => ({
    selectedCodes: [] as string[],
  }),
  actions: {
    toggleSelection(code: string) {
      if (this.selectedCodes.includes(code)) {
        this.selectedCodes = this.selectedCodes.filter(c => c !== code);
      } else {
        this.selectedCodes.push(code);
      }
    },
    clearSelection() {
      this.selectedCodes = [];
    },
    setSelectedCodes(codes: string[]) {
      this.selectedCodes = codes;
    },
  },
  persist: {
    key: "selection-cache",
    storage: safeSession,         // ← 未定義ならプラグイン側でスキップされる
    paths: ["selectedCodes"],     // 念のため対象キーを限定
  },
});
