import { defineStore } from "pinia";

const safeSession: Storage | undefined =
  typeof window !== "undefined" ? window.sessionStorage : undefined;

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
}, {
  persist: {
    key: "selection-cache",
    storage: safeSession,
  },
});