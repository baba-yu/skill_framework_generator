<template>
    <teleport to="body">
      <div v-if="visible" class="modal-backdrop" @click="$emit('close')">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Credit</h3>
            <button class="modal-close" @click="$emit('close')">×</button>
          </div>
          <div class="modal-body">
            <p style="text-align: center">
              <a href="https://services.onetcenter.org/" title="This site incorporates information from O*NET Web Services. Click to learn more." target="_blank">
                <img src="https://www.onetcenter.org/image/link/onet-in-it.svg" style="width: 130px; height: 60px; border: none" alt="O*NET in-it">
              </a>
            </p>
            <p>This site incorporates information from <a href="https://services.onetcenter.org/" target="_blank">O*NET Web Services</a> by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). O*NET® is a trademark of USDOL/ETA.</p>
          </div>
        </div>
      </div>
    </teleport>
  </template>
  
  <script setup lang="ts">
  defineProps<{
    visible: boolean;
  }>();
  
  defineEmits<{
    close: [];
  }>();
  </script>
  
  <style scoped lang="scss">
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }
  
  .modal-content {
    background: white;
    border-radius: 12px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow: hidden;
    box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
  }
  
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .modal-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
  }
  
  .modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6b7280;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    
    &:hover {
      background: #f3f4f6;
      color: #1f2937;
    }
  }
  
  .modal-body {
    padding: 20px 24px;
    
    p {
      margin: 0 0 16px 0;
      line-height: 1.6;
      color: #374151;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    a {
      color: #1a73e8;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
  </style>