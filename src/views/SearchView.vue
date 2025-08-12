<script setup lang="ts">
import { ref } from "vue";
import { fetchOccupations, type Occupation } from "@/api/occupations";
import { useSelectionStore } from "@/store/selection";
import { useSearchStore } from "@/store/search";
import { useLoadingStore } from "@/store/loading";
import BaseTagInput from "@/components/base/BaseTagInput.vue";
import BaseButton from "@/components/base/BaseButton.vue";

const selection = useSelectionStore();
const searchStore = useSearchStore();
const loading = useLoadingStore();

async function searchSubmit() {
  const keywords = searchStore.keywords.slice(0, 3);
  if (keywords.length === 0) return;
  loading.startLoading("search");
  try {
    const data: Occupation[] = await fetchOccupations(keywords);
    searchStore.setResults(data);
  } finally {
    loading.stopLoading("search");
  }
}

function clearAllSelected() {
  selection.clearSelection();
}
</script>

<template>
  <div class="container">
    <h2>Search Occupations</h2>

    <div style="display:flex; gap:12px; align-items:flex-start;">
      <form @submit.prevent="searchSubmit" style="flex:1; display:flex; flex-direction:column; gap:8px;">
        <!-- ★ ここをタグ入力に -->
        <BaseTagInput v-model="searchStore.keywords" :max="3" placeholder="Add keyword and press Enter" />
        <BaseButton type="submit">Search</BaseButton>
      </form>

      <div style="margin-left:auto; display:flex; gap:8px;">
        <BaseButton
          :disabled="selection.selectedCodes.length === 0"
          @click="$router.push({ path: '/preview', query: { codes: selection.selectedCodes.join(',') } })"
        >
          Review your framework ({{ selection.selectedCodes.length }})
        </BaseButton>
        <BaseButton variant="secondary" @click="clearAllSelected">
          Clear all
        </BaseButton>
      </div>
    </div>

    <div v-if="searchStore.results.length" style="margin-top:12px;">
      <h3>Results (click to select):</h3>
      <ul>
        <li
          v-for="occ in searchStore.results"
          :key="occ.code"
          :style="{ cursor: 'pointer', background: selection.selectedCodes.includes(occ.code) ? '#d0f0d0' : '' }"
          @click="selection.toggleSelection(occ.code)"
        >
          <strong>{{ occ.title }}</strong> ({{ occ.code }})
          <p>{{ occ.description }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>
