<script setup lang="ts">
import { ref } from 'vue';

const host = ref(window.location.hostname);
</script>

<template>
	<div class="twitch-iframe">
		<h2>Ask for help, or try it out!</h2>

		<iframe id="twitch-chat-embed"
			:src="`https://www.twitch.tv/embed/potatbotat/chat?parent=${host}&darkpopout`"
			loading="lazy"
		></iframe>
	</div>
</template>

<style scoped>
	.twitch-iframe {
		background: var(--panel-bg);
		border-radius: 15px;
		padding: 15px;
		border: 1px solid var(--panel-border);
		box-shadow: var(--panel-shadow);
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.twitch-iframe h2 {
		text-align: center;
		margin: 0 0 8px 0;
	}
	iframe#twitch-chat-embed {
		display: block;
		width: 100%;
		border: none;
		border-radius: 7.5px;
		flex: 1 1 auto;
		min-height: 0;
	}
</style>
