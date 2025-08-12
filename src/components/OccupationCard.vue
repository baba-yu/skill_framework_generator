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
    <div class="card-content">
      <div class="card-header">
        <h3 class="occupation-title">{{ occupation.title }}</h3>
        <div class="status-indicator">
          <span v-if="isSelected" class="status-text">Added!</span>
          <span v-else class="status-text">Add to your framework</span>
        </div>
      </div>
      
      <p class="occupation-description">{{ occupation.description }}</p>
      
      <div class="card-footer">
        <span class="occupation-code">{{ occupation.code }}</span>
      </div>
    </div>

    <!-- 選択状態のインジケーター -->
    <div v-if="isSelected" class="selection-indicator">
      <span class="material-symbols-outlined">check_circle</span>
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
  background: white;
  border: 2px solid $color-border;
  border-radius: $radius-lg;
  padding: $space-4;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;

  &:hover {
    border-color: rgba(26, 115, 232, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  &.selected {
    border-color: $color-primary;
    background: rgba(26, 115, 232, 0.02);
    
    &:hover {
      border-color: $color-primary;
      box-shadow: 0 4px 12px rgba(26, 115, 232, 0.15);
    }
  }

  &.add-mode {
    .status-text {
      color: $color-primary;
    }
  }

  &.remove-mode {
    .status-text {
      color: #059669; // green
    }
  }
}

.card-content {
  position: relative;
  z-index: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $space-3;
  gap: $space-3;
}

.occupation-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: $color-text;
  line-height: 1.3;
  flex: 1;
}

.status-indicator {
  flex-shrink: 0;
}

.status-text {
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.occupation-description {
  margin: 0 0 $space-4 0;
  color: $color-muted;
  line-height: 1.5;
  font-size: 14px;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.occupation-code {
  font-size: 12px;
  font-weight: 500;
  color: $color-muted;
  background: rgba(107, 114, 128, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.selection-indicator {
  position: absolute;
  top: $space-3;
  right: $space-3;
  color: $color-primary;
  z-index: 2;

  .material-symbols-outlined {
    font-size: 20px;
  }
}

@media (max-width: 768px) {
  .occupation-card {
    padding: $space-3;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: $space-2;
  }

  .occupation-title {
    font-size: 16px;
  }
}
</style>