<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchBackend } from '../assets/request';
import { brightenColor } from '../assets/utilities';

interface Connection {
  user_id: number;
  id: string;
  username: string | null;
  display: string | null;
  pfp: string | null;
  platform: string;
  meta: Record<string, any>;
}

interface UserSettings {
  is_bot: boolean;
  language: string | null;
  no_reply: boolean;
  is_selfbot: boolean;
  ignore_dropped: boolean;
  color_responses: boolean;
}

interface PotatUser {
  user_id: number;
  username: string;
  first_seen: string;
  level: number;
  display: string;
  settings: UserSettings;
  connections: Connection[];
}

interface Command {
  command_id: number;
  channel_id: string;
  user_id: number;
  trigger: string;
  response: string;
  active: boolean;
  active_online: boolean;
  active_offline: boolean;
  reply: boolean;
  whisper: boolean;
  announce: boolean;
  cooldown: number;
  delay: number;
  use_count: number;
  created: string;
  modified: string;
  run_command: string | null;
  platform: string;
  name: string | null;
  help: string | null;
  user_requires: string;
  raw: boolean;
  expires_at: string | null;
  bot_requires: string;
  category: string | null;
  type: string;
  aliases: string[];
  level: number;
  reward_id: string | null;
}

interface ChannelSettings {
  prefix: string;
  paj_bot: string | null;
  language: string;
  no_reply: boolean;
  permission: string;
  offline_only: boolean;
  whisper_only: boolean;
  silent_errors: boolean;
  user_cooldown: number | null;
  force_language: boolean;
  color_responses: boolean;
  channel_cooldown: number | null;
  pyramid_response: string | null;
  users_blacklisted: string[];
  first_msg_responses: boolean;
  allow_bot_emote_tracking: boolean;
}

interface Channel {
  username: string;
  joined_at: string;
  added_by: { id: string; addedAt: string; username: string }[];
  settings: ChannelSettings;
  platform: string;
  channel_id: string;
  state: string;
  meta: { bot_banned: boolean; twitch_banned: boolean };
  editors: string[];
  ambassadors: string[];
  chan_id: string;
  login: string;
  commands: Command[];
  blocks: { users: string[]; commands: string[] };
}

interface Potatoes {
  joinedAt: string;
  count: number;
  prestige: number;
  rank: number;
  taxMultiplier: number;
  verbose: boolean;
  potato: { readyAt: number; ready: boolean; usage: number; averageResponse: string };
  cdr: { readyAt: number; ready: boolean };
  trample: { readyAt: number; ready: boolean; trampleCount: number; trampledCount: number; trampledBy: string | null };
  steal: { readyAt: number; ready: boolean; stolenCount: number; theftCount: number; stoleBy: string | null; stolenAmount: number };
  eat: { readyAt: number; ready: boolean };
  quiz: { readyAt: number | null; ready: boolean; attempted: number; completed: number };
  gamble: { winCount: number; loseCount: number; totalWins: number; totalLosses: number };
  duel: { winCount: number; loseCount: number; totalWins: number; totalLosses: number; caughtLosses: number };
}

interface Entry {
  user: PotatUser;
  channel?: Channel;
  potatoes: Potatoes | null;
}

const VALID_TABS = ['commands', 'connections', 'potatoes', 'settings'] as const;
type Tab = typeof VALID_TABS[number];

