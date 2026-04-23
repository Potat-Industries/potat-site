<template>
  <div class="not-found">
    <div class="panel">
      <h1>Uh oh… wrong way!</h1>

      <img src="/potatNerd.png" alt="" />

      <button class="home-button" @click="goHome">
        Go Home
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.not-found {
  text-align: center;
  margin-top: 10vh;
}
img {
  width: 300px;
  margin-top: 20px;
}
.home-button {
  margin-top: 20px;
  padding: 0.6em 1.2em;
  font-size: 22px;
  font-weight: 500;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  background-color: #4CAF50;
  color: white;
  text-shadow: -1px -1px 0 #333, 1px -1px 0 #333;
  transition: border-color 0.25s;
}
.panel {
  background: var(--panel-bg);
  border-radius: 15px;
  padding: 20px;
  border: 1px solid var(--panel-border);
  box-shadow: var(--panel-shadow);
  text-align: center;
  max-width: 500px;
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: 10vh;
  gap: 16px;
}
.home-button:hover {
  border-color: #fff;
}

.home-container {
    animation: fadeIn 0.6s ease-out;
}
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>