import { defineStore } from "pinia";
import type { Occupation } from "@/api/occupations";

const safeSession: Storage | undefined =
  typeof window !== "undefined" ? window.sessionStorage : undefined;

export const useSelectionStore = defineStore("selection", {
  state: () => ({
    selectedCodes: [] as string[],
    selectedOccupations: [] as Occupation[], // 新規追加：選択された職業の完全な情報
  }),
  actions: {
    toggleSelection(code: string) {
      if (this.selectedCodes.includes(code)) {
        // 削除時は両方から削除
        this.selectedCodes = this.selectedCodes.filter((c: string) => c !== code);
        this.selectedOccupations = this.selectedOccupations.filter((occ: Occupation) => occ.code !== code);
      } else {
        // 追加時はコードのみ追加（職業情報は別途addOccupationで追加）
        this.selectedCodes.push(code);
      }
    },
    
    addOccupation(occupation: Occupation) {
      // 重複チェック
      if (!this.selectedOccupations.find(occ => occ.code === occupation.code)) {
        this.selectedOccupations.push(occupation);
      }
    },
    
    removeOccupation(code: string) {
      this.selectedCodes = this.selectedCodes.filter((c: string) => c !== code);
      this.selectedOccupations = this.selectedOccupations.filter((occ: Occupation) => occ.code !== code);
    },
    
    getOccupationByCode(code: string): Occupation | undefined {
      return this.selectedOccupations.find(occ => occ.code === code);
    },
    
    clearSelection() {
      this.selectedCodes = [];
      this.selectedOccupations = [];
    },
    
    setSelectedCodes(codes: string[]) {
      this.selectedCodes = codes;
      // 注意: この場合、selectedOccupationsとの整合性を保つため、
      // 対応する職業情報がない場合は別途処理が必要
    },
    
    // 整合性チェック用（開発時のデバッグに使用）
    validateConsistency() {
      const codesSet = new Set(this.selectedCodes);
      const occupationCodes = new Set(this.selectedOccupations.map(occ => occ.code));
      
      // selectedCodesにあるがselectedOccupationsにない場合を検出
      const missingOccupations = [...codesSet].filter(code => !occupationCodes.has(code));
      if (missingOccupations.length > 0) {
        console.warn('Missing occupation data for codes:', missingOccupations);
      }
      
      // selectedOccupationsにあるがselectedCodesにない場合を検出
      const extraOccupations = [...occupationCodes].filter(code => !codesSet.has(code));
      if (extraOccupations.length > 0) {
        console.warn('Extra occupation data for codes:', extraOccupations);
        // 自動的にクリーンアップ
        this.selectedOccupations = this.selectedOccupations.filter(occ => codesSet.has(occ.code));
      }
    }
  },
  
  getters: {
    // 現在選択されている職業の完全な情報を取得
    allSelectedOccupations: (state) => {
      return state.selectedOccupations.filter(occ => state.selectedCodes.includes(occ.code));
    },
    
    // 選択数
    selectionCount: (state) => state.selectedCodes.length,
    
    // 制限チェック
    isAtLimit: (state) => state.selectedCodes.length >= 10,
  },
  
  persist: {
    key: "selection-cache",
    storage: safeSession,
  },
});