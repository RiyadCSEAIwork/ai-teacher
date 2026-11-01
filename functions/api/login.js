// POST /api/login  { name, code }  ->  sets a login cookie
// Works for members listed in USERS and for students who signed up (stored in D1).
import {
  json, isConfigured, parseUsers, codesMatch, signSession, sessionCookie,
  SESSION_SECONDS, getUsage, tooManyFailedLogins, recordFailedLogin,
  getDbUser, dbPasswordMatches, dummyPasswordWork,
} from "../../lib/auth.js";

export async function onRequestPost({ request, env }) {
  if (!isConfigured(env)) return json({ error: "server_not_configured" }, 500);

  let body;
  try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }

  if (await tooManyFailedLogins(env, request)) return json({ error: "too_many_attempts" }, 429);

  const name = String((body && body.name) || "").trim().toLowerCase();
  const code = String((body && body.code) || "").trim();

  let ok = false;
  if (code.length <= 128) {
    const expected = parseUsers(env).get(name);
    if (expected !== undefined) {
      ok = await codesMatch(code, expected);
    } else {
      const row = await getDbUser(env, name);
      if (row) {
        ok = await dbPasswordMatches(row, code);
      } else {
        // Unknown name: do the same amount of work anyway, so response time doesn't reveal which names exist.
        await dummyPasswordWork(env, code);
        await codesMatch(code, "\u0000no-such-user");
      }
    }
  }

  if (!ok) {
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
