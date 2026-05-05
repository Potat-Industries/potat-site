<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { brightenColor } from '../assets/utilities';
import { fetchBackend } from '../assets/request';
import { SimpleChannel, ComputedExtras, HistoryResponse } from '../types/emotes';

interface ProviderInfo {
	logo: string;
	home: string;
	name: string;
}

let observer: IntersectionObserver;

const

providers: Record<string, ProviderInfo>  = {
  '7TV': {
    logo: 'https://cdn.7tv.app/emote/63915e53209bcb04cf0aa45d/2x.avif',
    home: 'https://7tv.app/',
    name: '7TV'
  },
  STV: {
    logo: 'https://cdn.7tv.app/emote/63915e53209bcb04cf0aa45d/2x.avif',
    home: 'https://7tv.app/',
    name: '7TV'
  },
  FFZ: {
    logo: 'https://www.frankerfacez.com/static/images/cover/zreknarf.png',
    home: 'https://www.frankerfacez.com/',
    name: 'FrankerFaceZ'
  },
  BTTV: {
    logo: 'https://lh3.googleusercontent.com/18QCNXbFYR0TjGij27lc4oI8VB40Pv9EZ2XPSG0TdAFVs0gUO86pdGS4JQoq8UxH7Dqg9j4dvJE6Pg0jtqjkb3wb=s120',
    home: 'https://betterttv.com/',
    name: 'BetterTTV'
  },
},

route = useRoute(),
loaded = ref(false),
isLoading = ref(false),
none = ref(false),
username = ref(route.params.username),
history = ref<ComputedExtras[]>([]),
cursor = ref<string | null>(null),
imRetarded = new Map(),
channel = ref<SimpleChannel>({
  pfp: '',
  bestName: '',
  login: '',
  name: ''
}),

fetchEmoteHistory = async (pagination?: string | null) => {
	if (isLoading.value) {
		return;
	}

	isLoading.value = true;

  try {
    const response = await fetchBackend<HistoryResponse>(`emotes/history/${username.value}`, {
      params: { limit: 50, after: pagination }
    });

    const data = response?.data[0];
    if (!data && !history.value.length) {
      none.value = true;
      return;
    }

    if (response.pagination?.hasNextPage) {
      cursor.value = response?.pagination?.cursor;
    }

    channel.value = data.channel;

    const computedHistory = data.history.map(update => {
      let userPfp: string = update.user_stv_pfp;
      let user_url: string = '';
      let set_url: string = '';
      let method: string = '';
      let word: string = '';
			let expiry = null;
			let expired = null;

      if (!update.user_stv_pfp || update.user_stv_pfp === '//cdn.7tv.app/') {
        userPfp = update.user_pfp;
      }

      if (update.action === 'ALIAS') {
        method = `renamed ${update.emote_name} to `;
        word = 'in';
      }

      if (update.action === 'ADD') {
        method = `added `;
        word = 'to';
      }

      if (update.action === 'REMOVE') {
        method = `removed `;
        word = 'from';
      }

      if (update.provider === '7TV' || update.provider === 'STV') {
        user_url = `https://7tv.app/users/${update.user_stv_id}`;
        set_url = `https://7tv.app/emote-sets/${update.set_id}`;
      }

      if (update.provider === 'BTTV') {
        user_url = `https://betterttv.com/users/${update.user_bttv_id}`;
        set_url = `https://betterttv.com/users/${update.set_id}`;
      }

      if (update.provider === 'FFZ') {
        user_url = `https://www.frankerfacez.com/channel/${update.user_login}`;
        set_url = `https://www.frankerfacez.com/channel/${channel.value.login}`;
      }

			if (update.expires_at) {
				expiry = update.expires_at;
				expired = update.is_expired ?? false;
			}

      return {
        ...update,
        user_pfp: userPfp,
        user_url,
        set_url,
        method,
        word,
				expiry,
				expired
      }
    });

    for (const update of computedHistory) {
			if (!update) {
				continue;
			}

      const key = `${update.emote_id}:${update.action}:${update.user_login}:${update.set_id}`
      imRetarded.set(key, update);
    }

    history.value = [...imRetarded.values()];
  } catch (error) {
    console.error('Failed to fetch emote history:', error);
  } finally {
    loaded.value = true;
		isLoading.value = false;
  }
},

handleScroll = () => {
	if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
		if (!cursor.value) return;
    fetchEmoteHistory(cursor.value);
	}
},

