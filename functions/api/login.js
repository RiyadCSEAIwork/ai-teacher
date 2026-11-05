// POST /api/login  { identifier, password }  ->  sets a login cookie
// identifier = username OR email. (Old field names name/code, username/email/login still work too.)
// Works for members listed in USERS and for students who signed up (stored in D1).
import {
  json, isConfigured, parseUsers, codesMatch, signSession, sessionCookie,
  SESSION_SECONDS, getUsage, tooManyFailedLogins, recordFailedLogin,
  getDbUser, getDbUserByEmail, dbPasswordMatches, dummyPasswordWork, getGender,
} from "../../lib/auth.js";

export async function onRequestPost({ request, env }) {
  if (!isConfigured(env)) return json({ error: "server_not_configured" }, 500);

  let body;
  try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }
  body = body || {};

  if (await tooManyFailedLogins(env, request)) return json({ error: "too_many_attempts" }, 429);

  const identifier = String(body.identifier || body.name || body.username || body.login || body.email || "").trim().toLowerCase();
  const code = String(body.password || body.code || "").trim();

  let name = identifier;
  let ok = false;
  if (code.length <= 128 && identifier.length <= 120) {
    const expected = parseUsers(env).get(identifier);
    if (expected !== undefined) {
      ok = await codesMatch(code, expected);
    } else {
      // Typed an email? Find the account that owns it. Otherwise treat it as a username.
      let row = identifier.includes("@") ? await getDbUserByEmail(env, identifier) : await getDbUser(env, identifier);
      if (row) {
        name = row.name;
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
  const gender = await getGender(env, name);
  return json(
    { ok: true, user: name, gender, used: usage.used, limit: usage.limit },
    200,
    { "Set-Cookie": sessionCookie(token, SESSION_SECONDS) }
  );
}

export async function onRequest() {
  return json({ error: "method_not_allowed" }, 405);
}
