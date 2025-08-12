<template>
  <div class="search-view">
    <!-- ヘッダー -->
    <AppHeader @open-credit="openCreditModal" />

    <!-- メインコンテンツ -->
    <div class="main-container">
      <!-- 検索エリア -->
      <div class="search-area">
        <div class="search-row">
          <div class="search-form">
            <div class="search-input-container">
              <div class="input-area" @click="focusInput">
                <!-- 既存のタグ表示 -->
                <span 
                  v-for="(tag, index) in search.keywords" 
                  :key="index" 
                  class="tag"
                >
                  {{ tag }}
                  <button class="tag-remove" @click.stop="removeTag(index)">×</button>
                </span>
                <!-- 新しいタグ入力 -->
                <input
                  ref="inputRef"
                  v-model="searchInput"
                  type="text"
                  :placeholder="search.keywords.length === 0 ? 'Search occupation(s)' : ''"
                  class="tag-input"
                  :disabled="search.keywords.length >= 3"
                  @keydown.enter="handleEnter"
                  @keydown.space="handleSpace"
                  @keydown.comma.prevent="addTagFromInput"
                />
              </div>
              
              <button class="search-btn" @click="executeSearch" :disabled="search.keywords.length === 0 && !searchInput.trim()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>
            
            <!-- 警告メッセージ -->
            <div v-if="search.keywords.length >= 3" class="keyword-limit-warning">
              up to 3 words
            </div>
          </div>

          <div class="spacer"></div>

          <div class="action-buttons">
            <button 
              class="review-btn"
              :disabled="selection.selectedCodes.length === 0"
              @click="goToPreview"
            >
              Review your framework ({{ selection.selectedCodes.length }})
            </button>
            <button 
              class="clear-btn"
              :disabled="selection.selectedCodes.length === 0"
              @click="clearAll"
            >
              Clear all
            </button>
          </div>
        </div>
      </div>

      <!-- 検索結果 -->
      <div class="results-area">
        <div v-if="loading.loadingKeys.includes('search')" class="loading">
          Searching...
        </div>

        <div v-else-if="search.results.length > 0" class="results-list">
          <div
            v-for="occupation in search.results"
            :key="occupation.code"
            class="occupation-item"
            :class="{ selected: isSelected(occupation.code) }"
            @click="toggleSelection(occupation.code)"
          >
            <!-- 左側：タイトルとアクション -->
            <div class="occupation-left">
              <h3 class="occupation-title">{{ occupation.title }}</h3>
              <div class="occupation-actions">
                <span v-if="isSelected(occupation.code)" class="status added">Added!</span>
                <span v-else class="status add">Add to your framework</span>
              </div>
            </div>
            
            <!-- 右側：説明（スクロール可能） -->
            <div class="occupation-right">
              <div class="description-container">
                <p class="occupation-description">{{ occupation.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="hasSearched" class="no-results">
          <div class="no-results-icon">🔍</div>
          <p>No result</p>
        </div>

        <div v-else class="initial-state">
          <p>Enter keywords to search for occupations</p>
        </div>
      </div>
    </div>
    
    <!-- クレジットモーダル -->
    <CreditModal :visible="showCreditModal" @close="closeCreditModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchOccupations } from '@/api/occupations';
import { useSelectionStore } from '@/store/selection';
import { useSearchStore } from '@/store/search';
import { useLoadingStore } from '@/store/loading';
import AppHeader from '@/components/AppHeader.vue';
import CreditModal from '@/components/CreditModal.vue';

const router = useRouter();
const selection = useSelectionStore();
const search = useSearchStore();
const loading = useLoadingStore();

const searchInput = ref('');
const showCreditModal = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

// 検索実行済みかどうかは、結果が存在するかで判定
const hasSearched = computed(() => search.results.length > 0);

const isSelected = (code: string) => selection.selectedCodes.includes(code);

function focusInput() {
  inputRef.value?.focus();
}

// エンターキーではタグ追加のみを行う
function handleEnter() {
  addTagFromInput();
}

function handleSpace(e: KeyboardEvent) {
  e.preventDefault();
  addTagFromInput();
}

function addTagFromInput() {
  const trimmed = searchInput.value.trim();
  if (trimmed && !search.keywords.includes(trimmed)) {
    // storeのkeywordsに追加
    const newKeywords = [...search.keywords, trimmed];
    search.setKeywords(newKeywords);
    searchInput.value = '';
  }
}

function removeTag(index: number) {
  // storeのkeywordsから削除
  const newKeywords = search.keywords.filter((_, i) => i !== index);
  search.setKeywords(newKeywords);
}

function openCreditModal() {
  showCreditModal.value = true;
}

function closeCreditModal() {
  showCreditModal.value = false;
}

// 検索実行は検索ボタンクリック時のみ
async function executeSearch() {
  // 入力フィールドからもタグを追加
  if (searchInput.value.trim()) {
    addTagFromInput();
  }
  
  if (search.keywords.length === 0) return;
  
  loading.startLoading('search');
  
  try {
    const results = await fetchOccupations(search.keywords);
    search.setResults(results);
  } catch (error) {
    console.error('Search failed:', error);
    search.setResults([]);
  } finally {
    loading.stopLoading('search');
  }
}

function toggleSelection(code: string) {
  selection.toggleSelection(code);
}

function clearAll() {
  selection.clearSelection();
}

function goToPreview() {
  loading.startLoading('nav');
  router.push({
    path: '/preview',
    query: { codes: selection.selectedCodes.join(',') }
  });
}

// コンポーネントマウント時の処理
onMounted(() => {
  // ストアに保存された検索結果がある場合は、既に検索実行済みとみなす
  // 特に追加の処理は必要なし（hasSearchedはcomputedで自動計算）
});
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;

.search-view {
  min-height: 100vh;
  background: #ffffff;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.search-area {
  margin-bottom: 32px;
}

.search-row {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: nowrap;
  width: 100%;
}

.search-form {
  flex: 0 0 500px; // 400px → 500px に拡大
}

.spacer {
  flex: 1;
}

.search-input-container {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  padding: 4px 12px; // 6px → 4px に調整（input-areaのpaddingと合わせて調整）
  gap: 8px;
  cursor: text;
  height: 42px;
  width: 500px;
  max-width: 500px;
  min-width: 500px;
  box-sizing: border-box;
  position: relative;
  
  &:focus-within {
    border-color: #1a73e8;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
  }
}

.input-area {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
  flex: 1;
  height: 100%;
  cursor: text;
  overflow-x: auto;
  overflow-y: hidden;
  min-width: 0; // flexアイテムが親の幅を超えないように
  padding: 2px 0; // タグの角丸が切れないように上下にパディング追加
  
  // 横スクロールバーのスタイル
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f8f9fa;
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
    
    &:hover {
      background: #94a3b8;
    }
  }
  
  // Firefox用のスクロールバー
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f8f9fa;
}

.tag {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #1a73e8;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  flex-shrink: 0; // タグのサイズを固定
  white-space: nowrap; // タグ内のテキストが改行されないように
  height: 24px; // 固定の高さ
}

.tag-remove {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0 2px;
  
  &:hover {
    color: white;
  }
}

.tag-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  width: 150px; // 少し幅を広げる
  max-width: 150px; // 最大幅を制限
  min-width: 150px; // 最小幅を制限
  flex: 0 0 150px;
  padding: 4px 0;
  white-space: nowrap;
  height: 24px;
  overflow: hidden; // テキストオーバーフローを隠す
  text-overflow: ellipsis; // 長い文字列は省略記号で表示
  
  &::placeholder {
    color: #9ca3af;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &::placeholder {
      color: #d1d5db;
    }
  }
}

