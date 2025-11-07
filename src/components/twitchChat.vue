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
			height="550"
			width="100%"
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
		contain-intrinsic-size: 420px;
	}
	.twitch-iframe h2 {
		text-align: center;
	}
	iframe#twitch-chat-embed {
		display: flex;
		border: none;
		border-radius: 7.5px;
		height: clamp(360px, 60vh, 550px);
	}
</style>
