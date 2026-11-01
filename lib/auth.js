// Shared helpers for login + daily limits.
// Lives OUTSIDE the functions/ folder on purpose, so Cloudflare does not turn it into a web address.
//
// Settings read from Cloudflare (Settings -> Variables and Secrets / Bindings):
//   SESSION_SECRET     (Secret)  long random text used to sign login cookies
//   USERS              (Secret)  "name1:code1,name2:code2"   (names: a-z 0-9 _ -  | codes: no commas)
//   RATE_KV            (KV binding) stores the daily counters
//   DAILY_LIMIT        (Text, optional) questions per person per day, default 30
//   GLOBAL_DAILY_LIMIT (Text, optional) questions for the whole site per day, default 100

const enc = new TextEncoder();

export const COOKIE_NAME = "aiteacher_session";
export const SESSION_SECONDS = 60 * 60 * 24 * 30; // stay logged in for 30 days
const MAX_FAILED_LOGINS_PER_HOUR = 10;

export function json(body, status = 200, extraHeaders = {}) {
  const headers = new Headers({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  for (const [k, v] of Object.entries(extraHeaders)) headers.set(k, v);
  return new Response(JSON.stringify(body), { status, headers });
}

function toInt(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function limitFrom(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function parseUsers(env) {
  const map = new Map();
  String(env.USERS || "").split(",").forEach((pair) => {
    const i = pair.indexOf(":");
    if (i < 1) return;
    const name = pair.slice(0, i).trim().toLowerCase();
    const code = pair.slice(i + 1).trim();
    if (/^[a-z0-9_-]{1,32}$/.test(name) && code) map.set(name, code);
  });
  return map;
}

// True only when every required setting is present. We refuse to run "open" if something is missing.
// Members can come from USERS (set by you in Cloudflare) and/or from the sign-up page (stored in D1).
export function isConfigured(env) {
  return Boolean(
    env.SESSION_SECRET && String(env.SESSION_SECRET).length >= 16 &&
    (parseUsers(env).size > 0 || env.DB) &&
    env.RATE_KV && typeof env.RATE_KV.get === "function" && typeof env.RATE_KV.put === "function"
  );
}

// ---------- small crypto helpers ----------
function toB64Url(buf) {
  let s = "";
  new Uint8Array(buf).forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(str) {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function hmacKey(secret, usages) {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, usages);
}

async function sha256(text) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(text)));
}

// Compares two secrets without leaking, through timing, how many characters matched.
export async function codesMatch(a, b) {
  const [ha, hb] = await Promise.all([sha256(String(a)), sha256(String(b))]);
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha[i] ^ hb[i];
  return diff === 0;
}

// ---------- login cookie ----------
export async function signSession(env, name) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `${name}.${exp}`;
  const key = await hmacKey(env.SESSION_SECRET, ["sign"]);
  const sig = toB64Url(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
  return `${payload}.${sig}`;
}

export function sessionCookie(value, maxAgeSeconds) {
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAgeSeconds}`;
}

function getCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    if (part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return null;
}

// Returns the logged-in user's name, or null.
export async function verifySession(env, request) {
  const token = getCookie(request, COOKIE_NAME);
  if (!token) return null;

  const lastDot = token.lastIndexOf(".");
  const midDot = token.lastIndexOf(".", lastDot - 1);
  if (lastDot < 0 || midDot < 1) return null;

  const name = token.slice(0, midDot);
  const exp = parseInt(token.slice(midDot + 1, lastDot), 10);
  const sig = token.slice(lastDot + 1);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return null;

  let ok = false;
  try {
    const key = await hmacKey(env.SESSION_SECRET, ["verify"]);
    ok = await crypto.subtle.verify("HMAC", key, fromB64Url(sig), enc.encode(`${name}.${exp}`));
  } catch {
    return null;
  }
  if (!ok) return null;

  // Removing someone from USERS (or deleting their row in D1) logs them out immediately.
  if (parseUsers(env).has(name)) return name;
  return (await getDbUser(env, name)) ? name : null;
}

// ---------- accounts made on the sign-up page ----------
// They live in the D1 table "users". Only a salted PBKDF2 hash of the password is kept, never the password itself.
// Optional Cloudflare settings:
//   SIGNUP_CODE        (Secret)  invite code students must type to sign up (6+ characters). Without it, sign-up stays closed.
//   MAX_SIGNUPS        (Text)    how many sign-up accounts are allowed in total, default 3
//   PBKDF2_ITERATIONS  (Text)    password hashing strength, default 100000 (the most Cloudflare allows)
export const SIGNUP_NAME_RE = /^[a-z0-9_-]{3,20}$/;
let usersTableReady = false;

async function ensureUsersTable(db) {
  if (usersTableReady) return;
  await db
    .prepare("CREATE TABLE IF NOT EXISTS users (name TEXT PRIMARY KEY, salt TEXT NOT NULL, hash TEXT NOT NULL, iterations INTEGER NOT NULL, created_at INTEGER NOT NULL)")
    .run();
  usersTableReady = true;
}

function iterationsFrom(env) {
  return Math.min(limitFrom(env.PBKDF2_ITERATIONS, 100000), 100000);
}

async function derivePassword(password, saltBytes, iterations) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: saltBytes, iterations }, key, 256));
}

export async function getDbUser(env, name) {
  if (!env.DB || !SIGNUP_NAME_RE.test(name)) return null;
  try {
    await ensureUsersTable(env.DB);
    const row = await env.DB.prepare("SELECT name, salt, hash, iterations FROM users WHERE name = ?").bind(name).first();
    return row || null;
  } catch (e) {
    console.log("users lookup failed", String(e));
    return null;
  }
}

export async function dbPasswordMatches(row, password) {
  const bits = await derivePassword(password, fromB64Url(row.salt), row.iterations);
  return codesMatch(toB64Url(bits), row.hash);
}

// Used for unknown names, so a wrong name takes as long as a wrong password.
export async function dummyPasswordWork(env, password) {
  await derivePassword(password, new Uint8Array(16), iterationsFrom(env));
}

// Returns "ok", "name_taken" or "signup_full". The limit is checked inside the same SQL statement as the insert,
// so two people signing up at the same moment can never go over MAX_SIGNUPS.
export async function createDbUser(env, name, password) {
  if (parseUsers(env).has(name)) return "name_taken";
  await ensureUsersTable(env.DB);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = iterationsFrom(env);
  const hash = toB64Url(await derivePassword(password, salt, iterations));
  const result = await env.DB
    .prepare("INSERT OR IGNORE INTO users (name, salt, hash, iterations, created_at) SELECT ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM users) < ?")
    .bind(name, toB64Url(salt), hash, iterations, Date.now(), limitFrom(env.MAX_SIGNUPS, 3))
    .run();
  if (result && result.meta && result.meta.changes > 0) return "ok";
  const exists = await env.DB.prepare("SELECT 1 AS x FROM users WHERE name = ?").bind(name).first();
  return exists ? "name_taken" : "signup_full";
}

// ---------- daily limits ----------
// "Day" follows Bangladesh time (UTC+6), so counters reset at local midnight.
export function dayKey() {
  return new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 10);
}

export async function getUsage(env, name) {
  const day = dayKey();
  const [u, g] = await Promise.all([
    env.RATE_KV.get(`u:${name}:${day}`),
    env.RATE_KV.get(`g:${day}`),
  ]);
  return {
    day,
    used: toInt(u),
    limit: limitFrom(env.DAILY_LIMIT, 30),
    globalUsed: toInt(g),
    globalLimit: limitFrom(env.GLOBAL_DAILY_LIMIT, 100),
  };
}

// Called only after Gemini answered successfully, so failed requests never use up someone's quota.
export async function addUsage(env, name, usage) {
  const opts = { expirationTtl: 60 * 60 * 48 };
  try {
    await env.RATE_KV.put(`u:${name}:${usage.day}`, String(usage.used + 1), opts);
  } catch (e) { console.log("KV put failed (user counter)", String(e)); }
  try {
    await env.RATE_KV.put(`g:${usage.day}`, String(usage.globalUsed + 1), opts);
  } catch (e) { console.log("KV put failed (global counter)", String(e)); }
}

// ---------- brute-force guard for the login form ----------
function failKey(request) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  return `f:${ip}:${Math.floor(Date.now() / 3600000)}`;
}

export async function tooManyFailedLogins(env, request) {
  return toInt(await env.RATE_KV.get(failKey(request))) >= MAX_FAILED_LOGINS_PER_HOUR;
}

export async function recordFailedLogin(env, request) {
  const key = failKey(request);
  try {
    await env.RATE_KV.put(key, String(toInt(await env.RATE_KV.get(key)) + 1), { expirationTtl: 60 * 60 * 2 });
  } catch (e) { console.log("KV put failed (login attempts)", String(e)); }
}
