// NexUrl.js
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for every backend URL used in the app.
// NexApi.js (and nothing else) should read from this file to build requests.
//
// Two bases are exposed on purpose, mirroring how the original contexts
// actually talked to the backend:
//
//   • REST calls (Auth/Chat contexts) used relative "/api/..." paths — this
//     assumes a Vite dev-server proxy (or same-origin deploy) forwards them
//     to the backend, so no host/port is baked in here.
//   • The Socket.io client used an absolute origin from
//     import.meta.env.VITE_API_BASE_URL, because WebSocket upgrades aren't
//     proxied the same way REST calls are.
//
// If your setup proxies everything (including sockets) through one origin,
// you can safely set SOCKET_URL to '' or point it at the same base.
// ─────────────────────────────────────────────────────────────────────────────

export const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const API_PREFIX = '/api';

export const NexUrl = {
  auth: {
    token: () => `${API_PREFIX}/auth/token`,
    signup: () => `${API_PREFIX}/auth/signup`,
    login: () => `${API_PREFIX}/auth/login`,
  },

  users: {
    list: () => `${API_PREFIX}/users`,
    updateMe: () => `${API_PREFIX}/users/me`,
  },

  rooms: {
    mine: () => `${API_PREFIX}/me/rooms`,
    create: () => `${API_PREFIX}/rooms`,
    read: (roomId) => `${API_PREFIX}/rooms/${roomId}/read`,
    messages: (roomId) => `${API_PREFIX}/rooms/${roomId}/messages`,
  },

  messages: {
    delete: (messageId) => `${API_PREFIX}/messages/${messageId}`,
    edit: (messageId) => `${API_PREFIX}/messages/${messageId}`,
    pin: (messageId) => `${API_PREFIX}/messages/${messageId}/pin`,
  },

  upload: {
    presign: () => `${API_PREFIX}/upload/presign`,
  },
};

export default NexUrl;