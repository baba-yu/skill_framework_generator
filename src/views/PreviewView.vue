<template>
  <BaseLayout>
    <div class="preview-view">
      <!-- ブレッドクラム -->
      <div class="breadcrumb">
        <button class="back-button" @click="$router.push('/skill-framework-builder')">
          ← Back to framework selection
        </button>
      </div>

      <!-- タイトルエリア -->
      <div class="title-section">
        <div class="title-content">
          <h2>Preview</h2>
          <p class="subtitle">
            Includes the skills for the following role(s): {{ occupationNames }}
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

      <!-- コンテンツレイアウト -->
      <div class="content-layout">
        <!-- カテゴリーセクション -->
        <div class="content-section">
          <div class="column-header">CATEGORIES</div>
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
              <h4 class="error-title">Error</h4>
              <p class="error-message">{{ error }}</p>
            </div>
            
            <div v-else-if="availableCategories.length === 0" class="empty-state">
              <div class="empty-icon">📂</div>
              <h4 class="empty-title">No Categories</h4>
              <p class="empty-message">No skill categories available for the selected occupations.</p>
            </div>
            
            <div v-else class="category-list">
              <button
                v-for="category in availableCategories"
                :key="category"
                :class="['category-item', { active: selectedCategory === category }]"
                @click="selectCategory(category)"
              >
                <span class="category-name">{{ formatCategoryName(category) }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- スキルセクション -->
        <div class="content-section">
          <div class="column-header">SKILLS</div>
          <div class="content-card skills-card">
            <div v-if="selectedCategory && selectedCategorySkills.length > 0" class="skills-list">
              <button
                v-for="(skill, index) in selectedCategorySkills"
                :key="`${skill.category}-${skill.name}-${index}`"
                :class="['skill-item', { active: selectedSkill && selectedSkill.name === skill.name && selectedSkill.category === skill.category }]"
                @click="selectSkill(skill)"
              >
                <span class="skill-name">{{ skill.name }}</span>
              </button>
            </div>
            
            <div v-else-if="selectedCategory && selectedCategorySkills.length === 0" class="empty-state">
              <h4 class="empty-title">No Skills Available</h4>
              <p class="empty-message">
                There are no skills in the "{{ formatCategoryName(selectedCategory) }}" category.
              </p>
            </div>
            
            <div v-else-if="!selectedCategory && !loading.loadingKeys.includes('preview')" class="no-selection-state">
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
        </div>
        
        <!-- スキル詳細セクション -->
        <div class="content-section">
          <div class="column-header">SKILL DETAILS</div>
          <div class="content-card details-card">
            <div v-if="selectedSkill" class="skill-details">
              <!-- パンくずナビ -->
              <div class="skill-breadcrumb">
                {{ formatCategoryName(selectedSkill.category) }} > {{ selectedSkill.name }}
              </div>
              
              <!-- スキル名 -->
              <h4 class="skill-title">{{ selectedSkill.name }}</h4>
              
              <!-- 説明ボックス -->
              <div class="skill-description-box">
                <div class="description-wrapper">
                  <p 
                    ref="descriptionRef"
                    :class="[
                      'skill-description', 
                      { 'is-truncated': !isDescriptionExpanded && needsDescriptionTruncation }
                    ]"
                  >{{ selectedSkill.description }}</p>
                  
                  <button
                    v-if="needsDescriptionTruncation"
                    class="see-all-toggle"
                    @click="toggleDescriptionExpanded"
                    :aria-expanded="isDescriptionExpanded"
                    :aria-label="isDescriptionExpanded ? 'テキストを省略表示する' : 'テキストを全文表示する'"
                  >
                    <span class="toggle-text">
                      {{ isDescriptionExpanded ? 'See less' : 'See all' }}
                    </span>
                    <svg 
                      class="toggle-icon"
                      :class="{ 'is-expanded': isDescriptionExpanded }"
                      width="12" 
                      height="12" 
                      viewBox="0 0 12 12" 
                      fill="none"
                    >
                      <path 
                        d="M3 4.5L6 7.5L9 4.5" 
                        stroke="currentColor" 
                        stroke-width="1.5" 
                        stroke-linecap="round" 
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div v-else-if="selectedCategory && selectedCategorySkills.length === 0" class="empty-state">
              <h4 class="empty-title">No Skills Available</h4>
              <p class="empty-message">
                There are no skills in the "{{ formatCategoryName(selectedCategory) }}" category.
              </p>
            </div>
            
            <div v-else-if="selectedCategory" class="no-selection-state">
              <h4 class="no-selection-title">Select a Skill</h4>
              <p class="no-selection-message">
                Choose a skill from the list to view its details.
              </p>
            </div>
            
            <div v-else class="initial-state">
              <h4 class="initial-title">Skill Details</h4>
              <p class="initial-message">
                Select a category and skill to view detailed information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
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

