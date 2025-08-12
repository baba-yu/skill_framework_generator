<template>
  <div class="search-view">
    <!-- ヘッダー -->
    <header class="header">
      <div class="header-container">
        <div class="logo">
          <svg width="24" height="24" viewBox="0 0 160 160" fill="none">
            <path d="m93.34,84.44c3.66-2.44,3.66-6.43,0-8.88l-58.69-39.12c-3.66-2.44-6.66-.84-6.66,3.56v80c0,4.4,3,6,6.66,3.56l58.69-39.12Z" 
                  fill="none" stroke="#4c75f2" stroke-miterlimit="10" stroke-width="5"/>
          </svg>
          <span>Skill Framework Generator</span>
        </div>
        
        <div class="header-actions">
          <button class="menu-btn">⋮</button>
        </div>
      </div>
    </header>

    <!-- メインコンテンツ -->
    <div class="main-container">
      <!-- 検索エリア -->
      <div class="search-area">
        <div class="search-form">
          <div class="search-input-container">
            <input
              v-model="searchKeywords"
              type="text"
              placeholder="Mechatronics Thermal"
              class="search-input"
              @keydown.enter="executeSearch"
            />
            <button class="search-btn" @click="executeSearch">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </div>

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
            <div class="occupation-content">
              <h3 class="occupation-title">{{ occupation.title }}</h3>
              <p class="occupation-description">{{ occupation.description }}</p>
              <div class="occupation-actions">
                <span v-if="isSelected(occupation.code)" class="status added">Added!</span>
                <span v-else class="status add">Add to your framework</span>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { fetchOccupations } from '@/api/occupations';
import { useSelectionStore } from '@/store/selection';
import { useSearchStore } from '@/store/search';
import { useLoadingStore } from '@/store/loading';

const router = useRouter();
const selection = useSelectionStore();
const search = useSearchStore();
const loading = useLoadingStore();

const searchKeywords = ref('');
const hasSearched = ref(false);

const isSelected = (code: string) => selection.selectedCodes.includes(code);

async function executeSearch() {
  if (!searchKeywords.value.trim()) return;
  
  hasSearched.value = true;
  loading.startLoading('search');
  
  try {
    const keywords = searchKeywords.value.trim().split(/\s+/);
    const results = await fetchOccupations(keywords);
    search.setResults(results);
    search.setKeywords(keywords);
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
  background: #f8f9fa;
}

.header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 24px;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  color: #1f2937;
}

.menu-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  color: #6b7280;
  
  &:hover {
    background: #f3f4f6;
  }
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.search-area {
  margin-bottom: 32px;
}

.search-form {
  margin-bottom: 16px;
}

.search-input-container {
  display: flex;
  max-width: 500px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  outline: none;
  font-size: 16px;
  
  &::placeholder {
    color: #9ca3af;
  }
}

.search-btn {
  padding: 12px 16px;
  background: #1a73e8;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    background: #1557b0;
  }
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.review-btn {
  background: #1a73e8;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  
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

.occupation-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.occupation-description {
  margin: 0 0 12px 0;
  color: #6b7280;
  line-height: 1.5;
}

.occupation-actions {
  display: flex;
  justify-content: flex-end;
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
  
  .search-input-container {
    max-width: none;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>