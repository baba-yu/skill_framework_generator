// src/store/framework.ts
import { defineStore } from 'pinia';
import type { SkillItem } from '@/api/preview';
import { transformTechnologySkills } from '@/utils/skillTransform';

export const useFrameworkStore = defineStore('framework', {
  state: () => ({
    originalSkills: [] as SkillItem[],
    transformedSkills: [] as SkillItem[],
    isTransformed: false,
  }),
  
  getters: {
    // 現在表示するスキルデータ
    currentSkills: (state): SkillItem[] => {
      return state.isTransformed ? state.transformedSkills : state.originalSkills;
    },
    
    // 変換可能かチェック（Technology Skillsが存在するか）
    canTransform: (state): boolean => {
      return state.originalSkills.some(skill => 
        skill.category === 'technology_skills' || skill.category === 'Technology Skills'
      );
    },
  },
  
  actions: {
    // オリジナルスキルをセット
    setOriginalSkills(skills: SkillItem[]) {
      this.originalSkills = skills;
      this.isTransformed = false;
      this.transformedSkills = [];
    },
    
    // Technology Skillsを変換
    transformSkills() {
      if (!this.canTransform) {
        console.warn('No technology_skills to transform');
        return;
      }
      
      this.transformedSkills = transformTechnologySkills(this.originalSkills);
      this.isTransformed = true;
    },
    
    // オリジナルに戻す
    revertTransform() {
      this.isTransformed = false;
    },
    
    // リセット
    reset() {
      this.originalSkills = [];
      this.transformedSkills = [];
      this.isTransformed = false;
    },
  },
});