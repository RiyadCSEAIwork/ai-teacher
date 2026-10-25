// POST /api/login  { name, code }  ->  sets a login cookie
import {
  json, isConfigured, parseUsers, codesMatch, signSession, sessionCookie,
  SESSION_SECONDS, getUsage, tooManyFailedLogins, recordFailedLogin,
} from "../../lib/auth.js";

export async function onRequestPost({ request, env }) {
  if (!isConfigured(env)) return json({ error: "server_not_configured" }, 500);

  let body;
  try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }

  if (await tooManyFailedLogins(env, request)) return json({ error: "too_many_attempts" }, 429);

  const name = String((body && body.name) || "").trim().toLowerCase();
  const code = String((body && body.code) || "").trim();
  const expected = parseUsers(env).get(name);

  // Always do one comparison, even for unknown names, so response time doesn't reveal which names exist.
  const same = await codesMatch(code, expected === undefined ? "\u0000no-such-user" : expected);
  if (expected === undefined || !same) {
    await recordFailedLogin(env, request);
    return json({ error: "invalid_login" }, 401);
  }

  const token = await signSession(env, name);
  const usage = await getUsage(env, name);
  return json(
    { ok: true, user: name, used: usage.used, limit: usage.limit },
    200,
    { "Set-Cookie": sessionCookie(token, SESSION_SECONDS) }
  );
}

export async function onRequest() {
  return json({ error: "method_not_allowed" }, 405);
}