function tabFromHash(hash: string): Tab | undefined {
  const clean = hash.replace(/^#/, '') as Tab;
  return VALID_TABS.includes(clean) ? clean : undefined;
}

const route = useRoute();
const router = useRouter();

const
entry = ref<Entry | null>(null),
loading = ref(false),
notFound = ref(false),
searchQuery = ref(''),
activeTab = ref<Tab>('connections'),

defaultTab = (e: Entry | null): Tab => (e?.channel ? 'commands' : 'connections'),

resolveTab = (e: Entry | null): Tab => tabFromHash(route.hash) ?? defaultTab(e),

setTab = (tab: Tab) => {
  activeTab.value = tab;
  router.replace({ path: route.path, hash: `#${tab}` });
},

fetchUser = async (username: string | undefined) => {
  entry.value = null;
  notFound.value = false;

  if (!username) return;

  loading.value = true;
  try {
    const res = await fetchBackend<Entry>(`users/${encodeURIComponent(username)}`);
    entry.value = res?.data?.[0] ?? null;
    if (!entry.value) notFound.value = true;
    activeTab.value = resolveTab(entry.value);
  } catch (err) {
    console.error('[user] Failed to fetch user:', err);
    notFound.value = true;
  } finally {
    loading.value = false;
  }
},

submitSearch = () => {
  const name = searchQuery.value.trim();
  if (!name) return;
  router.push({ name: 'User', params: { username: name } });
  searchQuery.value = '';
},

getAvatar = (e: Entry): string => {
  const stv = e.user.connections.find((c) => c.platform === 'STV' && c.pfp);
  if (stv?.pfp) return stv.pfp;
  const twitch = e.user.connections.find((c) => c.platform === 'TWITCH' && c.pfp);
  if (twitch?.pfp) return twitch.pfp;
  return '/tatov2.png';
},

getColor = (e: Entry): string => {
  const twitch = e.user.connections.find((c) => c.platform === 'TWITCH');
  return brightenColor(twitch?.meta?.color) || '#6441a4';
},

getName = (e: Entry): string => {
  const twitch = e.user.connections.find((c) => c.platform === 'TWITCH');
  return twitch?.display || e.user.display || e.user.username;
};

watch(
  () => route.params.username,
  (username) => fetchUser(username as string | undefined),
  { immediate: true },
);

watch(
  () => route.hash,
  (hash) => {
    if (!entry.value) return;
    const t = tabFromHash(hash as string);
    if (t) activeTab.value = resolveTab(entry.value);
  },
);
</script>

<template>
  <div class="user-page">
    <div class="search-row">
      <input
        v-model="searchQuery"
        type="text"
        class="search-box"
        placeholder="Look up a user..."
        @keyup.enter="submitSearch"
      />
      <button @click="submitSearch">Look up</button>
    </div>

    <div v-if="!route.params.username" class="empty-state">
      <img src="/tatoExplode.gif" alt="PotatBotat" class="empty-gif" />
    </div>

    <div v-else-if="loading" class="loading-indicator">
      <img src="/tatov2.png" alt="Loading potato" class="spinning-potato" />
      Loading...
    </div>

    <div v-else-if="notFound" class="not-found">
      <img src="/tatoExplode.gif" alt="Not found" class="empty-gif" />
      <p>Couldn't find a user by that name.</p>
    </div>

    <template v-else-if="entry">
      <div class="profile-box">
        <div class="profile-picture">
          <img :src="getAvatar(entry)" :alt="getName(entry)" />
        </div>
        <div class="text-content">
          <strong class="username" :style="{ color: getColor(entry) }">{{ getName(entry) }}</strong>
          <div class="meta-row">
            <span>Level {{ entry.user.level }}</span>
            <template v-if="entry.potatoes">
              <span>Rank #{{ entry.potatoes.rank }}</span>
              <span>🥔 {{ entry.potatoes.count.toLocaleString() }}</span>
            </template>
            <span v-else class="untracked">No potatoes</span>
          </div>
        </div>
      </div>

      <div class="tabs">
        <button :class="{ active: activeTab === 'commands' }" @click="setTab('commands')">Commands</button>
	    <button :class="{ active: activeTab === 'connections' }" @click="setTab('connections')">Connections</button>
	    <button :class="{ active: activeTab === 'potatoes' }" @click="setTab('potatoes')">Potatoes</button>
	    <button :class="{ active: activeTab === 'settings' }" @click="setTab('settings')">Channel Settings</button>
      </div>

    <template v-if="activeTab === 'commands'">
        <ul v-if="entry.channel && entry.channel.commands.length" class="item-list">
            <li v-for="cmd in entry.channel.commands" :key="cmd.command_id" class="item">
                <div class="item-top">
                    <span class="mono">{{ cmd.name ?? cmd.trigger ?? '(unnamed)' }}</span>
                    <span class="type-tag">{{ cmd.type }}</span>
                    <span v-if="!cmd.active" class="disabled-tag">disabled</span>
                </div>
                <code v-if="cmd.type === 'COMMAND'" class="response">{{ cmd.run_command }}</code>
                <p v-else class="response">{{ cmd.response }}</p>
                <div class="item-bottom">
                    <span>used {{ cmd.use_count.toLocaleString() }}x</span>
                    <span>cooldown {{ cmd.cooldown / 1000 }}s</span>
                    <span>level {{ cmd.level }}</span>
                </div>
            </li>
        </ul>
        <div v-else-if="entry.channel" class="no-channel">
            <img src="/tatov2.png" alt="" class="no-channel-icon" />
            <p>No commands set up.</p>
        </div>
        <div v-else class="no-channel">
            <img src="/tatoExplode.gif" alt="" class="no-channel-icon" />
            <p>This user hasn't joined PotatBotat in a channel.</p>
        </div>
    </template>

      <div v-else-if="activeTab === 'connections'" class="connections-grid">
        <div v-for="conn in entry.user.connections" :key="conn.platform + conn.id" class="conn-card">
          <img v-if="conn.pfp" :src="conn.pfp" :alt="conn.platform" />
          <div>
            <div class="conn-platform">{{ conn.platform === 'STV' ? '7TV' : conn.platform }}</div>
            <div class="conn-username">{{ conn.display ?? conn.username ?? conn.id }}</div>
          </div>
        </div>
      </div>

      <template v-else-if="activeTab === 'potatoes'">
        <div v-if="entry.potatoes" class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Count</div>
            <div class="stat-value">{{ entry.potatoes.count.toLocaleString() }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Rank</div>
            <div class="stat-value">#{{ entry.potatoes.rank }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Prestige</div>
            <div class="stat-value">{{ entry.potatoes.prestige }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Trample</div>
            <div class="stat-value">{{ entry.potatoes.trample.trampleCount }} / {{ entry.potatoes.trample.trampledCount }} taken</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Steal</div>
            <div class="stat-value">{{ entry.potatoes.steal.stolenCount }} stolen · {{ entry.potatoes.steal.theftCount }} attempts</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Gamble</div>
            <div class="stat-value">{{ entry.potatoes.gamble.winCount }}W / {{ entry.potatoes.gamble.loseCount }}L</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Duel</div>
            <div class="stat-value">{{ entry.potatoes.duel.winCount }}W / {{ entry.potatoes.duel.loseCount }}L</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Quiz</div>
            <div class="stat-value">{{ entry.potatoes.quiz.completed }} / {{ entry.potatoes.quiz.attempted }} completed</div>
          </div>
        </div>
        <p v-else class="empty-text no-channel">This user hasn't claimed any potatoes yet.</p>
      </template>

      <template v-else-if="activeTab === 'settings'">
        <div v-if="entry.channel" class="settings-table">
          <div class="settings-row">
            <span class="key">state</span>
            <span class="val">{{ entry.channel.state }}</span>
          </div>
          <div class="settings-row">
            <span class="key">joined_at</span>
            <span class="val">{{ new Date(entry.channel.joined_at).toLocaleDateString() }}</span>
          </div>
          <div class="settings-row">
            <span class="key">bot_banned</span>
            <span class="val">{{ entry.channel.meta.bot_banned }}</span>
          </div>
          <div class="settings-row">
            <span class="key">twitch_banned</span>
            <span class="val">{{ entry.channel.meta.twitch_banned }}</span>
          </div>
          <div v-for="(value, key) in entry.channel.settings" :key="key" class="settings-row">
            <span class="key">{{ key }}</span>
            <span class="val">{{ Array.isArray(value) ? (value.length ? value.join(', ') : '—') : String(value) }}</span>
          </div>
        </div>
        <p v-else class="empty-text no-channel">This user does not have PotatBotat in their channel.</p>
      </template>
    </template>
  </div>
</template>

<style scoped>
.user-page {
  max-width: 900px;
  margin: 20px auto 0;
  padding: 0 10px;
}

.search-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.search-box {
  flex: 1;
  outline: auto -webkit-focus-ring-color;
  outline-color: #f4f4f4;
  color: white;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: rgba(31, 31, 31, 0.94);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border: none;
}

.search-row button {
  background-color: #6441a4;
  text-shadow: none;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 1em 1.6em;
  font-size: 0.9em;
  font-weight: 600;
  font-family: inherit;
  background-color: #4CAF50;
  cursor: pointer;
  transition: border-color 0.25s;
  text-shadow: -1px -1px 0 #333, 1px -1px 0 #333, -1px 1px 0 #333, 1px 1px 0 #333;
  outline: auto -webkit-focus-ring-color;
  outline-color: #f4f4f4;
}

.empty-state,
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 12px;
}

.empty-gif {
  width: 160px;
  height: 160px;
}

.not-found p {
  color: #aaa;
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

.profile-box {
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), var(--panel-bg);
  border: 1px solid var(--panel-border);
  box-shadow: var(--panel-shadow);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 12px;
  backdrop-filter: blur(var(--panel-blur));
}

.profile-picture img {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  font-size: 22px;
  text-shadow:
    -1px -1px 0 #333,
    1px -1px 0 #333,
    -1px 1px 0 #333,
    1px 1px 0 #333;
}

.meta-row {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  color: #aaa;
  font-size: 14px;
}

.untracked {
  font-style: italic;
}

.tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  box-shadow: var(--panel-shadow);
  border-radius: 15px;
  padding: 8px;
  margin-bottom: 12px;
  backdrop-filter: blur(var(--panel-blur));
  position: sticky;
  top: 75px;
  z-index: 1;
}

.tabs button {
  background: transparent;
  border: none;
  color: #aaa;
  padding: 10px 14px;
  border-radius: 15px;
  font-size: 14px;
  text-shadow: none;
}

.tabs button:hover {
  color: #fff;
}

.tabs button.active {
  background-color: #6441a4;
  color: #fff;
}

.item-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  box-shadow: var(--panel-shadow);
  border-radius: 15px;
  padding: 12px 14px;
  backdrop-filter: blur(var(--panel-blur));
}

