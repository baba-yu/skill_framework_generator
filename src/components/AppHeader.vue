<template>
  <header class="app-header">
    <div class="header-container">
      <!-- ロゴ部分 -->
      <div class="logo-section">
        <div class="logo-icon">
          <svg width="32" height="32" viewBox="0 0 160 160" fill="none">
            <path d="m93.34,84.44c3.66-2.44,3.66-6.43,0-8.88l-58.69-39.12c-3.66-2.44-6.66-.84-6.66,3.56v80c0,4.4,3,6,6.66,3.56l58.69-39.12Z" 
                  fill="none" stroke="#4c75f2" stroke-miterlimit="10" stroke-width="5"/>
            <path d="m88,119l41.79-33.96c3.41-2.77,3.41-7.31,0-10.09l-41.79-33.96" 
                  fill="none" stroke="#4c75f2" stroke-miterlimit="10" stroke-width="5" stroke-linecap="round"/>
          </svg>
        </div>
        <span class="logo-text">Skill Framework Generator</span>
      </div>

      <!-- ナビゲーション -->
      <nav class="nav-section">
        <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">
          Search
        </router-link>
        <router-link to="/preview" class="nav-link" :class="{ active: $route.path === '/preview' }">
          Preview
        </router-link>
      </nav>

      <!-- 右側メニュー -->
      <div class="actions-section">
        <button 
          class="menu-button"
          @click="showUserMenu = !showUserMenu"
          :class="{ active: showUserMenu }"
        >
          <span class="material-symbols-outlined">more_vert</span>
        </button>

        <!-- ドロップダウンメニュー -->
        <div v-if="showUserMenu" class="dropdown-menu" @click.stop>
          <button class="menu-item" @click="goToDashboard">
            <span class="material-symbols-outlined">dashboard</span>
            Dashboard
          </button>
          <button class="menu-item" @click="goToWebsite">
            <span class="material-symbols-outlined">language</span>
            Website
          </button>
          <button class="menu-item" @click="showCreditModal">
            <span class="material-symbols-outlined">info</span>
            Credit
          </button>
        </div>
      </div>
    </div>

    <!-- 背景クリックでメニューを閉じる -->
    <div v-if="showUserMenu" class="menu-backdrop" @click="showUserMenu = false"></div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const showUserMenu = ref(false);

// メニュー外クリックで閉じる
function handleClickOutside(event: Event) {
  const target = event.target as Element;
  if (!target.closest('.actions-section')) {
    showUserMenu.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// メニューアクション
function goToDashboard() {
  console.log('Go to Dashboard');
  showUserMenu.value = false;
}

function goToWebsite() {
  window.open('https://www.zipteam.com/', '_blank');
  showUserMenu.value = false;
}

function showCreditModal() {
  console.log('Show Credit Modal');
  showUserMenu.value = false;
  // TODO: クレジットモーダルを表示
}
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;

.app-header {
  position: relative;
  background: white;
  border-bottom: 1px solid $color-border;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $space-4;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: $space-3;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: $color-text;
}

.nav-section {
  display: flex;
  gap: $space-6;
}

.nav-link {
  padding: $space-2 $space-3;
  border-radius: $radius-lg;
  text-decoration: none;
  color: $color-muted;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    color: $color-text;
    background: rgba(26, 115, 232, 0.1);
  }

  &.active {
    color: $color-primary;
    background: rgba(26, 115, 232, 0.1);
  }
}

.actions-section {
  position: relative;
}

.menu-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: $color-muted;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover, &.active {
    background: rgba(26, 115, 232, 0.1);
    color: $color-primary;
  }

  .material-symbols-outlined {
    font-size: 20px;
  }
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 160px;
  background: white;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: $space-2;
  z-index: 1000;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: $space-2;
  width: 100%;
  padding: $space-2 $space-3;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: $color-text;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(26, 115, 232, 0.1);
  }

  .material-symbols-outlined {
    font-size: 18px;
    color: $color-muted;
  }
}

.menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999;
}
</style>