<template>
  <header class="header">
    <div class="header-container">
      <div class="logo">
        <svg width="24" height="24" viewBox="0 0 160 160" fill="none">
          <path d="m93.34,84.44c3.66-2.44,3.66-6.43,0-8.88l-58.69-39.12c-3.66-2.44-6.66-.84-6.66,3.56v80c0,4.4,3,6,6.66,3.56l58.69-39.12Z" 
                fill="none" stroke="#4c75f2" stroke-miterlimit="10" stroke-width="5"/>
        </svg>
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
</style>