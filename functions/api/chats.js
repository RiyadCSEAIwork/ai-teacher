// Chat history, saved per logged-in member in a Cloudflare D1 database.
//   GET    /api/chats            -> this member's chats, newest first (id, title, updated)
//   GET    /api/chats?id=...     -> one chat with all its saved messages
//   PUT    /api/chats            -> create or update { id, title, messages }
//   DELETE /api/chats?id=...     -> delete one chat
// Needs a D1 binding named DB (see DEPLOY steps). The table is created automatically.

import { json, isConfigured, verifySession } from "../../lib/auth.js";

const MAX_CHATS = 50;          // oldest chats beyond this are removed automatically
const MAX_MESSAGES = 40;       // messages kept per chat
const MAX_TEXT = 10000;        // characters kept per message
const MAX_TITLE = 60;
const MAX_BODY_CHARS = 400000; // safety limit for one save request
const ID_RE = /^[a-z0-9]{6,40}$/;

let tableReady = false;

async function ensureTable(db) {
  if (tableReady) return;
  await db
    .prepare(
      "CREATE TABLE IF NOT EXISTS chats (id TEXT PRIMARY KEY, owner TEXT NOT NULL, title TEXT NOT NULL, messages TEXT NOT NULL, updated_at INTEGER NOT NULL)"
    )
    .run();
  await db.prepare("CREATE INDEX IF NOT EXISTS chats_owner_updated ON chats (owner, updated_at DESC)").run();
  tableReady = true;
}

function cleanMessages(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.text === "string")
    .map((m) => ({
      role: m.role,
      text: m.text.slice(0, MAX_TEXT),
      img: m.role === "user" && m.img === true, // pictures themselves are never stored, only a marker
    }))
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
    await ensureTable(env.DB);
  } catch (err) {
    console.log("chats table error", String(err));
    return json({ error: "history_failed" }, 500);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id") || "";

  try {
    if (request.method === "GET") {
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

      // Keep only the newest MAX_CHATS chats for this member.
      await env.DB
        .prepare(
          "DELETE FROM chats WHERE owner = ? AND id NOT IN (SELECT id FROM chats WHERE owner = ? ORDER BY updated_at DESC LIMIT ?)"
        )
        .bind(user, user, MAX_CHATS)
        .run();

      return json({ ok: true, id: chatId, updated: now });
    }

    if (request.method === "DELETE") {
      if (!ID_RE.test(id)) return json({ error: "bad_request" }, 400);
      await env.DB.prepare("DELETE FROM chats WHERE id = ? AND owner = ?").bind(id, user).run();
      return json({ ok: true });
    }

    return json({ error: "method_not_allowed" }, 405);
  } catch (err) {
    console.log("chats error", String(err));
    return json({ error: "history_failed" }, 500);
  }
}
