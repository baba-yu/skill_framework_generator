<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="visible" class="modal-backdrop" @click="handleBackdropClick">
        <div 
          class="modal-container modal-md"
          @click.stop
          role="dialog"
          aria-labelledby="modal-title"
          aria-describedby="modal-content"
        >
          <!-- モーダルヘッダー -->
          <div class="modal-header">
            <h3 id="modal-title" class="modal-title">Credit</h3>
            <button 
              class="modal-close-button"
              @click="$emit('close')"
              aria-label="Close modal"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M18 6L6 18M6 6l12 12" 
                  stroke="currentColor" 
                  stroke-width="2" 
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
          
          <!-- モーダルボディ -->
          <div id="modal-content" class="modal-body">
            <div class="credit-content">
              <!-- O*NET ロゴ -->
              <div class="onet-logo-container">
                <a 
                  href="https://services.onetcenter.org/" 
                  title="This site incorporates information from O*NET Web Services. Click to learn more." 
                  target="_blank"
                  class="onet-logo-link"
                >
                  <img 
                    src="https://www.onetcenter.org/image/link/onet-in-it.svg" 
                    alt="O*NET in-it"
                    class="onet-logo"
                  >
                </a>
              </div>
              
              <!-- クレジット説明 -->
              <div class="credit-text">
                <p class="credit-description">
                  This site incorporates information from 
                  <a 
                    href="https://services.onetcenter.org/" 
                    target="_blank"
                    class="credit-link"
                  >
                    O*NET Web Services
                  </a> 
                  by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA).
                </p>
                
                <p class="trademark-notice">
                  O*NET® is a trademark of USDOL/ETA.
                </p>
              </div>
            </div>
          </div>
          
          <!-- モーダルフッター -->
          <div class="modal-footer">
            <button 
              class="btn btn-secondary btn-md"
              @click="$emit('close')"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

function handleBackdropClick() {
  emit('close');
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.visible) {
    emit('close');
  }
}

// ESCキーでモーダルを閉じる
onMounted(() => {
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape);
});

// モーダルが開いている間はスクロールをロック
watch(() => props.visible, (isVisible) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = isVisible ? 'hidden' : '';
  }
});

onUnmounted(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
});
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;

/* モーダル背景 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: $color-bg-overlay;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-modal-backdrop;
  padding: $space-4;
  backdrop-filter: blur(4px);
}

/* モーダルコンテナ */
.modal-container {
  background: $color-white;
  border-radius: $radius-xl;
  box-shadow: $shadow-xl;
  max-height: 90vh;
  overflow: hidden;
  z-index: $z-modal;
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
}

/* モーダルヘッダー */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-6;
  border-bottom: $border-width solid $color-border;
  background: $color-gray-50;
}

.modal-title {
  margin: 0;
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: $color-text;
}

.modal-close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  border-radius: $radius-md;
  color: $color-text-secondary;
  cursor: pointer;
  transition: $transition-colors;
  
  &:hover {
    background: $color-gray-200;
    color: $color-text;
  }
  
  &:focus-visible {
    outline: none;
    background: $color-gray-200;
    box-shadow: $shadow-focus;
  }
}

/* モーダルボディ */
.modal-body {
  flex: 1;
  padding: $space-6;
  overflow-y: auto;
}

.credit-content {
  display: flex;
  flex-direction: column;
  gap: $space-5;
  text-align: center;
}

/* O*NET ロゴ */
.onet-logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.onet-logo-link {
  display: inline-block;
  transition: $transition-transform;
  border-radius: $radius-md;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 4px;
  }
}

.onet-logo {
  width: 130px;
  height: 60px;
  border: none;
  display: block;
}

/* クレジットテキスト */
.credit-text {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.credit-description {
  margin: 0;
  font-size: $font-size-base;
  line-height: $line-height-relaxed;
  color: $color-text;
  text-align: left;
}

.credit-link {
  color: $color-primary;
  text-decoration: none;
  font-weight: $font-weight-medium;
  
  &:hover {
    color: $color-primary-hover;
    text-decoration: underline;
  }
  
  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
    border-radius: $radius-sm;
  }
}

.trademark-notice {
  margin: 0;
  font-size: $font-size-sm;
  color: $color-text-secondary;
  font-style: italic;
  text-align: left;
}

/* モーダルフッター */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: $space-3;
  padding: $space-6;
  border-top: $border-width solid $color-border;
  background: $color-gray-50;
}

/* アニメーション */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(-20px);
}

/* レスポンシブ対応 */
@media (max-width: $breakpoint-md) {
  .modal-backdrop {
    padding: $space-3;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: $space-4;
  }
  
  .modal-title {
    font-size: $font-size-lg;
  }
  
  .modal-close-button {
    width: 32px;
    height: 32px;
  }
  
  .credit-description {
    font-size: $font-size-sm;
  }
  
  .onet-logo {
    width: 110px;
    height: 50px;
  }
}

/* アクセシビリティ */
@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active {
    transition: none;
  }
  
  .onet-logo-link:hover {
    transform: none;
  }
}

/* 高コントラストモード */
@media (prefers-contrast: high) {
  .modal-container {
    border: 2px solid $color-text;
  }
  
  .modal-header,
  .modal-footer {
    border-width: 2px;
  }
}
</style>