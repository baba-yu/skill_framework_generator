<template>
  <div class="preview-view">
    <!-- ヘッダー -->
    <AppHeader @open-credit="openCreditModal" />

    <!-- メインコンテンツ -->
    <div class="main-content">
      <!-- 戻るボタン -->
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
            Includes the skills for the following occupation(s): 
            {{ occupationNames }}
          </p>
        </div>
        <button class="download-button" @click="downloadCSV" :disabled="!hasSkills">
          Download
        </button>
      </div>

      <!-- コンテンツグリッド：3列レイアウト -->
      <div class="content-grid">
        <!-- CATEGORIES カラム -->
        <div class="column categories-column">
          <h3 class="column-title">CATEGORIES</h3>
          <div class="column-content">
            <div v-if="loading.loadingKeys.includes('preview')" class="loading">
              Loading...
            </div>
            <div v-else-if="error" class="error">
              {{ error }}
            </div>
            <div v-else class="category-list">
              <button
                v-for="category in availableCategories"
                :key="category"
                class="category-item"
                :class="{ active: selectedCategory === category }"
                @click="selectCategory(category)"
              >
                {{ formatCategoryName(category) }}
              </button>
            </div>
          </div>
        </div>

        <!-- SKILLS カラム -->
        <div class="column skills-column">
          <h3 class="column-title">SKILLS</h3>
          <div class="column-content">
            <div v-if="selectedCategorySkills.length > 0" class="skills-list" :class="{ scrollable: selectedCategorySkills.length >= 14 }">
              <button
                v-for="skill in selectedCategorySkills"
                :key="skill.name"
                class="skill-item"
                :class="{ active: selectedSkill?.name === skill.name }"
                @click="selectSkill(skill)"
              >
                {{ skill.name }}
              </button>
            </div>
            <div v-else-if="selectedCategory && !loading.loadingKeys.includes('preview')" class="empty-state">
              No skills available
            </div>
          </div>
        </div>

        <!-- SKILL DETAILS カラム -->
        <div class="column details-column">
          <h3 class="column-title">SKILL DETAILS</h3>
          <div class="column-content">
            <div v-if="selectedSkill" class="skill-details">
              <h4 class="skill-name">{{ selectedSkill.name }}</h4>
              <div class="skill-description-scroll">
                <p class="skill-description">{{ selectedSkill.description }}</p>
              </div>
            </div>
            <div v-else-if="selectedCategory && selectedCategorySkills.length === 0" class="empty-state">
              No skill details available
            </div>
            <div v-else class="empty-state">
              Select a skill to view details
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- クレジットモーダル -->
    <CreditModal :visible="showCreditModal" @close="closeCreditModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useSelectionStore } from '@/store/selection';
import { useLoadingStore } from '@/store/loading';
import { fetchFrameworkPreviewAll, type SkillItem } from '@/api/preview';
import { downloadCsv } from '@/utils/csv';
import AppHeader from '@/components/AppHeader.vue';
import CreditModal from '@/components/CreditModal.vue';

const route = useRoute();
const selection = useSelectionStore();
const loading = useLoadingStore();
const { selectedCodes: codes } = storeToRefs(selection);

const skills = ref<SkillItem[]>([]);
const error = ref('');
const selectedCategory = ref('');
const selectedSkill = ref<SkillItem | null>(null);
const showCreditModal = ref(false);

// 利用可能なカテゴリー
const availableCategories = computed(() => {
  const categories = [...new Set(skills.value.map(s => s.category))];
  return categories.sort();
});

// 選択されたカテゴリーのスキル
const selectedCategorySkills = computed(() => {
  if (!selectedCategory.value) return [];
  return skills.value.filter(s => s.category === selectedCategory.value);
});

// 職業名（簡易版）
const occupationNames = computed(() => {
  const count = codes.value.length;
  return `${count} occupation${count !== 1 ? 's' : ''}`;
});

const hasSkills = computed(() => skills.value.length > 0);

// カテゴリー名の整形
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

// カテゴリー選択
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

// スキル選択
function selectSkill(skill: SkillItem) {
  selectedSkill.value = skill;
}

// モーダル制御
function openCreditModal() {
  showCreditModal.value = true;
}

function closeCreditModal() {
  showCreditModal.value = false;
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

// CSV ダウンロード
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

// カテゴリー変更時のスキル自動選択
watch(selectedCategorySkills, (newSkills) => {
  if (newSkills.length > 0 && (!selectedSkill.value || !newSkills.includes(selectedSkill.value))) {
    selectedSkill.value = newSkills[0];
  } else if (newSkills.length === 0) {
    selectedSkill.value = null;
  }
});

onMounted(async () => {
  loading.startLoading('preview');
  loading.stopLoading('nav');
  await loadPreview(true);
});
</script>

<style scoped lang="scss">
.preview-view {
  min-height: 100vh;
  background: #ffffff;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.breadcrumb {
  margin-bottom: 16px;
}

.back-button {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    color: #374151;
  }
}

.title-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 16px 0;
}

.title-content h1 {
  margin: 0 0 4px 0;
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.download-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover:not(:disabled) {
    background: #2563eb;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1px;
  background: #e5e7eb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  min-height: 500px;
}

.column {
  background: white;
  display: flex;
  flex-direction: column;
}

.column-title {
  margin: 0;
  padding: 16px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.column-content {
  flex: 1;
  padding: 16px 0;
  overflow: hidden;
}

.loading,
.error,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #6b7280;
  font-size: 14px;
}

.category-list,
.skills-list {
  display: flex;
  flex-direction: column;
}

// スキルリストのスクロール対応
.skills-list {
  &.scrollable {
    max-height: 600px; // より多くのスキルを表示可能に
    overflow-y: auto;
    
    // カスタムスクロールバー
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
      
      &:hover {
        background: #94a3b8;
      }
    }
  }
}

.category-item,
.skill-item {
  background: none;
  border: none;
  padding: 12px 20px;
  text-align: left;
  cursor: pointer;
  color: #374151;
  font-size: 14px;
  transition: background 0.2s ease;
  border-bottom: 1px solid #f3f4f6;
  
  &:hover {
    background: #f9fafb;
  }
  
  &.active {
    background: #eff6ff;
    color: #3b82f6;
    font-weight: 500;
  }
  
  &:last-child {
    border-bottom: none;
  }
}

.skill-details {
  padding: 20px;
}

.skill-name {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.skill-description-scroll {
  max-height: 300px;
  overflow-y: auto;
  
  // カスタムスクロールバー
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
    
    &:hover {
      background: #94a3b8;
    }
  }
}

.skill-description {
  margin: 0;
  color: #6b7280;
  line-height: 1.6;
  font-size: 14px;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .column {
    border-bottom: 1px solid #e5e7eb;
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  // モバイルでもスクロール対応
  .skills-list.scrollable {
    max-height: 450px; // モバイルでも十分な高さを確保
  }
}
</style>