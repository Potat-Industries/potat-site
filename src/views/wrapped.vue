<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchBackend } from '$assets/request';
import { brightenColor } from '$assets/utilities';
import router from '../router';
import { useRoute } from 'vue-router';
const route = useRoute();

interface WrappedVanity {
  readonly pfp: string;
  readonly color: string;
  readonly display: string;
}

type WrappedNode = {
  readonly name: string;
  readonly count: number;
} & Partial<WrappedVanity>;

interface WrappedUser {
  readonly self: WrappedVanity;
  readonly totalChatsSent: number;
  readonly totalCommandsUsed: number;
  readonly mostUsedCommands: WrappedNode[];
  readonly mostChattedChannels: WrappedNode[];
  readonly totalEmoteActions: number;
  readonly totalPotatoesFarmed: number;
  readonly addedBotToChannels: number;
  readonly changedPaintCount: number;
  readonly customCommandsMade: number;
}

interface WrappedChannel {
  readonly prefix: string;
  readonly totalChatsSent: number;
  readonly totalCommandsUsed: number;
  readonly topCommands?: WrappedNode[];
  readonly topChatters?: WrappedNode[];
  readonly totalEmoteActions: number;
}

interface WrappedGlobal {
  readonly botMessagesSent: number;
  readonly newUsersThisYear: number;
  readonly newChannelsThisYear: number;
  readonly totalCommandsExecuted: number;
  readonly totalEmoteActions: number;
  readonly topBotter: WrappedNode[];
  readonly topCommands: WrappedNode[];
  readonly topChannels: WrappedNode[];
}

interface Wrapped {
  readonly user: WrappedUser;
  readonly channel?: WrappedChannel;
  readonly global: WrappedGlobal;
}

const selectedSection = ref<'User' | 'Channel' | 'Global'>('User');
const wrappedData = ref<Wrapped | null>(null);
const isLoading = ref(true);
const computedArray = ref(['User', 'Channel', 'Global']);
const user = route.params.username as string

const redirectToHome = () => {
  window.location.href = '/';
};

const getWrapped = async (username: string): Promise<Wrapped> => {
  return fetchBackend<Wrapped>(`wrapped?user=${username}`).then((res) => res.data?.[0]);
};

const changeWrapped = (wrapped: 'User' | 'Channel' | 'Global') => {
	router.push({ path: `/wrapped/${user}/${wrapped.toLowerCase()}` });
  selectedSection.value = wrapped;
};

const redirectToCommand = (name: string) => {
	if (name) {
		window.location.href = `/help/${name}`
	}
}

const redirectToChannelWrapped = (channelName: string) => {
  if (channelName) {
    window.location.href = `/wrapped/${channelName}`;
  }
};

onMounted(() => {
  if (!user) {
    console.log('No user provided');
    return redirectToHome();
  }

  getWrapped(user).then((data) => {
    if (!data || !data.user.totalChatsSent) {
      console.log('Failed to load user wrapped data');
      return redirectToHome();
    }
    wrappedData.value = data;

		if (!data.channel?.totalChatsSent && !data.channel?.prefix) {
			computedArray.value = ['User', 'Global'];
		}

		if (route.params.type && typeof route.params.type === 'string') {
			selectedSection.value = route.params.type.slice(0, 1).toUpperCase() +
				route.params.type.slice(1).toLowerCase() as 'User' | 'Channel' | 'Global';
		}

		document.documentElement.style.setProperty(
			'--user-purple',
			brightenColor(data.user.self.color, 40) || '#ae81ff'
		);
  }).finally(() => {
    isLoading.value = false;
  });
});
</script>

