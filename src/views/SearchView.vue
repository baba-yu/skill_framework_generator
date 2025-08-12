.header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0;
}

.header-container {
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  color: #1f2937;
}

.header-actions {
  position: relative;
}

.menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  color: #6b7280;
  
  &:hover {
    background: #f3f4f6;
  }
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 8px;
  min-width: 150px;
  z-index: 1001;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  color: #374151;
  text-decoration: none;
  border: none;
  background: none;
  text-align: left;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
  }
}

.menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
}.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  
  &:hover {
    background: #f3f4f6;
    color: #1f2937;
  }
}

.modal-body {
  padding: 20px 24px;
  
  p {
    margin: 0 0 16px 0;
    line-height: 1.6;
    color: #374151;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  a {
    color: #1a73e8;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}<template>
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
                  v-for="(tag, index) in searchTags" 
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
                  placeholder="Search occupation(s)"
                  class="tag-input"
                  @keydown.enter="handleEnter"
                  @keydown.space="handleSpace"
                  @keydown.comma.prevent="addTagFromInput"
                />
              </div>
              
              <button class="search-btn" @click="executeSearch" :disabled="searchTags.length === 0 && !searchInput.trim()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
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
import { ref } from 'vue';
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

const hasSearched = ref(false);
const searchTags = ref<string[]>([]);
const searchInput = ref('');
const showCreditModal = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

const isSelected = (code: string) => selection.selectedCodes.includes(code);

function focusInput() {
  inputRef.value?.focus();
}

function handleEnter() {
  addTagFromInput();
  executeSearch();
}

function handleSpace(e: KeyboardEvent) {
  e.preventDefault();
  addTagFromInput();
}

function addTagFromInput() {
  const trimmed = searchInput.value.trim();
  if (trimmed && !searchTags.value.includes(trimmed)) {
    searchTags.value.push(trimmed);
    searchInput.value = '';
  }
}

function removeTag(index: number) {
  searchTags.value.splice(index, 1);
}

function openCreditModal() {
  showCreditModal.value = true;
}

function closeCreditModal() {
  showCreditModal.value = false;
}

async function executeSearch() {
  // 入力フィールドからもタグを追加
  if (searchInput.value.trim()) {
    addTagFromInput();
  }
  
  if (searchTags.value.length === 0) return;
  
  hasSearched.value = true;
  loading.startLoading('search');
  
  try {
    const results = await fetchOccupations(searchTags.value);
    search.setResults(results);
    search.setKeywords(searchTags.value);
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
  flex: 0 0 400px;
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
  padding: 8px 12px;
  gap: 8px;
  cursor: text;
  
  &:focus-within {
    border-color: #1a73e8;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
  }
}

.input-area {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  flex: 1;
  min-height: 32px;
  cursor: text;
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
  flex-shrink: 0;
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
  min-width: 120px;
  flex: 1;
  padding: 4px 0;
  
  &::placeholder {
    color: #9ca3af;
  }
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  
  &:hover {
    background: #f3f4f6;
    color: #1f2937;
  }
}

.modal-body {
  padding: 20px 24px;
  
  p {
    margin: 0 0 16px 0;
    line-height: 1.6;
    color: #374151;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  a {
    color: #1a73e8;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
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