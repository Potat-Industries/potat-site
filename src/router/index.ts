import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
const createHmac = require('create-hmac');

function b64urlEncode(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function encodeId(id: string, secret: string): string {
  if (id === undefined || id === null) {
    throw new Error('id is required');
  }
  if (!secret) {
    throw new Error('secret is required');
  }

  const idStr = String(id);

  const sigFull = createHmac('sha256', secret).update(idStr).digest();
  const sig = sigFull.subarray(0, 16);

  return `${idStr}.${b64urlEncode(sig)}`;
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/home.vue'),
  },
  {
    path: '/leaderboard/:type?',
    name: 'Leaderboard',
    component: () => import('../views/leaderboard.vue'),
    alias: '/loserboard/:type?',
  },
  {
    path: '/channel/:username',
    name: 'Channel',
    component: () => import('../views/channel.vue'),
  },
  {
    path: '/help/:command?',
    name: 'Help',
    component: () => import('../views/help.vue'),
  },
  {
    path: '/redirects',
    name: 'Redirects',
    component: () => import('../views/redirects.vue'),
  },
  {
    path: '/api/docs',
    name: 'API Docs',
    component: () => import('../views/docs.vue'),
  },
  {
    path: '/emotes/history/:username',
    name: 'History',
    component: () => import('../views/emoteHistory.vue'),
  },
  {
    path: '/connections',
    name: 'Connections',
    component: () => import('../views/connections.vue'),
  },
  {
    path: '/emotes/search',
    name: 'Search',
    component: () => import('../views/emoteSearch.vue'),
  },
  {
    path: '/wrapped/2025/:username',
    name: 'Wrapped2025',
    component: () => import('../views/wrapped.vue'),
    beforeEnter: (req) => {
      const isAuthed = Boolean(localStorage.getItem('authorization'));
      const username = req.params?.username;
      if (isAuthed && !username) {
        const userId = JSON.parse(localStorage.getItem('userState') || '{}')?.id;
        if (!userId) {
          return false;
        }
        window.location.href = `https://wrapped.potat.app/p/${encodeId(userId, import.meta.env.WRAPPED_KEY)}`;
      }
      if (username) {
        window.location.href = `https://api.potat.app/wrapped/2025/login/${username}`;
      }
      return false;
    },
  },
  {
    path: '/wrapped/2024/:username/:type?',
    name: 'Wrapped',
    component: () => import('../views/wrapped.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
