<script setup lang="ts">
import { ref, onMounted, computed, reactive, watch } from 'vue';
import { humanizeDuration } from '../assets/utilities';
import { Command, KeyString } from '../types/help';
import router from '../router';
import { useRoute } from 'vue-router';
import { fetchBackend } from '../assets/request';
const route = useRoute();

const prefix = ref<string>('#');

const userState: { value: string | null } = reactive({
	value: localStorage.getItem('userState')
});

enum InternalLevels {
  'Blacklisted',
  'Standard users',
  'Bot moderators',
  'Bot admins',
  'Bot developers',
};

const collapsed = ref<{
	[category: string]: boolean;
}>({});

const isAllCommands = computed(() => !route.params.command);

const prefCategorySort = [
	'emotes',
	'potato',
	'settings',
	'stream',
	'utilities',
	'moderation',
	'spam',
	'fun',
	'anime',
	'development',
	'deprecated',
]

const

permissions: KeyString = {
  'NONE': 'No Permissions',
  'SUBSCRIBER': 'Channel Subscriber',
  'VIP': 'Channel VIP',
  'MOD': 'Channel Moderator',
  'AMBASSADOR': 'Channel Ambassador',
  'BROADCASTER': 'Broadcaster',
},

botPerms: KeyString = {
  'MOD': 'Channel Moderator',
  'VIP': 'Channel VIP'
},

changeCommand = (command: Command) => {
	router.push({ path: `/help/${command.name}` })
  selectedCommand.value = command.name;
},

checkArray = (arr: string[] | undefined) => {
  return arr && arr.length && arr.some(a => a.trim() !== '')
},

categories = computed(() => {
  return [...new Set(commands.value.map(command => command.category).sort((a, b) => {
			const ap = prefCategorySort.indexOf(a);
			const bp = prefCategorySort.indexOf(b);

			return ap - bp;
		}))].filter(each => {
    if (!Boolean(each)) return false;

    const filtered = filteredCommands.value.filter(command => command.category === each)
    if (filtered.length === 0) return false;
    return true;
  });
}),

getCategory = computed(() => {
	return new Map<string, Command[]>(
		categories.value
			.map(category => [category, filteredCommands.value.filter(command => command.category === category)])
	);
}),

getCommand = computed(() => {
  return filteredCommands.value.find(command => command.name === selectedCommand.value);
}),

commands = ref<Command[] | []>([]),
search = ref<string>(''),
selectedCategory = ref<string>(localStorage.getItem('lastCategory') || 'utilities'),
selectedCommand = ref<string>(localStorage.getItem(`last${selectedCategory}`) || 'join'),

filteredCommands = computed((): Command[] => {
  if (!search.value) {
    return commands.value;
  }
  const query = search.value.toLowerCase();
  return commands.value.filter((command) => {
    return (
      (command.name.toLowerCase().includes(query) ||
      command.aliases.some(alias => alias.toLowerCase().includes(query)) ||
      command.description.toLowerCase().includes(query) ||
      command.title.toLowerCase().includes(query))
    );
  });
});

watch(() => route.params.command, (newCommand) => {
	if (newCommand && commands.value.length > 0) {
		const cmd = commands.value.find(command => command.name === newCommand);
		if (cmd) {
			selectedCommand.value = cmd.name;
			setTimeout(scrollToSelectedCommand, 200);
		}
	}
});

const toggleCollapse = (category: string) => {
	collapsed.value[category] = !collapsed.value[category];
};

const commandsListContainer = ref<HTMLDivElement>();

const scrollToSelectedCommand = () => {
	if (!commandsListContainer.value) {
		return;
	}

	const selectedCommand = commandsListContainer.value.querySelector('.command-item .active') as HTMLElement;

	if (!selectedCommand || !selectedCommand.offsetTop) {
		return;
	}

	commandsListContainer.value.scrollTo({
		top: selectedCommand.offsetTop - (0.4 * commandsListContainer.value.offsetHeight),
		behavior: 'smooth',
	});
}

onMounted(async () => {
	fetch('https://api.potat.app/help')
		.then(res => res.json())
		.then((data) => {
			commands.value = data;

			if (route?.params?.command) {
				const cmd = commands.value.find(command => command.name === route.params.command)

				if (cmd) {
					selectedCommand.value = cmd.name;

					setTimeout(scrollToSelectedCommand, 200);
				}
			}
		})
		.catch(console.error);

	if (userState.value) {
		const username = JSON.parse(userState.value)?.login;
		if (!username) {
			return;
		}

		type IAmLazy = { channel: { settings: { prefix: string | string[] } } }

		const userData = await fetchBackend<IAmLazy>(`users/${username}`);
		const userPrefix = userData?.data?.[0]?.channel?.settings?.prefix;
		if (!userPrefix) {
			return;
		} 

		if (Array.isArray(userPrefix)) {
			prefix.value = userPrefix[0];
		} else if (typeof userPrefix === 'string') {
			prefix.value = userPrefix;
		}
	}
});
</script>

