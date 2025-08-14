<template>
  <div v-if="visible && suggestions.length > 0" class="suggestions-dropdown" ref="dropdownRef">
    <div
      v-for="(suggestion, index) in suggestions"
      :key="suggestion"
      class="suggestion-item"
      :class="{ active: activeIndex === index }"
      @click="selectSuggestion(suggestion)"
      @mouseenter="setActiveIndex(index)"
    >
      <span class="suggestion-tag">{{ suggestion }}</span>
      <span class="suggestion-icon">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

// Props
interface Props {
  visible: boolean
  query: string
  suggestions: string[]
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'select', suggestion: string): void
  (e: 'close'): void
}

const emit = defineEmits<Emits>()

// State
const activeIndex = ref(-1)
const dropdownRef = ref<HTMLElement | null>(null)

// Methods
function selectSuggestion(suggestion: string) {
  emit('select', suggestion)
  activeIndex.value = -1
}

function setActiveIndex(index: number) {
  activeIndex.value = index
}

function handleKeyDown(event: KeyboardEvent) {
  if (!props.visible || props.suggestions.length === 0) return

  let handled = false

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      event.stopPropagation()
      activeIndex.value = Math.min(activeIndex.value + 1, props.suggestions.length - 1)
      handled = true
      break
    
    case 'ArrowUp':
      event.preventDefault()
      event.stopPropagation()
      activeIndex.value = Math.max(activeIndex.value - 1, -1)
      handled = true
      break
    
    case 'Enter':
      if (activeIndex.value >= 0) {
        event.preventDefault()
        event.stopPropagation()
        selectSuggestion(props.suggestions[activeIndex.value])
        handled = true
      }
      break
    
    case 'Escape':
      event.preventDefault()
      event.stopPropagation()
      emit('close')
      handled = true
      break
  }
}

function handleClickOutside(event: Event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    emit('close')
  }
}

// Watch for query changes to reset active index
watch(() => props.query, () => {
  activeIndex.value = -1
})

// Watch for suggestions changes to reset active index if out of bounds
watch(() => props.suggestions.length, (newLength) => {
  if (activeIndex.value >= newLength) {
    activeIndex.value = -1
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown, true)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown, true)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: $color-white;
  border: $border-width solid $color-border;
  border-radius: $radius-lg;
  box-shadow: $shadow-lg;
  max-height: 200px;
  overflow-y: auto;
  z-index: $z-dropdown;
  margin-top: 2px;
  animation: slideDown 0.15s ease-out;

  /* カスタムスクロールバー */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: $color-gray-300;
    border-radius: 3px;

    &:hover {
      background: $color-gray-400;
    }
  }
}

.suggestion-item {
  padding: $space-2 $space-3;
  cursor: pointer;
  transition: $transition-colors;
  border-bottom: 1px solid $color-border-light;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-2;

  &:last-child {
    border-bottom: none;
  }

  &:hover,
  &.active {
    background: rgba(130, 130, 130, 0.05);
  }
}

.suggestion-tag {
  flex: 0 0 auto;
  display: inline-block;
  padding: 4px 6px;
  background: #828282;
  color: $color-white;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  font-weight: $font-weight-normal;
  white-space: nowrap;
  transition: $transition-colors;
  
  .suggestion-item:hover &,
  .suggestion-item.active & {
    background: #6d6d6d;
  }
}

.suggestion-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: none;
  border-radius: 50%;
  flex-shrink: 0;
  color: #4F4F4F;
  transition: $transition-colors;
  
  .suggestion-item:hover &,
  .suggestion-item.active & {
    color: #4F4F4F;
  }
  
  svg {
    width: 14px;
    height: 14px;
    stroke-width: 2.5;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* レスポンシブ対応 */
@media (max-width: $breakpoint-md) {
  .suggestions-dropdown {
    max-height: 150px;
  }
  
  .suggestion-item {
    padding: $space-2;
    gap: $space-1;
  }
  
  .suggestion-tag {
    padding: 3px 5px;
    font-size: $font-size-xs;
  }
  
  .suggestion-icon {
    width: 18px;
    height: 18px;
    
    svg {
      width: 12px;
      height: 12px;
    }
  }
}

/* アクセシビリティ */
@media (prefers-reduced-motion: reduce) {
  .suggestions-dropdown {
    animation: none;
  }
}
</style>