<template>
	<div v-if="isLoading" class="loading-container">
    <div class="loading-spinner"></div>
    <p>Loading your Wrapped data...</p>
  </div>
  <div v-else-if="wrappedData" id="wrapped-container">
    <div class="sidebar-container">
      <nav class="sidebar">
				<ul class="wrapped-list" role="menu">
					<li
						v-for="wrapped in computedArray"
						:key="wrapped"
						class="wrapped-item"
						@click="changeWrapped(wrapped as 'User' | 'Channel' | 'Global')"
						role="menuitem"
					>
						<a :class="{ active: selectedSection === wrapped }">{{ wrapped }}</a>
					</li>
				</ul>
      </nav>
    </div>
    <div class="wrapped-info">
			<div class="profile-container">
				<a
					target="_blank"
					class="profile-link"
					style="cursor: pointer;"
					:href="`https://twitch.tv/${wrappedData.user.self.display.toLowerCase()}`"
				>
					<img :src="wrappedData.user.self.pfp || 'https://gachi.gay/sgJNs'" />
				</a>
				<div class="profile-text">
					<h1>
						<div :style="{
							color: brightenColor(wrappedData.user.self.color, 35),
							textAlign: 'center',
						}">
							{{ wrappedData.user.self.display }}
						</div>
						2024 Wrapped
					</h1>
				</div>
			</div>

      <div v-if="selectedSection === 'User'">
        <div class="text-content">
          <div class="small-stat-grid">
						<h2 v-if="wrappedData.user.totalChatsSent > 0" class="grid-stat-box">
							<div>
								Sent
								<strong>{{ wrappedData.user.totalChatsSent.toLocaleString() }}</strong>
							</div>
							Total Chat Messages
						</h2>
						<h2 v-if="wrappedData.user.totalCommandsUsed > 0" class="grid-stat-box">
							<div>
								Executed
								<strong>{{ wrappedData.user.totalCommandsUsed.toLocaleString() }}</strong>
							</div>
							Total Command{{ wrappedData.user.totalCommandsUsed > 1 ? 's' : '' }}
						</h2>
						<h2 v-if="wrappedData.user.totalEmoteActions > 0" class="grid-stat-box">
							<div>
								Performed
								<strong>{{ wrappedData.user.totalEmoteActions.toLocaleString() }}</strong>
							</div>
							Emote Action{{ wrappedData.user.totalEmoteActions > 1 ? 's' : '' }}
						</h2>
						<h2 v-if="wrappedData.user.totalPotatoesFarmed > 0" class="grid-stat-box">
							<div>
								Farmed
								<strong>{{ wrappedData.user.totalPotatoesFarmed.toLocaleString() }}</strong>
							</div>
							Total Potatoes
						</h2>
						<h2 v-if="wrappedData.user.addedBotToChannels > 0" class="grid-stat-box">
							Added The Bot In
							<div>
								<strong>{{ wrappedData.user.addedBotToChannels.toLocaleString() }}</strong>
								Channel{{ wrappedData.user.addedBotToChannels > 1 ? 's' : '' }}
							</div>
						</h2>
						<h2 v-if="wrappedData.user.changedPaintCount > 0" class="grid-stat-box">
							Changed Your 7TV Paint
							<div>
								<strong>{{ wrappedData.user.changedPaintCount.toLocaleString() }}</strong>
								Time{{ wrappedData.user.changedPaintCount > 1 ? 's' : '' }}
							</div>
						</h2>
						<h2 v-if="wrappedData.user.customCommandsMade > 0" class="grid-stat-box">
							<div>
								Handcrafted
								<strong>{{ wrappedData.user.customCommandsMade.toLocaleString() }}</strong>
							</div>
							Custom Command{{ wrappedData.user.customCommandsMade > 1 ? 's' : '' }}
						</h2>
					</div>

					<h2 v-if="wrappedData.user.mostUsedCommands.length">
						Your Most Used Commands:
					</h2>
						<div
							v-for="(command, index) in wrappedData.user.mostUsedCommands || []"
							:key="command.name"
							class="wrapped-details"
							style="cursor: pointer;"
							@click="redirectToCommand(command.name)"
						>
						<div>
							<a>#</a><strong>{{ command.name }}</strong>
							<span v-if="index === 0" class="highlight-star"> ★</span>
						</div>
						<p>Times used: <strong>{{ command.count.toLocaleString() }}</strong></p>
					</div>

					<h2 v-if="wrappedData.user.mostChattedChannels.length">
						The Channels You Chatted The Most:
					</h2>
					<div
						v-for="(channel, index) in wrappedData.user.mostChattedChannels || []"
						:key="channel.name"
						class="wrapped-details"
						@click="redirectToChannelWrapped(channel.name)"
						style="cursor: pointer;"
					>
						<div class="channel-pfp">
							<img
								:style="{ border: `2px solid ${brightenColor(channel.color as string, 35)}` }"
								:src="channel.pfp || 'https://gachi.gay/sgJNs'"
							/>
							<strong :style="{ color: brightenColor(channel.color as string, 35) }">
								{{ channel.display ?? channel.name }}
							</strong>
							<span v-if="index === 0" class="highlight-star"> ★</span>
						</div>
						<p>Messages sent: <strong>{{ channel.count.toLocaleString() }}</strong></p>
					</div>
        </div>
      </div>

			<div v-if="selectedSection === 'Channel'">
        <div class="text-content">
          <div class="small-stat-grid">
            <h2 v-if="(wrappedData.channel?.totalChatsSent ?? 0) > 0" class="grid-stat-box">
              Your Chatters Sent
              <strong>{{ wrappedData.channel?.totalChatsSent.toLocaleString() }}</strong>
              Total Messages
            </h2>
            <h2 v-if="(wrappedData.channel?.totalCommandsUsed ?? 0) > 0" class="grid-stat-box">
              <div>
								They Also Executed
              	<strong>{{ wrappedData.channel?.totalCommandsUsed.toLocaleString() }}</strong>
							</div>
							Total Command{{ (wrappedData.channel?.totalCommandsUsed ?? 0) > 1 ? 's' : '' }}
            </h2>
            <h2 v-if="(wrappedData.channel?.totalEmoteActions ?? 0) > 0" class="grid-stat-box">
              <div>
								A Total Of
              	<strong>{{ wrappedData.channel?.totalEmoteActions.toLocaleString() }}</strong>
								Emotes
							</div>
							 Were Added Or Removed
            </h2>
          </div>
        </div>

				<h2 v-if="wrappedData.channel?.topCommands?.length">
					Your Chat's Favorite Commands
				</h2>
					<div
						v-for="(command, index) in wrappedData.channel?.topCommands || []"
						:key="command.name"
						class="wrapped-details"
						style="cursor: pointer;"
						@click="redirectToCommand(command.name)"
					>
					<div>
						<a>{{ wrappedData.channel?.prefix ?? '#' }}</a><strong>{{ command.name }}</strong>
						<span v-if="index === 0" class="highlight-star"> ★</span>
					</div>
					<p>Times used: <strong>{{ command.count.toLocaleString() }}</strong></p>
				</div>

				<h2 v-if="wrappedData.channel?.topChatters?.length">
					Your most loyal chatters
				</h2>
					<div
						v-for="(channel, index) in wrappedData.channel?.topChatters || []"
						:key="channel.name"
						class="wrapped-details"
						@click="redirectToChannelWrapped(channel.name)"
						style="cursor: pointer;"
					>
					<div class="channel-pfp">
						<img
							:style="{ border: `2px solid ${brightenColor(channel.color as string, 35)}` }"
							:src="channel.pfp || 'https://gachi.gay/sgJNs'"
						/>
						<strong :style="{ color: brightenColor(channel.color as string, 35) }">
							{{ channel.display ?? channel.name }}
						</strong>
						<span v-if="index === 0" class="highlight-star"> ★</span>
					</div>
					<p>Messages sent: <strong>{{ channel.count.toLocaleString() }}</strong></p>
				</div>

      </div>

			<div v-if="selectedSection === 'Global'">
        <div class="text-content">
          <div class="small-stat-grid">
            <h2 v-if="wrappedData.global?.botMessagesSent > 0" class="grid-stat-box">
              <div>
								The Bot Sent
              	<strong>{{ wrappedData.global?.botMessagesSent.toLocaleString() }}</strong>
							</div>
							Total Chat Messages
            </h2>
            <h2 v-if="wrappedData.global?.newUsersThisYear > 0" class="grid-stat-box">
              <div>
								Over
								<strong>{{ wrappedData.global?.newUsersThisYear.toLocaleString() }}</strong>
								Unique
							</div>
							Users Were Seen
            </h2>
            <h2 v-if="wrappedData.global?.totalCommandsExecuted > 0" class="grid-stat-box">
							Chatters Executed A Total Of
              <div>
								<strong>{{ wrappedData.global?.totalCommandsExecuted.toLocaleString() }}</strong>
								Commands
							</div>
            </h2>
						<h2 v-if="wrappedData.global?.totalEmoteActions > 0" class="grid-stat-box">
							<div>
								A Total
								<strong>{{ wrappedData.global?.totalEmoteActions.toLocaleString() }}</strong>
							</div>
							Emote Actions Were Performed
						</h2>
						<h2 v-if="wrappedData.global.newChannelsThisYear > 0" class="grid-stat-box">
							<div>
								An Insane
								<strong>{{ wrappedData.global?.newChannelsThisYear.toLocaleString() }}</strong>
								New
								</div>
								Channels Added The Bot
						</h2>
						<h2 class="grid-stat-box">
							<div>
								Thank You For Using
								<strong>PotatBotat</strong>
								In 2024!
							</div>

						</h2>
          </div>

					<h2>The Top Commands Across All Channels</h2>
					<div
						v-for="(command, index) in wrappedData.global?.topCommands || []"
						:key="command.name"
						class="wrapped-details"
						@click="redirectToCommand(command.name)"
					>
						<div>
							<a>#</a><strong>{{ command.name }}</strong>
							<span v-if="index === 0" class="highlight-star"> ★</span>
						</div>
						<p>Times used: <strong>{{ command.count.toLocaleString() }}</strong></p>
					</div>

					<h2>The Channels Who Used PotatBotat The Most In 2024</h2>
					<div
						v-for="(channel, index) in wrappedData.global?.topChannels || []"
						:key="channel.name"
						class="wrapped-details"
					>
						<div class="channel-pfp">
							<img
								:style="{ border: `2px solid ${brightenColor(channel.color as string, 35)}` }"
								:src="channel.pfp || 'https://gachi.gay/sgJNs'"
								@click="redirectToChannelWrapped(channel.name)"
								style="cursor: pointer;"
							/>
							<strong :style="{ color: brightenColor(channel.color as string, 35) }">
								{{ channel.display ?? channel.name }}
							</strong>
							<span v-if="index === 0" class="highlight-star"> ★</span>
						</div>
						<p>Total Commands Used: <strong>{{ channel.count.toLocaleString() }}</strong></p>
					</div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
