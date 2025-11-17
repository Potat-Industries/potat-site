<script setup lang="ts">
import { ref, onMounted, computed, reactive, watch } from 'vue';
import { humanizeDuration } from '../assets/utilities';
import { Command, KeyString } from '../types/help';
import router from '../router';
import { useRoute } from 'vue-router';
import { fetchBackend, API_BASE } from '../assets/request';
const route = useRoute();

const prefix = ref<string>('#');
const expandedExamples = ref<{ [commandName: string]: boolean }>({});
const expandedFlagExamples = ref<{ [flagKey: string]: boolean }>({});

const BOT_BADGE_URL = 'https://static-cdn.jtvnw.net/badges/v1/3ffa9565-c35b-4cad-800b-041e60659cf2/2';
const MODERATOR_BADGE_URL = 'https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/2';

const userState: { value: string | null } = reactive({
	value: localStorage.getItem('userState'),
});

enum InternalLevels {
  'Blacklisted',
  'Standard users',
  'Bot moderators',
  'Bot admins',
  'Bot developers',
};

const verbs = [
  'Farting',
  'Running',
  'Embellishing',
  'Procreating',
  'Invigorating',
  'Yeeting',
  'Simmering',
  'Vibing',
  'Overthinking',
  'Underachieving',
  'Screaming',
  'Caffeinating',
  'Moonwalking',
  'Microwaving',
  'Rizzing',
  'Evolving',
  'Uninstalling',
  'Downloading',
  'Uploading',
  'Rebooting',
  'Crying',
  'Dabbing',
  'Teleporting',
  'Inflating',
  'Evaporating',
  'Vaporizing',
  'Manifesting',
  'Rebranding',
  'Eating',
  'Vibing',
  'Gaslighting',
  'Gatekeeping',
  'Blinking',
  'Sneezing',
];

const nouns = [
  'Hamburger',
  'Potato',
  'Cat',
  'Dog',
  'Loser',
  'Chad',
  'Goose',
  'Goblin',
  'Laptop',
  'Fridge',
  'Banana',
  'Waffle',
  'Cactus',
  'Muffin',
  'Taco',
  'Wizard',
  'Karen',
  'Duck',
  'Grandma',
  'Toaster',
  'Intern',
  'Microwave',
  'Raccoon',
  'Goldfish',
  'Blobfish',
  'Toilet',
  'Pickle',
  'Sock',
  'Keyboard',
  'Giraffe',
  'NPC',
  'Goat',
  'Crab',
  'Pigeon',
  'Breadstick',
  'Frog',
  'Bagel',
  'Mushroom',
  'Pizza',
  'Sloth',
  'Turtle',
  'Donut',
  'Cupcake',
  'Hamster',
  'Platypus',
];

const getFunnyName = () => {
	const verb = verbs[Math.floor(Math.random() * verbs.length)];
	const noun = nouns[Math.floor(Math.random() * nouns.length)];
	if (Math.random() < 0.5) {
		const power = Math.pow(10, 1 + Math.floor(Math.random() * 4));
		const number = String(Math.floor(Math.random() * power));

		return `${verb}${noun}${number}`;
	}
	return `${verb}${noun}`;
};

const twitchStandardColors = [
  '#0000FF',
  '#8A2BE2',
  '#5F9EA0',
  '#D2691E',
  '#FF7F50',
  '#1E90FF',
  '#B22222',
  '#DAA520',
  '#008000',
  '#FF69B4',
  '#FF4500',
  '#FF0000',
  '#2E8B57',
  '#00FF7F',
  '#9ACD32',
];

const getUserColor = () => {
	return twitchStandardColors[Math.floor(Math.random() * twitchStandardColors.length)];
};

