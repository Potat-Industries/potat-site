<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { fetchBackend } from '../assets/request';
import eventBus from '../assets/eventBus';
import { UserState } from '../types/misc';

const

buttonToShake = ref<string | null>(null),

authorizationToken = reactive({ value: localStorage.getItem('authorization') }),

userState = reactive({ value: localStorage.getItem('userState') }),

linkedPlatforms = ref<Set<string>>(new Set()),

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
  linkedPlatforms.value = new Set();
},

shakeButton = (platform: string) => {
  eventBus.$emit('flash-sign-in');
  
  buttonToShake.value = platform;

  setTimeout(() => buttonToShake.value = null, 500);
},

loadLinkedPlatforms = async () => {
  if (!isAuthenticated.value) return;

  const login = (JSON.parse(userState.value as string) as UserState)?.login;
  if (!login) return;

  const res = await fetchBackend<Record<string, unknown>>(`users/${login}`, { auth: true });
  const user = res.data?.[0] as Record<string, unknown> | undefined;
  if (!user) return;

  const platformFields: Record<string, string> = {
    ANILIST: 'anilist_id',
    KICK: 'kick_id',
    DISCORD: 'discord_id',
    STEAM: 'steam_id',
    TRAKT: 'trakt_id',
  };

  const linked = new Set<string>();
  for (const [platform, field] of Object.entries(platformFields)) {
    if (user[field] != null) linked.add(platform);
  }
  linkedPlatforms.value = linked;
};

onMounted(async () => {
  await loadLinkedPlatforms();

  eventBus.$on('newToken', async (payload: { token: string; user: string }) => {
    authorizationToken.value = payload.token;
    userState.value = payload.user;
    await loadLinkedPlatforms();
  });
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
          <img src="/anilist.svg" class="icon"/> Anilist
          <span v-if="linkedPlatforms.has('ANILIST')" class="disconnect-option">Disconnect</span>
        </button>

        <button
          style="background-color:#00e701" 
          :class="{ shake: buttonToShake === 'KICK' }" 
          @click="connect('KICK')"
        >
          <img src="/kick.png" class="icon"/> Kick
          <span v-if="linkedPlatforms.has('KICK')" class="disconnect-option">Disconnect</span>
        </button>

        <button 
          style="background-color:#5865F2" 
          :class="{ shake: buttonToShake === 'DISCORD' }" 
          @click="connect('DISCORD')"
        >
          <img src="/discord.svg" class="icon"/> Discord
          <span v-if="linkedPlatforms.has('DISCORD')" class="disconnect-option">Disconnect</span>
        </button>

        <button 
          style="background-color:#1b2838" 
          :class="{ shake: buttonToShake === 'STEAM' }" 
          @click="connect('STEAM')"
        >
          <img src="/steam.png" class="icon"/> Steam
          <span v-if="linkedPlatforms.has('STEAM')" class="disconnect-option">Disconnect</span>
        </button>

        <button 
          style="background-color:#9F42C6" 
          :class="{ shake: buttonToShake === 'TRAKT' }" 
          @click="connect('TRAKT')"
        >
          <img src="/trakt.png" class="icon"/> Trakt
          <span v-if="linkedPlatforms.has('TRAKT')" class="disconnect-option">Disconnect</span>
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

.disconnect-option {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 2px 8px;
  white-space: nowrap;
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
