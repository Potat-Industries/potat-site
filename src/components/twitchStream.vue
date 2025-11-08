<script setup lang="ts">
import { ref } from 'vue';

const host = ref(window.location.hostname);
</script>

<template>
	<div class="twitch-iframe">
		<iframe id="twitch-chat-embed"
    	:src="`https://player.twitch.tv/?channel=potatbotat&parent=${host}&darkpopout`"
			loading="lazy"
			height="310"
			width="550"
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
		contain: paint;
		content-visibility: auto;
		contain-intrinsic-size: 340px;
	}
	.twitch-iframe h2 {
		text-align: center;
	}
	iframe#twitch-chat-embed {
		display: flex;
		border: none;
		border-radius: 7.5px;
	}

	@media (max-width: 600px) {
		iframe#twitch-chat-embed {
			width: 100%;
		}
	}
</style>
