<template>
  <div class="preview-view">
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
      <!-- 戻るボタン -->
      <div class="breadcrumb">
        <button class="back-btn" @click="$router.push('/')">
          ← Back to framework selection
        </button>
      </div>

      <!-- タイトルエリア -->
      <div class="title-area">
        <h1>Preview</h1>
        <p class="subtitle">
          Includes the skills for the following occupation(s): 
          {{ occupationNames }}
        </p>
        <button class="download-btn" @click="downloadCSV" :disabled="!hasSkills">
          Download
        </button>
      </div>

      <!-- コンテンツエリア -->
      <div class="content-area">
        <!-- 左サイドバー：カテゴリー -->
        <aside class="sidebar">
          <div class="categories">
            <h3>Categories</h3>
            <nav class="category-nav">
              <button
                v-for="category in availableCategories"
                :key="category"
                class="category-btn"
                :class="{ active: selectedCategory === category }"
                @click="selectedCategory = category"
              >
                {{ formatCategoryName(category) }}
              </button>
            </nav>
          </div>
        </aside>

        <!-- メインコンテンツ：スキル詳細 -->
        <main class="skill-details">
          <div v-if="loading.loadingKeys.includes('preview')" class="loading">
            Loading...
          </div>

          <div v-else-if="error" class="error">
            {{ error }}
            <button @click="loadPreview" class="retry-btn">Try again</button>
          </div>

          <div v-else-if="selectedCategorySkills.length > 0" class="skills-content">
            <h2>{{ formatCategoryName(selectedCategory) }}</h2>
            <p class="category-description">
              {{ getCategoryDescription(selectedCategory) }}
            </p>

            <div class="skills-list">
              <div v-for="skill in selectedCategorySkills" :key="skill.name" class="skill-item">
                <h4>{{ skill.name }}</h4>
                <p>{{ skill.description }}</p>
              </div>
            </div>
          </div>

          <div v-else-if="!codes.length" class="empty-state">
            <p>No selection. Please go back and select at least one code.</p>
            <router-link to="/">Back to Search</router-link>
          </div>

          <div v-else class="no-skills">
            <div class="no-result-icon">🔍</div>
            <p>No result</p>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useSelectionStore } from '@/store/selection';
import { useLoadingStore } from '@/store/loading';
import { fetchFrameworkPreviewAll, type SkillItem } from '@/api/preview';
import { downloadCsv } from '@/utils/csv';

const route = useRoute();
const selection = useSelectionStore();
const loading = useLoadingStore();
const { selectedCodes: codes } = storeToRefs(selection);

const skills = ref<SkillItem[]>([]);
const error = ref('');
const selectedCategory = ref('');

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
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// カテゴリーの説明
function getCategoryDescription(category: string): string {
  const skill = skills.value.find(s => s.category === category);
  return skill ? `Knowledge of ${skill.description}` : '';
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
      selectedCategory.value = availableCategories.value[0];
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

onMounted(async () => {
  loading.startLoading('preview');
  loading.stopLoading('nav');
  await loadPreview(true);
});
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;

.preview-view {
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

.breadcrumb {
  margin-bottom: 16px;
}

.back-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    color: #1a73e8;
  }
}

.title-area {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.title-area h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.subtitle {
  flex: 1;
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.download-btn {
  background: #1a73e8;
  color: white;
  border: none;
  padding: 10px 20px;
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

.content-area {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  min-height: 500px;
}

.sidebar {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  height: fit-content;
}

.categories h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.category-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-btn {
  background: none;
  border: none;
  padding: 8px 12px;
  text-align: left;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
    color: #1f2937;
  }
  
  &.active {
    background: #eff6ff;
    color: #1a73e8;
    font-weight: 500;
  }
}

.skill-details {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 32px;
  min-height: 500px;
}

.loading,
.error,
.empty-state,
.no-skills {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  text-align: center;
  color: #6b7280;
}

.retry-btn {
  margin-top: 16px;
  background: #1a73e8;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.skills-content h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.category-description {
  margin: 0 0 24px 0;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 16px;
}

.skills-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skill-item {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fafbfc;
}

.skill-item h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.skill-item p {
  margin: 0;
  color: #6b7280;
  line-height: 1.5;
}

.no-result-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .content-area {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .title-area {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .skill-details {
    padding: 20px;
  }
}
</style>