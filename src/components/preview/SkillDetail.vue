<template>
    <div class="skill-detail">
      <h3 class="detail-title">SKILL DETAILS</h3>
      
      <div class="detail-content">
        <!-- スキルが選択されている場合 -->
        <div v-if="skill" class="skill-details">
          <div class="skill-header">
            <h4 class="skill-name">{{ skill.name }}</h4>
            <div class="skill-category">
              <span class="category-label">Category:</span>
              <span class="category-value">{{ formatCategoryName(skill.category) }}</span>
            </div>
          </div>
          
          <div class="skill-description-container">
            <h5 class="description-title">Description</h5>
            <div class="skill-description-scroll">
              <p class="skill-description">{{ skill.description }}</p>
            </div>
          </div>
        </div>
  
        <!-- カテゴリーが選択されているが、そのカテゴリーにスキルがない場合 -->
        <div v-else-if="selectedCategory && categorySkillsCount === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <h4 class="empty-title">No Skills Available</h4>
          <p class="empty-message">
            There are no skills in the "{{ formatCategoryName(selectedCategory) }}" category.
          </p>
        </div>
  
        <!-- カテゴリーが選択されているが、スキルが選択されていない場合 -->
        <div v-else-if="selectedCategory" class="no-selection-state">
          <div class="no-selection-icon">👈</div>
          <h4 class="no-selection-title">Select a Skill</h4>
          <p class="no-selection-message">
            Choose a skill from the list to view its details.
          </p>
        </div>
  
        <!-- カテゴリーが選択されていない場合 -->
        <div v-else class="initial-state">
          <div class="initial-icon">📚</div>
          <h4 class="initial-title">Skill Details</h4>
          <p class="initial-message">
            Select a category and skill to view detailed information.
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import type { SkillItem } from '@/api/preview';
  
  // Props
  interface Props {
    skill: SkillItem | null;
    selectedCategory: string;
    categorySkillsCount?: number;
  }
  
  defineProps<Props>();
  
  // Methods
  function formatCategoryName(category: string): string {
    switch (category) {
      case 'technology_skills':
        return 'Technology Skills';
      case 'skills':
        return 'Skills';
      case 'knowledge':
        return 'Knowledge';
      default:
        return category
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
    }
  }
  </script>
  
  <style scoped lang="scss">
  @use "@/styles/variables.scss" as *;
  
  .skill-detail {
    background: $color-white;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .detail-title {
    margin: 0;
    padding: $space-4 $space-5;
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: $color-text-secondary;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: $color-gray-50;
    border-bottom: $border-width solid $color-border;
  }
  
  .detail-content {
    flex: 1;
    overflow-y: auto;
    padding: $space-5;
  }
  
  /* Skill Details */
  .skill-details {
    height: 100%;
    display: flex;
    flex-direction: column;
    animation: fadeIn 0.3s ease-out;
  }
  
  .skill-header {
    margin-bottom: $space-5;
    padding-bottom: $space-4;
    border-bottom: $border-width solid $color-border-light;
  }
  
  .skill-name {
    margin: 0 0 $space-3 0;
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    color: $color-text;
    line-height: $line-height-tight;
  }
  
  .skill-category {
    display: flex;
    align-items: center;
    gap: $space-2;
    font-size: $font-size-sm;
  }
  
  .category-label {
    color: $color-text-secondary;
    font-weight: $font-weight-medium;
  }
  
  .category-value {
    color: $color-primary;
    font-weight: $font-weight-medium;
    background: $color-primary-light;
    padding: 2px 8px;
    border-radius: $radius-sm;
    font-size: $font-size-xs;
  }
  
  .skill-description-container {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .description-title {
    margin: 0 0 $space-3 0;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
    color: $color-text;
  }
  
  .skill-description-scroll {
    flex: 1;
    overflow-y: auto;
    max-height: 400px;
    padding-right: $space-2;
    
    /* カスタムスクロールバー */
    &::-webkit-scrollbar {
      width: 6px;
    }
  
    &::-webkit-scrollbar-track {
      background: $color-gray-100;
      border-radius: 3px;
    }
  
    &::-webkit-scrollbar-thumb {
      background: $color-gray-300;
      border-radius: 3px;
  
      &:hover {
        background: $color-gray-400;
      }
    }
  }
  
  .skill-description {
    margin: 0;
    color: $color-text;
    line-height: $line-height-relaxed;
    font-size: $font-size-sm;
  }
  
  /* States */
  .empty-state,
  .no-selection-state,
  .initial-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    height: 100%;
    min-height: 200px;
  }
  
  .empty-icon,
  .no-selection-icon,
  .initial-icon {
    font-size: 32px;
    margin-bottom: $space-4;
  }
  
  .empty-title,
  .no-selection-title,
  .initial-title {
    margin: 0 0 $space-3 0;
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $color-text;
  }
  
  .empty-message,
  .no-selection-message,
  .initial-message {
    margin: 0;
    color: $color-text-secondary;
    font-size: $font-size-sm;
    line-height: $line-height-relaxed;
    max-width: 300px;
  }
  
  /* アニメーション */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* レスポンシブ対応 */
  @media (max-width: $breakpoint-md) {
    .detail-title {
      padding: $space-3 $space-4;
      font-size: $font-size-xs;
    }
    
    .detail-content {
      padding: $space-4;
    }
    
    .skill-name {
      font-size: $font-size-lg;
    }
    
    .skill-category {
      font-size: $font-size-xs;
    }
    
    .description-title {
      font-size: $font-size-sm;
    }
    
    .skill-description {
      font-size: $font-size-xs;
    }
    
    .skill-description-scroll {
      max-height: 250px;
    }
    
    .empty-title,
    .no-selection-title,
    .initial-title {
      font-size: $font-size-base;
    }
    
    .empty-message,
    .no-selection-message,
    .initial-message {
      font-size: $font-size-xs;
    }
  }
</style>