<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps<{ username?: string }>();

const recapPath = computed(() => {
  const name = props.username?.trim();
  return name ? `/wrapped/${name}/user` : '/wrapped/user';
});

const dismissed = ref(false);

const greetingName = computed(() => props.username || 'Friend');

const heroSrc = '/potat-banner-asset.png';

const phrases = [
  'you crushed it!',
  'you killed it!',
  'you went off!',
  'you popped off!',
  'you were unstoppable!',
  'you shined!',
  'you brought the hype!',
  'you went turbo!',
  'you were on fire!',
  'you did numbers!',
  'you peaked!',
  'you ascended!',
  'you unleashed!',
  'you made it look easy!',
  'you dominated!',
];

const pickRandomPhrase = () => {
  const idx = Math.floor(Math.random() * phrases.length);
  return phrases[idx];
};

const ending = ref(pickRandomPhrase());

const onDismiss = () => {
  dismissed.value = true;
  try {
    localStorage.setItem('hideWrapped2025Banner', '1');
  } catch {}
};

onMounted(() => {
  try {
    dismissed.value = localStorage.getItem('hideWrapped2025Banner') === '1';
  } catch {}
  ending.value = pickRandomPhrase();
});
</script>

<template>
  <div v-if="!dismissed" class="wrapped-banner" role="region" aria-label="Wrapped announcement">
    <div class="wrapped-content">
      <span class="pill">NEW</span>
      <span class="message">
        <span class="message-intro">Potat Wrapped 2025 just landed.</span>
        {{ ' ' }}{{ greetingName }}, {{ ending }}
      </span>
    </div>
    <div class="wrapped-right">
      <img class="banner-flare" src="/banner-flare.png" alt="" aria-hidden="true" />
      <img class="banner-assets" src="/banner-asset.png" alt="" aria-hidden="true" />
      <div class="actions">
      <router-link :to="recapPath" class="cta">
        See Your Recap
        <span class="arrow" aria-hidden="true">↗</span>
      </router-link>
      <button class="dismiss" aria-label="Dismiss banner" @click="onDismiss">×</button>
      </div>
    </div>
  </div>
  <div v-else class="wrapped-banner-spacer" />
  
</template>

<style scoped>
.wrapped-banner {
  position: sticky;
  top: 0;
  z-index: 9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 10px;
  color: #fff;
  backdrop-filter: blur(2px);
  background:
    linear-gradient(90deg, #7b2ff7 0%, #9a4efb 40%, #6f4cc9 80%);
  border-bottom: 1px solid rgba(0,0,0,0.2);
  overflow: hidden;
  min-height: 56px;
}
.wrapped-banner,
.wrapped-banner * {
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.wrapped-right {
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
  padding-left: 110px;
}

.banner-assets {
  position: absolute;
  right: 155px;
  bottom: -28px;
  top: auto;
  transform: none;
  height: 75px;
  width: auto;
  object-fit: contain;
  pointer-events: none;
  z-index: 1;
  opacity: 0.85;
}

.banner-flare {
  position: absolute;
  right: -220px;
  bottom: -115px;
  height: 270px;
  width: auto;
  object-fit: contain;
  pointer-events: none;
  z-index: 0;
  opacity: 0.28;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.25));
  mix-blend-mode: screen;
  transform: scaleX(-1.5) scale(1.55);
}

.wrapped-banner-spacer { height: 0; }

.wrapped-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1 1 auto;
  min-width: 0;
}

.pill {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 3px 7px;
  border-radius: 999px;
  color: #111;
  background: #ffdf37;
}

.message {
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-intro {
  font-weight: 600;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 2;
  flex-wrap: nowrap;
}

.cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
  background: #fff;
  color: #2c1f4a;
  text-decoration: none;
  white-space: nowrap;
  flex: 0 0 auto;
  min-width: 120px;
}

.cta:hover { filter: brightness(0.95); }

.arrow { line-height: 1; font-size: 13px; }
.arrow { font-size: 12px; }

.dismiss {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 18px;
  line-height: 1;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
}

.dismiss:hover { background: rgba(255,255,255,0.15); }

@media (max-width: 900px) {
  .wrapped-right { padding-left: 0; }
  .banner-assets { display: none; }
  .banner-flare { display: none; }
}

@media (max-width: 640px) {
  .message { white-space: normal; }
  .cta { padding: 5px 8px; min-width: 104px; font-size: 12px; }
  .banner-assets { right: 135px; height: 72px; bottom: -4px; top: auto; transform: none; }
}
</style>
