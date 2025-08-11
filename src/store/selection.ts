import { defineStore } from "pinia";

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
  },
});
