<script setup lang="ts">
import { ref, onMounted, Ref } from 'vue';
import eventBus from '../assets/eventBus';
import { delay } from '../assets/utilities';
import { fetchBackend } from '../assets/request';
import { UpdateEvent } from '../types/misc';

enum EventType {
  CommandsExecuted = 'commands-executed',
  NewUser = 'new-user',
  ActiveChannels = 'active-channels',
  EmoteActions = 'emote-actions',
  EmoteUse = 'emote-use',
  PotatoUpdate = 'potato-update',
}


const data: Ref = ref({});
onMounted(async () => {
	data.value = await fetchBackend('').then(res => res?.data?.[0])

	eventBus.$on('update', async (stats) => {
		const { data: update, topic } = stats as UpdateEvent;
		switch (topic) {
			case EventType.CommandsExecuted:
				data.value.misc.commandsUsed = update.totalCount;
				break;
			case EventType.NewUser:
				data.value.twitch.usersSeen += 1;
				break;
			case EventType.ActiveChannels:
				data.value.twitch.activeChannels = update.activeCount;
				break;
			case EventType.EmoteActions:
				if (update.action !== 'ADD') return;
				data.value.misc.emoteActions.added += 1;
				break;
			case EventType.EmoteUse:
				data.value.misc.emotesUsed += update?.emote?.count ?? 0;
				break;
			case EventType.PotatoUpdate:
				for (let i = 0; i < update.updateCount; i++) {
					data.value.potato.total += 1;
					await delay(Math.min(5, 5000/update.updateCount));
				}
				break;
		}
	})
});
</script>

<template>
  <div v-if="data.misc" class="text-container">
		<strong>Commands used:</strong>
		<span>{{ data?.misc?.commandsUsed?.toLocaleString() }}</span>

		<strong>Potatoes farmed:</strong>
		<span>{{ data?.potato?.total?.toLocaleString() }}</span>

		<strong>Active channels:</strong>
		<span>{{ data?.twitch?.activeChannels?.toLocaleString() }}</span>

		<strong>Emotes added:</strong>
		<span>{{ data?.misc?.emoteActions?.added?.toLocaleString() }}</span>

		<strong>Emotes used:</strong>
		<span>{{ data?.misc?.emotesUsed?.toLocaleString() }}</span>

		<strong>Users seen:</strong>
		<span>{{ parseInt(data?.twitch?.usersSeen)?.toLocaleString() }}</span>
  </div>
</template>

<style scoped>
.text-container {
	display: grid;
	grid-template: auto / auto auto;
	gap: 8px;
	text-shadow: -1px -1px 0 #333, 1px -1px 0 #333, -1px 1px 0 #333, 1px 1px 0 #333;
	background: var(--panel-bg);
	border-radius: 15px;
	padding: 20px;
	backdrop-filter: blur(var(--panel-blur));
	border: 1px solid var(--panel-border);
	box-shadow: var(--panel-shadow);
	font-variant-numeric: tabular-nums;
	strong {
		min-width: 160px;
		margin-right: 10px;
		font-size: 100%;
	}
}

</style>
