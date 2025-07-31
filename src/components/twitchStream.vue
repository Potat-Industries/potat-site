<script setup lang="ts">
import { ref } from 'vue';

const host = ref(window.location.hostname);
</script>

<template>
	<div class="twitch-iframe">
		<iframe id="twitch-chat-embed"
    	:src="`https://player.twitch.tv/?channel=potatbotat&parent=${host}&darkpopout`"
			height="310"
			width="550"
		></iframe>
	</div>
</template>

<style scoped>
  .twitch-iframe {
    background-color: rgba(31, 31, 31, 0.8);
    border-radius: 15px;
    padding: 15px;
  }
	.twitch-iframe h2 {
		text-align: center;
	}
  iframe#twitch-chat-embed {
    display: flex;
    border: none;
		border-radius: 15px;
  }

	@media (max-width: 600px) {
		iframe#twitch-chat-embed {
			width: 100%;
		}
	}
</style>
