<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { default as eventBus } from '../assets/eventBus';
import { brightenColor, delay } from '../assets/utilities';
import { fetchBackend } from '../assets/request';
import { TokenUserData, TwitchUser, UserState } from '../types/misc';
import computePaintStyle from '../assets/applyPaint';

const

isShaking = ref(false),

isOperationInProgress = ref(false),

authorizationToken = reactive({
  value: localStorage.getItem('authorization')
}),

userState = reactive({
  value: localStorage.getItem('userState')
}),

newState = reactive<{ value: boolean }>({
  value: (JSON.parse(userState.value as string) as UserState)?.is_channel
}),

isAuthenticated = computed<boolean>(() => {
  return authorizationToken.value !== null || userState.value !== null;
}),

isChannel = computed<boolean>(() => {
  return userState.value !== null && newState.value;
}),

assignUser = async (): Promise<void> => {
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
  
  eventBus.$emit('userState', userData);

  if (userData?.chatColor && !userData?.userPaint) {
    const adjustedColor = brightenColor(userData.chatColor);
    document.querySelector('.twitch-user span')?.setAttribute('style', `color: ${adjustedColor}`);
  }

  if (userData?.userPaint) {
    const paintStyle = computePaintStyle(userData.userPaint);
    document.querySelector('.twitch-user span')?.setAttribute('style', `${paintStyle}`);
  }
},

handleMessage = (event: MessageEvent) => {
  const { id, login, name, stv_id, token, is_channel } = event.data;

  if (!token) {
    return;
  }

  localStorage.setItem('authorization', token);
  localStorage.setItem(
    'userState',
    JSON.stringify({ id, login, name, stv_id, is_channel })
  );

  authorizationToken.value = token;
  eventBus.$emit('newToken', {
    token,
    user: JSON.stringify({ id, login, name, stv_id, is_channel }),
  });

  eventBus.$on('signOut', () => {
    signOut();
  });

  userState.value = JSON.stringify({ id, login, name, stv_id, is_channel });
  assignUser();

  if (!is_channel) {
    join();
  }
},

signIn = (): void => {
  window.open(
		`https://api.${window.location.host}/login`,
		'_blank',
		'width=600,height=400'
	);

  window.addEventListener('message', handleMessage);
},

signOut = (): void => {
  localStorage.clear();
  userState.value = null;
  authorizationToken.value = null;
  newState.value = false;
},

join = async () => {
  if (isOperationInProgress.value) return;

  isOperationInProgress.value = true;
  newState.value = true;

  const result = await fetchBackend('join', { method: 'POST', auth: true })
  if ([400, 401, 403, 418].includes(result?.statusCode)) {
    console.log('Signing out due to error:', result?.errors?.[0]?.message);

    eventBus.$emit(
      'failed-join',
      `Failed to join channel: ${result?.errors?.[0]?.message}`
    );

    eventBus.$emit('signOut');
    signOut();

    isOperationInProgress.value = false;
    return shakeButton();
  } else {
		eventBus.$emit('join-success-popup');
	}

  await delay(3000);
  isOperationInProgress.value = false;
},

part = async () => {
  if (isOperationInProgress.value) return;

  isOperationInProgress.value = true;
  newState.value = false;

  const result = await fetchBackend('part', { method: 'DELETE', auth: true })
  if ([401, 418].includes(result?.statusCode)) {
    console.log('Signing out due to error:', result?.errors?.[0]?.message);

    eventBus.$emit(
      'failed-part',
      `Failed to part channel: ${result?.errors?.[0]?.message}`
    );

    eventBus.$emit('signOut');
    signOut();

    isOperationInProgress.value = false;
    return shakeButton();
  }

  await delay(3000);
  isOperationInProgress.value = false;
},

shakeButton = () => {
  eventBus.$emit('flash-sign-in');

  isShaking.value = true;

  setTimeout(() => isShaking.value = false, 500);
};

onMounted(async () => {
  eventBus.$on('newToken', ({ token, user }: TokenUserData) => {
    authorizationToken.value = token;
    userState.value = user;
    newState.value = JSON.parse(user).is_channel;
  });

  eventBus.$on('signOut', signOut);

  if (isAuthenticated.value) {
    const user = JSON.parse(userState.value as string);
    const userData = await fetchBackend<{ channel: any }>(`users/${user?.login}`)
    newState.value = userData.data?.[0]?.channel?.state === 'JOINED';
  }
});
</script>

<template>
  <div class="button-box">
    <template v-if="isAuthenticated && isChannel">
      <div class="part-with-info">
        <button
          class="part-button"
          type="button"
          @click="part"
          :disabled="isOperationInProgress"
          :class="{ 'cooldown': isOperationInProgress }"
        >Part</button>
        <button
          class="info-button"
          type="button"
          title="Show setup / next steps"
          aria-label="Show setup / next steps"
          @click.stop="eventBus.$emit('join-success-popup')"
        >
          <svg class="info-icon" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" />
            <line x1="12" y1="10" x2="12" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <circle cx="12" cy="7" r="1.5" fill="currentColor" />
          </svg>
        </button>
      </div>
    </template>
    <template v-else-if="isAuthenticated">
      <button
        class="join-button"
        type="button"
        @click="join"
        :disabled="isOperationInProgress"
        :class="{ 'cooldown': isOperationInProgress }"
      >Join</button>
    </template>
    <template v-else>
      <button
        class="join-button"
        @click="signIn"
        :class="{ 'shake': isShaking }"
      >Join</button>
    </template>
  </div>
</template>

<style scoped>
.button-box {
  background: var(--panel-bg);
  border-radius: 15px;
  padding: 15px;
  margin: 20px;
  border: 1px solid var(--panel-border);
  box-shadow: var(--panel-shadow);
  contain: paint;
  content-visibility: auto;
  contain-intrinsic-size: 140px;
}

.part-button,
.join-button {
  border-radius: 8px;
  border: 2px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.25s;
  text-shadow: -1px -1px 0 #333, 1px -1px 0 #333, -1px 1px 0 #333, 1px 1px 0 #333;
	font-size: 22px;
	min-width: 80%;
}

.part-with-info {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.info-button {
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  aspect-ratio: 1 / 1;
  padding: 0;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  box-sizing: border-box;
  flex: 0 0 auto;
  cursor: pointer;
  transition: background-color .15s ease;
}

.info-icon { display: block; shape-rendering: geometricPrecision; width: 18px; height: 18px; }

.info-button:hover { background-color: rgba(255,255,255,0.07); }

.info-button:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.join-button {
  background-color: #4CAF50;
}

.part-button {
  background-color: #ec2f2f;
}

.part-button:hover,
.join-button:hover {
  border-color: #fdfdfd;
}

.cooldown {
  background-color: #555 !important;
  cursor: not-allowed;
  opacity: 0.6;
}

.part-button.cooldown,
.join-button.cooldown {
  border-color: #333;
}

.part-button:disabled,
.join-button:disabled {
  pointer-events: none;
}

.part-button:focus,
.part-button:focus-visible,
.join-button:focus,
.join-button:focus-visible {
  outline: 6px auto -webkit-focus-ring-color;
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
