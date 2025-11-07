<script setup lang="ts">
import { ref, onMounted, computed, Ref } from 'vue';
import { humanizeDuration, brightenColor } from '../assets/utilities';
import { fetchBackend } from '../assets/request';
import { Partner } from '../types/misc';

let interval = ref<NodeJS.Timeout | null>(null);

const

index = ref(0),
partners: Ref<Partner[] | []> = ref([]),
isTransitioning = ref(false),
current = computed(() => partners.value[Math.abs(index.value) % partners.value.length]),

cyclePartners = (isClick?: boolean) => {
  if (isTransitioning.value) return;

  clearInterval(interval.value!);
  if (isClick) index.value++;

  isTransitioning.value = true;

  interval.value! = setInterval(() => {
    index.value++;
  }, 5000);

  setTimeout(() => {
    isTransitioning.value = false;
  }, 1000);
},

getDate = (date: string) => {
  const joined = new Date(date);
  const now = new Date();
  return humanizeDuration(now.getTime() - joined.getTime());
};

onMounted(async () => {
  // Fetch partners
  partners.value = await fetchBackend<Partner>('partners').then(res => res.data);

  // Preload images
  partners.value.forEach(partner => {
    const img = new Image();
    img.src = partner?.stv_pfp ?? partner?.twitch_pfp ?? '';
})

cyclePartners();
});
</script>

<template>
  <div v-if="partners.length" class="slider-container" @click="cyclePartners(true)">
    <div class="partner-title">
      <h2><strong>Featured partners using the bot</strong></h2>
    </div>
    <div class="partner-container">
      <Transition name="slide-fade" mode="out-in" tag="div">
      <div v-if="current" :key="index" class="partner-container">
        <div class="slider-item">
          <div class="pfp-container">
            <a :href="current.page_url" target="_blank">
              <img :src="current.stv_pfp ?? current.twitch_pfp">
            </a>
          </div>
          <div class="text-container" :style="{ color: brightenColor(current.user_color, 25) }">
            <div>
              <strong>{{ current.display }}</strong>
            </div>
            {{ current.followers.toLocaleString() }} followers
            <br />
            Joined {{ getDate(current.joined_at) }} ago
            <br />
            Used {{ current.command_count.toLocaleString() }} total commands
          </div>
        </div>
      </div>
    </Transition>
    </div>
  </div>
</template>

<style scoped>
.slider-container {
  text-shadow: -1px -1px 0 #333, 1px -1px 0 #333, -1px 1px 0 #333, 1px 1px 0 #333;
  user-select: none;
  background: var(--panel-bg);
  border-radius: 15px;
  padding: 15px;
  backdrop-filter: blur(var(--panel-blur));
  border: 1px solid var(--panel-border);
  box-shadow: var(--panel-shadow);
}
.slider-item {
  display: grid;
	grid-template-columns: auto 1fr;
	gap: 10px;
  align-items: center;
  overflow: hidden;
}

.slide-fade-enter-active {
  transition: all 0.5s ease-in;
}

.slide-fade-leave-active {
  transition: all -1s ease-out;
}

.slide-fade-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
.partner-title {
	text-align: center;
}
.pfp-container img {
  border-radius: 50%;
  width: 100px;
  height: 100px;
  object-fit: cover;
  flex: 1;
}

.text-container {
	padding: 5px 0;
  background: transparent;
  border: none;
  backdrop-filter: none;
}
</style>
