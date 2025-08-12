<template>
    <button class="btn" :type="type" :disabled="disabled" @click="$emit('click')">
      <slot />
    </button>
</template>
  
<script setup lang="ts">
  withDefaults(defineProps<{ disabled?: boolean; type?: "button" | "submit" | "reset" }>(), {
    type: "button",
  });
  defineEmits<{ (e: "click"): void }>();
</script>

  
<style scoped lang="scss">
  @use "@/styles/variables.scss" as *;
  
  .btn {
    display: inline-flex;
    align-items: center;
    gap: $space-2;
    padding: $space-2 $space-4;
    border-radius: $radius-lg;
    border: 1px solid $color-border;
    background: $color-primary;
    color: white;
    box-shadow: $shadow-sm;
    cursor: pointer;
    transition: background .15s ease, transform .02s ease;
  
    &:hover { background: $color-primary-hover; }
    &:active { transform: translateY(1px); }
    &:disabled {
      opacity: .6;
      cursor: not-allowed;
    }
  }
</style>
  