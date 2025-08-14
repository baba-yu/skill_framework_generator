<template>
  <div class="skill-detail">
    <h3 class="detail-title">SKILL DETAILS</h3>
    
    <div class="detail-content">
      <!-- スキルが選択されている場合 -->
      <div v-if="skill" class="skill-details">
        <div class="skill-header">
          <h4 class="skill-name">{{ skill.name }}</h4>
          <div class="skill-category">
            <span class="category-label">Category:</span>
            <span class="category-value">{{ formatCategoryName(skill.category) }}</span>
          </div>
        </div>
        
        <div class="skill-description-container">
          <h5 class="description-title">Description</h5>
          
          <!-- デバッグ情報 -->
          <div style="background: #f0f0f0; padding: 8px; margin-bottom: 10px; font-size: 12px; font-family: monospace;">
            <div>needsTruncation: {{ needsTruncation }}</div>
            <div>isExpanded: {{ isExpanded }}</div>
            <div>lines count: {{ skill.description ? skill.description.split('\n').length : 0 }}</div>
            <div>has newlines: {{ skill.description ? skill.description.includes('\n') : false }}</div>
          </div>
          
          <div class="skill-description-scroll">
            <div class="description-wrapper">
              <p 
                ref="descriptionRef"
                :class="[
                  'skill-description', 
                  { 'is-truncated': !isExpanded && needsTruncation }
                ]"
              >{{ skill.description }}</p>
              
              <!-- See all / See less ボタン -->
              <button
                v-if="needsTruncation"
                class="see-all-toggle"
                @click="toggleExpanded"
                :aria-expanded="isExpanded"
                :aria-label="isExpanded ? 'テキストを省略表示する' : 'テキストを全文表示する'"
              >
                <span class="toggle-text">
                  {{ isExpanded ? 'See less' : 'See all' }}
                </span>
                <svg 
                  class="toggle-icon"
                  :class="{ 'is-expanded': isExpanded }"
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
      </div>

      <!-- カテゴリーが選択されているが、そのカテゴリーにスキルがない場合 -->
      <div v-else-if="selectedCategory && categorySkillsCount === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h4 class="empty-title">No Skills Available</h4>
        <p class="empty-message">
          There are no skills in the "{{ formatCategoryName(selectedCategory) }}" category.
        </p>
      </div>

      <!-- カテゴリーが選択されているが、スキルが選択されていない場合 -->
      <div v-else-if="selectedCategory" class="no-selection-state">
        <div class="no-selection-icon">👈</div>
        <h4 class="no-selection-title">Select a Skill</h4>
        <p class="no-selection-message">
          Choose a skill from the list to view its details.
        </p>
      </div>

      <!-- カテゴリーが選択されていない場合 -->
      <div v-else class="initial-state">
        <div class="initial-icon">📚</div>
        <h4 class="initial-title">Skill Details</h4>
        <p class="initial-message">
          Select a category and skill to view detailed information.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import type { SkillItem } from '@/api/preview';

console.log('=== SkillDetail component loaded ===');

// Props
interface Props {
  skill: SkillItem | null;
  selectedCategory: string;
  categorySkillsCount?: number;
}

const props = defineProps<Props>();

console.log('Initial props:', props);

// Refs
const descriptionRef = ref<HTMLElement | null>(null);
const isExpanded = ref(false);
const needsTruncation = ref(false);

// 3行の高さを計算するための定数（line-height * 3行）
const LINE_HEIGHT = 1.6; // $line-height-relaxed相当
const MAX_LINES = 3;

onMounted(() => {
  console.log('=== Component mounted ===');
  console.log('Props on mount:', props);
});

// スキルが変わったら展開状態をリセット
watch(() => props.skill, (newSkill, oldSkill) => {
  console.log('=== Watch triggered ===');
  console.log('newSkill:', newSkill);
  console.log('oldSkill:', oldSkill);
  
  isExpanded.value = false;
  checkTruncationNeeded();
}, { immediate: true });

