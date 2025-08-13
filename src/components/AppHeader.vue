<template>
  <header class="app-header">
    <div class="header-container">
      <!-- ロゴセクション -->
      <div class="logo-section">
        <div class="logo-icon">
          <svg width="32" height="32" viewBox="0 0 160 160" fill="none">
            <path 
              d="m93.34,84.44c3.66-2.44,3.66-6.43,0-8.88l-58.69-39.12c-3.66-2.44-6.66-.84-6.66,3.56v80c0,4.4,3,6,6.66,3.56l58.69-39.12Z" 
              fill="none" 
              stroke="currentColor" 
              stroke-miterlimit="10" 
              stroke-width="8"
            />
          </svg>
        </div>
        <div class="logo-text">
          <h1 class="app-title">Skill Framework Generator</h1>
          <p class="app-subtitle">Create dream teams using skills data</p>
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
  max-width: $layout-max-width;
  margin: 0 auto;
  height: $header-height;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $layout-padding;
  gap: $space-4;
  
  @media (max-width: $breakpoint-md) {
    padding: 0 $layout-padding-mobile;
  }
}

/* ロゴセクション */
.logo-section {
  display: flex;
  align-items: center;
  gap: $space-3;
  flex: 1;
  min-width: 0; // flexboxの縮小を許可
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
  min-width: 0; // flexboxの縮小を許可
}

.app-title {
  margin: 0;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $color-text;
  line-height: $line-height-tight;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: $breakpoint-md) {
    font-size: $font-size-base;
  }
}

.app-subtitle {
  margin: 0;
  font-size: $font-size-xs;
  color: $color-text-secondary;
  line-height: $line-height-normal;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: $breakpoint-lg) {
    display: none; // 中画面以下では非表示
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
  
  .logo-icon svg {
    width: 24px;
    height: 24px;
  }
  
  .app-title {
    font-size: $font-size-sm;
  }
}

@media (max-width: $breakpoint-sm) {
  .app-title {
    display: none; // 小画面では非表示
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

/* ダークモード対応の準備 */
@media (prefers-color-scheme: dark) {
  /* 将来のダークモード実装用 */
}
</style>