:root {
  --user-purple: #ae81ff;
}

#wrapped-container {
  display: grid;
  grid-template: auto / 150px 1fr;
  gap: 24px;
  padding: 16px;
  font-family: Arial, sans-serif;
}

.sidebar {
  background-color: rgba(31, 31, 31, 0.906);
  position: sticky;
  top: 80px;
  border-radius: 12px;
  overflow: hidden;
  width: 100%;
  padding: 16px 0;
}

.wrapped-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.wrapped-item {
  margin: 0;
  padding: 12px 0;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.wrapped-item a {
  text-decoration: none;
  color: white;
}

.wrapped-item a.active {
	color: var(--user-purple);
}

.wrapped-item:hover a {
	color: var(--user-purple);
}

.highlight-star {
  color: #ffd700;
  font-size: 16px;
}

.small-stat-grid {
	display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: auto;
  gap: 16px;
}

.grid-stat-box {
  background: rgba(50, 50, 50, 0.8);
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.3);
}

.grid-stat-box strong {
	color: var(--user-purple);
}

.grid-stat-box:hover {
  transform: scale(1.04);
}

h2.grid-stat-box:nth-child(7) {
  grid-column-end: -2;
}

.wrapped-info {
  background-color: rgba(31, 31, 31, 0.906);
  border-radius: 12px;
  padding: 24px;
  text-align: left;
  overflow-y: auto;
}