// 警告メッセージ
.keyword-limit-warning {
  margin-top: 4px;
  font-size: 12px;
  color: #dc2626;
  font-weight: 500;
}

.search-btn {
  padding: 8px 12px;
  background: #1a73e8;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 4px;
  flex-shrink: 0;
  
  &:hover:not(:disabled) {
    background: #1557b0;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex: 0 0 auto;
}

.review-btn {
  background: #1a73e8;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: #1557b0;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.clear-btn {
  background: white;
  color: #dc2626;
  border: 1px solid #dc2626;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: #fef2f2;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.results-area {
  min-height: 400px;
  max-height: 800px; // より広い表示範囲
  overflow-y: auto; // 縦スクロール対応
  
  // カスタムスクロールバー
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
    
    &:hover {
      background: #94a3b8;
    }
  }
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.occupation-item {
  display: flex;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #1a73e8;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &.selected {
    border-color: #1a73e8;
    background: #f0f7ff;
  }
}

.occupation-left {
  flex: 0 0 300px;
  padding-right: 20px;
}

.occupation-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.occupation-actions {
  margin-top: 8px;
}

.status {
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  
  &.add {
    color: #1a73e8;
  }
  
  &.added {
    color: #059669;
  }
}

.occupation-right {
  flex: 1;
  border-left: 1px solid #e5e7eb;
  padding-left: 20px;
}

.description-container {
  max-height: 100px;
  overflow-y: auto;
}

.occupation-description {
  margin: 0;
  color: #6b7280;
  line-height: 1.5;
  font-size: 14px;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.no-results-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.initial-state {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

@media (max-width: 768px) {
  .main-container {
    padding: 16px;
  }
  
  .search-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .search-form {
    flex: 1 1 auto;
  }
  
  .spacer {
    display: none;
  }
  
  // モバイルでの検索ボックスの幅調整
  .search-form {
    flex: 1 1 auto;
  }
  
  .search-input-container {
    width: 100%;
    max-width: none;
    min-width: 300px;
  }
  
  .tag-input {
    width: 120px;
    max-width: 120px;
    min-width: 120px;
    flex: 0 0 120px;
  }
  
  // モバイルでの検索結果の高さ調整
  .results-area {
    max-height: 700px; // モバイルでもより広く
  }
  
  .occupation-item {
    flex-direction: column;
  }
  
  .occupation-left {
    flex: 1 1 auto;
    padding-right: 0;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .occupation-right {
    flex: 1 1 auto;
    border-left: none;
    padding-left: 0;
    padding-top: 16px;
  }
}
</style>