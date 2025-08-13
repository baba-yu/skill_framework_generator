<template>
  <div 
    class="occupation-card"
    :class="{ 
      selected: isSelected,
      'add-mode': !isSelected,
      'remove-mode': isSelected 
    }"
    @click="$emit('toggle')"
  >
    <!-- 選択状態のインジケーター -->
    <div v-if="isSelected" class="selection-indicator">
      <span class="material-symbols-outlined">check_circle</span>
    </div>

    <div class="card-content">
      <!-- ヘッダー部分 -->
      <div class="card-header">
        <div class="title-section">
          <h3 class="occupation-title">{{ occupation.title }}</h3>
          <span class="occupation-code">{{ occupation.code }}</span>
        </div>
        
        <div class="status-section">
          <div class="status-indicator">
            <span v-if="isSelected" class="status-text status-added">Added!</span>
            <span v-else class="status-text status-add">Add to your framework</span>
          </div>
        </div>
      </div>
      
      <!-- 説明部分 -->
      <div class="card-body">
        <div class="description-container">
          <p class="occupation-description">{{ occupation.description }}</p>
        </div>
      </div>
    </div>

    <!-- ホバー時のアクションヒント -->
    <div class="action-hint">
      <span v-if="isSelected">Click to remove</span>
      <span v-else>Click to add</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Occupation } from '@/api/occupations';

defineProps<{
  occupation: Occupation;
  isSelected: boolean;
}>();

defineEmits<{
  toggle: [];
}>();
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;

.occupation-card {
  position: relative;
  background: $color-bg-card;
  border: $border-width-thick solid $color-border;
  border-radius: $radius-lg;
  padding: $space-5;
  cursor: pointer;
  transition: $transition-colors, $transition-shadow, $transition-transform;
  overflow: hidden;
  display: flex;
  min-height: 140px;

  // ホバー効果
  &:hover {
    border-color: $color-primary;
    box-shadow: $shadow-card-hover;
    transform: translateY(-2px);

    .action-hint {
      opacity: 1;
      transform: translateY(0);
    }
  }

  // フォーカス効果
  &:focus-visible {
    outline: none;
    box-shadow: $shadow-focus;
  }

  // 選択状態
  &.selected {
    border-color: $color-primary;
    background: $color-primary-light;
    
    &:hover {
      border-color: $color-primary-hover;
      box-shadow: $shadow-card-hover;
    }
  }

  // アニメーション
  &.add-mode {
    .status-text {
      color: $color-primary;
    }
  }

  &.remove-mode {
    .status-text {
      color: $color-success;
    }
  }
}

.selection-indicator {
  position: absolute;
  top: $space-3;
  right: $space-3;
  color: $color-primary;
  z-index: 2;
  opacity: 0;
  animation: checkFadeIn 0.3s ease-out forwards;

  .material-symbols-outlined {
    font-size: 24px;
  }
}

@keyframes checkFadeIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $space-4;
  position: relative;
  z-index: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: $space-4;
}

.title-section {
  flex: 1;
  min-width: 0; // flexboxの縮小を許可
}

.occupation-title {
  margin: 0 0 $space-2 0;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $color-text;
  line-height: $line-height-tight;
  word-wrap: break-word;
}

.occupation-code {
  display: inline-block;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  color: $color-text-secondary;
  background: $color-gray-100;
  padding: 2px 6px;
  border-radius: $radius-sm;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-section {
  flex-shrink: 0;
}

.status-indicator {
  text-align: right;
}

.status-text {
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 8px;
  border-radius: $radius-sm;
  transition: $transition-colors;

  &.status-add {
    color: $color-primary;
    background: rgba(26, 115, 232, 0.1);
  }

  &.status-added {
    color: $color-success;
    background: $color-success-light;
  }
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.description-container {
  flex: 1;
  overflow: hidden;
}

.occupation-description {
  margin: 0;
  color: $color-text-secondary;
  line-height: $line-height-relaxed;
  font-size: $font-size-sm;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-hint {
  position: absolute;
  bottom: $space-3;
  right: $space-3;
  background: $color-gray-900;
  color: $color-white;
  padding: 4px 8px;
  border-radius: $radius-sm;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  opacity: 0;
  transform: translateY(4px);
  transition: $transition-fast;
  pointer-events: none;
  z-index: 3;
}

/* レスポンシブ対応 */
@media (max-width: $breakpoint-lg) {
  .occupation-card {
    padding: $space-4;
    min-height: 120px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: $space-2;
  }

  .status-section {
    align-self: flex-end;
  }
}

@media (max-width: $breakpoint-md) {
  .occupation-card {
    padding: $space-3;
    min-height: 100px;

    &:hover {
      transform: none; // モバイルではtransformを無効化
    }
  }

  .occupation-title {
    font-size: $font-size-base;
  }

  .occupation-description {
    -webkit-line-clamp: 3;
    font-size: $font-size-xs;
  }

  .selection-indicator .material-symbols-outlined {
    font-size: 20px;
  }

  .action-hint {
    display: none; // モバイルでは非表示
  }
}

/* ダークモード対応の準備 */
@media (prefers-color-scheme: dark) {
  /* 将来のダークモード実装用 */
}

/* 高コントラストモード */
@media (prefers-contrast: high) {
  .occupation-card {
    border-width: 2px;
    
    &:hover {
      border-width: 3px;
    }
  }
}

/* アニメーション削減設定 */
@media (prefers-reduced-motion: reduce) {
  .occupation-card {
    transition: none;
    
    &:hover {
      transform: none;
    }
  }
  
  .selection-indicator {
    animation: none;
    opacity: 1;
  }
}
</style>