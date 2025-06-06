<script setup lang="ts">
import { ref, onMounted, reactive, computed, ReactiveEffect } from 'vue';
import { default as eventBus } from '../assets/eventBus';
import computePaintStyle from '../assets/applyPaint';
import { brightenColor } from '../assets/utilities';
import { fetchBackend } from '../assets/request';
import { TwitchUser } from '../types/misc';

const authToken: { value: string | null } = reactive({
	value: localStorage.getItem('authorization')
});

const userState: { value: string | null } = reactive({
	value: localStorage.getItem('userState')
});

const twitchUser = ref<TwitchUser | null>(null);
const shouldFlash = ref(false);

const isAuthenticated = computed(() => {
  return authToken.value !== null && userState.value !== null;
});

const signIn = (): void => {
  window.open(
		`https://api.${window.location.host}/login`,
		'_blank',
		'width=600,height=400'
	);
};

const signOut = async (): Promise<void> => {
  localStorage.clear();
  authToken.value = null;
  userState.value = null;
  twitchUser.value = null;
};

const flashButton = () => {
  shouldFlash.value = true;

  setTimeout(() => shouldFlash.value = false, 500);
};

const assignUser = async (): Promise<void> => {
  if (!isAuthenticated.value) {
    return;
  }

  const data = await fetchBackend<TwitchUser>('twitch', { auth: true })
  if ([401, 418].includes(data?.statusCode)) {
    console.log('Signing out due to error:', data?.errors?.[0]?.message);
    signOut();
    return eventBus.$emit('signOut');
  }

  const userData = data.data[0];
  twitchUser.value = userData

  if (userData?.chatColor && !userData?.userPaint) {
    const adjustedColor = brightenColor(userData.chatColor);
    document.querySelector('.twitch-user span')?.setAttribute('style', `color: ${adjustedColor}`);
  }

  if (userData?.userPaint) {
    const paintStyle = computePaintStyle(userData.userPaint);
    document.querySelector('.twitch-user span')?.setAttribute('style', `${paintStyle}`);
  }
}

const handleMessage = (event: MessageEvent) => {
  const { id, login, name, stv_id, token, is_channel } = event.data;

  if (!token) {
    return;
  }

  localStorage.setItem('authorization', token);
  localStorage.setItem(
    'userState',
    JSON.stringify({ id, login, name, stv_id, is_channel })
  );

  authToken.value = token;

  eventBus.$emit('newToken', {
    token,
    user: JSON.stringify({ id, login, name, stv_id, is_channel }),
  });

  eventBus.$on('signOut', () => {
    signOut();
  });

  userState.value = JSON.stringify({ id, login, name, stv_id, is_channel });
  assignUser();

  window.removeEventListener('message', handleMessage);
};

onMounted((): void => {
  assignUser();

  eventBus.$on('flash-sign-in', () => {
    flashButton();
  });

  eventBus.$on('userState', (newState: string) => {
    userState.value = newState;
  });

  window.addEventListener('message', handleMessage);
});

</script>

<template>
  <template v-if="isAuthenticated">
    <div class="twitch-user" @click="signOut">
      <img box-shadow="0 0 0 2px #8763b8" v-if="twitchUser && twitchUser.twitch_pfp"
        :src="twitchUser.stv_pfp ? twitchUser.stv_pfp : twitchUser.twitch_pfp" alt="Twitch Profile Picture"
        class="profile-picture" />
      <span>{{ twitchUser?.name }}</span>
    </div>
  </template>
  <template v-else>
    <button class="twitch-button" :class="{ flash: shouldFlash }" @click="signIn">
      <img src="/Twitch-icon-white.png" style="width: 1.5em; height: 1.5em;" />
      <span class="button-text">Sign in</span>
    </button>
  </template>
</template>

<style scoped>
.twitch-button {
	width: 100%;
  font-size: 0.88em;
  padding: 12px;
  border-radius: 15px;
  transition: background-color 0.2s ease;
  background-color: #6441a4;
  color: #fff;
  outline: auto -webkit-focus-ring-color;
  outline-color: #f4f4f4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.twitch-user {
  display: flex;
  align-items: center;
  font: inherit;
  font-size: 1.5em;
  font-weight: bolder;
  margin-right: 12px;
}

.profile-picture {
  width: 1.6em;
  height: 1.6em;
  border-radius: 50%;
  margin-right: 0.3em;
}

.profile-picture:focus-visible {
  outline: none;
}

.twitch-button:focus-visible {
  outline: 10px auto -webkit-focus-ring-color;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
}

.twitch-button:focus-visible {
  outline: 10px auto -webkit-focus-ring-color;
}

button:hover {
  outline-color: #f4f4f4;
}

.button-text {
  margin-left: 0.5em;
  font-weight: bold;
}

.flash {
  animation: flash 3s ease-in-out infinite;
}


.twitch-button .flash {
  animation-duration: 3s;
  animation-iteration-count: 2;
  animation-direction: forwards;
}

@keyframes flash {
  0% {
    background-color: #6441a4;
    box-shadow: 0 0 5px #6441a4;
  }
  10% {
    background-color: #ff4d4d;
    box-shadow: 0 0 15px #ff4d4d;
  }
}
</style>
