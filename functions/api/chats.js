// Chat history, saved per logged-in member in a Cloudflare D1 database.
//   GET    /api/chats                      -> this member's chats, newest first (id, title, updated)
//   GET    /api/chats?id=...               -> one chat with all its saved messages
//   PUT    /api/chats                      -> create or update { id, title, messages }
//   DELETE /api/chats?id=...               -> delete one chat (and its pictures)
//   PUT    /api/chats?img=ID&chat=CHATID   -> save a small picture (body = base64 JPEG text)
//   GET    /api/chats?img=ID               -> the picture itself (image/jpeg)
// Needs a D1 binding named DB (see DEPLOY steps). The tables are created automatically.

import { json, isConfigured, verifySession } from "../../lib/auth.js";

const MAX_CHATS = 50;            // oldest chats beyond this are removed automatically
const MAX_MESSAGES = 40;         // messages kept per chat
const MAX_TEXT = 10000;          // characters kept per message
const MAX_TITLE = 60;
const MAX_BODY_CHARS = 400000;   // safety limit for one chat save request
const MAX_IMAGES_PER_CHAT = 6;   // pictures kept per chat
const MAX_IMAGE_CHARS = 260000;  // base64 characters per saved picture (about 190 KB)
const SUBJECT_IDS = ["math", "physics", "chemistry", "biology", "ict"];
const ID_RE = /^[a-z0-9]{6,40}$/;
const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

let tableReady = false;

async function ensureTables(db) {
  if (tableReady) return;
  await db
    .prepare(
      "CREATE TABLE IF NOT EXISTS chats (id TEXT PRIMARY KEY, owner TEXT NOT NULL, title TEXT NOT NULL, messages TEXT NOT NULL, updated_at INTEGER NOT NULL)"
    )
    .run();
  await db.prepare("CREATE INDEX IF NOT EXISTS chats_owner_updated ON chats (owner, updated_at DESC)").run();
  await db
    .prepare(
      "CREATE TABLE IF NOT EXISTS chat_images (id TEXT PRIMARY KEY, chat_id TEXT NOT NULL, owner TEXT NOT NULL, data TEXT NOT NULL, created_at INTEGER NOT NULL)"
    )
    .run();
  await db.prepare("CREATE INDEX IF NOT EXISTS chat_images_chat ON chat_images (chat_id)").run();
  tableReady = true;
}

function cleanMessages(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.text === "string")
    .map((m) => {
      const out = {
        role: m.role,
        text: m.text.slice(0, MAX_TEXT),
        img: m.role === "user" && m.img === true,
      };
      // imgId points at a small saved copy of the picture (see the picture endpoints below)
      if (out.img && typeof m.imgId === "string" && ID_RE.test(m.imgId)) out.imgId = m.imgId;
      // when the message was sent (ms since 1970) and, for answers, how long it took
      const now = Date.now();
      if (Number.isFinite(m.ts) && m.ts > 1.6e12 && m.ts < now + 86400000) out.ts = Math.round(m.ts);
      if (m.role === "assistant" && Number.isFinite(m.dur) && m.dur > 0 && m.dur < 600000) out.dur = Math.round(m.dur);
      // 👍 / 👎 on an answer
      if (m.role === "assistant" && (m.fb === "up" || m.fb === "down")) out.fb = m.fb;
      // the class and subject a question was asked in (subject id from the fixed list, class number 0-7)
      if (m.role === "user" && m.ctx && typeof m.ctx === "object") {
        const c = {};
        if (typeof m.ctx.s === "string" && SUBJECT_IDS.includes(m.ctx.s)) c.s = m.ctx.s;
        if (Number.isInteger(m.ctx.c) && m.ctx.c >= 0 && m.ctx.c <= 7) c.c = m.ctx.c;
        if (c.s !== undefined || c.c !== undefined) out.ctx = c;
      }
      return out;
    })
    .filter((m) => m.text.length > 0 || m.img)
    .slice(-MAX_MESSAGES);
}

