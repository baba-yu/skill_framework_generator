<template>
    <div class="skill-categories">
      <h3 class="categories-title">CATEGORIES</h3>
      
      <div class="categories-content">
        <!-- ローディング状態 -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading">
            <div class="loading-dots">
              <span class="loading-dot"></span>
              <span class="loading-dot"></span>
              <span class="loading-dot"></span>
            </div>
            <span class="loading-text">Loading...</span>
          </div>
        </div>
  
        <!-- エラー状態 -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">⚠️</div>
          <p class="error-message">{{ error }}</p>
        </div>
  
        <!-- カテゴリーリスト -->
        <div v-else-if="categories.length > 0" class="category-list">
          <button
            v-for="category in categories"
            :key="category"
            class="category-item"
            :class="{ active: selectedCategory === category }"
            @click="$emit('select', category)"
          >
            {{ formatCategoryName(category) }}
          </button>
        </div>
  
        <!-- 空状態 -->
        <div v-else class="empty-state">
          <div class="empty-icon">📁</div>
          <p class="empty-message">No categories available</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  // Props
  interface Props {
    categories: string[];
    selectedCategory: string;
    isLoading?: boolean;
    error?: string;
  }
  
  defineProps<Props>();
  
  // Emits
  interface Emits {
    (e: 'select', category: string): void;
  }
  
  defineEmits<Emits>();
  
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
  
  .skill-categories {
    background: $color-white;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .categories-title {
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
  
  .categories-content {
    flex: 1;
    overflow-y: auto;
    padding: $space-4 0;
  }
  
  /* States */
  .loading-state,
  .error-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    padding: $space-4;
    text-align: center;
  }
  
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-3;
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
  
  .loading-text {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }
  
  .error-icon,
  .empty-icon {
    font-size: 24px;
    margin-bottom: $space-2;
  }
  
  .error-message,
  .empty-message {
    margin: 0;
    color: $color-text-secondary;
    font-size: $font-size-sm;
    line-height: $line-height-relaxed;
  }
  
  /* Category List */
  .category-list {
    display: flex;
    flex-direction: column;
  }
  
  .category-item {
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
  
  /* レスポンシブ対応 */
  @media (max-width: $breakpoint-md) {
    .categories-title {
      padding: $space-3 $space-4;
      font-size: $font-size-xs;
    }
    
    .categories-content {
      padding: $space-3 0;
    }
    
    .category-item {
      padding: $space-2 $space-4;
      font-size: $font-size-xs;
    }
    
    .loading-state,
    .error-state,
    .empty-state {
      height: 150px;
      padding: $space-3;
    }
  }
  </style>