// 省略が必要かどうかをチェック（デバッグ版）
const checkTruncationNeeded = () => {
  if (!props.skill?.description) {
    needsTruncation.value = false;
    return;
  }

  // デバッグ用ログ
  console.log('=== Debug Truncation Check ===');
  console.log('Description:', props.skill.description);
  console.log('Description length:', props.skill.description.length);
  
  // 改行コードで分割して行数をカウント
  const lines = props.skill.description.split('\n');
  console.log('Lines after split by \\n:', lines);
  console.log('Number of lines:', lines.length);
  console.log('MAX_LINES:', MAX_LINES);
  
  const shouldTruncate = lines.length > MAX_LINES;
  console.log('Should truncate:', shouldTruncate);
  
  needsTruncation.value = shouldTruncate;
  console.log('needsTruncation.value:', needsTruncation.value);
  console.log('=== End Debug ===');
};

// 展開/省略の切り替え
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

// Methods
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
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;

.skill-detail {
  background: $color-white;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.detail-title {
  margin: 0;
  padding: $space-4 $space-5;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-text-secondary;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: $color-gray-50;
  border-bottom: $border-width solid $color-border;
}

.detail-content {
  flex: 1;
  overflow-y: auto;
  padding: $space-5;
}

/* Skill Details */
.skill-details {
  height: 100%;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.3s ease-out;
}

.skill-header {
  margin-bottom: $space-5;
  padding-bottom: $space-4;
  border-bottom: $border-width solid $color-border-light;
}

.skill-name {
  margin: 0 0 $space-3 0;
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: $color-text;
  line-height: $line-height-tight;
}

.skill-category {
  display: flex;
  align-items: center;
  gap: $space-2;
  font-size: $font-size-sm;
}

.category-label {
  color: $color-text-secondary;
  font-weight: $font-weight-medium;
}

.category-value {
  color: $color-primary;
  font-weight: $font-weight-medium;
  background: $color-primary-light;
  padding: 2px 8px;
  border-radius: $radius-sm;
  font-size: $font-size-xs;
}

.skill-description-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.description-title {
  margin: 0 0 $space-3 0;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  color: $color-text;
}

.skill-description-scroll {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
  padding-right: $space-2;
  
  /* カスタムスクロールバー */
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

.description-wrapper {
  position: relative;
}

.skill-description {
  margin: 0;
  color: $color-text;
  line-height: $line-height-relaxed;
  font-size: $font-size-sm;
  transition: all 0.3s ease;
  white-space: pre-line; // 改行コードを尊重
  
  &.is-truncated {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    white-space: normal; // truncate時は通常の折り返し
  }
}

/* See all/See less ボタン */
.see-all-toggle {
  display: inline-flex;
  align-items: center;
  gap: $space-1;
  margin-top: $space-2;
  padding: $space-1 $space-2;
  background: transparent;
  border: none;
  color: $color-primary;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  cursor: pointer;
  border-radius: $radius-sm;
  transition: all 0.2s ease;

  &:hover {
    background: $color-primary-light;
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

/* States */
.empty-state,
.no-selection-state,
.initial-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  min-height: 200px;
}

.empty-icon,
.no-selection-icon,
.initial-icon {
  font-size: 32px;
  margin-bottom: $space-4;
}

.empty-title,
.no-selection-title,
.initial-title {
  margin: 0 0 $space-3 0;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $color-text;
}

.empty-message,
.no-selection-message,
.initial-message {
  margin: 0;
  color: $color-text-secondary;
  font-size: $font-size-sm;
  line-height: $line-height-relaxed;
  max-width: 300px;
}

/* アニメーション */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* レスポンシブ対応 */
@media (max-width: $breakpoint-md) {
  .detail-title {
    padding: $space-3 $space-4;
    font-size: $font-size-xs;
  }
  
  .detail-content {
    padding: $space-4;
  }
  
  .skill-name {
    font-size: $font-size-lg;
  }
  
  .skill-category {
    font-size: $font-size-xs;
  }
  
  .description-title {
    font-size: $font-size-sm;
  }
  
  .skill-description {
    font-size: $font-size-xs;
  }
  
  .skill-description-scroll {
    max-height: 250px;
  }
  
  .empty-title,
  .no-selection-title,
  .initial-title {
    font-size: $font-size-base;
  }
  
  .empty-message,
  .no-selection-message,
  .initial-message {
    font-size: $font-size-xs;
  }
}

/* アクセシビリティ */
@media (prefers-reduced-motion: reduce) {
  .skill-description,
  .toggle-icon,
  .see-all-toggle {
    transition: none;
  }
  
  .skill-details {
    animation: none;
  }
}
</style>