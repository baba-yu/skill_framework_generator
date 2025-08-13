<template>
    <div class="base-layout">
      <!-- ヘッダー -->
      <AppHeader @open-credit="openCreditModal" />
  
      <!-- メインコンテンツ -->
      <main class="main-content">
        <slot />
      </main>
      
      <!-- クレジットモーダル -->
      <CreditModal :visible="showCreditModal" @close="closeCreditModal" />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import AppHeader from '@/components/AppHeader.vue';
  import CreditModal from '@/components/CreditModal.vue';
  
  const showCreditModal = ref(false);
  
  function openCreditModal() {
    showCreditModal.value = true;
  }
  
  function closeCreditModal() {
    showCreditModal.value = false;
  }
  </script>
  
  <style scoped lang="scss">
  @use "@/styles/variables.scss" as *;
  
  .base-layout {
    min-height: 100vh;
    background: $color-bg;
    display: flex;
    flex-direction: column;
  }
  
  .main-content {
    flex: 1;
    width: 100%;
  }
  </style>