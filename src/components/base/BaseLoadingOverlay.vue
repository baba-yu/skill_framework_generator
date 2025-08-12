<!-- src/components/base/BaseLoadingOverlay.vue -->
<template>
  <teleport to="body">
    <div v-if="props.visible" class="overlay" role="status" aria-live="polite">
      <div class="panel">
        <div class="dots">
          <span></span><span></span><span></span>
        </div>
        <span v-if="props.message" class="msg">{{ props.message }}</span>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { watch, onBeforeUnmount } from "vue";

const props = withDefaults(defineProps<{
  visible: boolean;
  message?: string;
  lockScroll?: boolean;
}>(), {
  lockScroll: true,
});

// 背景スクロールのロック/解除
watch(() => props.visible, (v) => {
  if (!props.lockScroll || typeof document === "undefined") return;
  document.body.style.overflow = v ? "hidden" : "";
});

// 途中でアンマウントされたときに解除
onBeforeUnmount(() => {
  if (!props.lockScroll || typeof document === "undefined") return;
  document.body.style.overflow = "";
});
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0;
  display: grid; place-items: center;
  background: rgba(255,255,255,0.85);
  z-index: 1000;
}
.panel {
  background: #fff;
  padding: 14px 18px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,.18);
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.dots { display: inline-flex; gap: 6px; }
.dots span {
  width: 10px; height: 10px;
  background: #111; border-radius: 50%;
  animation: bounce .6s infinite ease-in-out;
}
.dots span:nth-child(2) { animation-delay: .2s; }
.dots span:nth-child(3) { animation-delay: .4s; }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.75); opacity: .6; }
  40%           { transform: scale(1.2);  opacity: 1; }
}
.msg { color: #111; font-weight: 600; }
</style>