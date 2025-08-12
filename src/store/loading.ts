import { defineStore } from "pinia";

export const useLoadingStore = defineStore("loading", {
  state: () => ({
    loadingKeys: [] as string[],
  }),
  getters: {
    isLoading: (s) => s.loadingKeys.length > 0,
  },
  actions: {
    startLoading(key: string) {
      if (!this.loadingKeys.includes(key)) this.loadingKeys.push(key);
    },
    stopLoading(key: string) {
      this.loadingKeys = this.loadingKeys.filter(k => k !== key);
    },
    resetLoading() {
      this.loadingKeys = [];
    },
  },
});
