<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { fetchBackend } from '../assets/request';
import eventBus from '../assets/eventBus';

const

buttonToShake = ref<string | null>(null),

authorizationToken = reactive({ value: localStorage.getItem('authorization') }),

userState = reactive({ value: localStorage.getItem('userState') }),

isAuthenticated = computed<boolean>(() => {
  return authorizationToken.value !== null || userState.value !== null;
}),

openWindow = (url: string) => {
	const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
	if (isSafari) {
		setTimeout(() => window.open(url, '_top'), 0);
	} else {
		window.open(url, '_blank', 'width=600,height=800');
	}
},

connect = async (platform: string) => {
  if (!isAuthenticated.value) return shakeButton(platform);

  const url = await fetchBackend<string>(`auth/${platform.toLowerCase()}/authorize`, {
    auth: true
  }).then(res => res.data?.[0])

  if (!url) {
    shakeButton(platform);
    return signOut();
  }

  openWindow(url);
},

signOut = (): void => {
  localStorage.clear();
  userState.value = null;
  authorizationToken.value = null;
},

shakeButton = (platform: string) => {
  eventBus.$emit('flash-sign-in');
  
  buttonToShake.value = platform;

  setTimeout(() => buttonToShake.value = null, 500);
};

onMounted(() => {
  eventBus.$on('newToken', (payload: { token: any; user: any }) => {
    const userState = JSON.parse(payload.user) ?? {};
    authorizationToken.value = payload.token;
    userState.value = userState;
  })
})
</script>

<template>
  <div class="container">
    <div class="connections-box">
      <h2>Connect a Platform</h2>
      <div class="buttons-container">
        <button 
          style="background-color:#02A9FF" 
          :class="{ shake: buttonToShake === 'ANILIST' }" 
          @click="connect('ANILIST')"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/61/AniList_logo.svg" class="icon"/> Anilist
        </button>

        <button
          style="background-color:#00e701" 
          :class="{ shake: buttonToShake === 'KICK' }" 
          @click="connect('KICK')"
        >
          <img src="https://kick.com/favicon.ico" class="icon"/> Kick
        </button>

        <button 
          style="background-color:#5865F2" 
          :class="{ shake: buttonToShake === 'DISCORD' }" 
          @click="connect('DISCORD')"
        >
          <img src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0a6918e57475a843f59f_icon_clyde_black_RGB.svg" class="icon"/> Discord
        </button>

        <button 
          style="background-color:#1DB954" 
          :class="{ shake: buttonToShake === 'SPOTIFY' }" 
          @click="connect('SPOTIFY')"
        >
          <img src="https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Black.png" class="icon"/> Spotify
        </button>

        <button 
          style="background-color:#1b2838" 
          :class="{ shake: buttonToShake === 'STEAM' }" 
          @click="connect('STEAM')"
        >
          <img src="https://steamcommunity.com/favicon.ico" class="icon"/> Steam
        </button>
      </div>
    </div>
  </div>
</template>


<style scoped>
.container {
  width: 400px;
  margin: auto;
  background-color: rgba(31, 31, 31, 0.906);
  border-radius: 15px;
  padding: 20px;
  overflow-y: auto;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

h2 {
  color: white;
  text-align: center;
  margin-bottom: 15px;
  font-size: 24px;
}

.buttons-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 16px;
  font-size: 16px;
  color: white;
  border: none;
  font-size: 18px;
  cursor: pointer;
  text-align: center;
  border-radius: 15px;
}

button .icon {
  width: 24px;
  height: 24px;
}

button:hover {
  filter: brightness(0.9);
  transform: scale(1.05);
}

.shake {
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-10px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(10px);
  }
}
</style>
