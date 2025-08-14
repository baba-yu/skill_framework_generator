<template>
  <div 
    class="occupation-card"
    :class="{ 
      selected: isSelected,
      'add-mode': !isSelected && !isLimitReached,
      'remove-mode': isSelected,
      'limit-reached': isLimitReached && !isSelected
    }"
  >
    <!-- 左側：タイトル、インフォ、アクション -->
    <div class="card-left">
      <div class="card-content">
        <!-- タイトル列（タイトル+インフォアイコン） -->
        <div class="title-column">
          <h3 class="occupation-title">{{ occupation.title }}</h3>
          <BaseHover 
            :content="occupation.description"
            position="right"
            :delay="300"
            max-width="400px"
          >
            <button 
              class="info-icon"
              aria-label="Show occupation description"
              tabindex="0"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  stroke-width="1.5"
                  fill="none"
                />
                <line 
                  x1="12" 
                  y1="16" 
                  x2="12" 
                  y2="12" 
                  stroke="currentColor" 
                  stroke-width="1.5" 
                  stroke-linecap="round"
                />
                <circle 
                  cx="12" 
                  cy="9" 
                  r="1" 
                  fill="currentColor"
                />
              </svg>
            </button>
          </BaseHover>
        </div>

        <!-- アクション列 -->
        <div class="action-column">
          <button 
            class="toggle-button"
            :class="{ 
              'added': isSelected,
              'disabled': isLimitReached && !isSelected
            }"
            :disabled="isLimitReached && !isSelected"
            :aria-label="isSelected ? 'Remove from framework' : 'Add to framework'"
            @click="$emit('toggle')"
          >
            <!-- アイコン -->
            <div class="toggle-icon-circle">
              <transition name="icon-fade" mode="out-in">
                <!-- 選択済み：マイナスアイコン -->
                <svg 
                  v-if="isSelected" 
                  key="minus"
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none"
                >
                  <path 
                    d="M5 12h14" 
                    stroke="currentColor" 
                    stroke-width="2.5" 
                    stroke-linecap="round"
                  />
                </svg>
                <!-- 制限達成：禁止アイコン -->
                <svg 
                  v-else-if="isLimitReached" 
                  key="banned"
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none"
                >
                  <path 
                    d="m15 9-6 6M9 9l6 6" 
                    stroke="currentColor" 
                    stroke-width="2" 
                    stroke-linecap="round"
                  />
                </svg>
                <!-- 通常：プラスアイコン -->
                <svg 
                  v-else 
                  key="plus"
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none"
                >
                  <path 
                    d="M12 5v14M5 12h14" 
                    stroke="currentColor" 
                    stroke-width="2.5" 
                    stroke-linecap="round"
                  />
                </svg>
              </transition>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- 選択状態のインジケーター -->
    <div v-if="isSelected" class="selection-indicator">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="currentColor"/>
        <path 
          d="M9 12l2 2 4-4" 
          stroke="white" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Occupation } from '@/api/occupations';
import BaseHover from '@/components/base/BaseHover.vue';

interface Props {
  occupation: Occupation;
  isSelected: boolean;
  selectedCount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  selectedCount: 0
});

const isLimitReached = computed(() => 
  props.selectedCount >= 10 && !props.isSelected
);

defineEmits<{
  toggle: [];
}>();
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;

.occupation-card {
  position: relative;
  background: $color-white;
  border: $border-width solid $color-border;
  border-radius: $radius-lg;
  transition: $transition-colors, $transition-shadow;
  overflow: hidden;
  display: flex;
  min-height: 120px;
  padding: $space-4;

  &.selected {
    border-color: $color-primary;
    background: rgba(35, 46, 209, 0.02);
  }

  &.limit-reached {
    opacity: 0.6;
  }

  &:hover:not(.limit-reached) {
    border-color: $color-primary;
    box-shadow: $shadow-card-hover;
  }
}

.card-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-content {
  display: flex;
  align-items: center;
  gap: $space-3;
  width: 100%;
}

.title-column {
  display: flex;
  align-items: center;
  gap: $space-2;
  flex: 1;
  min-width: 0; // テキストのオーバーフロー対応
}

.info-column {
  flex-shrink: 0;
}

.action-column {
  flex-shrink: 0;
}

.title-row {
  display: flex;
  align-items: center;
  gap: $space-2;
  flex: 1;
}

.title-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  gap: $space-3;
}

.occupation-title {
  margin: 0;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $color-text;
  line-height: $line-height-tight;
  word-wrap: break-word;
  flex-shrink: 1;
  min-width: 0;
}

.info-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  color: $color-text-secondary;
  cursor: pointer;
  border-radius: 50%;
  transition: $transition-colors;

  &:hover {
    color: $color-primary;
    background: rgba(35, 46, 209, 0.08);
  }

  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }
}

.action-section {
  display: flex;
  align-self: flex-start;
}

.toggle-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  transition: $transition-colors;
  border-radius: 50%;

  &:hover:not(:disabled) {
    background: rgba(35, 46, 209, 0.08);
  }

  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:not(.added):not(.disabled) {
    color: $color-primary;
  }

  &.added {
    color: $color-text-secondary;
  }

  &.disabled {
    color: $color-error;
  }
}

.toggle-icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 1.5px solid currentColor;
  border-radius: 50%;
  transition: $transition-colors;
  flex-shrink: 0;
}

.selection-indicator {
  position: absolute;
  top: $space-3;
  right: $space-3;
  color: $color-primary;
  z-index: 2;
  opacity: 0;
  animation: checkFadeIn 0.3s ease-out forwards;
}

/* アニメーション */
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

.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: opacity 0.15s ease;
}

.icon-fade-enter-from,
.icon-fade-leave-to {
  opacity: 0;
}

/* レスポンシブ対応 */
@media (max-width: $breakpoint-lg) {
  .occupation-card {
    min-height: 100px;
    padding: $space-3;
  }

  .occupation-title {
    font-size: $font-size-base;
  }

  .toggle-button,
  .info-icon {
    width: 28px;
    height: 28px;
  }

  .toggle-icon-circle {
    width: 20px;
    height: 20px;
    border-width: 1.5px;
    
    svg {
      width: 12px;
      height: 12px;
    }
  }

  .info-icon svg {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: $breakpoint-md) {
  .occupation-card {
    min-height: 90px;
  }

  .card-content {
    gap: $space-2;
  }

  .occupation-title {
    font-size: $font-size-sm;
  }

  .toggle-button,
  .info-icon {
    width: 24px;
    height: 24px;
  }

  .toggle-icon-circle {
    width: 18px;
    height: 18px;
    border-width: 1px;
    
    svg {
      width: 10px;
      height: 10px;
    }
  }

  .info-icon svg {
    width: 18px;
    height: 18px;
  }

  .selection-indicator {
    svg {
      width: 16px;
      height: 16px;
    }
  }
}

/* アクセシビリティ */
@media (prefers-reduced-motion: reduce) {
  .selection-indicator {
    animation: none;
    opacity: 1;
  }
  
  .icon-fade-enter-active,
  .icon-fade-leave-active {
    transition: none;
  }
}

@media (prefers-contrast: high) {
  .occupation-card {
    border-width: 2px;
    
    &:hover {
      border-width: 3px;
    }
  }
  
  .info-icon {
    border: 1px solid currentColor;
  }
}
</style>