.item-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.mono {
  font-family: monospace;
  font-weight: 600;
}

.type-tag {
  font-size: 11px;
  color: #aaa;
  background: rgba(255, 255, 255, 0.06);
  padding: 2px 8px;
  border-radius: 6px;
}

.disabled-tag {
  font-size: 11px;
  color: #ff6b6b;
}

.response {
  margin: 0;
  color: #aaa;
  font-size: 13px;
  word-break: break-word;
}

.item-bottom {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  font-size: 11px;
  color: #888;
}

.connections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.conn-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  box-shadow: var(--panel-shadow);
  border-radius: 15px;
  padding: 10px;
  backdrop-filter: blur(var(--panel-blur));
}

.conn-card img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.conn-platform {
  font-size: 11px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.conn-username {
  font-size: 14px;
  font-weight: 500;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
}

.stat-card {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  box-shadow: var(--panel-shadow);
  border-radius: 15px;
  padding: 14px 16px;
  backdrop-filter: blur(var(--panel-blur));
}

.stat-label {
  font-size: 11px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 17px;
  font-weight: 600;
  text-shadow:
    -1px -1px 0 #333,
    1px -1px 0 #333,
    -1px 1px 0 #333,
    1px 1px 0 #333;
}

.settings-table {
  display: flex;
  flex-direction: column;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  box-shadow: var(--panel-shadow);
  border-radius: 15px;
  overflow: hidden;
  backdrop-filter: blur(var(--panel-blur));
}

.settings-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  font-size: 13px;
}

.settings-row:nth-child(odd) {
  background: rgba(0, 0, 0, 0.15);
}

.key {
  color: #aaa;
  font-family: monospace;
}

.val {
  font-weight: 500;
  text-align: right;
  word-break: break-word;
}

.empty-text {
  color: #aaa;
  font-size: 13px;
}

.no-channel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  box-shadow: var(--panel-shadow);
  border-radius: 15px;
  padding: 32px 20px;
  backdrop-filter: blur(var(--panel-blur));
  text-align: center;
}

.no-channel-icon {
  width: 56px;
  height: 56px;
}

.no-channel p {
  margin: 0;
  color: #aaa;
  font-size: 13px;
}
</style>