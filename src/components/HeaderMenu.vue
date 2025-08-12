<template>
    <div class="header-menu">
      <button class="menu-btn" @click="showMenu = !showMenu">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
      
      <!-- ドロップダウンメニュー -->
      <div v-if="showMenu" class="dropdown-menu">
        <a href="https://app.zipteam.com" target="_blank" class="menu-item" @click="showMenu = false">Dashboard</a>
        <a href="https://www.zipteam.com" target="_blank" class="menu-item" @click="showMenu = false">Website</a>
        <button class="menu-item" @click="openCredit">Credit</button>
      </div>
      
      <!-- メニュー背景クリック用 -->
      <div v-if="showMenu" class="menu-backdrop" @click="showMenu = false"></div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  
  const showMenu = ref(false);
  
  const emit = defineEmits<{
    openCredit: [];
  }>();
  
  function openCredit() {
    showMenu.value = false;
    emit('openCredit');
  }
  </script>
  
  <style scoped lang="scss">
  .header-menu {
    position: relative;
  }
  
  .menu-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    color: #6b7280;
    
    &:hover {
      background: #f3f4f6;
    }
  }
  
  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 8px;
    min-width: 150px;
    z-index: 1001;
  }
  
  .menu-item {
    display: block;
    width: 100%;
    padding: 8px 12px;
    color: #374151;
    text-decoration: none;
    border: none;
    background: none;
    text-align: left;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s ease;
    
    &:hover {
      background: #f3f4f6;
    }
  }
  
  .menu-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
  }
  </style>