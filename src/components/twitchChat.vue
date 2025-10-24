<script setup lang="ts">
import { ref } from 'vue';

const host = ref(window.location.hostname);
</script>

<template>
	<div class="twitch-iframe">
		<h2>Ask for help, or try it out!</h2>

		<iframe id="twitch-chat-embed"
    	:src="`https://www.twitch.tv/embed/potatbotat/chat?parent=${host}&darkpopout`"
			height="550"
			width="100%"
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
		border-radius: 7.5px;
	}
</style>
