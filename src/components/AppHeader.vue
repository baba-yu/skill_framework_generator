<template>
  <header class="app-header">
    <div class="header-container">
      <!-- ロゴセクション -->
      <div class="logo-section">
        <div class="logo-icon">
          <img src="@/assets/zipteam-icon.svg" alt="Zipteam" width="32" height="32" />
        </div>
        <div class="logo-text">
          <h1 class="app-title">Skill Framework Generator</h1>
        </div>
      </div>
      
      <!-- ナビゲーション・メニュー -->
      <div class="header-actions">
        <HeaderMenu @open-credit="$emit('openCredit')" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import HeaderMenu from '@/components/HeaderMenu.vue';

defineEmits<{
  openCredit: [];
}>();
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;

.app-header {
  background: $color-white;
  border-bottom: $border-width solid $color-border;
  position: sticky;
  top: 0;
  z-index: $z-sticky;
  backdrop-filter: blur(8px);
  box-shadow: $shadow-sm;
}

.header-container {
  width: 100%;
  height: $header-height;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $space-6; // ブラウザ端までの余白
  gap: $space-4;
  
  @media (max-width: $breakpoint-md) {
    padding: 0 $space-4; // モバイルでも端まで
  }
}

/* ロゴセクション */
.logo-section {
  display: flex;
  align-items: center;
  gap: $space-3;
  flex: 0 0 auto; // 左端固定
}

.logo-icon {
  flex-shrink: 0;
  color: $color-primary;
  transition: $transition-colors;
  
  &:hover {
    color: $color-primary-hover;
  }
}

.logo-text {
  min-width: 0;
}

.app-title {
  margin: 0;
  font-size: $font-size-sm; // サイズを小さく調整
  font-weight: $font-weight-semibold;
  color: $color-text;
  line-height: $line-height-tight;
  white-space: nowrap;
  
  @media (max-width: $breakpoint-md) {
    font-size: $font-size-sm; // モバイルではさらに小さく
  }
}

/* ヘッダーアクション */
.header-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: $space-3;
}

/* レスポンシブ対応 */
@media (max-width: $breakpoint-md) {
  .header-container {
    gap: $space-2;
  }
  
  .logo-section {
    gap: $space-2;
  }
  
  .logo-icon img {
    width: 24px;
    height: 24px;
  }
}

@media (max-width: $breakpoint-sm) {
  .app-title {
    display: none; // 非常に小さい画面では非表示
  }
}

/* アクセシビリティ */
@media (prefers-reduced-motion: reduce) {
  .logo-icon {
    transition: none;
  }
}

/* 高コントラストモード */
@media (prefers-contrast: high) {
  .app-header {
    border-bottom-width: 2px;
  }
}
</style>