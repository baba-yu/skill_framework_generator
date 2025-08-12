<template>
  <header class="header">
    <div class="header-container">
      <div class="logo">
        <img src="/src/assets/zipteam-icon.svg" alt="Zipteam" width="24" height="24" />
        <span>Skill Framework Generator</span>
      </div>
      
      <HeaderMenu @open-credit="$emit('openCredit')" />
    </div>
  </header>
</template>

<script setup lang="ts">
import HeaderMenu from './HeaderMenu.vue';

defineEmits<{
  openCredit: [];
}>();
</script>

<style scoped lang="scss">
.header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0;
}

.header-container {
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  color: #1f2937;
}

.logo img {
  flex-shrink: 0;
}
</style>