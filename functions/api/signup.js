// POST /api/signup  { name, code, invite }  ->  creates a student account and logs it in
//   name    : 3-20 characters, a-z 0-9 _ -
//   code    : the password, 8-128 characters
//   invite  : the invite code you share with your students (Cloudflare secret SIGNUP_CODE)
// Only a few accounts are allowed (MAX_SIGNUPS, default 3). Without the invite code a stranger could use up those places.
import {
  json, isConfigured, codesMatch, signSession, sessionCookie, SESSION_SECONDS, getUsage,
  tooManyFailedLogins, recordFailedLogin, createDbUser, SIGNUP_NAME_RE,
} from "../../lib/auth.js";

export async function onRequestPost({ request, env }) {
  if (!isConfigured(env)) return json({ error: "server_not_configured" }, 500);
  if (!env.DB) return json({ error: "history_not_configured" }, 500);

  // Sign-up is closed until the owner sets an invite code. We never run it "open".
  const inviteCode = String(env.SIGNUP_CODE || "").trim();
  if (inviteCode.length < 6) return json({ error: "signup_closed" }, 403);

  let body;
  try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }

  // Wrong invite codes count like wrong passwords, so guessing it is slowed down.
  if (await tooManyFailedLogins(env, request)) return json({ error: "too_many_attempts" }, 429);

  const given = String((body && body.invite) || "").trim().slice(0, 128);
  if (!(await codesMatch(given, inviteCode))) {
    await recordFailedLogin(env, request);
    return json({ error: "invalid_invite" }, 403);
  }

  const name = String((body && body.name) || "").trim().toLowerCase();
  const password = String((body && body.code) || "").trim();
  if (!SIGNUP_NAME_RE.test(name)) return json({ error: "bad_name" }, 400);
  if (password.length < 8 || password.length > 128) return json({ error: "weak_password" }, 400);

  let result;
  try {
    result = await createDbUser(env, name, password);
  } catch (err) {
    console.log("signup failed", String(err));
    return json({ error: "history_failed" }, 500);
  }
  if (result !== "ok") return json({ error: result }, 409);

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
