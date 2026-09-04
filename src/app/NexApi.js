// NexApi.js
// ─────────────────────────────────────────────────────────────────────────────
// Thin HTTP layer built on top of NexUrl.js.
//
// Every network call in the app should go through the exported *Api objects
// below instead of calling fetch() directly. That keeps auth headers, JSON
// parsing, and error handling consistent in one place, and means a context
// file never has to know a raw URL — only NexUrl.js does.
// ─────────────────────────────────────────────────────────────────────────────

import { NexUrl } from './nexUrl';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status; // 0 = network/connection failure, no HTTP response
    this.data = data; // parsed JSON error body from the server, if any
  }
}

// Core request helper — every exported API function funnels through this.
async function request(url, { method = 'GET', token, body, headers = {} } = {}) {
  const finalHeaders = { ...headers };
  if (body !== undefined) finalHeaders['Content-Type'] = 'application/json';
  if (token) finalHeaders['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    // Network failure — no response object to inspect
    throw new ApiError(err.message || 'Network error', 0, null);
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new ApiError(
      data?.error || `Request failed with status ${res.status}`,
      res.status,
      data,
    );
  }

  return data;
}

// ── Auth ─────────────────────────────────────────────────────────────────
export const authApi = {
  exchangeGoogleToken: (payload) =>
    request(NexUrl.auth.token(), { method: 'POST', body: payload }),

  signup: (payload) =>
    request(NexUrl.auth.signup(), { method: 'POST', body: payload }),

  login: (payload) =>
    request(NexUrl.auth.login(), { method: 'POST', body: payload }),
};

// ── Users ────────────────────────────────────────────────────────────────
export const usersApi = {
  list: (token) => request(NexUrl.users.list(), { token }),

  // Partial update of the signed-in user's own profile (name, avatarUrl, status, ...)
  updateMe: (token, payload) =>
    request(NexUrl.users.updateMe(), { method: 'PATCH', token, body: payload }),
};

// ── Rooms ────────────────────────────────────────────────────────────────
export const roomsApi = {
  mine: (token) => request(NexUrl.rooms.mine(), { token }),

  create: (token, payload) =>
    request(NexUrl.rooms.create(), { method: 'POST', token, body: payload }),

  markRead: (token, roomId) =>
    request(NexUrl.rooms.read(roomId), { method: 'POST', token }),

  messages: {
    list: (token, roomId) => request(NexUrl.rooms.messages(roomId), { token }),

    send: (token, roomId, payload) =>
      request(NexUrl.rooms.messages(roomId), { method: 'POST', token, body: payload }),
  },
};

// ── Messages ─────────────────────────────────────────────────────────────
export const messagesApi = {
  delete: (token, messageId) =>
    request(NexUrl.messages.delete(messageId), { method: 'DELETE', token }),
  edit: (token, messageId, payload) =>
    request(NexUrl.messages.edit(messageId), { method: 'PATCH', token, body: payload }),
  pin: (token, messageId, payload) =>
    request(NexUrl.messages.pin(messageId), { method: 'PATCH', token, body: payload }),
};

// ── Upload ───────────────────────────────────────────────────────────────
export const uploadApi = {
  presign: (token, payload) =>
    request(NexUrl.upload.presign(), { method: 'POST', token, body: payload }),

  // The S3 PUT goes straight to the presigned URL returned above, not through
  // NexUrl/our own API — that URL is generated per-upload by the backend and
  // points at the storage provider, not our server.
  putFile: async (uploadUrl, file) => {
    let res;
    try {
      res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
    } catch (err) {
      throw new ApiError(err.message || 'File upload network error', 0, null);
    }
    if (!res.ok) {
      throw new ApiError('File upload failed', res.status, null);
    }
    return res;
  },
};