export async function onRequest(context) {
  const { request, env } = context;

  if (!isConfigured(env)) return json({ error: "server_not_configured" }, 500);
  const user = await verifySession(env, request);
  if (!user) return json({ error: "unauthorized" }, 401);
  if (!env.DB) return json({ error: "history_not_configured" }, 500);

  try {
    await ensureTables(env.DB);
  } catch (err) {
    console.log("chats table error", String(err));
    return json({ error: "history_failed" }, 500);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id") || "";
  const imgId = url.searchParams.get("img") || "";

  try {
    if (request.method === "GET") {
      // ---- one saved picture ----
      if (imgId) {
        if (!ID_RE.test(imgId)) return json({ error: "not_found" }, 404);
        const row = await env.DB
          .prepare("SELECT data FROM chat_images WHERE id = ? AND owner = ?")
          .bind(imgId, user)
          .first();
        if (!row) return json({ error: "not_found" }, 404);
        const bin = atob(row.data);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return new Response(bytes, {
          status: 200,
          headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=86400" },
        });
      }

      // ---- one chat ----
      if (id) {
        if (!ID_RE.test(id)) return json({ error: "not_found" }, 404);
        const row = await env.DB
          .prepare("SELECT id, title, messages, updated_at FROM chats WHERE id = ? AND owner = ?")
          .bind(id, user)
          .first();
        if (!row) return json({ error: "not_found" }, 404);
        let messages = [];
        try { messages = JSON.parse(row.messages); } catch { /* damaged row: show it empty */ }
        return json({ ok: true, chat: { id: row.id, title: row.title, messages, updated: row.updated_at } });
      }

      // ---- the list ----
      const { results } = await env.DB
        .prepare("SELECT id, title, updated_at FROM chats WHERE owner = ? ORDER BY updated_at DESC LIMIT ?")
        .bind(user, MAX_CHATS)
        .all();
      return json({
        ok: true,
        chats: (results || []).map((r) => ({ id: r.id, title: r.title, updated: r.updated_at })),
      });
    }

    if (request.method === "PUT") {
      const raw = await request.text();

      // ---- save one small picture ----
      if (imgId) {
        const chatId = url.searchParams.get("chat") || "";
        if (!ID_RE.test(imgId) || !ID_RE.test(chatId)) return json({ error: "bad_request" }, 400);
        const data = raw.trim();
        if (!data || data.length > MAX_IMAGE_CHARS || !BASE64_RE.test(data)) return json({ error: "bad_request" }, 400);

        const count = await env.DB
          .prepare("SELECT COUNT(*) AS n FROM chat_images WHERE chat_id = ? AND owner = ?")
          .bind(chatId, user)
          .first();
        if (count && count.n >= MAX_IMAGES_PER_CHAT) return json({ error: "too_many_images" }, 409);

        await env.DB
          .prepare("INSERT INTO chat_images (id, chat_id, owner, data, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING")
          .bind(imgId, chatId, user, data, Date.now())
          .run();
        return json({ ok: true, id: imgId });
      }

      // ---- save a chat ----
      if (raw.length > MAX_BODY_CHARS) return json({ error: "bad_request" }, 413);
      let body;
      try { body = JSON.parse(raw); } catch { return json({ error: "bad_request" }, 400); }

      const chatId = String((body && body.id) || "");
      if (!ID_RE.test(chatId)) return json({ error: "bad_request" }, 400);
      const title = String((body && body.title) || "").replace(/\s+/g, " ").trim().slice(0, MAX_TITLE) || "Chat";
      const messages = cleanMessages(body && body.messages);
      if (!messages.length) return json({ error: "bad_request" }, 400);

      const now = Date.now();
      // The WHERE makes sure nobody can overwrite a chat that belongs to someone else.
      const result = await env.DB
        .prepare(
          "INSERT INTO chats (id, owner, title, messages, updated_at) VALUES (?, ?, ?, ?, ?) " +
          "ON CONFLICT(id) DO UPDATE SET title = excluded.title, messages = excluded.messages, updated_at = excluded.updated_at " +
          "WHERE chats.owner = excluded.owner"
        )
        .bind(chatId, user, title, JSON.stringify(messages), now)
        .run();
      if (result && result.meta && result.meta.changes === 0) return json({ error: "forbidden" }, 403);

      // Keep only the newest MAX_CHATS chats for this member, and drop pictures of chats that are gone.
      await env.DB
        .prepare(
          "DELETE FROM chats WHERE owner = ? AND id NOT IN (SELECT id FROM chats WHERE owner = ? ORDER BY updated_at DESC LIMIT ?)"
        )
        .bind(user, user, MAX_CHATS)
        .run();
      await env.DB
        .prepare("DELETE FROM chat_images WHERE owner = ? AND chat_id NOT IN (SELECT id FROM chats WHERE owner = ?)")
        .bind(user, user)
        .run();

      return json({ ok: true, id: chatId, updated: now });
    }

    if (request.method === "DELETE") {
      if (!ID_RE.test(id)) return json({ error: "bad_request" }, 400);
      await env.DB.prepare("DELETE FROM chats WHERE id = ? AND owner = ?").bind(id, user).run();
      await env.DB.prepare("DELETE FROM chat_images WHERE chat_id = ? AND owner = ?").bind(id, user).run();
      return json({ ok: true });
    }

    return json({ error: "method_not_allowed" }, 405);
  } catch (err) {
    console.log("chats error", String(err));
    return json({ error: "history_failed" }, 500);
  }
}
