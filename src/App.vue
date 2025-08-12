<template>
  <div id="app">
    <router-view />
    <BaseLoadingOverlay :visible="loading.isLoading" message="Loading…" />
  </div>
</template>

<script setup lang="ts">
import { useLoadingStore } from "@/store/loading";
import BaseLoadingOverlay from "@/components/base/BaseLoadingOverlay.vue";

const loading = useLoadingStore();
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>