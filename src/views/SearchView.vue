<template>
    <div>
      <h2>Search Occupations</h2>
  
      <!-- 検索フォーム -->
      <form @submit.prevent="search">
        <input v-model="keyword1" placeholder="Keyword 1" />
        <input v-model="keyword2" placeholder="Keyword 2" />
        <input v-model="keyword3" placeholder="Keyword 3" />
        <button type="submit">Search</button>
      </form>
  
      <!-- 選択管理ツールバー -->
      <div style="margin: .75rem 0; display:flex; gap:.5rem; align-items:center;">
        <span>Selected: <strong>{{ store.selectedCodes.length }}</strong></span>
        <button
          type="button"
          @click="onClear()"
          :disabled="store.selectedCodes.length === 0"
          title="Clear selected codes"
        >
          Clear selection
        </button>
  
        <!-- プレビューへ遷移 -->
        <router-link
          v-if="store.selectedCodes.length"
          :to="{ path: '/preview', query: { codes: store.selectedCodes.join(',') } }"
          style="margin-left:auto"
        >
          Go to Preview ({{ store.selectedCodes.length }} selected)
        </router-link>
      </div>
  
      <!-- 検索結果 -->
      <div v-if="results.length">
        <h3>Results (click to select):</h3>
        <ul>
          <li
            v-for="occ in results"
            :key="occ.code"
            :style="{ cursor: 'pointer', background: store.selectedCodes.includes(occ.code) ? '#d0f0d0' : '' }"
            @click="store.toggleSelection(occ.code)"
          >
            <strong>{{ occ.title }}</strong> ({{ occ.code }})
            <p>{{ occ.description }}</p>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from "vue";
  import { fetchOccupations, type Occupation } from "@/api/occupations";
  import { useSelectionStore } from "@/store/selection";
  
  const store = useSelectionStore();
  
  const keyword1 = ref("");
  const keyword2 = ref("");
  const keyword3 = ref("");
  const results = ref<Occupation[]>([]);
  
  async function search() {
    const keywords = [keyword1.value, keyword2.value, keyword3.value].filter(k => k);
    results.value = await fetchOccupations(keywords);
  }
  
  function onClear() {
    // 必要なら確認ダイアログを出す：
    // if (!confirm("Clear all selected codes?")) return;
    store.clearSelection();
  }
  </script>
  