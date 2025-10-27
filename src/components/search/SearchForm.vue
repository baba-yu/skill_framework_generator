<template>
  <div class="search-form">
    <div class="search-row">
      <!-- 検索入力エリア -->
      <div class="search-input-section">
        <div class="search-input-container" :class="{ 'suggestions-open': showSuggestions }">
          <div class="input-area" @click="focusInput">
            <!-- 既存のタグ表示 -->
            <span 
              v-for="(tag, index) in searchTags" 
              :key="index" 
              class="search-tag"
            >
              {{ tag }}
              <button class="tag-remove" @click.stop="removeTag(index)" aria-label="Remove tag">×</button>
            </span>
            
            <!-- 新しいタグ入力 -->
            <input
              ref="inputRef"
              v-model="searchInput"
              type="text"
              :placeholder="searchTags.length === 0 ? 'Enter role keyword(s)' : ''"
              class="tag-input"
              :disabled="isSearching || isTagLimitReached"
              @keydown="handleKeydown"
              @input="handleInput"
              @focus="handleFocus"
              @blur="handleBlur"
            />
          </div>

          <div class="search-buttons">
            <!-- 全クリアボタン（タグがあるときのみ表示） -->
            <button 
              v-if="searchTags.length > 0"
              class="clear-all-btn" 
              @click="clearAllTags"
              aria-label="Clear all tags"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M18 6L6 18M6 6l12 12" 
                  stroke="#828282" 
                  stroke-width="2" 
                  stroke-linecap="round"
                />
              </svg>
            </button>
            <!-- 検索ボタン -->
            <button 
              class="btn btn-primary btn-md search-button" 
              @click="executeSearch" 
              :disabled="!canSearch || isSearching"
              aria-label="Search"
            >
              <svg v-if="!isSearching" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="2"/>
                <path d="m15 15 6 6" stroke="currentColor" stroke-width="2"/>
              </svg>
              <div v-else class="loading-dots">
                <span class="loading-dot"></span>
                <span class="loading-dot"></span>
                <span class="loading-dot"></span>
              </div>
            </button>
          </div>

          <!-- 予測変換ドロップダウン -->
          <KeywordSuggestions
            :visible="showSuggestions"
            :query="searchInput"
            :suggestions="currentSuggestions"
            @select="selectSuggestion"
            @close="hideSuggestions"
          />
        </div>
        
        <!-- タグ制限警告 -->
        <div v-if="shouldShowTagWarning" class="tag-warning">
          <span class="warning-text">Up to 5 words.</span>
        </div>
      </div>

      <!-- スペーサー -->
      <div class="spacer"></div>

      <!-- アクションボタン -->
      <div class="action-buttons" :class="{ hidden: selectedCount === 0 }">
        <!-- プレビュー選択ボタン -->
        <BaseButton 
          variant="primary"
          size="md"
          :disabled="selectedCount === 0"
          @click="$emit('openSidebar')"
          class="preview-button"
        >
          Preview selection{{ selectedCount > 1 ? 's' : '' }} ({{ selectedCount }})
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useSearchStore } from '@/store/search';
import { useKeywordSuggestions } from '@/composables/useKeywordSuggestions';
import BaseButton from '@/components/base/BaseButton.vue';
import KeywordSuggestions from '@/components/search/KeywordSuggestions.vue';

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
  (e: 'openSidebar'): void;
}

const emit = defineEmits<Emits>();

// Store & Composables
const searchStore = useSearchStore();
const { loadKeywords, getSuggestions } = useKeywordSuggestions();

// State
const searchTags = ref<string[]>([]);
const searchInput = ref('');
const inputRef = ref<HTMLInputElement | null>(null);
const showSuggestions = ref(false);
const currentSuggestions = ref<string[]>([]);
const enterPressCount = ref(0);
const enterTimeout = ref<NodeJS.Timeout | null>(null);

// Computed
const canSearch = computed(() => 
  searchTags.value.length > 0 || searchInput.value.trim().length > 0
);

const isTagLimitReached = computed(() => searchTags.value.length >= 5);
const shouldShowTagWarning = computed(() => searchTags.value.length >= 4);

// Methods
function focusInput() {
  inputRef.value?.focus();
}

