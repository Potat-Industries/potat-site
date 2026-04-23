<template>
  <div class="not-found">
    <h1>Uh oh… wrong way!</h1>

    <img src="/potatNerd.png" alt="potatoNerd" />

    <button class="home-button" @click="goHome">
      Go Home
    </button>
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
    animation: fadIn 0.6s ease-out;
}

@keyframes fadeIn {
    from {
        opactiy: 0;
        transform: trasnlateY(10px);
    }
    to {
        opacity: 1;
        transform: trasnlateY(0);
    }
}
</style>