.profile-container {
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: center;
  width: 100%;
}

.profile-link {
  display: block;
}

.profile-link img {
  border-radius: 50%;
  width: 120px;
  height: 120px;
  object-fit: cover;
  border: 3px solid var(--user-purple);
}

.profile-text h1 {
  font-size: 36px;
  color: white;
  line-height: 1.2;
  margin: 0;
}

.profile-picture strong {
  color: inherit;
  font-weight: bold;
}

.text-content {
  line-height: 1.6;
  color: white;
}

.text-content h2 {
  font-size: 18px;
  margin-bottom: 12px;
}

.wrapped-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: rgba(50, 50, 50, 0.8);
  border-radius: 8px;
  margin-bottom: 8px;
  transition: transform 0.2s;
}

.wrapped-details:hover {
  transform: scale(1.02);
}

.wrapped-details strong {
  font-size: 16px;
	color: var(--user-purple);
}

.wrapped-details p {
  font-size: 14px;
  color: #d3d3d3;
  margin: 0;
}

.wrapped-details .channel-pfp {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wrapped-details .channel-pfp img {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  object-fit: cover;
  border: 2px solid var(--user-purple);
}

.wrapped-details p {
	color: white;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: rgba(50, 50, 50, 0.8);
  text-align: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 700px) {
	#wrapped-container {
		grid-template: 1fr / auto;
	}

	.small-stat-grid {
     grid-template: 1fr / auto;
  }
}
</style>

