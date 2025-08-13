<template>
    <div class="search-form">
      <div class="search-row">
        <!-- 検索入力エリア -->
        <div class="search-input-section">
          <div class="search-input-container">
            <div class="input-area" @click="focusInput">
              <!-- 既存のタグ表示 -->
              <span 
                v-for="(tag, index) in searchTags" 
                :key="index" 
                class="tag tag-primary tag-removable"
              >
                {{ tag }}
                <button class="tag-remove" @click.stop="removeTag(index)" aria-label="Remove tag">×</button>
              </span>
              
              <!-- 新しいタグ入力 -->
              <input
                ref="inputRef"
                v-model="searchInput"
                type="text"
                :placeholder="searchTags.length === 0 ? 'Search occupation(s)' : ''"
                class="tag-input"
                :disabled="isSearching"
                @keydown.enter="handleEnter"
                @keydown.space="handleSpace"
                @keydown.comma.prevent="addTagFromInput"
                @keydown.backspace="handleBackspace"
              />
            </div>
            
            <!-- 検索ボタン -->
            <button 
              class="btn btn-primary btn-md search-btn" 
              @click="executeSearch" 
              :disabled="!canSearch || isSearching"
              aria-label="Search"
            >
              <svg v-if="!isSearching" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
              </svg>
              <div v-else class="loading-dots">
                <span class="loading-dot"></span>
                <span class="loading-dot"></span>
                <span class="loading-dot"></span>
              </div>
            </button>
          </div>
        </div>
  
        <!-- スペーサー -->
        <div class="spacer"></div>
  
        <!-- アクションボタン -->
        <div class="action-buttons">
          <button 
            class="btn btn-primary btn-md review-btn"
            :disabled="selectedCount === 0"
            @click="$emit('review')"
          >
            Review your framework ({{ selectedCount }})
          </button>
          <button 
            class="btn btn-outline btn-md clear-btn"
            :disabled="selectedCount === 0"
            @click="$emit('clear')"
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  
  // Props
  interface Props {
    selectedCount: number;
    isSearching?: boolean;
  }
  
  const props = withDefaults(defineProps<Props>(), {
    isSearching: false,
  });
  
  // Emits
  interface Emits {
    (e: 'search', keywords: string[]): void;
    (e: 'review'): void;
    (e: 'clear'): void;
  }
  
  const emit = defineEmits<Emits>();
  
  // State
  const searchTags = ref<string[]>([]);
  const searchInput = ref('');
  const inputRef = ref<HTMLInputElement | null>(null);
  
  // Computed
  const canSearch = computed(() => 
    searchTags.value.length > 0 || searchInput.value.trim().length > 0
  );
  
  // Methods
  function focusInput() {
    inputRef.value?.focus();
  }
  
  function addTagFromInput() {
    const trimmed = searchInput.value.trim();
    if (trimmed && !searchTags.value.includes(trimmed) && searchTags.value.length < 3) {
      searchTags.value.push(trimmed);
      searchInput.value = '';
    }
  }
  
  function removeTag(index: number) {
    searchTags.value.splice(index, 1);
  }
  
  function handleEnter() {
    if (searchInput.value.trim()) {
      addTagFromInput();
    }
    executeSearch();
  }
  
  function handleSpace(e: KeyboardEvent) {
    if (searchInput.value.trim()) {
      e.preventDefault();
      addTagFromInput();
    }
  }
  
  function handleBackspace() {
    // 入力が空で Backspace → 最後のタグを削除
    if (!searchInput.value && searchTags.value.length > 0) {
      removeTag(searchTags.value.length - 1);
    }
  }
  
  function executeSearch() {
    // 入力フィールドからもタグを追加
    if (searchInput.value.trim()) {
      addTagFromInput();
    }
    
    if (searchTags.value.length === 0) return;
    
    emit('search', [...searchTags.value]);
  }
  
  function clearTags() {
    searchTags.value = [];
    searchInput.value = '';
  }
  
  // 外部からのアクセス用にexposeする
  defineExpose({
    clearTags,
    focusInput,
  });
  </script>
  
  <style scoped lang="scss">
  @use "@/styles/variables.scss" as *;
  
  .search-form {
    margin-bottom: $space-8;
  }
  
  .search-row {
    display: flex;
    align-items: flex-start;
    gap: $space-5;
    flex-wrap: nowrap;
    width: 100%;
  }
  
  .search-input-section {
    flex: 0 0 400px;
    min-width: 300px;
  }
  
  .search-input-container {
    display: flex;
    align-items: center;
    border: $border-width-thick solid $color-border;
    border-radius: $radius-lg;
    background: $color-white;
    padding: $space-2 $space-3;
    gap: $space-2;
    cursor: text;
    transition: $transition-colors, $transition-shadow;
    
    &:focus-within {
      border-color: $color-border-focus;
      box-shadow: $shadow-focus;
    }
  
    &:hover:not(:focus-within) {
      border-color: $color-gray-300;
    }
  }
  
  .input-area {
    display: flex;
    align-items: center;
    gap: $space-2;
    flex-wrap: wrap;
    flex: 1;
    min-height: 32px;
    cursor: text;
  }
  
  .tag-input {
    border: none;
    outline: none;
    background: transparent;
    font-size: $font-size-base;
    min-width: 120px;
    flex: 1;
    padding: $space-1 0;
    
    &::placeholder {
      color: $color-text-muted;
    }
  
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
  
  .search-btn {
    flex-shrink: 0;
    min-width: 48px;
    
    .loading-dots {
      display: flex;
      gap: 2px;
      align-items: center;
      justify-content: center;
    }
    
    .loading-dot {
      width: 4px;
      height: 4px;
      background: currentColor;
      border-radius: 50%;
      animation: loadingDot 1.4s infinite ease-in-out;
  
      &:nth-child(1) { animation-delay: -0.32s; }
      &:nth-child(2) { animation-delay: -0.16s; }
      &:nth-child(3) { animation-delay: 0s; }
    }
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
  
  .spacer {
    flex: 1;
  }
  
  .action-buttons {
    display: flex;
    gap: $space-3;
    flex: 0 0 auto;
  }
  
  .review-btn {
    white-space: nowrap;
  }
  
  .clear-btn {
    white-space: nowrap;
    border-color: $color-error;
    color: $color-error;
  
    &:hover:not(:disabled) {
      background: $color-error;
      color: $color-white;
    }
  }
  
  /* レスポンシブ対応 */
  @media (max-width: $breakpoint-lg) {
    .search-row {
      flex-direction: column;
      gap: $space-4;
    }
    
    .search-input-section {
      flex: 1 1 auto;
    }
    
    .spacer {
      display: none;
    }
    
    .action-buttons {
      align-self: stretch;
      
      .review-btn,
      .clear-btn {
        flex: 1;
      }
    }
  }
  
  @media (max-width: $breakpoint-md) {
    .search-input-section {
      min-width: unset;
    }
    
    .search-input-container {
      padding: $space-2;
    }
    
    .action-buttons {
      flex-direction: column;
      gap: $space-2;
    }
  }
  </style>