function addTagFromInput() {
  const trimmed = searchInput.value.trim();
  if (trimmed && !searchTags.value.includes(trimmed) && searchTags.value.length < 5) {
    searchTags.value.push(trimmed);
    searchInput.value = '';
    hideSuggestions();
    // ストアにも保存
    searchStore.setKeywords([...searchTags.value]);
  }
}

function removeTag(index: number) {
  searchTags.value.splice(index, 1);
  // ストアにも反映
  searchStore.setKeywords([...searchTags.value]);
}

function clearAllTags() {
  searchTags.value = [];
  searchInput.value = '';
  searchStore.setKeywords([]);
  hideSuggestions();
  focusInput();
}

// 統一されたキーボードイベント処理
function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'Enter':
      // 予測選択が表示されている場合の処理
      if (showSuggestions.value && currentSuggestions.value.length > 0) {
        // エンター回数をカウント
        enterPressCount.value++
        
        // タイムアウトをクリア
        if (enterTimeout.value) {
          clearTimeout(enterTimeout.value)
        }
        
        if (enterPressCount.value === 1) {
          // 1回目のエンター: 予測選択コンポーネントに処理を委ねる
          // 500ms後にカウントをリセット
          enterTimeout.value = setTimeout(() => {
            enterPressCount.value = 0
          }, 500)
          return
        } else if (enterPressCount.value >= 2) {
          // 2回目のエンター: 自由入力でタグ追加
          event.preventDefault()
          enterPressCount.value = 0
          if (enterTimeout.value) {
            clearTimeout(enterTimeout.value)
          }
          if (searchInput.value.trim()) {
            addTagFromInput()
          }
          return
        }
      } else {
        // 予測選択が表示されていない場合は通常通りタグ追加
        event.preventDefault()
        if (searchInput.value.trim()) {
          addTagFromInput()
        }
      }
      break
      
    case 'ArrowDown':
    case 'ArrowUp':
      // 予測選択が表示されている場合は処理しない（予測選択コンポーネントに委ねる）
      if (showSuggestions.value && currentSuggestions.value.length > 0) {
        return
      }
      break
      
    case ',':
      event.preventDefault()
      addTagFromInput()
      break
      
    case 'Backspace':
      handleBackspace()
      break
      
    case 'Escape':
      if (showSuggestions.value) {
        hideSuggestions()
        event.preventDefault()
      }
      break
  }
}

function handleBackspace() {
  // 入力が空で Backspace → 最後のタグを削除
  if (!searchInput.value && searchTags.value.length > 0) {
    removeTag(searchTags.value.length - 1);
  }
}

function handleInput() {
  updateSuggestions();
}

function handleFocus() {
  updateSuggestions();
}

function handleBlur() {
  // 少し遅延させてクリックイベントを処理できるようにする
  setTimeout(() => {
    hideSuggestions();
  }, 250);
}

function updateSuggestions() {
  const query = searchInput.value.trim();
  const tagCount = searchTags.value.length;
  
  if (query.length >= 2 && tagCount < 5) {
    currentSuggestions.value = getSuggestions(query, 8);
    showSuggestions.value = currentSuggestions.value.length > 0;
  } else {
    hideSuggestions();
  }
}

function selectSuggestion(suggestion: string) {
  // 予測選択時はエンターカウントをリセット
  enterPressCount.value = 0
  if (enterTimeout.value) {
    clearTimeout(enterTimeout.value)
  }
  
  searchInput.value = suggestion;
  addTagFromInput();
  hideSuggestions();
  focusInput();
}

function hideSuggestions() {
  showSuggestions.value = false;
  currentSuggestions.value = [];
  // 予測選択が閉じたらエンターカウントもリセット
  enterPressCount.value = 0
  if (enterTimeout.value) {
    clearTimeout(enterTimeout.value)
  }
}

function executeSearch() {
  // 入力フィールドからもタグを追加
  if (searchInput.value.trim()) {
    addTagFromInput();
  }
  
  if (searchTags.value.length === 0) return;
  
  hideSuggestions();
  emit('search', [...searchTags.value]);
}

function clearTags() {
  searchTags.value = [];
  searchInput.value = '';
  searchStore.setKeywords([]);
}

// ストアからキーワードを復元
onMounted(async () => {
  // 辞書を読み込み
  await loadKeywords();
  
  // 既存のキーワードを復元
  if (searchStore.keywords.length > 0) {
    searchTags.value = [...searchStore.keywords];
  }
});