<template>
  <div v-if="commands.length > 0" id="help-container">
    <div :class="{ 'sidebar-container': true, 'hidden-mobile': !isAllCommands }">
      <nav class="sidebar" ref="commandsListContainer">
				<div class="search-container">
					<input v-model="search" type="text" placeholder="Search..." class="search"/>
				</div>
        <section v-for="category in categories" :key="category">
          <h3 @click="toggleCollapse(category)" :class="{ 'command-category': true, 'collapsed': collapsed[category] }">{{ category }}</h3>
					<ul class="commands-list" v-show="!collapsed[category]">
						<li @click="changeCommand(command)" v-for="command in getCategory.get(category)" :key="command.name" class="command-item">
							<a :class="{ active: command.name === selectedCommand }"><span class="command-prefix">{{ prefix }}</span>{{ command.name }}</a>
						</li>
					</ul>
				</section>
      </nav>
    </div>
    <div v-if="getCommand" :class="{ 'help-content': true, 'hidden-mobile': isAllCommands }">
			<div class="command-info">
				<nav class="command-nav">
					<button class="visible-mobile all-commands">
						<router-link to="/help">All Commands</router-link>
					</button>
					<h2 class="command-title">{{ getCommand.title }}</h2>
				</nav>
				<div class="command-details">
					<div>
						<div v-if="getCommand.description" class="description-block">
							{{ getCommand.description }}
						</div>
						<div v-if="getCommand.usage">
							<strong>Usage: </strong>{{ getCommand.usage.replace(/^#/g, prefix) }}
						</div>
						<p v-if="checkArray(getCommand.aliases)">
							<hr class="section-divider">
							<strong>Aliases: </strong>
							<a class="alias-bubbles">
								<span v-for="alias in getCommand.aliases" :key="alias" class="alias-bubble">{{ prefix }}{{ alias }}</span>
							</a>
						</p>
						<p v-if="getCommand.cooldown">
							<hr class="section-divider">
							<strong>Base Cooldown: </strong>{{ humanizeDuration(getCommand.cooldown) }}
						</p>
						<p v-if="getCommand.level || getCommand.botRequires !== 'none' || getCommand.userRequires !== 'none'">
							<hr class="section-divider">
							<h4>Requirements to use:</h4>
							<ul class="requirements-list">
								<li v-if="getCommand.level">
									<strong>Access Level:</strong> {{ InternalLevels[getCommand.level] }}
								</li>
								<li v-if="getCommand.userRequires !== 'none'">
									<strong>User Requires:</strong> {{ permissions[getCommand.userRequires] ?? 'No Permissions' }}
								</li>
								<li v-if="getCommand.botRequires !== 'none'">
									<strong>Bot Requires:</strong> {{ botPerms[getCommand.botRequires] ?? 'No Permissions' }}
								</li>
							</ul>
						</p>
						<p v-if="Object.keys(getCommand.conditions)?.length">
							<hr class="section-divider">
							<strong>Conditions:</strong>
							<ul>
								<li v-if="getCommand.conditions.whisperable === true">Whisperable</li>
								<li v-if="getCommand.conditions.offlineOnly === true">Offline only</li>
								<li v-if="getCommand.conditions.ignoreBots === true">Ignores bots</li>
								<li v-if="typeof getCommand.conditions.isNotPipable === 'boolean'">{{ getCommand.conditions.isNotPipable ? 'Cannot be piped' : 'Can be piped' }}</li>
								<li v-if="getCommand.conditions.superuser === true">Requires Superuser</li>
								<li v-if="getCommand.conditions.isBlockable === true">Can be Opted-Out From</li>
							</ul>
						</p>
						<p v-if="getCommand.flags?.length">
							<hr class="section-divider">
							<strong>Flags: </strong>
							<div v-for="(flag, index) in getCommand.flags" :key="index" class="flag-details">
								<p><strong>Name: </strong>{{ flag.name }}</p>
								<p><strong>Description: </strong>{{ flag.description }}</p>
								<p><strong>Type:</strong> {{ flag.type }}</p>
								<p><strong>Availiable to:</strong> {{ InternalLevels[flag.level] }}</p>
								<p v-if="flag.userRequires">
									<strong>User requires: :</strong> {{ permissions[flag.userRequires] }}
								</p>
								<p v-if="flag.aliases?.length"><strong>Aliases:</strong> {{ flag.aliases.join(', ') }}</p>
								<p v-if="flag.required"><strong>Required: </strong> {{ flag.required ? 'Yes' : 'No' }}</p>
								<p v-if="flag.usage"><strong>Usage:</strong> {{ flag.usage.replace(/^#/g, prefix) }}</p>
							</div>
						</p>
					</div>
				</div>
			</div>
		</div>
  </div>
</template>

<style scoped>
.visible-mobile {
	display: none;
}
.search {
	font-size: 18px;;
	width: 100%;
  padding: 10px;
  border-radius: 5px;
  outline: auto -webkit-focus-ring-color;
  outline-color: #f4f4f4;
  color: white;
}
.search-container {
	background-color: rgba(31, 31, 31, 1);
	width: 100%;
	position: sticky;
	top: 0;
	z-index: 2;
}
#help-container {
	display: grid;
	grid-template: auto / 250px 1fr;
	gap: 36px;
	padding: 10px;
}
.sidebar {
	position: sticky;
	top: 80px;
	height: 80vh;
	overflow-y: auto;
	overflow-x: hidden;
	width: 100%;
}
.flag-details {
  font-size: 0.9em;
  margin-top: 10px;
  padding: 10px;
  border-radius: 15px;
  background-color: #1e1c1c79;
  outline: auto -webkit-focus-ring-color;
  outline-color: #f4f4f4;
}
.command-prefix {
	color: #666666;
	padding-right: 1px;
}
.command-details {
  background-color: #474747;
  border-radius: 15px;
  padding: 20px;
  background-color: rgba(31, 31, 31, 0.906);
  text-align: left;
  overflow-y: auto;
}
.command-title {
  display: inline-flex;
  justify-content: center;
  min-width: 100px;
  margin-bottom: 20px;
  border-radius: 15px;
  padding: 20px;
  background-color: rgba(31, 31, 31, 0.906);
  outline: auto -webkit-focus-ring-color;
  outline-color: #f4f4f4;
}
.sidebar {
  display: flex;
  flex-direction: column;
	background-color: rgba(31, 31, 31, 0.906);
	section {
		border-bottom: 1px solid rgb(135, 135, 135);
		padding: 15px;
	}
}
.command-category {
	font-size: 16px;
	background: rgba(31, 31, 31, 1);
	padding: 5px;
	position: sticky;
  outline: auto -webkit-focus-ring-color;
  outline-color: #f4f4f4;
	top: 60px;
	z-index: 1;
	cursor: pointer;
	border-radius: 5px;
	user-select: none;
}
.command-category.collapsed::after {
	content: '▶';
}
.command-category::after {
	position: absolute;
	right: 10px;
	content: '▼';
	margin-left: 5px;
	transition: transform 0.3s ease;
	transform: rotate(0deg);
	display: inline-block;
}
.commands-list {
	margin: 0;
	padding: 0;
	list-style: none;
}
.command-item {
	margin: 10px 0;
	cursor: pointer;
	font-size: 18px;
	margin: 6px 0;
	padding: 8px;
}
.command-item a.active {
	color: #ae81ff;
}
.description-block {
  background-color: #2a2a2a;
  border-left: 4px solid #ae81ff;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 6px;
  color: #f9fafb;
  font-size: 1rem;
  line-height: 1.5;
}
.usage-block pre {
  display: inline-block;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  font-family: "Fira Code", monospace;
  font-size: 0.9rem;
  white-space: pre;
  margin-top: 0.25rem;
}
.alias-bubbles {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 5px;
}
.alias-bubble {
  background-color: #2a2a2a;
  color: #fff;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  white-space: nowrap;
  border: 1px solid #444;
}
.section-divider {
  border: none;
  border-top: 1px solid #444;
  margin: 1rem 0;
}

.section-header {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
button {
  cursor: pointer;
  position: relative;
  z-index: 1;
  min-width: 120px;
  background-color: rgba(31, 31, 31, 0.84);
  color: white;
  border: none;
  border-radius: 15px;
  padding: 10px;
  margin-bottom: 10px;
  outline: auto -webkit-focus-ring-color;
  outline-color: #f4f4f4;
  user-select: none;
  transition: background-color 0.3s ease;
}

button.active {
  background-color: #6441a4;
  color: #fff;
  outline: none;
}

@media (max-width: 640px) {
	#help-container {
		display: flex;
	}
	#help-container > div {
		width: 100%;
		flex: 1;
	}
	.sidebar {
		height: auto;
	}
	.visible-mobile {
		display: block;
	}
	.hidden-mobile {
		display: none;
	}
	.command-nav {
		background-color: rgba(31, 31, 31, 0.906);
		padding: 15px;
		margin-bottom: 5px;
	}
	.all-commands {
		font-size: 20px;
	}
	.command-item {
		font-size: 20px;
	}
	.command-title {
		outline: none;
		font-size: 22px;
	}
	#help-content {
		padding-top: 20px;
	}
}
</style>