// Description truncation
const descriptionRef = ref<HTMLElement | null>(null);
const isDescriptionExpanded = ref(false);
const needsDescriptionTruncation = ref(false);
const MAX_DESCRIPTION_LINES = 3;
const MAX_DESCRIPTION_LENGTH = 200; // 200文字で省略

// Computed
const availableCategories = computed(() => {
  const categories = [...new Set(skills.value.map(s => s.category))];
  return categories.sort();
});

const selectedCategorySkills = computed(() => {
  if (!selectedCategory.value) return [];
  const filteredSkills = skills.value.filter(s => s.category === selectedCategory.value);
  return filteredSkills.sort((a, b) => a.name.localeCompare(b.name));
});

const occupationNames = computed(() => {
  // 新しいアプローチ：選択ストアから直接取得
  const selectedOccupations = selection.allSelectedOccupations;
  
  if (selectedOccupations.length > 0) {
    // 選択ストアから職業タイトルを取得
    return selectedOccupations.map(occ => occ.title).join(', ');
  } else {
    // フォールバック: 件数表示
    const count = codes.value.length;
    return `${count} occupation${count !== 1 ? 's' : ''}`;
  }
});

const hasSkills = computed(() => skills.value.length > 0);

// Description truncation methods
const checkDescriptionTruncation = () => {
  if (!selectedSkill.value?.description) {
    needsDescriptionTruncation.value = false;
    return;
  }
  
  const description = selectedSkill.value.description;
  const lines = description.split('\n');
  
  console.log('=== Description Analysis ===');
  console.log('Description lines:', lines.length);
  console.log('Description length:', description.length);
  console.log('Description preview:', description.substring(0, 100) + '...');
  console.log('Lines array:', lines);
  
  // 改行コードによる行数チェック OR 文字数による判定
  const hasMultipleLines = lines.length > MAX_DESCRIPTION_LINES;
  const isTooLong = description.length > MAX_DESCRIPTION_LENGTH;
  
  needsDescriptionTruncation.value = hasMultipleLines || isTooLong;
  
  console.log('hasMultipleLines:', hasMultipleLines);
  console.log('isTooLong:', isTooLong);
  console.log('needsDescriptionTruncation:', needsDescriptionTruncation.value);
  console.log('========================');
};

const toggleDescriptionExpanded = () => {
  isDescriptionExpanded.value = !isDescriptionExpanded.value;
  console.log('Description expanded:', isDescriptionExpanded.value);
};

// Watchers
watch(() => selectedSkill.value, () => {
  isDescriptionExpanded.value = false;
  nextTick(() => {
    checkDescriptionTruncation();
  });
}, { immediate: true });

