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
        <BaseButton 
          variant="primary"
          size="lg"
          :disabled="!hasSkills"
          @click="downloadCSV"
          class="download-button"
        >
          Download
        </BaseButton>
      </div>

      <!-- 3カラムレイアウト -->
      <div class="content-layout">
        <!-- カテゴリーヘッダー -->
        <div class="column-header">CATEGORIES</div>
        <!-- スキルヘッダー -->
        <div class="column-header">SKILLS</div>
        <!-- 詳細ヘッダー -->
        <div class="column-header">SKILL DETAILS</div>
        
        <!-- カテゴリーカード -->
        <div class="content-card categories-card">
          <div v-if="loading.loadingKeys.includes('preview')" class="loading-state">
            <div class="loading">
              <div class="loading-dots">
                <span class="loading-dot"></span>
                <span class="loading-dot"></span>
                <span class="loading-dot"></span>
              </div>
              <span class="loading-text">Loading...</span>
            </div>
          </div>
          
          <div v-else-if="error" class="error-state">
            <div class="error-icon">⚠️</div>
            <p class="error-message">{{ error }}</p>
          </div>
          
          <div v-else-if="availableCategories.length > 0" class="category-list">
            <button
              v-for="category in availableCategories"
              :key="category"
              class="category-item"
              :class="{ active: selectedCategory === category }"
              @click="selectCategory(category)"
            >
              <span class="category-name">{{ formatCategoryName(category) }}</span>
            </button>
          </div>
          
          <div v-else class="empty-state">
            <div class="empty-icon">📁</div>
            <p class="empty-message">No categories available</p>
          </div>
        </div>
        
        <!-- スキルカード -->
        <div class="content-card skills-card">
          <div v-if="selectedCategorySkills.length > 0" class="skills-list">
            <button
              v-for="skill in selectedCategorySkills"
              :key="skill.name"
              class="skill-item"
              :class="{ active: selectedSkill?.name === skill.name }"
              @click="selectSkill(skill)"
            >
              <span class="skill-name">{{ skill.name }}</span>
            </button>
          </div>
          
          <div v-else-if="selectedCategory && !loading.loadingKeys.includes('preview')" class="empty-state">
            <div class="empty-icon">📝</div>
            <p class="empty-message">No skills available in this category</p>
          </div>
          
          <div v-else-if="!selectedCategory && !loading.loadingKeys.includes('preview')" class="no-selection-state">
            <div class="no-selection-icon">👆</div>
            <p class="no-selection-message">Select a category to view skills</p>
          </div>
          
          <div v-else class="loading-state">
            <div class="loading">
              <div class="loading-dots">
                <span class="loading-dot"></span>
                <span class="loading-dot"></span>
                <span class="loading-dot"></span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 詳細カード -->
        <div class="content-card details-card">
          <div v-if="selectedSkill" class="skill-details">
            <div class="skill-header">
              <h4 class="skill-title">{{ selectedSkill.name }}</h4>
              <div class="skill-category">
                <span class="category-label">Category:</span>
                <span class="category-value">{{ formatCategoryName(selectedSkill.category) }}</span>
              </div>
            </div>
            
            <div class="skill-description-container">
              <h5 class="description-title">Description</h5>
              <div class="skill-description-scroll">
                <p class="skill-description">{{ selectedSkill.description }}</p>
              </div>
            </div>
          </div>
          
          <div v-else-if="selectedCategory && selectedCategorySkills.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <h4 class="empty-title">No Skills Available</h4>
            <p class="empty-message">
              There are no skills in the "{{ formatCategoryName(selectedCategory) }}" category.
            </p>
          </div>
          
          <div v-else-if="selectedCategory" class="no-selection-state">
            <div class="no-selection-icon">👈</div>
            <h4 class="no-selection-title">Select a Skill</h4>
            <p class="no-selection-message">
              Choose a skill from the list to view its details.
            </p>
          </div>
          
          <div v-else class="initial-state">
            <div class="initial-icon">📚</div>
            <h4 class="initial-title">Skill Details</h4>
            <p class="initial-message">
              Select a category and skill to view detailed information.
            </p>
          </div>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useSelectionStore } from '@/store/selection';
