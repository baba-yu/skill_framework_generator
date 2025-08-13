<template>
  <BaseLayout>
    <div class="search-view">
      <!-- 検索フォーム -->
      <SearchForm
        :selected-count="selection.selectedCodes.length"
        :is-searching="loading.loadingKeys.includes('search')"
        @search="handleSearch"
        @review="goToPreview"
        @clear="clearAll"
      />

      <!-- 検索結果 -->
      <OccupationList
        :occupations="search.results"
        :selected-codes="selection.selectedCodes"
        :is-loading="loading.loadingKeys.includes('search')"
        :has-searched="hasSearched"
        @toggle="toggleSelection"
      />
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchOccupations } from '@/api/occupations';
import { useSelectionStore } from '@/store/selection';
import { useSearchStore } from '@/store/search';
import { useLoadingStore } from '@/store/loading';
import BaseLayout from '@/components/base/BaseLayout.vue';
import SearchForm from '@/components/search/SearchForm.vue';
import OccupationList from '@/components/search/OccupationList.vue';

// Router and Stores
const router = useRouter();
const selection = useSelectionStore();
const search = useSearchStore();
const loading = useLoadingStore();

// State
const hasSearched = ref(false);

// Methods
async function handleSearch(keywords: string[]) {
  if (keywords.length === 0) return;
  
  hasSearched.value = true;
  loading.startLoading('search');
  
  try {
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
  if (selection.selectedCodes.length === 0) return;
  
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
  width: 100%;
  max-width: $layout-max-width;
  margin: 0 auto;
  padding: $space-6 $layout-padding $space-8;
  min-height: calc(100vh - #{$header-height});
  
  @media (max-width: $breakpoint-md) {
    padding: $space-4 $layout-padding-mobile $space-6;
  }
}
</style>