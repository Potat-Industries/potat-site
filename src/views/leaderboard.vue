<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { brightenColor } from '../assets/utilities';
import { fetchBackend } from '../assets/request';
import { useRoute } from 'vue-router';
import router from '../router';
import computePaintStyle from '../assets/applyPaint';
import { PaintRawData } from '../types/misc';
const potatoImage = '/tatov2.png';

interface Leaderboard {
  bestName: string;
  rank?: number;
  farmSize?: number;
  farmName?: string;
  prestige?: number;
  potatoCount?: number;
  paint_count?: number;
  badge_count?: number;
  trivia_wins?: number;
  emote_count?: string;
  user_count?: string;
  channel_count?: string;
  scramble_wins?: number;
  command_count?: string;
  user_pfp: string;
  user_color: string;
}

interface Stat {
  user_count: number;
  percentage: number;
  rank: number;
}

type ColorStat = {
  color: string;
} & Stat;

type BadgeStat = {
  badge: string;
  url?: string;
  clickAction?: string;
  name: string;
  version: number;
} & Stat;

type UserBadgeOwnedStat = {
  badge: string;
  user_pfp: string;
  user_color: string;
  bestName: string;
  owned_badges: number;
} & Stat;

type BadgeOwnersStat = BadgeStat & {
  total_owners: string;
}

type PaintStat = {
  id: string;
  paint: PaintRawData;
  owners: number;
} & Stat;

interface BadgeRawData {
  id: string;
  kind: string;
  name: string;
  description: string;
  tooltip: string;
  tag: string;
  url?: string
}

type StvBadgeStat = {
  badge: BadgeRawData;
  id: string;
  owners: number;
} & Stat;

const LeaderboardTypes = [
  'twitchownedbadges',
  'twitchbadgeowners',
  'emoteusechannel',
  'commandschannel',
  'emoteschannel',
  'emoteuseuser',
  'twitchbadges',
  'twitchcolors',
  'commandsuser',
  'emotesuser',
  'paintstats',
  'badgestats',
  'scramble',
  'potatoes',
  'trivia',
  'paints',
  'badges',
] as const;

type LeaderboardTypes = (typeof LeaderboardTypes)[number];

const route = useRoute();

let inputType = (route.query.type || route.params.type)?.toString().toLowerCase() as LeaderboardTypes;
inputType =  inputType && LeaderboardTypes.includes(inputType) ? inputType : 'potatoes';

let order = (route.query.order as string)?.toLowerCase();
if (!order || !['asc', 'desc'].includes(order)) {
	order = route.path.includes('loserboard') ? 'asc' : 'desc';
}

const

loserOrLeader = ref<boolean>(order === 'asc' ? true : false),
type = ref<LeaderboardTypes>(inputType ?? 'potatoes'),
cursor = ref<string | undefined>(undefined),
leaderboarders = ref<Leaderboard[]>([]),
badgeStats = ref<BadgeStat[]>([]),
ownedBadgeUserStats = ref<UserBadgeOwnedStat[]>([]),
badgeOwnerCounts = ref<BadgeOwnersStat[]>([]),
colorStats = ref<ColorStat[]>([]),
paintStats = ref<PaintStat[]>([]),
stvBadgeStats = ref<StvBadgeStat[]>([]),
map = new Map(),
loading = ref(false),
scrollTimeout = ref<number | undefined>(undefined),

