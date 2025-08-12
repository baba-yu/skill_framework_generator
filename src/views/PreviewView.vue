<template>
    <div>
      <h2>Preview</h2>
  
      <section v-if="codes.length">
        <p>Selected Codes:</p>
        <ul>
          <li v-for="c in codes" :key="c">{{ c }}</li>
        </ul>
      </section>
      <section v-else>
        <p>No selection</p>
        <router-link to="/">Back to Search</router-link>
      </section>
  
      <section v-if="codes.length" style="margin-top: 1rem;">
        <button @click="load()" :disabled="isPreviewLoading">
          {{ isPreviewLoading ? "Loading..." : "Load Preview" }}
        </button>
        <button @click="onDownload" :disabled="!items.length" style="margin-left: .5rem;">
          Download CSV
        </button>
      </section>
  
      <section v-if="items.length" style="margin-top: 1rem;">
        <h3>Category: {{ category }}</h3>
        <ul>
          <li v-for="(it, i) in items" :key="i">
            <strong>{{ it.name }}</strong><br />
            <small>{{ it.description }}</small>
          </li>
        </ul>
      </section>
  
      <section v-if="error" style="margin-top: 1rem; color: #c00;">
        {{ error }}
      </section>
  
      <router-link to="/" style="display:block; margin-top: 1rem;">Back to Search</router-link>
    </div>
</template>
  
<script setup lang="ts">
  import { computed, onMounted, ref } from "vue";
  import { storeToRefs } from "pinia";
  import { useRoute } from "vue-router";
  import { useSelectionStore } from "@/store/selection";
  import { fetchFrameworkPreviewAll, type SkillItem } from "@/api/preview";
  import { downloadCsv } from "@/utils/csv";
  import { useLoadingStore } from "@/store/loading"; // ★追加
  
  const route = useRoute();
  const store = useSelectionStore();
  const { selectedCodes: codes } = storeToRefs(store);
  
  const items = ref<SkillItem[]>([]);
  const error = ref<string>("");
  
  // ★ ローディング（loadingストア）を利用
  const loading = useLoadingStore();
  // 「preview処理中か？」をキーで判定（ボタンの活性/文言に使用）
  const isPreviewLoading = computed(() => loading.loadingKeys.includes("preview"));
  
  function parseCodesFromQuery(): string[] {
    const q = route.query.codes;
    if (!q) return [];
    if (Array.isArray(q)) return q.flatMap(s => s.split(",")).filter(Boolean);
    return String(q).split(",").filter(Boolean);
  }
  
  async function ensureCodes() {
    if (codes.value.length === 0) {
      const fromQuery = parseCodesFromQuery();
      if (fromQuery.length) {
        store.selectedCodes = fromQuery;
      }
    }
  }
  
  // ★ handoff=true のときは start は呼ばず、stop だけ行う
  async function load(handoff = false) {
    await ensureCodes();
    if (!codes.value.length) {
      error.value = "No selection. Please go back and select at least one code.";
      return;
    }
    if (!handoff) loading.startLoading("preview");
    error.value = "";
    try {
      items.value = await fetchFrameworkPreviewAll(codes.value);
    } catch (e) {
      error.value = "Failed to load preview.";
    } finally {
      loading.stopLoading("preview");
    }
  }
  
  onMounted(async () => {
    // ★ シームレス引き継ぎ：
    // 1) 到着直後に preview ローディングを開始
    loading.startLoading("preview");
    // 2) nav を停止（オーバーレイ担当を引き継ぐ）
    loading.stopLoading("nav");
    // 3) API実行（handoff=true で二重 start を避ける）
    await load(true);
  });
  
  // （grouped はそのまま）
  const grouped = computed<Record<string, SkillItem[]>>(() =>
    items.value.reduce((acc, it) => {
      (acc[it.category] ||= []).push(it);
      return acc;
    }, {} as Record<string, SkillItem[]>)
  );
  
  function onDownload() {
    if (!items.value.length) return;
    const headers = ["category", "skill_name", "description"];
    const rows = items.value.map(it => [it.category, it.name, it.description]);
    downloadCsv("skills_preview.csv", headers, rows);
  }
</script>
  