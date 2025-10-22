<template>
  <div class="occupation-list">
    <!-- ローディング状態 -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading">
        <div class="loading-dots">
          <span class="loading-dot"></span>
          <span class="loading-dot"></span>
          <span class="loading-dot"></span>
        </div>
        <span class="loading-text">Searching...</span>
      </div>
    </div>

    <!-- 検索結果 -->
    <div v-else-if="occupations.length > 0" class="results-list">
      <OccupationCard
        v-for="occupation in occupations"
        :key="occupation.code"
        :occupation="occupation"
        :is-selected="isSelected(occupation.code)"
        :selected-count="selectedCodes.length"
        @toggle="$emit('toggle', occupation.code)"
      />
    </div>

    <!-- 結果なし -->
    <div v-else-if="hasSearched" class="empty-state">
      <div class="empty-icon">
        <img src="@/assets/eye_glass.png" alt="No results" width="256" height="256" />
      </div>
      <h3 class="empty-title">No results found</h3>
      <p class="empty-description">
        Try different keywords or check your spelling
      </p>
    </div>

    <!-- 初期状態 -->
    <div v-else class="initial-state">
      <div class="initial-icon">
        <img src="@/assets/eye_glass.png" alt="Search" width="256" height="256" />
      </div>

      <br>

      <h3 class="initial-title">Enter keywords to find role-relevant frameworks</h3>

      <!-- <h3 class="initial-title">Search for occupation-based skill frameworks</h3> -->
      <!-- <p class="initial-description">
        Enter keywords to find relevant roles.
      </p> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Occupation } from '@/api/occupations';
import OccupationCard from '@/components/OccupationCard.vue';

// Props
interface Props {
  occupations: Occupation[];
  selectedCodes: string[];
  isLoading?: boolean;
  hasSearched?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  hasSearched: false,
});

// Emits
interface Emits {
  (e: 'toggle', code: string): void;
}

defineEmits<Emits>();

// Methods
function isSelected(code: string): boolean {
  return props.selectedCodes.includes(code);
}
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;

.occupation-list {
  min-height: 400px;
  width: 100%;
}

/* Results List */
.results-list {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

/* Loading State */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-4;
  color: $color-text-secondary;
}

.loading-dots {
  display: flex;
  gap: $space-2;
}

.loading-dot {
  width: 8px;
  height: 8px;
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
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
}

/* Empty States */
.empty-state,
.initial-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 400px;
  padding: $space-8 $space-4;
}

.empty-icon,
.initial-icon {
  margin-bottom: $space-6;
  display: flex;
  justify-content: center;
  align-items: center;
  
  img {
    opacity: 0.7;
    transition: opacity 0.3s ease;
    object-fit: contain;
  }
}

.empty-title,
.initial-title {
  margin: 0 0 $space-3 0;
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: $color-text;
}

.empty-description,
.initial-description {
  margin: 0;
  font-size: $font-size-base;
  color: $color-text-secondary;
  max-width: 400px;
  line-height: $line-height-relaxed;
}

/* Responsive */
@media (max-width: $breakpoint-md) {
  .occupation-list {
    min-height: 300px;
  }
  
  .empty-state,
  .initial-state {
    min-height: 300px;
    padding: $space-6 $space-4;
  }
  
  .empty-icon,
  .initial-icon {
    margin-bottom: $space-4;
    
    img {
      width: 80px;
      height: 80px;
    }
  }
  
  .empty-title,
  .initial-title {
    font-size: $font-size-lg;
  }
  
  .empty-description,
  .initial-description {
    font-size: $font-size-sm;
  }
}

/* アニメーション */
.results-list {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>