import { useSearchStore } from '@/store/search';
import { useLoadingStore } from '@/store/loading';
import { fetchFrameworkPreviewAll, type SkillItem } from '@/api/preview';
import { downloadCsv } from '@/utils/csv';
import BaseLayout from '@/components/base/BaseLayout.vue';
import BaseButton from '@/components/base/BaseButton.vue';

// Router and Stores
const route = useRoute();
const selection = useSelectionStore();
const search = useSearchStore();
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
  // 選択されたコードに対応する職業タイトルを取得
  const searchResults = search.results;
  const selectedTitles = codes.value
    .map(code => {
      const occupation = searchResults.find(result => result.code === code);
      return occupation?.title;
    })
    .filter(Boolean); // undefinedを除外
  
  if (selectedTitles.length > 0) {
    // タイトルがある場合は、カンマ区切りで表示
    return selectedTitles.join(', ');
  } else {
    // フォールバック: 件数表示
    const count = codes.value.length;
    return `${count} occupation${count !== 1 ? 's' : ''}`;
  }
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

function formatCategoryName(category: string): string {
  switch (category) {
    case 'technology_skills':
      return 'Technology Skills';
    case 'skills':
      return 'Skills';
    case 'knowledge':
      return 'Knowledge';
    default:
      return category
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
  }
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
  } catch (e: any) {
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
  color: #4F4F4F; // 統一色に変更
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
  font-size: $font-size-sm; // 14px
  line-height: $line-height-relaxed;
  
  @media (max-width: $breakpoint-md) {
    font-size: $font-size-xs; // モバイルでは12px
  }
}

.download-button {
  flex-shrink: 0;
  white-space: nowrap;
}

/* コンテンツレイアウト */
.content-layout {
  display: grid;
  grid-template-columns: 292px 292px 584px;
  grid-template-rows: auto auto; // 可変高さに変更
  gap: $space-2; // 12px → 8px にもっと詰める
  width: fit-content;
  margin: 0 auto;
}

/* カラムヘッダー */
.column-header {
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  color: #4F4F4F; // 統一色
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-bottom: 2px; // 4px → 2px にもっと詰める
  align-self: end;
}