// ストアの変更を監視
watch(() => searchStore.keywords, (newKeywords) => {
  searchTags.value = [...newKeywords];
});

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
  flex: 1 1 auto;
  min-width: 300px;
  max-width: 700px;
}

.search-input-container {
  display: flex;
  align-items: center;
  border: none !important;
  border-radius: $radius-lg;
  background: $color-white;
  padding: $space-2 $space-3;
  gap: $space-2;
  cursor: text;
  height: 36px;
  box-shadow: $shadow-md;
  transition: $transition-colors, $transition-shadow;
  position: relative; // 予測変換のため
  
  &:focus-within {
    border: none !important;
    box-shadow: $shadow-lg;
  }

  &:hover:not(:focus-within) {
    border: none !important;
    box-shadow: $shadow-lg;
  }

  &.suggestions-open {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}

.input-area {
  display: flex;
  align-items: center;
  gap: $space-2;
  flex-wrap: nowrap;
  flex: 1;
  min-height: 32px;
  cursor: text;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 4px;
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

.tag-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: $font-size-sm;
  min-width: 120px;
  flex: 1;
  flex-shrink: 0;
  padding: $space-1 0;
  
  &::placeholder {
    color: $color-text-muted;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.search-button {
  flex-shrink: 0;
  width: 32px !important;
  height: 32px !important;
  min-width: 32px;
  max-width: 32px;
  min-height: 32px;
  max-height: 32px;
  background: none !important;
  border: none !important;
  padding: 0;
  
  svg {
    width: 16px;
    height: 16px;
    circle, path {
      stroke: #828282;
    }
  }
  
  &:hover {
    background: rgba(130, 130, 130, 0.1) !important;
    transform: none !important;
    box-shadow: none !important;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .loading-dots {
    display: flex;
    gap: 2px;
    align-items: center;
    justify-content: center;
  }
  
  .loading-dot {
    width: 4px;
    height: 4px;
    background: #828282;
    border-radius: 50%;
    animation: loadingDot 1.4s infinite ease-in-out;
  }
}

.search-buttons {
  display: flex;
  align-items: center;
  gap: $space-2;
  flex-shrink: 0;
}

.clear-all-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: $radius-md;
  cursor: pointer;
  transition: $transition-colors;
  
  &:hover {
    background: rgba(130, 130, 130, 0.1);
  }
  
  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
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

/* タグスタイル */
.search-tag {
  display: inline-flex;
  align-items: center;
  gap: $space-1;
  padding: 6px 10px;
  height: 25px;
  font-size: $font-size-sm;
  font-weight: $font-weight-normal;
  flex-shrink: 0;
  background: #828282;
  color: $color-white;
  border-radius: $radius-md;
  white-space: nowrap;
  animation: tagAppear 0.2s ease;
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-left: 4px;
  background: #828282;
  border: none !important;
  border-radius: 50%;
  color: inherit;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  transition: $transition-colors;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}

@keyframes tagAppear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
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

.preview-button {
  white-space: nowrap;
}

/* タグ制限警告 */
.tag-warning {
  margin-top: $space-2;
  padding: $space-1 $space-2;
  font-size: $font-size-xs;
  color: #dc3545; // danger color
  font-weight: $font-weight-medium;
}

/* レスポンシブ対応 */
@media (max-width: $breakpoint-lg) {
  .search-row {
    flex-direction: column;
    gap: $space-4;
  }
  
  .search-input-section {
    flex: 1 1 auto;
    min-width: unset;
    max-width: 700px;
  }
  
  .spacer {
    display: none;
  }
  
  .action-buttons {
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    z-index: 1000;
    padding: $space-3;
    justify-content: center;
    transition: transform 0.3s ease, opacity 0.3s ease;
    
    &.hidden {
      transform: translateY(100%);
      opacity: 0;
      pointer-events: none;
    }
  }

  .preview-button {
    flex: 1; // モバイルではボタンを横幅いっぱいに
  }
}

@media (max-width: $breakpoint-md) {
  .search-input-section {
    flex: 1 1 auto;
    min-width: unset;
    max-width: 400px;
  }

  .search-input-container {
    border: 0px solid transparent !important;
    padding: $space-2;
  }
  
  .action-buttons {
    bottom: 15px;
    left: 15px;
    right: 15px;
    padding: $space-2;
    flex-direction: row;
    gap: $space-2;
  }

  .preview-button {
    flex: 1; // モバイルではボタンを横幅いっぱいに
  }
}
</style>