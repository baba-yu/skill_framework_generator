<template>
  <BaseLayout>
    <div class="preview-view">
      <!-- ブレッドクラム -->
      <div class="breadcrumb">
        <button class="back-button" @click="$router.push('/')">
          ← Back to framework selection
        </button>
      </div>

      <!-- タイトルエリア -->
      <div class="title-section">
        <div class="title-content">
          <h1>Preview</h1>
          <p class="subtitle">
            Includes the skills for the following occupation(s): {{ occupationNames }}
          </p>
        </div>
        <button 
          class="btn btn-primary btn-lg download-button" 
          @click="downloadCSV" 
          :disabled="!hasSkills"
        >
          Download
        </button>
      </div>

      <!-- 3カラムレイアウト -->
      <div class="content-grid">
        <!-- カテゴリー列 -->
        <SkillCategories
          :categories="availableCategories"
          :selected-category="selectedCategory"
          :is-loading="loading.loadingKeys.includes('preview')"
          :error="error"
          @select="selectCategory"
        />

        <!-- スキル列 -->
        <SkillList
          :skills="selectedCategorySkills"
          :selected-skill="selectedSkill"
          :selected-category="selectedCategory"
          :is-loading="loading.loadingKeys.includes('preview')"
          @select="selectSkill"
        />

        <!-- 詳細列 -->
        <SkillDetail
          :skill="selectedSkill"
          :selected-category="selectedCategory"
          :category-skills-count="selectedCategorySkills.length"
        />
      </div>
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useSelectionStore } from '@/store/selection';
import { useLoadingStore } from '@/store/loading';
import { fetchFrameworkPreviewAll, type SkillItem } from '@/api/preview';
import { downloadCsv } from '@/utils/csv';
import BaseLayout from '@/components/base/BaseLayout.vue';
import SkillCategories from '@/components/preview/SkillCategories.vue';
import SkillList from '@/components/preview/SkillList.vue';
import SkillDetail from '@/components/preview/SkillDetail.vue';

// Router and Stores
const route = useRoute();
const selection = useSelectionStore();
const loading = useLoadingStore();
const { selectedCodes: codes } = storeToRefs(selection);

// State
const skills = ref<SkillItem[]>([]);
const error = ref('');
const selectedCategory = ref('');
const selectedSkill = ref<SkillItem | null>(null);

// Computed
const availableCategories = computed(() => {
  const categories = [...new Set(skills.value.map(s => s.category))];
  return categories.sort();
});

const selectedCategorySkills = computed(() => {
  if (!selectedCategory.value) return [];
  return skills.value.filter(s => s.category === selectedCategory.value);
});

const occupationNames = computed(() => {
  const count = codes.value.length;
  return `${count} occupation${count !== 1 ? 's' : ''}`;
});

const hasSkills = computed(() => skills.value.length > 0);

// Methods
function selectCategory(category: string) {
  selectedCategory.value = category;
  // 最初のスキルを自動選択
  const categorySkills = selectedCategorySkills.value;
  if (categorySkills.length > 0) {
    selectedSkill.value = categorySkills[0];
  } else {
    selectedSkill.value = null;
  }
}

function selectSkill(skill: SkillItem) {
  selectedSkill.value = skill;
}

function downloadCSV() {
  if (skills.value.length === 0) return;
  
  const headers = ['category', 'skill_name', 'description'];
  const rows = skills.value.map(skill => [
    skill.category,
    skill.name,
    skill.description
  ]);
  
  downloadCsv('skills_framework.csv', headers, rows);
}

// クエリからコードを解析
function parseCodesFromQuery(): string[] {
  const q = route.query.codes;
  if (!q) return [];
  if (Array.isArray(q)) return q.flatMap(s => s.split(",")).filter(Boolean);
  return String(q).split(",").filter(Boolean);
}

// コードの確保
async function ensureCodes() {
  if (codes.value.length === 0) {
    const fromQuery = parseCodesFromQuery();
    if (fromQuery.length) {
      selection.setSelectedCodes(fromQuery);
    }
  }
}

// プレビューの読み込み
async function loadPreview(handoff = false) {
  await ensureCodes();
  
  if (codes.value.length === 0) {
    error.value = 'No selection. Please go back and select at least one code.';
    return;
  }

  if (!handoff) loading.startLoading('preview');
  error.value = '';

  try {
    skills.value = await fetchFrameworkPreviewAll(codes.value);
    
    // 最初のカテゴリーを自動選択
    if (availableCategories.value.length > 0 && !selectedCategory.value) {
      selectCategory(availableCategories.value[0]);
    }
  } catch (e) {
    error.value = 'Failed to load preview.';
    console.error('Preview error:', e);
  } finally {
    loading.stopLoading('preview');
  }
}

// カテゴリー変更時のスキル自動選択
watch(selectedCategorySkills, (newSkills) => {
  if (newSkills.length > 0 && (!selectedSkill.value || !newSkills.includes(selectedSkill.value))) {
    selectedSkill.value = newSkills[0];
  } else if (newSkills.length === 0) {
    selectedSkill.value = null;
  }
});

// Mount
onMounted(async () => {
  loading.startLoading('preview');
  loading.stopLoading('nav');
  await loadPreview(true);
});
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;

.preview-view {
  width: 100%;
  max-width: $layout-max-width;
  margin: 0 auto;
  padding: $space-6 $layout-padding $space-8;
  min-height: calc(100vh - #{$header-height});
  
  @media (max-width: $breakpoint-md) {
    padding: $space-4 $layout-padding-mobile $space-6;
  }
}

/* ブレッドクラム */
.breadcrumb {
  margin-bottom: $space-4;
}

.back-button {
  background: none;
  border: none;
  color: $color-text-secondary;
  cursor: pointer;
  font-size: $font-size-sm;
  padding: $space-2 0;
  transition: $transition-colors;
  
  &:hover {
    color: $color-text;
  }
  
  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
    border-radius: $radius-sm;
  }
}

/* タイトルセクション */
.title-section {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: $space-6;
  padding: $space-4 0;
  gap: $space-4;
}

.title-content {
  flex: 1;
}

.title-content h1 {
  margin: 0 0 $space-2 0;
  font-size: $font-size-4xl;
  font-weight: $font-weight-bold;
  color: $color-text;
  
  @media (max-width: $breakpoint-md) {
    font-size: $font-size-3xl;
  }
}

.subtitle {
  margin: 0;
  color: $color-text-secondary;
  font-size: $font-size-base;
  line-height: $line-height-relaxed;
  
  @media (max-width: $breakpoint-md) {
    font-size: $font-size-sm;
  }
}

.download-button {
  flex-shrink: 0;
  white-space: nowrap;
}

/* コンテンツグリッド */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1px;
  background: $color-border;
  border: $border-width solid $color-border;
  border-radius: $radius-lg;
  overflow: hidden;
  min-height: 500px;
  box-shadow: $shadow-card;
}

/* レスポンシブ対応 */
@media (max-width: $breakpoint-lg) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 0;
    min-height: auto;
  }
  
  .title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: $space-4;
  }
  
  .download-button {
    align-self: stretch;
  }
}

@media (max-width: $breakpoint-md) {
  .preview-view {
    min-height: calc(100vh - #{$header-height});
  }
  
  .title-section {
    padding: $space-3 0;
    margin-bottom: $space-4;
  }
  
  .content-grid {
    border-radius: $radius-md;
    min-height: 400px;
  }
}

/* ダークモード対応の準備 */
@media (prefers-color-scheme: dark) {
  // 将来のダークモード実装用
}
</style>
