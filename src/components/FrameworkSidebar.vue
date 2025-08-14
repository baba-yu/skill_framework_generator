<!-- src/components/FrameworkSidebar.vue -->
<template>
  <!-- バックドロップ -->
  <teleport to="body">
    <transition name="backdrop">
      <div 
        v-if="visible" 
        class="sidebar-backdrop" 
        @click="$emit('close')"
        aria-hidden="true"
      ></div>
    </transition>
  </teleport>

  <!-- サイドバー -->
  <teleport to="body">
    <transition name="sidebar">
      <div 
        v-if="visible" 
        class="framework-sidebar"
        role="dialog"
        aria-labelledby="sidebar-title"
        aria-modal="true"
      >
        <!-- ヘッダー -->
        <div class="sidebar-header">
          <h3 id="sidebar-title" class="sidebar-title">Selected Role(s)</h3>
          <button 
            class="close-button"
            @click="$emit('close')"
            aria-label="Close sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path 
                d="M18 6L6 18M6 6l12 12" 
                stroke="currentColor" 
                stroke-width="2" 
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>

        <!-- タグリスト -->
        <div class="sidebar-content">
          <div v-if="selectedOccupations.length > 0" class="occupation-tags">
            <div
              v-for="occupation in selectedOccupations"
              :key="occupation.code"
              class="occupation-tag"
            >
              <span class="tag-title">{{ occupation.title }}</span>
              <button 
                class="tag-remove" 
                @click="removeOccupation(occupation.code)"
                :aria-label="`Remove ${occupation.title}`"
              >
                ×
              </button>
            </div>
            
            <!-- フレームワーク制限警告 -->
            <div v-if="shouldShowFrameworkWarning" class="framework-warning">
              <span class="warning-text">Up to 10 roles.</span>
            </div>
          </div>

          <!-- 空状態 -->
          <div v-else class="empty-state">
            <p class="empty-message">Search and add roles to build your framework</p>
          </div>
        </div>

        <!-- フッター -->
        <div class="sidebar-footer">
          <BaseButton 
            variant="primary"
            size="md"
            :disabled="selectedOccupations.length === 0"
            @click="$emit('review')"
            class="review-button"
          >
            Create framework
          </BaseButton>
          
          <BaseButton 
            variant="danger"
            size="md"
            :disabled="selectedOccupations.length === 0"
            @click="$emit('clear')"
            class="clear-button"
          >
            Clear all
          </BaseButton>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Occupation } from '@/api/occupations';
import BaseButton from '@/components/base/BaseButton.vue';
import { useSelectionStore } from '@/store/selection';

// Props
interface Props {
  visible: boolean;
  selectedCodes: string[];
  occupations: Occupation[]; // 検索結果から選択されたもののタイトルを取得するため
}

const props = defineProps<Props>();

// Store
const selection = useSelectionStore();

// Emits
interface Emits {
  (e: 'close'): void;
  (e: 'remove', code: string): void;
  (e: 'review'): void;
  (e: 'clear'): void;
}

const emit = defineEmits<Emits>();

// Computed
const selectedOccupations = computed(() => {
  // 新しいアプローチ：ストアから直接取得
  return selection.allSelectedOccupations;
});

const shouldShowFrameworkWarning = computed(() => selectedOccupations.value.length >= 9);

// Methods
function removeOccupation(code: string) {
  emit('remove', code);
}
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;

/* バックドロップ */
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: $z-modal-backdrop;
  backdrop-filter: blur(2px);
}

/* サイドバー */
.framework-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 400px;
  max-width: 90vw;
  background: $color-white;
  z-index: $z-modal;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.1);
}

/* ヘッダー */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-6 $space-5;
  border-bottom: $border-width solid $color-border;
  flex-shrink: 0;
}

.sidebar-title {
  margin: 0;
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: $color-text;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: $radius-md;
  color: $color-text-secondary;
  cursor: pointer;
  transition: $transition-colors;
  
  &:hover {
    background: $color-gray-100;
    color: $color-text;
  }
  
  &:focus-visible {
    outline: none;
    background: $color-gray-100;
    box-shadow: $shadow-focus;
  }
}

/* コンテンツ */
.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: $space-5;
  
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

/* タグリスト */
.occupation-tags {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.occupation-tag {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-3;
  padding: $space-2 $space-3;
  background: #828282; // SearchFormと同じスタイル
  color: $color-white;
  border-radius: $radius-lg;
  transition: $transition-colors;
  animation: tagSlideIn 0.3s ease-out;
  
  &:hover {
    background: #6d6d6d;
  }
}

.tag-title {
  flex: 1;
  font-size: $font-size-sm;
  font-weight: $font-weight-normal;
  line-height: $line-height-normal;
  word-break: break-word;
  min-width: 0; // テキストの省略を可能にする
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: #828282;
  border: none;
  border-radius: 50%;
  color: inherit;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  transition: $transition-colors;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  &:focus-visible {
    outline: none;
    background: rgba(255, 255, 255, 0.4);
  }
}

/* フレームワーク制限警告 */
.framework-warning {
  margin-top: $space-2;
  padding: $space-2 $space-3;
  font-size: $font-size-xs;
  color: #dc3545; // danger color
  font-weight: $font-weight-medium;
  text-align: center;
}

/* 空状態 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 200px;
  padding: $space-4;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: $space-4;
}

.empty-message {
  margin: 0 0 $space-2 0;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  color: $color-text;
}

.empty-submessage {
  margin: 0;
  font-size: $font-size-sm;
  color: $color-text-secondary;
  line-height: $line-height-relaxed;
}

/* フッター */
.sidebar-footer {
  padding: $space-5;
  border-top: $border-width solid $color-border;
  display: flex;
  flex-direction: column;
  gap: $space-3;
  flex-shrink: 0;
}

.review-button,
.clear-button {
  width: 100%;
  justify-content: center;
}

/* アニメーション */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.sidebar-enter-active,
.sidebar-leave-active {
  transition: transform 0.3s ease;
}

.sidebar-enter-from,
.sidebar-leave-to {
  transform: translateX(100%);
}

@keyframes tagSlideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* レスポンシブ対応 */
@media (max-width: $breakpoint-md) {
  .framework-sidebar {
    width: 100vw;
    max-width: 100vw;
  }
  
  .sidebar-header {
    padding: $space-4;
  }
  
  .sidebar-content {
    padding: $space-4;
  }
  
  .sidebar-footer {
    padding: $space-4;
  }
  
  .sidebar-title {
    font-size: $font-size-lg;
  }
  
  .occupation-tag {
    padding: $space-2 $space-3;
  }
  
  .tag-title {
    font-size: $font-size-xs;
  }
}

/* アクセシビリティ */
@media (prefers-reduced-motion: reduce) {
  .backdrop-enter-active,
  .backdrop-leave-active,
  .sidebar-enter-active,
  .sidebar-leave-active {
    transition: none;
  }
  
  .occupation-tag {
    animation: none;
  }
}

/* 高コントラストモード */
@media (prefers-contrast: high) {
  .framework-sidebar {
    border-left: 2px solid $color-text;
  }
  
  .occupation-tag {
    border: 1px solid $color-white;
  }
}
</style>