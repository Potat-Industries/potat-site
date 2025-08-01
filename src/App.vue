<script setup lang="ts">
import LoginButton from './components/loginButton.vue';
import JoinedModal from './components/joinedModal.vue';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { StatsSocket } from './assets/socket';
import { useRoute } from 'vue-router';
import "normalize.css";
import { UserState } from './types/misc';
const route = useRoute();

new StatsSocket('wss://stats.potat.app');

const isDropdownVisible = ref(false);
const isMobileMenuVisible = ref(false);
const username = ref<string | undefined>(undefined);

const toggleDropdown = () => {
  isDropdownVisible.value = !isDropdownVisible.value;
};

const toggleMobileMenu = () => {
  isMobileMenuVisible.value = !isMobileMenuVisible.value;
};

const onDocumentClick =  (event: MouseEvent) => {
	if (!isDropdownVisible.value && !isMobileMenuVisible.value) {
		return;
	}

	const isBackground = !(event.target as HTMLElement)?.closest('.top-bar');

	if (isBackground) {
		isDropdownVisible.value = false;
		isMobileMenuVisible.value = false;

		return;
	}
};

function lazySetBackgroundImage() {
	const app = document.getElementById('app');

	if (!app) {
		console.error('Cannot set background image, app element not found!!');

		return;
	}

	app.style.backgroundImage = `url('/Home.png')`;
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick);

	const userState = localStorage.getItem('userState');
	if (typeof userState === 'string') {
		const parsed = JSON.parse(userState) as UserState;
		username.value = parsed.login;
	}

	if (document.readyState === 'complete') {
		lazySetBackgroundImage();
	} else {
		document.addEventListener('readystatechange', () => {
			if (document.readyState === 'complete') {
				lazySetBackgroundImage();
			}
		});
	}
});

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick);
});

watch(route, () => {
	isDropdownVisible.value = false;
	isMobileMenuVisible.value = false;
});
</script>
<template>
   <JoinedModal />

	<ul :class="{ 'top-bar': true, 'mobile-menu-visible': isMobileMenuVisible }">
		<li class="mobile-menu mobile-menu-toggle"><a class="nav-link" @click="toggleMobileMenu">Menu</a></li>
		<li><router-link to="/" class="nav-link">Home</router-link></li>
		<li><router-link :to="{ name: 'Help' }" class="nav-link">Commands</router-link></li>
		<li><router-link :to="{ name: 'Leaderboard' }" class="nav-link" >Leaderboards</router-link></li>
		<li class="nav-link tools-nav-link" @click="toggleDropdown">
			Tools
			<ul :class="{ 'dropdown-content': true, 'visible': isDropdownVisible }">
				<li>
					<router-link
					to="/connections"
					class="nav-link"
					style="margin-bottom: 10px;"
					>Connections</router-link>
				</li>
				<li>
					<router-link
					to="/emotes/search"
					class="nav-link"
					style="margin-bottom: 10px;"
					>Emote Search</router-link>
				</li>
				<li>
					<a
					href="https://haste.potat.app"
					class="nav-link external-link"
					style="margin-bottom: 10px;">Haste</a>
				</li>
				<li>
					<router-link
					to="/redirects"
					class="nav-link external-link"
					style="margin-bottom: 10px;"
					>URL Shortener</router-link>
				</li>
				<li><router-link
					to="/api/docs"
					class="nav-link"
					style="margin-bottom: 10px;"
					>API Docs</router-link>
				</li>
				<li v-if="username">
					<router-link
					:to="`/wrapped/${username}/user`"
					class="nav-link"
					style="margin-bottom: 10px;"
					>2024 Wrapped</router-link>
				</li>
			</ul>
		</li>
		<li class="login-button-container mobile-menu"><LoginButton/></li>
	</ul>

	<div class="temp-bar">
			<span >Going to Twitchcon? By using my <a href="https://www.ticketfairy.com/r/39179/1949214" target="_blank">referral code</a> while purchasing a ticket you will unlock the <img src="https://static-cdn.jtvnw.net/badges/v1/d139bccf-8184-4fec-a970-cd8d81a7f51a/2" alt="Chrome Star Badge" /> <a href="https://www.streamdatabase.com/twitch/global-badges/twitchcon-referral-program-2025-chrome-star/1" target="_blank">Chrome Star Badge</a>, and support me! </span>
	</div>

	<div class="main-container">
		<router-view></router-view>
	</div>
</template>

<style scoped>

.top-bar {
  position: sticky;
	margin: 0;
	list-style: none;
  background-color: rgba(31, 31, 31, 0.8);
  padding: 10px;
  display: flex;
  align-items: center;
  z-index: 10;
  user-select: none;
	font-size: 0.8em;
}
.temp-bar {
  background-color: rgba(112, 69, 67, 0.8);
  outline: auto;
  outline-color: rgba(31, 31, 31, 0.8);
  padding: 10px;
	justify-content: center;
	text-align: center;
  display: flex;
  z-index: 9;
  font-size: 1em;
  position: sticky;
	backdrop-filter: blur(2px);

	img {
		width: 20px;
		height: 20px;
		vertical-align: middle;
	}

	a:link {
		color: #aaccff; 
		text-decoration: underline;
	}

	a:visited {
		color: #dab6ff;
		text-decoration: underline;
	}

	a:hover {
		color: #ffaaaa;
		text-decoration: underline;
	}
}
.nav-link {
  margin-left: 10px;
  padding: 12px;
  outline: auto -webkit-focus-ring-color;
  outline-color: #f4f4f4;
  border-radius: 15px;
  transition: background-color 0.3s ease;
  color: inherit;
  cursor: pointer;
  position: relative;
}
.nav-link.router-link-active {
  background-color: #6441a4;
  color: #fff;
}
.external-link {
  text-decoration: none;
}
.main-container {
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
  margin-top: 60px;
	max-width: 1200px;
	margin: 20px auto 0;
}
.login-button-container {
  margin-left: auto;
  margin-right: 10px;
}
.dropdown-content:not(.visible) {
  display: none;
}
.dropdown-content {
  position: absolute;
  background-color: rgba(31, 31, 31, 1);
  box-shadow: 0px 8px 16px 0px rgba(60, 60, 60, 0.2);
  z-index: 1;
  margin: 20px 0 0 -20px;
  padding: 12px;
  border-radius: 15px;
	list-style: none;
}
.dropdown-content .nav-link {
  display: block;
  margin-right: 0;
  padding: 12px;
  white-space: nowrap;
}
.mobile-menu-toggle {
	display: none;
}
@media (max-width: 640px) {
  .more-dropdown {
    display: flex;
    align-items: center;
  }

  .more-dropdown .nav-link {
    margin-left: 5px;
  }

  .dropdown-content {
    position: relative;
  }

	.mobile-menu-toggle {
		display: inline-block;
	}

	.top-bar:not(.mobile-menu-visible) > li:not(.mobile-menu) {
		display: none;
	}

	.mobile-menu-visible {
		width: 100%;
		flex-direction: column;
		background: #333;
	}
	/**
		didn't use nested css because i wasn't sure if postcss is enabled,
		and i was lazy to test it, this is prettier IMO anyways
	*/
	.mobile-menu-visible > li {
		width: 100%;
	}
	.mobile-menu-visible > .login-button-container {
		width: 100%;
		margin: 10px;
	}
	.mobile-menu-visible > li > a {
		display: block;
		margin: 10px;
	}
}
</style>
