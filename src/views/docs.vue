<script setup lang="ts">
//@ts-ignore typescript is retarded holy shit
import SwaggerUI from '$components/swaggerUI.vue'
</script>

<template>
  <main >
    <div class="swagger-potato"><SwaggerUI /></div>
  </main>
</template>

<style scoped>
  .swagger-potato {
    width: 95%;
    align-items: top;
    background-color: #1a1a1a;
    border-radius: 15px;
    padding: 20px;
    background-color: rgba(31, 31, 31, 0.906);
    overflow-y: auto;
    margin: 0 auto;
  }

  :deep(#swagger-ui .parameters-col_description input) {
    color: #010101;
  }

  /* ignore the gross base swagger stuff lol */
  :deep(#swagger-ui .topbar),
  :deep(#swagger-ui .information-container),
  :deep(#swagger-ui .schemes-server-container) {
    display: none;
  }

  :deep(#swagger-ui .modal-ux) {
    background: hwb(0 8% 92% / 0.722);
    color: #e5e4e4;
  }

  :deep(#swagger-ui .scheme-container) {
    display: flex;
    background: none;
    margin: 0;
    padding: 0;
  }

  /* move authorize button to the right */
  :deep(#swagger-ui .scheme-container .schemes) {
    justify-content: flex-end;
  }

  :deep(#swagger-ui #auth-bearer-value) {
    color: #010101;
  }

  /** force max width when collapsed */
  :deep(#swagger-ui),
  :deep(#swagger-ui .opblock),
  :deep(#swagger-ui .opblock .opblock-summary) {
    width: 100%;
  }

  /** change header color for readability */
  :deep(#swagger-ui .opblock .opblock-section-header) {
    background: hwb(0 8% 92% / 0.722);
  }

  /** change text color so its readable lol */
  :deep(#swagger-ui .opblock .opblock-summary-description),
  :deep(#swagger-ui .opblock .opblock-section-header h4),
  :deep(#swagger-ui .swagger-ui .try-out__btn),
  :deep(#swagger-ui .tab li button.tablinks),
  :deep(#swagger-ui .opblock .opblock-body),
  :deep(#swagger-ui table tbody tr td),
  :deep(#swagger-ui table thead tr th),
  :deep(#swagger-ui table thead tr td),
  :deep(#swagger-ui table tbody tr th),
  :deep(#swagger-ui .parameter__type),
  :deep(#swagger-ui .parameter__name),
  :deep(#swagger-ui span),
  :deep(#swagger-ui h4),
  :deep(#swagger-ui h3),
  :deep(#swagger-ui h2),
  :deep(#swagger-ui h5),
  :deep(#swagger-ui p) {
    color: #e5e4e4;
  }
</style>
