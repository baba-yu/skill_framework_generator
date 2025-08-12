<script setup lang="ts">
import BaseTagInput from "@/components/base/BaseTagInput.vue";
import { fetchOccupations, type Occupation } from "@/api/occupations";
import { useSelectionStore } from "@/store/selection";
import { useSearchStore } from "@/store/search";
import { useLoadingStore } from "@/store/loading";

const selection = useSelectionStore();
const search = useSearchStore();      // ← keywords/results はここに保持
const loading = useLoadingStore();

async function searchSubmit() {
  const kw = (search.keywords ?? []).filter(Boolean).slice(0,3);
  if (kw.length === 0) return;
  loading.startLoading("search");
  try {
    console.log("[SEARCH] keywords:", kw);
    const data: Occupation[] = await fetchOccupations(kw);
    console.log("[SEARCH] results:", data.length);
    search.setResults(data);          // ← ストアに保存（persist 対象）
  } catch (e) {
    console.error("[SEARCH] failed:", e);
    search.setResults([]);            // ← 失敗時は空に
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
        <!-- ★ タグ入力はストア配列に直結 -->
        <BaseTagInput v-model="search.keywords" :max="3" placeholder="Add keyword and press Enter" />
        <button type="submit">Search</button>
      </form>

      <div style="margin-left:auto; display:flex; gap:8px;">
        <button
          type="button"
          :disabled="selection.selectedCodes.length === 0"
          @click="$router.push({ path: '/preview', query: { codes: selection.selectedCodes.join(',') } })"
        >
          Review your framework ({{ selection.selectedCodes.length }})
        </button>
        <button type="button" @click="clearAllSelected">Clear all</button>
      </div>
    </div>

    <!-- ★ 結果はストアから直接読む -->
    <div v-if="search.results.length" style="margin-top:12px;">
      <h3>Results (click to select):</h3>
      <ul>
        <li
          v-for="occ in search.results"
          :key="occ.code"
          :style="{ cursor: 'pointer', background: selection.selectedCodes.includes(occ.code) ? '#d0f0d0' : '' }"
          @click="selection.toggleSelection(occ.code)"
        >
          <strong>{{ occ.title }}</strong> ({{ occ.code }})
          <p>{{ occ.description }}</p>
        </li>
      </ul>
    </div>

    <p v-else style="margin-top:12px; color:#666;">No results yet</p>
  </div>
</template>