// Methods
function selectCategory(category: string) {
  selectedCategory.value = category;
  selectedSkill.value = null; // まずリセット
  
  // カテゴリのスキルを取得して最初のスキルを自動選択
  const categorySkills = skills.value.filter(s => s.category === category);
  if (categorySkills.length > 0) {
    selectedSkill.value = categorySkills[0];
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

async function loadSkills() {
  if (codes.value.length === 0) {
    return;
  }

  loading.startLoading('preview');
  error.value = '';
  
  try {
    const data = await fetchFrameworkPreviewAll(codes.value);
    skills.value = data;
    
    // 最初のカテゴリーを自動選択
    if (availableCategories.value.length > 0) {
      selectCategory(availableCategories.value[0]);
    }
  } catch (err) {
    console.error('Failed to load skills:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load skills';
  } finally {
    loading.stopLoading('preview');
  }
}

//FIXME: This includes csv utils functions. It should be devided from here.
function downloadCSV() {
  if (skills.value.length === 0) return;
  
  // ヘッダーを定義
  const headers = ['category', 'skill_name', 'description']; 
  
  // データを2次元配列に変換
  const rows = skills.value.map(skill => [
    formatCategoryName(skill.category),
    skill.name,
    skill.description
  ]);
  
  // 正しく3つの引数を渡す
  downloadCsv('skill-framework.csv', headers, rows);
}

// Lifecycle
onMounted(() => {
  const queryCodesParam = route.query.codes;
  if (typeof queryCodesParam === 'string' && queryCodesParam) {
    const queryCodes = queryCodesParam.split(',');
    
    if (queryCodes.length > 0) {
      selection.setSelectedCodes(queryCodes);
    }
  }
  
  loadSkills();
});

// Watch for changes in selected codes
watch(codes, () => {
  loadSkills();
}, { deep: true });
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

.breadcrumb {
  margin-bottom: $space-6;
}

.back-button {
  background: none;
  border: none;
  color: $color-text-secondary;
  cursor: pointer;
  font-size: $font-size-sm;
  padding: 0;
  
  &:hover {
    color: $color-primary;
  }
}

.title-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $space-4;
  padding-bottom: $space-6;
  border-bottom: $border-width solid $color-border-light;
  
  h1 {
    margin: 0 0 $space-2 0;
    font-size: $font-size-4xl;
    font-weight: $font-weight-bold;
    color: $color-text;
  }
  
  .subtitle {
    margin: 0;
    color: $color-text-secondary;
    font-size: $font-size-base;
    line-height: $line-height-relaxed;
  }
}

.content-layout {
  display: grid;
  grid-template-columns: minmax(250px, 25%) minmax(250px, 25%) minmax(400px, 50%);
  gap: $space-6;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  align-items: start;
  overflow: hidden;
}

.content-section {
  display: flex;
  flex-direction: column;
}

/* カラムヘッダー */
.column-header {
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  color: #4F4F4F;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-bottom: $space-2;
  margin-bottom: $space-2;
}

/* コンテンツカード */
.content-card {
  background: $color-white;
  border: $border-width solid $color-border;
  border-radius: $radius-lg;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.categories-card,
.skills-card {
  height: 630px;
}

.details-card {
  min-height: 230px;
  height: auto;
}

/* カテゴリーリスト */
.category-list {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: 100%;
  padding: $space-2;
  gap: 2px;
}

.category-item {
  background: none;
  border: none;
  padding: 0 $space-3;
  text-align: left;
  cursor: pointer;
  color: #828282;
  font-size: $font-size-sm;
  font-weight: $font-weight-normal;
  transition: $transition-colors;
  position: relative;
  margin: 0;
  height: 32px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  
  &:hover {
    color: #333333;
  }
  
  &.active {
    background: #F3F6F7;
    color: #333333;
    font-weight: $font-weight-medium;
    border-radius: $radius-sm;
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
  width: 100%;
}

/* スキルリスト */
.skills-list {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: 100%;
  padding: $space-2;
  gap: 2px;
}

.skill-item {
  background: none;
  border: none;
  padding: 0 $space-3;
  text-align: left;
  cursor: pointer;
  color: #828282;
  font-size: $font-size-sm;
  font-weight: $font-weight-normal;
  transition: $transition-colors;
  position: relative;
  margin: 0;
  height: 32px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  
  &:hover {
    color: #333333;
  }
  
  &.active {
    background: #F3F6F7;
    color: #333333;
    font-weight: $font-weight-medium;
    border-radius: $radius-sm;
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
  width: 100%;
}

/* スキル詳細 */
.skill-details {
  padding: $space-5;
  height: 100%;
  overflow-y: auto;
}

.skill-breadcrumb {
  font-size: $font-size-xs;
  color: #828282;
  margin-bottom: $space-4;
}

.skill-title {
  margin: 0 0 $space-4 0;
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: $color-text;
  line-height: $line-height-tight;
}

.skill-description-box {
  background: #F8F9FA;
  border: 1px solid #E9ECEF;
  border-radius: $radius-md;
  padding: $space-4;
}

.description-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.skill-description {
  margin: 0;
  color: $color-text;
  line-height: $line-height-relaxed;
  font-size: $font-size-sm;
  white-space: pre-line;
  transition: all 0.3s ease;
  width: 100%;
  
  &.is-truncated {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    white-space: normal;
  }
}

.see-all-toggle {
  display: inline-flex;
  align-items: center;
  gap: $space-1;
  margin-top: $space-3;
  padding: $space-1 $space-2;
  background: transparent;
  border: none;
  color: $color-primary;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  cursor: pointer;
  border-radius: $radius-sm;
  transition: color 0.2s ease;

  &:hover {
    color: $color-primary-hover;
  }

  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }

  &:active {
    transform: translateY(1px);
  }
}

.toggle-text {
  font-size: inherit;
}

.toggle-icon {
  transition: transform 0.2s ease;
  color: currentColor;
  
  &.is-expanded {
    transform: rotate(180deg);
  }
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
  padding: $space-8;
  color: #4F4F4F;
}

.loading-dots {
  display: flex;
  gap: 4px;
  margin-bottom: $space-2;
}

.loading-dot {
  width: 8px;
  height: 8px;
  background: $color-primary;
  border-radius: 50%;
  animation: loadingDot 1.4s infinite ease-in-out;
}

.loading-text {
  color: #4F4F4F;
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
  color: #4F4F4F;
  font-size: $font-size-xs;
  line-height: $line-height-relaxed;
}

.empty-title,
.no-selection-title,
.initial-title {
  margin: 0 0 $space-2 0;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: #4F4F4F;
}

/* カスタムスクロールバー */
.category-list,
.skills-list,
.skill-details {
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

/* アクセシビリティ対応 */
@media (prefers-reduced-motion: reduce) {
  .skill-description,
  .toggle-icon,
  .see-all-toggle {
    transition: none;
  }
}

/* アニメーション */
@keyframes loadingDot {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}


/* レスポンシブ対応 - モバイルでは縦並び */
@media (max-width: 1200px) {
  .content-layout {
    grid-template-columns: minmax(150px, 25%) minmax(150px, 25%) minmax(400px, 50%);
    gap: $space-4;
  }
}

@media (max-width: 800px) {
  .content-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    gap: $space-3;
  }
  
  .categories-card,
  .skills-card {
    height: 200px;
  }
  
  .details-card {
    min-height: 150px;
  }

  .download-button {
    align-self: stretch;
  }
}

// @media (max-width: $breakpoint-lg) {
//   .content-layout {
//     grid-template-columns: 1fr;
//     grid-template-rows: auto auto auto;
//     gap: $space-4;
//     width: 100%;
//     margin: 0;
//   }
  
//   .content-card {
//     max-width: 100%;
//   }
  
//   .categories-card,
//   .skills-card {
//     height: 400px;
//   }
  
//   .details-card {
//     min-height: 300px;
//     height: auto;
//   }
  
//   .title-section {
//     flex-direction: column;
//     align-items: flex-start;
//     gap: $space-4;
//   }
  
//   .download-button {
//     align-self: stretch;
//   }
// }

// @media (max-width: $breakpoint-md) {
//   .preview-view {
//     min-height: calc(100vh - #{$header-height});
//   }
  
//   .title-section {
//     padding: $space-3 0;
//     margin-bottom: $space-4;
//   }
  
//   .content-layout {
//     gap: $space-3;
//   }
  
//   .content-card {
//     min-height: 250px;
//   }
  
//   .categories-card,
//   .skills-card {
//     height: 300px;
//   }
  
//   .details-card {
//     min-height: 250px;
//   }
  
//   .column-header {
//     font-size: 10px;
//   }
  
//   .category-item,
//   .skill-item {
//     height: 32px;
//   }
  
//   .category-list,
//   .skills-list {
//     padding: $space-2;
//   }
// }
</style>