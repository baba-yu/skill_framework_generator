.tooltip-arrow {
    position: absolute;
    
    &.arrow-right {
      right: 100%;
      top: 50%;
      transform: translateY(-50%);
      
      // ボーダー付きの矢印を2つの要素で作成
      &::before,
      &::after {
        content: '';
        position: absolute;
        width: 0;
        height: 0;
        border: solid transparent;
      }
      
      // 外側のボーダー部分（少し大きめ）
      &::before {
        right: -5px;
        border-width: 5px;
        border-right-color: $color-border;
      }
      
      // 内側の背景部分
      &::after {
        right: -4px;
        border-width: 4px;
        border-right-color: #F3F6F7;
      }
    }
  }<!-- src/components/base/BaseHover.vue -->
  <template>
    <div 
      class="hover-wrapper"
      @mouseenter="showTooltip"
      @mouseleave="hideTooltip"
      @focus="showTooltip"
      @blur="hideTooltip"
      ref="wrapperRef"
    >
      <!-- スロット：ホバー対象の要素 -->
      <slot></slot>
      
      <!-- ツールチップ -->
      <teleport to="body">
        <div 
          v-if="isVisible" 
          class="tooltip"
          :class="[
            `tooltip-${position}`, 
            { 'tooltip-multiline': isMultiline }
          ]"
          :style="tooltipStyle"
          ref="tooltipRef"
          role="tooltip"
          :aria-hidden="!isVisible"
        >
          <div class="tooltip-content">
            <slot name="content">
              {{ content }}
            </slot>
          </div>
        </div>
      </teleport>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  
  interface Props {
    content?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    disabled?: boolean;
    maxWidth?: string;
  }
  
  const props = withDefaults(defineProps<Props>(), {
    position: 'right',
    delay: 500,
    disabled: false,
    maxWidth: '300px'
  });
  
  // Refs
  const wrapperRef = ref<HTMLElement>();
  const tooltipRef = ref<HTMLElement>();
  
  // State
  const isVisible = ref(false);
  const tooltipStyle = ref({});
  let showTimer: NodeJS.Timeout | null = null;
  let hideTimer: NodeJS.Timeout | null = null;
  
  // Computed
  const isMultiline = computed(() => {
    return props.content && props.content.length > 50;
  });
  
  // Methods
  function showTooltip() {
    if (props.disabled) return;
    
    clearTimeout(hideTimer!);
    showTimer = setTimeout(() => {
      isVisible.value = true;
    }, props.delay);
  }
  
  function hideTooltip() {
    clearTimeout(showTimer!);
    hideTimer = setTimeout(() => {
      isVisible.value = false;
    }, 100);
  }
  
  function updatePosition() {
    if (!wrapperRef.value) return;
  
    const wrapper = wrapperRef.value.getBoundingClientRect();
    
    // シンプルに右側に配置（CSSでも同じ位置になるように）
    const top = wrapper.top + (wrapper.height / 2);
    const left = wrapper.right + 8;
  
    tooltipStyle.value = {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      maxWidth: props.maxWidth,
      zIndex: 1070,
      transform: 'translateY(-50%)'
    };
  }
  
  // 表示されたときに位置を更新
  watch(isVisible, (newVal) => {
    if (newVal) {
      updatePosition();
    }
  });
  </script>
  
  <style scoped lang="scss">
  @use "@/styles/variables.scss" as *;
  
  .hover-wrapper {
    display: inline-block;
  }
  
  .tooltip {
    background: #F3F6F7;
    color: #6B7280;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    padding: $space-2 $space-3;
    font-size: $font-size-sm;
    line-height: $line-height-relaxed;
    box-shadow: $shadow-lg;
    pointer-events: none;
    word-wrap: break-word;
    z-index: $z-tooltip;
    white-space: nowrap;
    opacity: 0;
    animation: tooltipFadeIn 0.2s ease-out forwards;
  
    &.tooltip-multiline {
      padding: $space-3 $space-4;
      line-height: $line-height-relaxed;
      white-space: normal;
    }
  }
  
  .tooltip-content {
    position: relative;
    z-index: 1;
  }
  
  .tooltip-arrow {
    position: absolute;
    width: 0;
    height: 0;
    border: 4px solid transparent;
    
    &.arrow-right {
      right: 100%;
      top: 50%;
      transform: translateY(-50%);
      border-right-color: #F3F6F7;
      border-left: none;
    }
  }
  
  /* アニメーション */
  @keyframes tooltipFadeIn {
    from {
      opacity: 0;
      transform: translateY(-50%) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(-50%) scale(1);
    }
  }
  
  /* レスポンシブ対応 */
  @media (max-width: $breakpoint-md) {
    .tooltip {
      font-size: $font-size-xs;
      padding: $space-2;
      max-width: 250px !important;
      
      &.tooltip-multiline {
        padding: $space-2 $space-3;
      }
    }
  }
  
  /* アクセシビリティ - 動きを減らす設定 */
  @media (prefers-reduced-motion: reduce) {
    .tooltip {
      animation: none !important;
    }
  }
  
  /* 高コントラストモード */
  @media (prefers-contrast: high) {
    .tooltip {
      border: 2px solid #6B7280;
    }
  }
  </style>