// src/utils/skillTransform.ts
import type { SkillItem } from '@/api/preview';

/**
 * Technology Skillsのスキルを変換する
 * Skills → Categories
 * Skill Details (カンマ分解) → Skills
 * Skill名 → 新しいSkill Details
 */
export function transformTechnologySkills(skills: SkillItem[]): SkillItem[] {
  // Technology Skillsのみを対象（他のカテゴリーは削除）
  const techSkills = skills.filter(s => 
    s.category === 'technology_skills' || s.category === 'Technology Skills'
  );
  
  const transformed: SkillItem[] = [];
  
  // Technology Skillsを変換
  for (const skill of techSkills) {
    // Skill名を新しいCategoryとして使用
    const newCategory = skill.name;
    
    // Descriptionをカンマで分解して新しいSkillsを作成
    const detailParts = skill.description
      .split(',')
      .map(part => part.trim())
      .filter(part => part.length > 0);
    
    // 各分解されたパーツを新しいSkillとして追加
    for (const part of detailParts) {
      transformed.push({
        category: newCategory,
        name: part,
        description: newCategory // カテゴリー名をDescriptionとして使用
      });
    }
  }
  
  // 他のカテゴリー（Skills, Knowledge）は含めない
  return transformed;
}

/**
 * 変換されたスキルから利用可能なカテゴリーを抽出
 */
export function getTransformedCategories(transformedSkills: SkillItem[]): string[] {
  const categories = new Set<string>();
  for (const skill of transformedSkills) {
    categories.add(skill.category);
  }
  return Array.from(categories);
}