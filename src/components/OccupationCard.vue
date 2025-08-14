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
    <!-- 左側：タイトルとステータス -->
    <div class="card-left">
      <div class="title-section">
        <h3 class="occupation-title">{{ occupation.title }}</h3>
        <div class="status-section">
          <button 
            v-if="isSelected" 
            class="status-text status-added"
            @click="$emit('toggle')"
          >
            Added!
          </button>
          <button 
            v-else-if="isLimitReached" 
            class="status-text status-limit"
            disabled
          >
            Limit reached (10)
          </button>
          <button 
            v-else 
            class="status-text status-add"
            @click="$emit('toggle')"
          >
            Add to your framework
          </button>
        </div>
      </div>
    </div>

    <!-- 右側：説明（スクロール可能） -->
    <div class="card-right">
      <div class="description-container">
        <p class="occupation-description">{{ occupation.description }}</p>
      </div>
    </div>

    <!-- 選択状態のインジケーター -->
    <div v-if="isSelected" class="selection-indicator">
      <span class="material-symbols-outlined">check_circle</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Occupation } from '@/api/occupations';

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
  height: 200px;
  min-height: 200px;
  max-height: 200px;

  &.selected {
    border-color: $color-primary;
  }

  &.limit-reached {
    opacity: 0.6;
    pointer-events: none;
  }
}

.card-left {
  flex: 1;
  padding: $space-4;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: $color-white;
}

.title-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}

.occupation-title {
  margin: 0;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $color-text;
  line-height: $line-height-tight;
  word-wrap: break-word;
}

.status-section {
  display: flex;
}

.status-text {
  background: none;
  border: none;
  padding: 0;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  transition: $transition-colors;
  cursor: pointer;
  text-align: left;

  &:hover:not(:disabled) {
    opacity: 0.8;
  }

  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
    border-radius: $radius-sm;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &.status-add {
    color: #232ED1;
  }

  &.status-added {
    color: #828282;
  }

  &.status-limit {
    color: #dc3545;
  }
}

.card-right {
  flex: 1;
  background: #F3F6F7;
  padding: $space-4;
  display: flex;
  flex-direction: column;
}

.description-container {
  flex: 1;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }
}

.occupation-description {
  margin: 0;
  color: $color-text-secondary;
  line-height: $line-height-relaxed;
  font-size: $font-size-sm;
  padding-right: $space-2;
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
    font-size: 20px;
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

@media (max-width: $breakpoint-lg) {
  .occupation-card {
    height: 120px;
    min-height: 120px;
    max-height: 120px;
  }

  .card-left,
  .card-right {
    padding: $space-3;
  }

  .occupation-title {
    font-size: $font-size-base;
  }

  .status-text {
    font-size: $font-size-xs;
  }
}

@media (max-width: $breakpoint-md) {
  .occupation-card {
    flex-direction: column;
    height: 160px;
    min-height: 160px;
    max-height: 160px;
  }

  .card-left {
    flex: 0 0 auto;
  }

  .card-right {
    flex: 1;
  }

  .title-section {
    gap: $space-2;
  }

  .occupation-title {
    font-size: $font-size-sm;
  }

  .occupation-description {
    font-size: $font-size-xs;
  }

  .selection-indicator .material-symbols-outlined {
    font-size: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .selection-indicator {
    animation: none;
    opacity: 1;
  }
}

@media (prefers-contrast: high) {
  .occupation-card {
    border-width: 2px;
    
    &:hover {
      border-width: 3px;
    }
  }
}
</style>