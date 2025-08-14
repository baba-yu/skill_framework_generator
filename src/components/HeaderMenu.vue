<template>
  <div class="header-menu">
    <!-- メニューボタン -->
    <button 
      class="menu-button"
      @click="toggleMenu"
      :aria-expanded="showMenu"
      aria-label="Open menu"
    >
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
        <path 
          d="M4 6L8 10L12 6" 
          stroke="currentColor" 
          stroke-width="1.5" 
          stroke-linecap="round"
          :class="{ rotated: showMenu }"
        />
      </svg>
    </button>
    
    <!-- ドロップダウンメニュー -->
    <transition name="dropdown">
      <div v-if="showMenu" class="dropdown-menu" role="menu">
        <a 
          href="https://app.zipteam.com" 
          target="_blank" 
          class="menu-item"
          role="menuitem"
          @click="closeMenu"
        >
          <span class="menu-text">Dashboard</span>
          <span class="external-icon">↗</span>
        </a>
        
        <a 
          href="https://www.zipteam.com" 
          target="_blank" 
          class="menu-item"
          role="menuitem"
          @click="closeMenu"
        >
          <span class="menu-text">Website</span>
          <span class="external-icon">↗</span>
        </a>

        <a 
          href="https://docs.zipteam.com" 
          target="_blank" 
          class="menu-item"
          role="menuitem"
          @click="closeMenu"
        >
          <span class="menu-text">Help center</span>
          <span class="external-icon">↗</span>
        </a>
        
        <div class="menu-divider"></div>
        
        <button 
          class="menu-item"
          role="menuitem"
          @click="openCredit"
        >
          <span class="menu-text">Credit</span>
        </button>
      </div>
    </transition>
    
    <!-- メニュー背景クリック用 -->
    <div 
      v-if="showMenu" 
      class="menu-backdrop" 
      @click="closeMenu"
      aria-hidden="true"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const showMenu = ref(false);

const emit = defineEmits<{
  openCredit: [];
}>();

function toggleMenu() {
  showMenu.value = !showMenu.value;
}

function closeMenu() {
  showMenu.value = false;
}

function openCredit() {
  closeMenu();
  emit('openCredit');
}

// ESCキーでメニューを閉じる
function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && showMenu.value) {
    closeMenu();
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape);
});
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;

.header-menu {
  position: relative;
}

/* メニューボタン */
.menu-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: $radius-md;
  color: $color-text-secondary;
  cursor: pointer;
  transition: $transition-colors;
  
  &:hover {
    background: $color-gray-100;
    color: $color-text;
  }
  
  &:focus-visible {
    outline: none;
    background: $color-gray-100;
    box-shadow: $shadow-focus;
  }
  
  svg path.rotated {
    transform: rotate(180deg);
    transform-origin: center;
    transition: $transition-transform;
  }
}

/* ドロップダウンメニュー */
.dropdown-menu {
  position: absolute;
  top: calc(100% + #{$space-2});
  right: 0;
  min-width: 200px;
  background: $color-white;
  border: $border-width solid $color-border;
  border-radius: $radius-lg;
  box-shadow: $shadow-lg;
  padding: $space-3;
  z-index: $z-dropdown;
  transform-origin: top right;
}

/* メニューアイテム */
.menu-item {
  display: flex;
  align-items: center;
  gap: $space-3;
  width: 100%;
  padding: $space-3;
  color: $color-text;
  text-decoration: none;
  border: none;
  background: none;
  text-align: left;
  border-radius: $radius-md;
  cursor: pointer;
  font-size: $font-size-sm;
  font-weight: $font-weight-normal;
  transition: $transition-colors;
  
  &:hover {
    background: $color-gray-100;
    color: $color-text;
  }
  
  &:focus-visible {
    outline: none;
    background: $color-primary-light;
    color: $color-primary;
  }
}

.menu-text {
  flex: 1;
  white-space: nowrap;
}

.external-icon {
  font-size: 12px;
  color: $color-text-muted;
  opacity: 0.7;
}

/* メニュー区切り線 */
.menu-divider {
  height: 1px;
  background: $color-border-light;
  margin: $space-2 0;
}

/* 背景 */
.menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: $z-dropdown - 1;
  background: transparent;
}

/* アニメーション */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}

/* レスポンシブ対応 */
@media (max-width: $breakpoint-md) {
  .menu-button {
    width: 36px;
    height: 36px;
  }
  
  .dropdown-menu {
    min-width: 180px;
    padding: $space-2;
  }
  
  .menu-item {
    padding: $space-2;
    font-size: $font-size-xs;
  }
}

/* アクセシビリティ */
@media (prefers-reduced-motion: reduce) {
  .menu-button svg path {
    transition: none;
  }
  
  .dropdown-enter-active,
  .dropdown-leave-active {
    transition: none;
  }
}

/* 高コントラストモード */
@media (prefers-contrast: high) {
  .dropdown-menu {
    border-width: 2px;
  }
  
  .menu-item:focus-visible {
    outline: 2px solid $color-primary;
  }
}
</style>