const collapsed = ref<{ [category: string]: boolean; }>({});
const isAllCommands = computed(() => !route.params.command);
const prefCategorySort = [
	'emotes',
	'settings',
	'stream',
	'utilities',
	'potato',
	'moderation',
	'spam',
	'fun',
	'music',
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

const toggleExamples = (commandName: string) => {
	expandedExamples.value[commandName] = !expandedExamples.value[commandName];
};

const toggleFlagExamples = (flagKey: string) => {
	expandedFlagExamples.value[flagKey] = !expandedFlagExamples.value[flagKey];
};

const commandsListContainer = ref<HTMLDivElement>();

const scrollToSelectedCommand = () => {
	if (!commandsListContainer.value) {
		return;
	}

	const selectedCommandEl = commandsListContainer.value.querySelector('.command-item .active') as HTMLElement;

	if (!selectedCommandEl || !selectedCommandEl.offsetTop) {
		return;
	}

	const containerRect = commandsListContainer.value.getBoundingClientRect();
	const elementRect = selectedCommandEl.getBoundingClientRect();

	const isInView = (
		elementRect.top >= containerRect.top &&
		elementRect.bottom <= containerRect.bottom
	);

	if (!isInView) {
		selectedCommandEl.scrollIntoView({
			behavior: 'smooth',
			block: 'nearest'
		});
	}
}

onMounted(async () => {
	fetch(`${API_BASE}/help`, { cache: 'no-store' })
		.then(async (res) => {
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return res.json();
		})
		.then((data) => {
			const extractCommandsList = (payload: unknown): Command[] => {
				if (payload && typeof payload === 'object' && Array.isArray((payload as any).data)) {
					return (payload as any).data as Command[];
				}
				if (Array.isArray(payload)) {
					return payload as Command[];
				}
				return [] as Command[];
			};

			commands.value = extractCommandsList(data);

			if (route?.params?.command) {
				const cmd = commands.value.find(command => command.name === route.params.command)

				if (cmd) {
					selectedCommand.value = cmd.name;

					setTimeout(scrollToSelectedCommand, 200);
				}
			}
		})
		.catch((err) => {
			console.error('[help] fetch error', err);
		});

	if (userState.value) {
		const userStoreData = JSON.parse(userState.value);
		if (!userStoreData?.login) {
			return;
		}

		type IAmLazy = { channel: { settings: { prefix: string | string[] } } }

		const userData = await fetchBackend<IAmLazy>(`users/${userStoreData.login}`);
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
						<div v-if="getCommand.examples?.length" class="examples-section">
							<hr class="section-divider">
							<strong>Examples:</strong>
							<div class="examples-block">
								<div v-for="(example, index) in (expandedExamples[getCommand.name] ? getCommand.examples : [getCommand.examples[0]])" :key="index" class="example-item">
									<div v-if="example.description" class="example-description">{{ example.description }}</div>
									<div class="chat-container">
										<div v-if="example.trigger || example.input" class="chat-message user-message">
											<span class="chat-username" :style="{ color: getUserColor() }">{{ getFunnyName() }}:</span>
											<span class="chat-text">{{ (example.trigger || example.input)?.replace(/^#/g, prefix) }}</span>
										</div>
										<div class="chat-message bot-message">
											<img :src="MODERATOR_BADGE_URL" alt="Moderator" class="chat-badge" />
											<img :src="BOT_BADGE_URL" alt="Bot" class="chat-badge" />
											<span class="chat-username">PotatBotat:</span>
											<span class="chat-text">{{ example.output }}</span>
										</div>
									</div>
								</div>
								<button v-if="getCommand.examples.length > 1" @click="toggleExamples(getCommand.name)" class="toggle-examples-btn">
									{{ expandedExamples[getCommand.name] ? 'Show Less' : `Show All ${getCommand.examples.length} Examples` }}
								</button>
							</div>
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
						<div v-if="getCommand.flags?.length" class="flags-section">
							<hr class="section-divider">
							<strong>Flags:</strong>
							<div class="flags-container">
								<div v-for="(flag, index) in getCommand.flags" :key="index" class="flag-card">
									<div class="flag-header">
										<h4 class="flag-name">{{ flag.name }}</h4>
										<span class="flag-type">{{ flag.type }}</span>
									</div>
									
									<div class="flag-content">
										<p class="flag-description">{{ flag.description }}</p>
										
										<div class="flag-metadata">
											<div class="flag-meta-item">
												<strong>Available to:</strong> {{ InternalLevels[flag.level] }}
											</div>
											<div v-if="flag.userRequires" class="flag-meta-item">
												<strong>User requires:</strong> {{ permissions[flag.userRequires] }}
											</div>
											<div v-if="flag.aliases?.length" class="flag-meta-item">
												<strong>Aliases:</strong> 
												<span class="flag-aliases">
													<span v-for="alias in flag.aliases" :key="alias" class="flag-alias">{{ alias }}</span>
												</span>
											</div>
											<div v-if="flag.usage" class="flag-meta-item">
												<strong>Usage:</strong> <code>{{ flag.usage.replace(/^#/g, prefix) }}</code>
											</div>
										</div>

										<div v-if="flag.examples?.length" class="flag-examples">
											<strong>Examples:</strong>
											<div class="examples-block flag-examples-block">
												<div v-for="(example, exampleIndex) in (expandedFlagExamples[`${getCommand.name}-${flag.name}`] ? flag.examples : [flag.examples[0]])" :key="exampleIndex" class="example-item">
													<div v-if="example.description" class="example-description">{{ example.description }}</div>
													<div class="chat-container">
														<div v-if="example.trigger || example.input" class="chat-message user-message">
															<span class="chat-username" :style="{ color: getUserColor() }">{{ getFunnyName() }}:</span>
															<span class="chat-text">{{ (example.trigger || example.input)?.replace(/^#/g, prefix) }}</span>
														</div>
														<div class="chat-message bot-message">
															<img :src="MODERATOR_BADGE_URL" alt="Moderator" class="chat-badge" />
															<img :src="BOT_BADGE_URL" alt="Bot" class="chat-badge" />
															<span class="chat-username">PotatBotat:</span>
															<span class="chat-text">{{ example.output }}</span>
														</div>
													</div>
												</div>
												<button v-if="flag.examples.length > 1" @click="toggleFlagExamples(`${getCommand.name}-${flag.name}`)" class="toggle-examples-btn">
													{{ expandedFlagExamples[`${getCommand.name}-${flag.name}`] ? 'Show Less' : `Show All ${flag.examples.length} Examples` }}
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
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
	font-size: 18px;
	width: 100%;
	padding: 12px 14px;
	border-radius: 8px;
	outline: auto -webkit-focus-ring-color;
	outline-color: #f4f4f4;
	color: white;
	background: rgba(42, 42, 42, 0.6);
	transition: all 0.2s ease;
}
.search:focus {
	background: rgba(50, 50, 50, 0.8);
	border-color: rgba(174, 129, 255, 0.5);
	box-shadow: 0 0 0 3px rgba(174, 129, 255, 0.1);
}
.search::placeholder {
	color: rgba(255, 255, 255, 0.4);
}
.search-container {
	background: linear-gradient(180deg, rgba(31, 31, 31, 1) 0%, rgba(31, 31, 31, 0.98) 100%);
	width: 100%;
	position: sticky;
	top: 0;
	z-index: 2;
	padding-bottom: 8px;
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

.flags-section {
  margin-top: 1rem;
}

.flags-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
}

.flag-card {
  background-color: #2a2a2a;
  border-left: 4px solid #ae81ff;
  border-radius: 8px;
  padding: 1rem;
  color: #f9fafb;
}

.flag-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid #444;
  padding-bottom: 0.5rem;
}

.flag-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ae81ff;
  margin: 0;
  font-family: 'Fira Code', monospace;
}

.flag-type {
  background-color: #3a3a3a;
  color: #ffd700;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.flag-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.flag-description {
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
  color: #e0e0e0;
}

.flag-metadata {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.flag-meta-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.flag-meta-item strong {
  color: #b0b0b0;
  min-width: 100px;
  flex-shrink: 0;
}

.flag-aliases {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.flag-alias {
  background-color: #1a1a1a;
  color: #ae81ff;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-family: 'Fira Code', monospace;
}

.flag-examples {
  margin-top: 0.5rem;
}

.flag-examples-block {
  margin-top: 0.5rem;
  background-color: #1e1e1e;
  border-left: 3px solid #666;
}

.flag-examples strong {
  color: #b0b0b0;
  font-size: 0.9rem;
}

code {
  background-color: #1a1a1a;
  color: #ae81ff;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 0.9em;
}
.command-prefix {
	color: #666666;
	padding-right: 1px;
}
.command-details {
	background: linear-gradient(135deg, rgba(42, 42, 42, 0.8) 0%, rgba(31, 31, 31, 0.9) 100%);
	border-radius: 15px;
	padding: 24px;
	text-align: left;
	overflow-y: auto;
	backdrop-filter: blur(20px);
	border: 1px solid rgba(255, 255, 255, 0.05);
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
.command-title {
  display: inline-flex;
  justify-content: center;
  min-width: 100px;
  margin-bottom: 20px;
  border-radius: 15px;
  padding: 20px;
	background: linear-gradient(135deg, rgba(42, 42, 42, 0.8) 0%, rgba(31, 31, 31, 0.9) 100%);
	backdrop-filter: blur(20px);
	border: 1px solid rgba(255, 255, 255, 0.05);
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  outline: auto -webkit-focus-ring-color;
  outline-color: #f4f4f4;
}
.sidebar {
  display: flex;
  flex-direction: column;
	background: linear-gradient(180deg, rgba(31, 31, 31, 0.95) 0%, rgba(35, 35, 35, 0.95) 100%);
	backdrop-filter: blur(20px);
	section {
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		padding: 12px;
	}
}
.command-category {
	font-size: 16px;
	background: linear-gradient(135deg, rgba(42, 42, 42, 0.9) 0%, rgba(35, 35, 35, 0.9) 100%);
	padding: 8px 10px;
	position: sticky;
  outline: auto -webkit-focus-ring-color;
  outline-color: #f4f4f4;
	top: 60px;
	z-index: 1;
	cursor: pointer;
	border-radius: 6px;
	user-select: none;
  transition: all 0.2s ease;
  font-weight: 500;
}
.command-category:hover {
  background: linear-gradient(135deg, rgba(50, 50, 50, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
  border-color: rgba(255, 255, 255, 0.1);
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
	cursor: pointer;
	font-size: 18px;
	margin: 3px 0;
	padding: 8px 10px;
	border-radius: 6px;
	transition: all 0.15s ease;
  user-select: none;
}
.command-item:hover {
  background: rgba(60, 60, 60, 0.4);
  transform: translateX(2px);
}
.command-item a {
	user-select: none;
	transition: color 0.15s ease;
}
.command-item a.active {
	color: #ae81ff;
  font-weight: 500;
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

.examples-section {
  margin-top: 1rem;
}

.examples-block {
  background-color: #2a2a2a;
  border-left: 4px solid #ae81ff;
  padding: 1rem;
  margin-top: 0.5rem;
  border-radius: 6px;
  color: #f9fafb;
  font-size: 1rem;
  line-height: 1.5;
}

.example-item {
  margin-bottom: 1rem;
}

.example-item:last-of-type {
  margin-bottom: 0;
}

.example-description {
  font-style: italic;
  color: #b0b0b0;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.chat-container {
  background-color: #1a1a1a;
  border-radius: 8px;
  padding: 0.75rem;
  font-family: 'Roobert', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 0.9rem;
  line-height: 1.4;
}

.chat-message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.25rem;
  word-wrap: break-word;
}

.chat-message:last-child {
  margin-bottom: 0;
}

.chat-username {
  font-weight: 600;
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.chat-badge {
  height: 1.1em;
  width: auto;
  margin-right: 0.25rem;
  margin-top: 0.1em;
  flex-shrink: 0;
}

.bot-message .chat-username {
  color: #ae81ff;
}

.chat-text {
  color: #ffffff;
  word-break: break-word;
}

.toggle-examples-btn {
  margin-top: 0.75rem;
  background-color: #3a3a3a;
	color: #ae81ff;
	border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
	transition: background-color 0.2s ease, border-color 0.2s ease;
	outline: none;
}

.toggle-examples-btn:hover {
	background-color: #454545;
	border-color: #ae81ff;
}

.toggle-examples-btn:focus,
.toggle-examples-btn:focus-visible {
	outline: none;
	border-color: rgba(255, 255, 255, 0.15);
}

.toggle-examples-btn:focus-visible {
	border-color: #ae81ff;
	box-shadow: 0 0 0 2px rgba(174, 129, 255, 0.35);
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
	.chat-container {
		font-size: 0.85rem;
		padding: 0.5rem;
	}
	.chat-username {
		margin-right: 0.25rem;
	}
	.chat-badge {
		margin-right: 0.15rem;
	}
	.toggle-examples-btn {
		font-size: 0.8rem;
		padding: 0.4rem 0.8rem;
	}
	.flag-header {
		flex-direction: column;
		align-items: flex-start;
		gap: 0.5rem;
	}
	.flag-name {
		font-size: 1rem;
	}
	.flag-metadata {
		font-size: 0.85rem;
	}
	.flag-meta-item {
		flex-direction: column;
		align-items: flex-start;
		gap: 0.25rem;
	}
	.flag-meta-item strong {
		min-width: auto;
	}
}
</style>
