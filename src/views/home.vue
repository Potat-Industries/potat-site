<script setup lang="ts">
import JoinButton from '../components/joinButton.vue';
import PartnerList from '../components/partnerList.vue';
import StatsBox from '../components/statsBox.vue';
import TwitchChat from '../components/twitchChat.vue';
import TwitchStream from '../components/twitchStream.vue';
</script>

<template>

<div class="home-container">
	<div class="fk-old-layout">
		<div class="potat-home">
			<div class="title-box">
				<h1 class='paint'>
					<a href="https://twitch.tv/potatbotat">
						<img src="/tatoExplode.gif" class="logo"/>
					</a>
					<span>PotatBotat</span>
				</h1>
				<h2>An emote, entertainment, and utility chatbot</h2>
			</div>
		</div>
		<div class="join-container">
			<JoinButton/>
		</div>
	</div>

	<TwitchChat/>

	<div class="widgets-container">
		<PartnerList/>
		<StatsBox/>
		<TwitchStream/>
	</div>
</div>

</template>

<style scoped>
.home-container {
	display: grid;
	grid-template-columns: 1fr auto;
	grid-template-rows: auto 1fr;
	gap: 8px 20px;
	padding: 10px;
}

.fk-old-layout {
	grid-area: 1 / 1 / 2 / 3;
	display: flex;
	align-items: center;
	justify-content: center;
}

.potat-home {
	margin: 20px;
}

.title-box {
	background: var(--panel-bg);
	border-radius: 15px;
	padding: 15px;
	border: 1px solid var(--panel-border);
	box-shadow: var(--panel-shadow);
	text-align: center;
	margin: 0 auto;
	h2 {
		font-size: 22px;
		font-weight: 400;
	}
}

.paint span {
	font-size: 42px;
  background-image: url('/paint.webp');
  filter: drop-shadow(#9d31a5 0px 0px 0.1px);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  background-size: 100% auto;
}

.join-container {
	padding: 40px 0;
	text-align: center;
}

.twitch-iframe {
	grid-area: 2 / 2 / 2 / 3;
	min-width: 420px;
}

.widgets-container {
	grid-area: 2 / 1 / 2 / 2;
	display: flex;
	justify-content: space-around;
	align-items: start;
	flex-wrap: wrap;
	gap: 8px;
	will-change: transform;
	transform: translateZ(0);
}

h1 {
  margin-top: 0px;
  margin-bottom: 10px;
}

h2 {
  margin-top: 0px;
  margin-bottom: 0px;
}

.logo {
  height: 80px;
  width: 80px;
  margin-right: 20px;
}

@media (max-width: 960px) {
	.twitch-iframe {
		min-width: auto;
	}

	.join-container {
		padding: 0;
		button {
			width: 90% !important;
		}
	}
}
@media (max-width: 640px) {
	.fk-old-layout {
		flex-direction: column;
		align-items: initial;
	}

  .home-container {
		display: flex;
		flex-direction: column;
	}
}
</style>