/* コンテンツカード */
.content-card {
  background: $color-white;
  border: $border-width solid $color-border; // 1px
  border-radius: $radius-lg;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.categories-card,
.skills-card {
  max-width: 292px;
  height: 630px; // 左2つは固定630px
}

.details-card {
  max-width: 584px;
  min-height: 630px; // 最小高さ630px、可変
}

/* カテゴリーリスト */
.category-list {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: 100%;
}

.category-item {
  background: none;
  border: none;
  padding: 0; // パディングをリセット
  text-align: left;
  cursor: pointer;
  color: #828282; // デフォルト文字色
  font-size: $font-size-sm;
  font-weight: $font-weight-normal;
  transition: $transition-colors;
  position: relative;
  margin: 0 10px; // 左右10pxマージン
  height: 32px; // 高さ32px
  display: flex;
  align-items: center;
  
  &:hover {
    color: #333333;
  }
  
  &.active {
    background: #F3F6F7; // インナーレクタングル
    color: #333333; // 選択時文字色
    font-weight: $font-weight-medium;
    border-radius: $radius-sm; // 角丸
  }
  
  &:focus-visible {
    outline: none;
    background: $color-gray-100;
  }
}

.category-name {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 $space-3; // 内側のパディング
}

/* スキルリスト */
.skills-list {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: 100%;
}

.skill-item {
  background: none;
  border: none;
  padding: 0; // パディングをリセット
  text-align: left;
  cursor: pointer;
  color: #828282; // デフォルト文字色
  font-size: $font-size-sm;
  font-weight: $font-weight-normal;
  transition: $transition-colors;
  position: relative;
  margin: 0 10px; // 左右10pxマージン
  height: 32px; // 高さ32px
  display: flex;
  align-items: center;
  
  &:hover {
    color: #333333;
  }
  
  &.active {
    background: #F3F6F7; // インナーレクタングル
    color: #333333; // 選択時文字色
    font-weight: $font-weight-medium;
    border-radius: $radius-sm; // 角丸
  }
  
  &:focus-visible {
    outline: none;
    background: $color-gray-100;
  }
}

.skill-name {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 $space-3; // 内側のパディング
}

/* 詳細カード */
.skill-details {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: $space-4;
  overflow-y: auto;
}

.skill-header {
  margin-bottom: $space-4;
  padding-bottom: $space-4;
  border-bottom: $border-width solid $color-border-light;
  flex-shrink: 0;
}

.skill-title {
  margin: 0 0 $space-3 0;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $color-text;
  line-height: $line-height-tight;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.skill-category {
  display: flex;
  align-items: center;
  gap: $space-2;
  font-size: $font-size-xs;
}

.category-label {
  color: #4F4F4F; // 統一色
  font-weight: $font-weight-medium;
}

.category-value {
  color: $color-primary;
  font-weight: $font-weight-medium;
  background: $color-primary-light;
  padding: 2px 6px;
  border-radius: $radius-sm;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.skill-description-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.description-title {
  margin: 0 0 $space-3 0;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: #4F4F4F; // 統一色
  flex-shrink: 0;
}

.skill-description-scroll {
  flex: 1;
  overflow-y: auto;
  padding-right: $space-2;
  
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: $color-gray-100;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: $color-gray-300;
    border-radius: 3px;

    &:hover {
      background: $color-gray-400;
    }
  }
}

.skill-description {
  margin: 0;
  color: $color-text;
  line-height: $line-height-relaxed;
  font-size: $font-size-sm;
  word-break: break-word;
}

/* 状態表示 */
.loading-state,
.error-state,
.empty-state,
.no-selection-state,
.initial-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  padding: $space-4;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-3;
  color: #4F4F4F; // 統一色
}

.loading-dots {
  display: flex;
  gap: $space-1;
}

.loading-dot {
  width: 6px;
  height: 6px;
  background: currentColor;
  border-radius: 50%;
  animation: loadingDot 1.4s infinite ease-in-out;

  &:nth-child(1) { animation-delay: -0.32s; }
  &:nth-child(2) { animation-delay: -0.16s; }
  &:nth-child(3) { animation-delay: 0s; }
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

.loading-text {
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
}

.error-icon,
.empty-icon,
.no-selection-icon,
.initial-icon {
  font-size: 24px;
  margin-bottom: $space-2;
}

.error-message,
.empty-message,
.no-selection-message,
.initial-message {
  margin: 0;
  color: #4F4F4F; // 統一色
  font-size: $font-size-xs;
  line-height: $line-height-relaxed;
}

.empty-title,
.no-selection-title,
.initial-title {
  margin: 0 0 $space-2 0;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: #4F4F4F; // 統一色
}

/* カスタムスクロールバー */
.category-list,
.skills-list {
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: $color-gray-300;
    border-radius: 3px;

    &:hover {
      background: $color-gray-400;
    }
  }
}

/* レスポンシブ対応 */
@media (max-width: $breakpoint-lg) {
  .content-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto;
    gap: $space-2;
    width: 100%;
  }
  
  .content-card {
    height: 400px;
    max-width: 100%;
  }
  
  .categories-card,
  .skills-card {
    height: 400px;
  }
  
  .details-card {
    min-height: 400px;
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
  
  .content-layout {
    gap: $space-1;
  }
  
  .content-card {
    height: 300px;
  }
  
  .categories-card,
  .skills-card {
    height: 300px;
  }
  
  .details-card {
    min-height: 300px;
  }
  
  .column-header {
    font-size: 10px;
  }
  
  .category-item,
  .skill-item {
    margin: 0 8px; // モバイルでは8pxマージン
    height: 28px; // モバイルでは28px高さ
  }
}

/* ダークモード対応の準備 */
@media (prefers-color-scheme: dark) {
  // 将来のダークモード実装用
}
</style>