<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { fetchBackend } from '../assets/request';
import { SearchOptions, EmoteInfo, Emote } from '../types/emotes';

let observer: IntersectionObserver;

const

approach = ref<SearchOptions['approach']>('starts'),
caseSensitive = ref<SearchOptions['case']>(false),
format = ref<SearchOptions['format']>('any'),
cursor = ref<string | null>(null),
searchQuery = ref<string>(''),
emotes = ref<Emote[]>([]),
isRequesting = ref(false),
selectedEmote = ref<EmoteInfo | null>(null),
isLoading = ref(false),
searchEmotes = async (query: string, options: SearchOptions): Promise<Emote[]> => {
  if (isRequesting.value) return [];

  isRequesting.value = true;

  const response = await fetchBackend<Emote>(`twitch/emotes/search`, {
    params: {
      [options?.approach]: query,
      case: String(options?.case === true),
      format: options?.format && options?.format !== 'any' ? options?.format : null,
      first: 200,
      after: options.cursor
    }
  }).finally(() => {
    isRequesting.value = false;
  });

  if (response.errors?.length) {
    console.error(response.errors);
    return [];
  }

  if (response.pagination?.hasNextPage) {
    cursor.value = response.pagination.cursor;
  }

  return response?.data ?? [];
},

onQuery = async () => {
	if (isLoading.value) {
		return;
	}

	isLoading.value = true;

	try {
		const options: SearchOptions = {
			approach: approach.value,
			format: format.value,
			case: caseSensitive.value,
			cursor: cursor.value
		}

		const thisBatch = await searchEmotes(searchQuery.value, options).then(res => {
			return res.filter(each => !emotes.value.some(e => e.id === each.id));
		})

		emotes.value.push(...thisBatch);
	} finally {
		isLoading.value = false;
	}
},

onNewQuery = async () => {
  emotes.value = [];
  cursor.value = null;
  onQuery();
},


handleScroll = () => {
	if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
		if (!cursor.value) return;
		onQuery();
	}
},

bestName = (name: string, display: string): string => {
  return name === display.toLowerCase() ? display : name;
},

loadEmoteData = async (name: string) => {
  const emote = await fetchBackend<EmoteInfo>(`twitch/emotes`, {
    params: { name }
  }).then(res => res.data?.[0])

  console.log(emote);
  if (!emote) return;

  selectedEmote.value = emote;
},

closePopup = () => {
  selectedEmote.value = null;
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
},

openChannel = () => {
  if (selectedEmote.value) {
    window.open(`https://twitch.tv/${selectedEmote.value.channelLogin}`, '_blank');
  }
};

watch(emotes, async () => {
  await nextTick();
  observeImages();
});

onMounted(() => {
	addEventListener('scroll', handleScroll);
});


onUnmounted(() => {
	removeEventListener('scroll', handleScroll);
});

</script>

<template>
  <div class="container">
    <div class="search-bar">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search emotes..."
        @keydown.enter="onNewQuery"
        class="search-box"
      />
      <select v-model="approach" class="search-box">
        <option value="matches">Matches</option>
        <option value="starts">Starts</option>
        <option value="includes">Includes</option>
        <option value="ends">Ends</option>
      </select>
      <select v-model="format" class="search-box">
        <option value="any" selected>Any</option>
        <option value="static">Static</option>
        <option value="animated">Animated</option>
      </select>
      <label>
        Case Sensitive
        <input type="checkbox" v-model="caseSensitive"  class="search-box"/>
      </label>
      <button @click="onNewQuery" >Search</button>
    </div>
    <div class="emote-list">
      <div
        v-for="emote in emotes"
        :key="emote.id"
        class="emote"
        @click="loadEmoteData(emote.name)"
      >
        <img :src="emote.url"/>
        <span class="emote-text">{{ emote.name }}</span>
      </div>
    </div>
    <div v-if="selectedEmote" class="popup" @click="openChannel">
      <div class="popup-content">
        <img :src="selectedEmote.emoteURL" :alt="selectedEmote.emoteCode"/>
        <h3>{{ selectedEmote.emoteCode }}</h3>
        <p>Owned By: {{ bestName(selectedEmote.channelName, selectedEmote.channelLogin) }}</p>
        <p>Owner ID: {{ selectedEmote.channelID }}</p>
        <p>ID: {{ selectedEmote.emoteID }}</p>
        <p>Format: {{ selectedEmote.emoteAssetType }}</p>
        <p>State: {{ selectedEmote.emoteState }}</p>
        <p>Type: {{ selectedEmote.emoteType }}</p>
        <p v-if="selectedEmote.emoteTier">Tier: {{ selectedEmote.emoteTier }}</p>
        <p v-if="selectedEmote.bitCost">Bit Cost: {{ selectedEmote.bitCost }}</p>
        <p v-if="selectedEmote.artist">Artist: {{ bestName(selectedEmote.artist.displayName, selectedEmote.artist.login) }}</p>
      </div>
      <button @click="closePopup" class="close-button">Close</button>
    </div>
  </div>
</template>
<style scoped>
#container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
  margin-left: 5px;
  margin-right: 5px;
}

.search-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin: 0 auto 20px auto;
  width: fit-content;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: rgba(31, 31, 31, 0.9);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.search-bar input[type="text"] {
  padding: 5px;
  font-size: 1rem;
}

.search-bar select, .search-bar label {
  padding: 5px;
  font-size: 1rem;
}

.emote-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  margin-left: 10px;
  margin-right: 10px;
  overflow-x: hidden;
}

.search-box {
  padding: 10px;
  border-radius: 10px;
  background-color: rgba(31, 31, 31, 0.9);
  outline: auto -webkit-focus-ring-color;
  outline-color: #f4f4f4;
  color: white;
}

.emote {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(31, 31, 31, 0.9);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 3px;
  border-radius: 0.5rem;
  font-size: 12px;
}

.emote-text {
  width: 100%;
}

.emote img {
  width: 80px;
  height: 80px;
  cursor: pointer;
}

.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 20px;
  border-radius: 10px;
  z-index: 999;
  cursor: pointer;
}

.popup-content {
  text-align: center;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  background-color: rgba(255, 255, 255, 0.3);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.5);
}
</style>