fetchLeaderboard = async (type: LeaderboardTypes, last?: string | undefined) => {
	if (loading.value) {
		return;
	}

	loading.value = true;

	try {
    if (type === 'twitchbadges') {
      const response = await fetchBackend<BadgeStat>(`twitch/badges`, {
        params: { first: 200 }
      }).then(res => res?.data?.map(b => {
        if (b.badge === 'NOBADGE') return;
        if (!b.url) return b;
        const lastSlashIndex = b.url.lastIndexOf("/");
        b.url = b.url.substring(0, lastSlashIndex + 1) + "3";
        b.rank = b.rank -1;
        return b;
      }).filter(Boolean)as BadgeStat[]);

      badgeStats.value = response.sort((a, b) => {
        if (loserOrLeader.value) {
          return b.rank - a.rank;
        } else {
          return a.rank - b.rank;
        }
      }) ?? [];
    } else if (type === 'twitchownedbadges') {
      const response = await fetchBackend<UserBadgeOwnedStat>(`twitch/badges`, {
        params: { first: 100, owned: true, after: last }
      });

      ownedBadgeUserStats.value = response?.data ?? [];
    } else if (type === 'twitchbadgeowners') {
      const response = await fetchBackend<BadgeOwnersStat>(`twitch/badges`, {
        params: { first: 100, owners: true, after: last }
      }).then(res => res?.data?.map(b => {
        const lastSlashIndex = b.url?.lastIndexOf("/");
        b.url = b.url?.substring(0, (lastSlashIndex ?? 0) + 1) + "3";

        return b;
      }).filter(Boolean)as BadgeOwnersStat[]);

      badgeOwnerCounts.value = response ?? [];
    } else if (type === 'twitchcolors') {
      const response = await fetchBackend<ColorStat>(`twitch/colors`, {
        params: { 
          first: 200,
          after: last,
        }
      });
      const colors = response?.data?.map(c => {
        if (c.color === 'NOCOLOR') return;
        c.rank = c.rank -1;
        return c;
      }).filter(Boolean) as ColorStat[];

      for (const color of colors) {
        map.set(color.color, color);
      }

      colorStats.value = [...map.values()].sort((a, b) => a.rank - b.rank);
      cursor.value = response?.pagination?.cursor;
    } else if (type === 'paintstats') {
      const response = await fetchBackend<PaintStat>('paints')
        .then(res => res.data);

      paintStats.value = response.sort((a, b) => {
        if (loserOrLeader.value) {
          return a.percentage - b.percentage;
        } else {
          return b.percentage - a.percentage;
        }
      });
    } else if (type === 'badgestats') {
      const response = await fetchBackend<StvBadgeStat>('badges')
        .then(res => res.data);

      const toBadgeUrl = (id: string): string => `https://cdn.7tv.app/badge/${id}/4x.webp`;
      
      stvBadgeStats.value = response
        .map(e => {
          if (!e.badge?.id) return;
          e.badge.url = toBadgeUrl(e.badge.id);
          return e;
        })
        .filter((e): e is StvBadgeStat => Boolean(e))
        .sort((a, b) => {
          if (loserOrLeader.value) {
            return a.percentage - b.percentage;
          } else {
            return b.percentage - a.percentage;
          }
        }) ?? [];
    } else {
      const response = await fetchBackend<Leaderboard>(`leaderboard`, {
        params: {
          order: loserOrLeader.value ? 'asc' : 'desc',
          after: last,
          type
        }
      });

      for (const user of response.data) {
        map.set(user.bestName, user);
      }
      leaderboarders.value = [...map.values()]
      cursor.value = response?.pagination?.cursor;
    }
	} finally {
		loading.value = false;
	}
},

handleScroll = () => {
  if (scrollTimeout.value) return;
  scrollTimeout.value = window.setTimeout(() => {
    scrollTimeout.value = undefined;
    // if scroll to the end of the window
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
      if (!cursor.value) return;
      fetchLeaderboard(type.value, cursor.value);
    }
  }, 50);
},

fetchNewType = () => {
	router.push({
		path: `/${loserOrLeader.value ? 'loserboard' : 'leaderboard'}/${type.value}`,
		force: true // vite thinks loserboard is the same as leaderboard because it's an alias
	});
  leaderboarders.value = [];
  map.clear();
  cursor.value = undefined;
  if (type.value === 'twitchcolors') {
    loserOrLeader.value = false;
  }
  fetchLeaderboard(type.value, undefined);
},

getLocale = (value: string | undefined): string => {
  if (!value) {
    return '';
  }

  return parseInt(value as string).toLocaleString();
}

