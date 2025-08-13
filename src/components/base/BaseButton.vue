<template>
  <button 
    :class="buttonClasses"
    :type="type"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <!-- ローディングスピナー -->
    <div v-if="loading" class="button-loading">
      <div class="loading-dots">
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
      </div>
    </div>
    
    <!-- アイコン（左） -->
    <span v-if="iconLeft && !loading" class="button-icon icon-left">
      <slot name="icon-left">{{ iconLeft }}</slot>
    </span>
    
    <!-- ボタンテキスト -->
    <span v-if="$slots.default" class="button-text" :class="{ hidden: loading }">
      <slot />
    </span>
    
    <!-- アイコン（右） -->
    <span v-if="iconRight && !loading" class="button-icon icon-right">
      <slot name="icon-right">{{ iconRight }}</slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Props
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: string;
  iconRight?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  fullWidth: false,
});

// Emits
defineEmits<{
  click: [];
}>();

// Computed
const buttonClasses = computed(() => [
  'btn',
  `btn-${props.variant}`,
  `btn-${props.size}`,
  {
    'btn-loading': props.loading,
    'btn-full-width': props.fullWidth,
  }
]);
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;
@use "sass:color";

/* ベースボタンスタイル */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  border: $border-width solid transparent;
  border-radius: $radius-pill; // デフォルトで半円形状
  font-family: inherit;
  font-weight: $font-weight-medium;
  text-decoration: none;
  cursor: pointer;
  transition: $transition-colors, $transition-shadow, $transition-transform;
  white-space: nowrap;
  user-select: none;
  position: relative;
  overflow: hidden;

  // フォーカス状態
  &:focus-visible {
    outline: none;
    box-shadow: $shadow-focus;
  }

  // 無効状態
  &:disabled,
  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  // アクティブ状態
  &:active:not(:disabled):not(.btn-loading) {
    transform: translateY(1px);
  }

  // ローディング状態
  &.btn-loading {
    cursor: not-allowed;
    
    .button-text {
      opacity: 0.7;
    }
  }

  // フルワイズ
  &.btn-full-width {
    width: 100%;
  }
}

/* ボタンサイズ */
.btn-sm {
  height: $button-height-sm;
  padding: 0 $button-padding-x-sm;
  font-size: $button-font-size;
  gap: $space-1;
  border-radius: calc($button-height-sm / 2); // 高さの半分で半円形状
}

.btn-md {
  height: $button-height-md;
  padding: 0 $button-padding-x-md;
  font-size: $button-font-size;
  gap: $space-2;
  border-radius: $radius-pill; // 18px（36pxの半分）
}

.btn-lg {
  height: $button-height-lg;
  padding: 0 $button-padding-x-lg;
  font-size: $button-font-size;
  gap: $space-3;
  border-radius: calc($button-height-lg / 2); // 高さの半分で半円形状
}

/* ボタンバリアント */
.btn-primary {
  background: $color-primary;  // #232ED1
  border-color: $color-primary;
  color: $color-white;

  &:hover:not(:disabled):not(.btn-loading) {
    background: $color-primary-hover;  // #1e28b8
    border-color: $color-primary-hover;
  }
}

.btn-secondary {
  background: $color-white;
  border-color: $color-border;
  color: $color-text;

  &:hover:not(:disabled):not(.btn-loading) {
    background: $color-gray-50;
    border-color: $color-gray-300;
  }
}

.btn-outline {
  background: transparent;
  border-color: $color-primary;
  color: $color-primary;

  &:hover:not(:disabled):not(.btn-loading) {
    background: $color-primary;
    color: $color-white;
  }
}

.btn-ghost {
  background: transparent;
  border-color: transparent;
  color: $color-text;

  &:hover:not(:disabled):not(.btn-loading) {
    background: $color-gray-100;
  }
}

.btn-danger {
  background: $color-white;        // 白いフィル
  border-color: $color-error;      // #D72638 ボーダー
  color: $color-error;             // #D72638 文字色

  &:hover:not(:disabled):not(.btn-loading) {
    background: $color-error;      // ホバー時は背景色に
    color: $color-white;           // ホバー時は白文字
  }
}

.btn-success {
  background: $color-success;
  border-color: $color-success;
  color: $color-white;

  &:hover:not(:disabled):not(.btn-loading) {
    background: color.adjust($color-success, $lightness: -10%);
    border-color: color.adjust($color-success, $lightness: -10%);
  }
}

/* ボタン内要素 */
.button-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.loading-dots {
  display: flex;
  gap: 2px;
  align-items: center;
}

.loading-dot {
  width: 4px;
  height: 4px;
  background: currentColor;
  border-radius: 50%;
  animation: loadingDot 1.4s infinite ease-in-out;

  &:nth-child(1) { animation-delay: -0.32s; }
  &:nth-child(2) { animation-delay: -0.16s; }
  &:nth-child(3) { animation-delay: 0s; }
}

@keyframes loadingDot {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.button-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  
  &.icon-left {
    margin-right: -$space-1;
  }
  
  &.icon-right {
    margin-left: -$space-1;
  }
}

.button-text {
  transition: opacity 0.2s ease;
  
  &.hidden {
    opacity: 0;
  }
}

/* レスポンシブ対応 */
@media (max-width: $breakpoint-md) {
  .btn-lg {
    height: $button-height-md;
    font-size: $font-size-base;
  }
}

/* アクセシビリティ */
@media (prefers-reduced-motion: reduce) {
  .btn {
    transition: none;
    
    &:active {
      transform: none;
    }
  }
  
  .loading-dot {
    animation: none;
  }
}

/* 高コントラストモード */
@media (prefers-contrast: high) {
  .btn {
    border-width: 2px;
    
    &:focus-visible {
      outline: 3px solid currentColor;
      outline-offset: 2px;
    }
  }
}
</style>