observeImages = () => {
  const options = {
    rootMargin: '0px',
    threshold: 0.1
  };

  observer = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src as string;
        observer.unobserve(img);
      }
    }
  }, options);

  const images = document.querySelectorAll('img[data-src]');
  images.forEach(img => {
    observer.observe(img);
  });
}

onMounted(() => {
  fetchEmoteHistory();
  observeImages();
	addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
	removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div id="container" v-if="loaded && !none">
    <div class="title-bar">
      <div class="title-content">
        <div class="profile-picture" style="margin-right: 10px;">
          <a :href="`https://twitch.tv/${channel.login}`" target="_blank">
            <img :src="channel.pfp" :alt="`${channel.bestName} profile picture`" style=" width: 60px; height: 60px;"/>
          </a>
        </div>
        <h2>Emote actions in {{ channel.bestName }}'s channel</h2>
      </div>
    </div>
    <ul class="emote-list">
      <li v-for="update in history" :key="update.emote_id" class="emote-item">
        <div class="logo-container">
          <a :href="providers[update.provider].home" target="_blank">
            <img :src="providers[update.provider].logo" :title="providers[update.provider].name" class="logo-images"/>
          </a>
        </div>
        <div class="content-container">
          <div class="profile-picture">
            <a :href="`https://twitch.tv/${update.user_login}`" target="_blank">
              <img :src="update.user_stv_pfp || update.user_pfp" :alt="`${update.user_name} profile picture`"/>
            </a>
          </div>
          <div class="text-content">
            <span
							v-if="update.known_bot"
							class="actor-icon"
							:title="'Performed by emote management bot'"
						>⚙️ </span>

            <span
							v-else-if="update.actor !== 'potatbotat'"
							class="actor-icon"
							:title="'Performed on website'"
						>🌐 </span>

						<span
							v-else-if="update.expires_at && !update.is_expired"
							class="actor-icon"
							:title="`Temporary emote is set to expire after ${update.expires_at}`"
						>⏳ </span>

						<span
						  v-else-if="update.expires_at && update.is_expired"
							class="actor-icon"
							:title="`Temporary emote has expired after ${update.expires_at}`"
						>💥 </span>

            <a :href="update.user_url" target="_blank">
              <strong :style="{ color: brightenColor(update.user_color) }">{{ update.user_name }}</strong>
            </a>
            {{ update.method }}
            <span>
              <a :href="update.emoteLink" target="_blank">
                <img :src="update.emoteURL" />
              </a>
              {{ update.emote_new_alias || update.emote_alias || update.emote_name }}
            </span>
            {{ update.word }} set
            <a :href="update.set_url" target="_blank">
              <em>"{{ update.set_name }}"</em>
            </a>
          </div>
        </div>
        <div class="ago-container">
          <div class="text-content">
            <span>{{ update.ago }}</span>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>

#container {
  margin-top: 10px;
  margin-left: 10px;
  margin-right: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: left;
  color: #e5e4e4;
}

.title-bar {
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: rgba(31, 31, 31, 0.94);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.logo-container {
  display: flex;
  padding: 3px;
  border-radius: 0.5rem;
  background-color: rgba(31, 31, 31, 0.94);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  margin-right: 10px;
  align-items: center;
}

.content-container {
  display: flex;
  padding: 3px;
  border-radius: 0.5rem;
  background-color: rgba(31, 31, 31, 0.94);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  align-items: center;
  max-width: 700px;
  width: 100%;
}

.ago-container {
  display: flex;
  padding: 3px;
  border-radius: 0.5rem;
  background-color: rgba(31, 31, 31, 0.94);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  margin-left: 10px;
  align-items: center;
  text-align: center;
  max-width: 135px;
  width: 100%;
}

.emote-list {
  list-style: none;
  padding: 0;
  overflow-y: auto;
  word-break: break-word;
}

.emote-item {
  display: flex;
  box-sizing: border-box;
  flex-wrap: nowrap;
}


.profile-picture img {
  border-radius: 50%;
  margin-right: 5px;
  width: 40px;
  height: 40px;
  vertical-align: middle;
}

.title-content {
  display: flex;
  align-items: center;
}

.title-content h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
  color: #e5e4e4;
}

.actor-icon {
  cursor: pointer;
}

.logo-images {
  width: 40px;
  height: 40px;
  vertical-align: middle;
}



.emote-item .text-content {
  flex: 1;
  word-wrap: break-word;
}

.emote-item .text-content img {
  vertical-align: middle;
}

.emote-item .text-content em {
  font-style: italic;
}

a:hover {
  text-decoration: underline;
}

.emote-list::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}

.emote-list::-webkit-scrollbar-thumb {
  background: transparent;
}
</style>