onMounted(() => {
  fetchLeaderboard(type.value, undefined);

	addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
	removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div class="leaderboard">
    <div class="leaderboard-options">
        <select v-model="loserOrLeader" class="type-box" @change="fetchNewType">
          <option :value=false>Leaderboard</option>
          <option :value=true>Loserboard</option>
        </select>
        <select v-model="type" class="type-box" @change="fetchNewType">
          <option value="potatoes">Potatoes</option>
          <option value="trivia">Trivia</option>
          <option value="scramble">Unscramble</option>
          <option value="paints">Most 7TV Paint Changes</option>
          <option value="badges">Most 7TV Badge Changes</option>
          <option value="emoteschannel">Channel Emotes Actions</option>
          <option value="emotesuser">User Emote Actions</option>
          <option value="commandschannel">Channel Commands Used</option>
          <option value="commandsuser">User Commands Used</option>
          <option value="twitchbadges">Twitch Global Badges Active</option>
          <option value="twitchbadgeowners">Twitch Global Badge Owners</option>
          <option value="twitchownedbadges">Twitch Top Owned Badges</option>
          <option value="twitchcolors">Twitch Chat Colors</option>
          <option value="paintstats">Top 7TV Paints</option>
          <option value="badgestats">Top 7TV Badges</option>
          <option value="emoteusechannel">Channel Emote Uses</option>
          <option value="emoteuseuser">User Emote Uses</option>
        </select>
    </div>

    <ul v-if="colorStats.length && type === 'twitchcolors'" class="leaderboard-list">
      <li v-for="color in colorStats" :key="color.color" class="leaderboard-item">
        <div class="color-bar" :style="{ backgroundColor: color.color }"></div>
        <div class="text-content">
          <div><strong>Color:</strong> {{ color.color }}</div>
          <div><strong>Users Seen:</strong> {{ color.user_count.toLocaleString() }}</div>
          <div><strong>Percentage:</strong> {{ color.percentage.toFixed(6) }}%</div>
          <div><strong>Rank:</strong> {{ color.rank }}</div>
        </div>
      </li>
    </ul>

    <div v-if="loading" class="loading-indicator">
      <img :src="potatoImage" alt="Loading potato" class="spinning-potato" />
      Loading...
    </div>
  <ul v-if="badgeStats.length && type === 'twitchbadges'" class="leaderboard-list">
      <li v-for="badge in badgeStats" :key="badge.badge" class="leaderboard-item">
        <div class="badge-picture">
          <a :href="badge.clickAction" target="_blank">
            <img :src="badge.url" alt="Badge"/>
          </a>
        </div>
        <div class="text-content">
          <div><strong>Badge:</strong> {{ badge.name ?? badge.badge }}</div>
          <div><strong>Users Active:</strong> {{ badge.user_count.toLocaleString() }}</div>
          <div><strong>Percentage:</strong> {{ badge.percentage?.toFixed(6) }}%</div>
          <div><strong>Rank:</strong> {{ badgeStats.indexOf(badge) + 1 }}</div>
        </div>
      </li>
    </ul>

    <ul v-if="badgeOwnerCounts.length && type === 'twitchbadgeowners'" class="leaderboard-list">
      <li v-for="badge in badgeOwnerCounts" :key="badge.badge" class="leaderboard-item">
        <div class="badge-picture">
          <a :href="badge.clickAction" target="_blank">
            <img :src="badge.url" alt="Badge"/>
          </a>
        </div>
        <div class="text-content">
          <div><strong>Badge:</strong> {{ badge.name ?? badge.badge }}</div>
          <div><strong>Owners:</strong> {{ Number(badge.total_owners).toLocaleString() }}</div>
        </div>
      </li>
    </ul>

    <ul v-if="ownedBadgeUserStats.length && type === 'twitchownedbadges'" class="leaderboard-list">
      <li v-for="badge in ownedBadgeUserStats" :key="badge.bestName" class="leaderboard-item">
        <div class="profile-picture">
          <a :href="`https://twitch.tv/${badge.bestName?.toLowerCase()}`" target="_blank">
            <img :src="badge.user_pfp ?? 'https://static-cdn.jtvnw.net/user-default-pictures-uv/cdd517fe-def4-11e9-948e-784f43822e80-profile_image-600x600.png'"/>
          </a>
        </div>
        <div class="text-content">
          <div class="rank-name">
            <a :href="`https://twitch.tv/${badge.bestName?.toLowerCase()}`" target="_blank">
              <strong :style="{ color: brightenColor(badge.user_color) }">{{ badge.bestName }}</strong>
            </a>
          </div>
          <span>Owned Badges: {{ Number(badge.owned_badges)?.toLocaleString() }}</span>
        </div>
      </li>
    </ul>

    <ul v-if="paintStats.length && type === 'paintstats'" class="leaderboard-list">
      <li v-for="paint in paintStats" :key="paint.id" class="leaderboard-item">
        <div class="text-content">
          <div><strong>Active Users:</strong> {{ paint.user_count.toLocaleString() }}</div>
          <div><strong>Owners:</strong> {{ paint.owners?.toLocaleString() }}</div>
          <div><strong>Percentage:</strong> {{ paint.percentage.toFixed(3) }}%</div>
          <div><strong>Rank:</strong> {{ paint.rank }}</div>
        </div>
        <div class="paint-span" :style="computePaintStyle(paint.paint)">
          {{ paint.paint?.name?.trim() }}
        </div>
      </li>
    </ul>

    <ul v-if="stvBadgeStats.length && type === 'badgestats'" class="leaderboard-list">
      <li v-for="badge in stvBadgeStats" :key="badge.id" class="leaderboard-item">
        <div class="badge-picture">
          <a>
            <img :src="badge.badge?.url" alt="Badge"/>
          </a>
        </div>
        <div class="text-content">
          <div><strong>Active Users:</strong> {{ badge.user_count.toLocaleString() }}</div>
          <div><strong>Owners:</strong> {{ badge.owners?.toLocaleString() }}</div>
          <div><strong>Percentage:</strong> {{ badge.percentage.toFixed(3) }}%</div>
          <div><strong>Rank:</strong> {{ badge.rank }}</div>
        </div>
      </li>
    </ul>

    <ul class="leaderboard-list" v-if="leaderboarders.length && type !== 'twitchbadges'">
      <li v-for="(user, idx) in leaderboarders" :key="user.bestName" class="leaderboard-item">
        <div class="profile-picture">
          <a :href="`https://twitch.tv/${user.bestName.toLowerCase()}`" target="_blank">
            <img :src="user.user_pfp ?? 'https://static-cdn.jtvnw.net/user-default-pictures-uv/cdd517fe-def4-11e9-948e-784f43822e80-profile_image-600x600.png'"/>
          </a>
        </div>
        <div class="text-content">
          <div class="rank-name">
            #{{ idx + 1 }}
            <a :href="`https://twitch.tv/${user.bestName.toLowerCase()}`" target="_blank">
              <strong :style="{ color: brightenColor(user.user_color) }">{{ user.bestName }}</strong>
            </a>
          </div>
          <div class="details">
            <div v-if="type === 'potatoes'">
              <div>Prestige: {{ user.prestige }}</div>
              <div>Potatoes: {{ user.potatoCount?.toLocaleString() }}</div>
              <div>Farm: {{ user.farmName }}</div>
            </div>
            <div v-else-if="type === 'trivia'">
              <div>Trivia Wins: {{ user.trivia_wins?.toLocaleString()  }}</div>
            </div>
            <div v-else-if="type === 'scramble'">
              <div>Unscramble Wins: {{ user.scramble_wins?.toLocaleString()  }}</div>
            </div>
            <div v-else-if="type === 'paints'">
              <div>7TV Paint Change Count: {{ user.paint_count?.toLocaleString() }}</div>
            </div>
            <div v-else-if="type === 'badges'">
              <div>7TV Badge Change Count: {{ user.badge_count?.toLocaleString()  }}</div>
            </div>
            <div v-else-if="type === 'emoteschannel'">
              <div>Total Channel Emote Actions: {{ getLocale(user.emote_count) }}</div>
            </div>
            <div v-else-if="type === 'emotesuser'">
              <div>Total User Emote Actions: {{ getLocale(user.emote_count) }}</div>
            </div>
            <div v-else-if="type === 'commandschannel'">
              <div>Total Channel Commands Used: {{ getLocale(user.command_count) }}</div>
            </div>
            <div v-else-if="type === 'commandsuser'">
              <div>Total User Commands Used: {{ getLocale(user.command_count) }}</div>
            </div>
            <div v-else-if="type === 'emoteusechannel'">
              <div>Total Channel Emote Uses: {{ getLocale(user.channel_count) }}</div>
            </div>
            <div v-else-if="type === 'emoteuseuser'">
              <div>Total User Emote Uses: {{ getLocale(user.user_count) }}</div>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>


<style scoped>
.leaderboard-options {
  display: flex;
  gap: 10px;
  position: sticky;
  top: 75px;
  margin-bottom: 6px;
  z-index: 1;
  background: var(--panel-bg);
  padding: 10px;
  border-radius: 15px;
  backdrop-filter: blur(var(--panel-blur));
  border: 1px solid var(--panel-border);
  box-shadow: var(--panel-shadow);
}

.type-box {
  outline: auto -webkit-focus-ring-color;
  outline-color: #f4f4f4;
  color: white;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: rgba(31, 31, 31, 0.94);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.leaderboard-list {
  list-style: none;
  padding: 10px;
  text-align: left;
  position: relative;
  isolation: isolate;
  will-change: transform;
  transform: translateZ(0);
}

.leaderboard-item {
  padding: 8px;
  border-radius: 15px;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.10), rgba(0, 0, 0, 0.10)), var(--panel-bg);
  border: 1px solid var(--panel-border);
  box-shadow: var(--panel-shadow);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  overflow: hidden;
  background-clip: padding-box;
  contain: paint;
  content-visibility: auto;
  contain-intrinsic-size: 120px;
  position: relative;
  z-index: 1;
}

.leaderboard-item .text-content img {
  vertical-align: middle;
}

.profile-container {
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: rgba(31, 31, 31, 0.94);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.profile-picture img {
  border-radius: 50%;
  margin-right: 5px;
  width: 72px;
  height: 72px;
  vertical-align: cover;
}

.text-content {
  display: flex;
  flex-direction: column;
}

.rank-name {
  font-size: 18px;
}

.leaderboard-list::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}

.leaderboard-list::-webkit-scrollbar-thumb {
  background: transparent;
}

.badge-picture img {
  width: 64px;
  height: 64px;
  margin-right: 10px;
  margin-left: 10px;
}

.color-bar {
  width: 160px;
  height: 64px;
  border-radius: 4px;
  margin-right: 10px;
}

.paint-span {
  font-size: 2.4rem;
  width: 300px;
  height: 64px;
  margin-right: 10px;
  margin-left: 10px;
}

.loading-indicator {
  text-align: center;
  padding: 40px;
  font-size: 24px;
  color: #e5e4e4;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.spinning-potato {
  width: 40px;
  height: 40px;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
