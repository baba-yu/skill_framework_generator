<template>
    <div class="skill-list">
      <h3 class="skills-title">SKILLS</h3>
      
      <div class="skills-content">
        <!-- スキルがある場合 -->
        <div v-if="skills.length > 0" class="skills-list">
          <button
            v-for="skill in skills"
            :key="skill.name"
            class="skill-item"
            :class="{ active: selectedSkill?.name === skill.name }"
            @click="$emit('select', skill)"
          >
            <span class="skill-name">{{ skill.name }}</span>
          </button>
        </div>
  
        <!-- カテゴリーが選択されているが、スキルがない場合 -->
        <div v-else-if="selectedCategory && !isLoading" class="empty-state">
          <div class="empty-icon">📝</div>
          <p class="empty-message">No skills available in this category</p>
        </div>
  
        <!-- カテゴリーが選択されていない場合 -->
        <div v-else-if="!selectedCategory && !isLoading" class="no-selection-state">
          <div class="no-selection-icon">👆</div>
          <p class="no-selection-message">Select a category to view skills</p>
        </div>
  
        <!-- ローディング状態 -->
        <div v-else class="loading-state">
          <div class="loading">
            <div class="loading-dots">
              <span class="loading-dot"></span>
              <span class="loading-dot"></span>
              <span class="loading-dot"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import type { SkillItem } from '@/api/preview';
  
  // Props
  interface Props {
    skills: SkillItem[];
    selectedSkill: SkillItem | null;
    selectedCategory: string;
    isLoading?: boolean;
  }
  
  defineProps<Props>();
  
  // Emits
  interface Emits {
    (e: 'select', skill: SkillItem): void;
  }
  
  defineEmits<Emits>();
  </script>
  
  <style scoped lang="scss">
  @use "@/styles/variables.scss" as *;
  
  .skill-list {
    background: $color-white;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .skills-title {
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
  
  .skills-content {
    flex: 1;
    overflow-y: auto;
  }
  
  /* Skills List */
  .skills-list {
    display: flex;
    flex-direction: column;
  }
  
  .skill-item {
    background: none;
    border: none;
    padding: $space-3 $space-5;
    text-align: left;
    cursor: pointer;
    color: $color-text;
    font-size: $font-size-sm;
    font-weight: $font-weight-normal;
    transition: $transition-colors;
    border-bottom: $border-width solid $color-border-light;
    
    &:hover {
      background: $color-gray-50;
    }
    
    &.active {
      background: $color-primary-light;
      color: $color-primary;
      font-weight: $font-weight-medium;
      border-right: 3px solid $color-primary;
    }
    
    &:focus-visible {
      outline: none;
      background: $color-gray-100;
    }
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .skill-name {
    display: block;
    line-height: $line-height-normal;
  }
  
  /* States */
  .empty-state,
  .no-selection-state,
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    padding: $space-4;
    text-align: center;
  }
  
  .empty-icon,
  .no-selection-icon {
    font-size: 24px;
    margin-bottom: $space-2;
  }
  
  .empty-message,
  .no-selection-message {
    margin: 0;
    color: $color-text-secondary;
    font-size: $font-size-sm;
    line-height: $line-height-relaxed;
  }
  
  .loading {
    display: flex;
    align-items: center;
    gap: $space-2;
    color: $color-text-secondary;
  }
  
  .loading-dots {
    display: flex;
    gap: $space-1;
  }
  
  .loading-dot {
    width: 6px;
    height: 6px;
    background: currentColor;
    border-radius: 50%;
    animation: loadingDot 1.4s infinite ease-in-out;
  
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
    &:nth-child(3) { animation-delay: 0s; }
  }
  
  @keyframes loadingDot {
    0%, 80%, 100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    40% {
      transform: scale(1.2);
      opacity: 1;
    }
  }
  
  /* スキルリストのアニメーション */
  .skills-list {
    animation: fadeIn 0.2s ease-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* レスポンシブ対応 */
  @media (max-width: $breakpoint-md) {
    .skills-title {
      padding: $space-3 $space-4;
      font-size: $font-size-xs;
    }
    
    .skill-item {
      padding: $space-2 $space-4;
      font-size: $font-size-xs;
    }
    
    .empty-state,
    .no-selection-state,
    .loading-state {
      height: 150px;
      padding: $space-3;
    }
    
    .empty-message,
    .no-selection-message {
      font-size: $font-size-xs;
    }
  }
  </style>