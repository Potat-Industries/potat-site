<script setup lang="ts">
	import { onMounted, ref } from 'vue';
  import eventBus from '../assets/eventBus';
	const showModal = ref(false);

	onMounted(() => {
		eventBus.$on('join-success-popup', () => {
			console.log('join event fired');
			showModal.value = true;
		});
	});
</script>

<template>
	<div v-if="showModal" class="modal-overlay">
		<div class="modal">
			<h2><strong>Successfully Added The Bot to your channel!</strong></h2>
			<h2>Next Steps...</h2>
			<ul>
				<li>
						Give the bot
						<span class="tooltip">
							moderator status
							<span class="tooltip-text">
								Due to
								<a
									href="https://discuss.dev.twitch.com/t/giving-broadcasters-control-concurrent-join-limits-for-irc-and-eventsub/54997"
									target="_blank"
								>Twitch Chat Bot Changes</a>
								, the bot needs to be a moderator in your channel to function properly
							</span>
						</span>
						in your channel
				</li>
				<li>
					Add the bot as an
					<span class="tooltip">
						editor
						<span class="tooltip-text">
							In order to add and remove emotes in your channel, PotatBotat must be an editor with one or more services below
						</span>
					</span>
					for any of the following services you use
				</li>
			</ul>

			<div class="providers">
				<a href="https://www.frankerfacez.com/channel/mine" target="_blank">
					FFZ
					<button>
						<img src="/ffz.png" alt="FFZ" title="FFZ"/>
					</button>
				</a>
				<a href="https://betterttv.com/dashboard/editors" target="_blank">
					BTTV
					<button>
						<img src="/bttv.png" alt="BTTV" title="BTTV"/>
					</button>
				</a>
				<a href="https://7tv.app/settings/editors" target="_blank">
					7TV
					<button>
						<img src="/7tv.svg" alt="7TV" title="7TV"/>
					</button>
				</a>
			</div>
			<div>
				<h2><strong>Tips:</strong></h2>
			</div>
			<ul>
				<li>
					The bot is offline-only by default, use the
					<a
						href="/help/offline"
						target="_blank"
						rel="noopener noreferrer"
					>always</a>
					command to toggle this
				</li>
				<li>
					Use the
					<a
						href="/help/ambassador"
						target="_blank"
						rel="noopener noreferrer"
					>ambassador</a>
					command to allow your mods to also configure the bot
				</li>
				<li>
					Make sure to check out
					<a
						href="/help"
						target="_blank"
						rel="noopener noreferrer"
					>commands page</a>
					to learn more about how to use the bot!
				</li>
				<li>
					Join our
					<a href="https://discord.gg/nG4m5JpD3Y" target="_blank">Discord</a>
					for support and feature suggestions!
				</li>
			</ul>
			<button @click="showModal = false" style="background-color: #6441a4;">Close</button>
		</div>
	</div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(19, 19, 19, 0.637);
	backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  padding: 20px;
  border-radius: 8px;
  background-color: rgba(31, 31, 31, 1);
  box-shadow: 0px 8px 16px 0px rgba(60, 60, 60, 0.2);
  max-width: 90%;
  text-align: center;

	ul {
		list-style: none;
		padding-left: 0;
		margin-left: 0;

		a {
			color: #4da6ff;
			text-decoration: underline;
		}

		a:hover {
			color: #3399ff;
		}
	}

	li {
		list-style-type: none;
	}
}

.providers {
	display: flex;
	gap: 10px;
	flex-direction: row;
	justify-content: center;
	margin-bottom: 20px;
	margin-top: 20px;

	button {
		width: 5em;
		height: 5em;
		background-color: rgb(17, 17, 17);
		border-radius: 15px;
		margin: 0.3em;
		padding: 0;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;

		img {
			width: 100%;
			height: 100%;
			object-fit: contain;
			border-radius: inherit;
		}
	}

	button:hover {
		transform: scale(1.1);
		outline: 2px solid #4da6ff;
	}
}

.tooltip {
  position: relative;
  text-decoration: underline dotted;
  display: inline-block;
  padding: 2px;
  color: #4A90E2;
}

.tooltip-text {
  visibility: hidden;
  background-color: #333;
  color: #fff;
  text-align: center;
  padding: 10px 12px;
  border-radius: 6px;
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  white-space: normal;
  opacity: 0;
  transition: opacity 0.3s ease-in-out, visibility 0.3s;
  z-index: 10;
  font-size: 0.9em;
  width: auto;
  min-width: 180px;
  max-width: 300px;
  outline: 2px solid #4da6ff;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
  word-wrap: break-word;
}

.tooltip:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}
</style>
