// POST /api/signup  { username, email, password, gender, invite }  ->  creates a student account and logs it in
//   username : 3-20 characters, a-z 0-9 _ -
//   email    : the student's email (can also be used to log in)
//   password : 8-128 characters
//   gender   : "male" or "female" (decides the avatar)
//   invite   : the secret code you share with your students (Cloudflare secret SIGNUP_CODE)
// (Old field names name/code still work too.)
// Only a few accounts are allowed (MAX_SIGNUPS, default 3). Without the invite code a stranger could use up those places.
import {
  json, isConfigured, codesMatch, signSession, sessionCookie, SESSION_SECONDS, getUsage,
  tooManyFailedLogins, recordFailedLogin, createDbUser, SIGNUP_NAME_RE, EMAIL_RE,
} from "../../lib/auth.js";

export async function onRequestPost({ request, env }) {
  if (!isConfigured(env)) return json({ error: "server_not_configured" }, 500);
  if (!env.DB) return json({ error: "history_not_configured" }, 500);

  // Sign-up is closed until the owner sets an invite code. We never run it "open".
  const inviteCode = String(env.SIGNUP_CODE || "").trim();
  if (inviteCode.length < 6) return json({ error: "signup_closed" }, 403);

  let body;
  try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }
  body = body || {};

  // Wrong invite codes count like wrong passwords, so guessing it is slowed down.
  if (await tooManyFailedLogins(env, request)) return json({ error: "too_many_attempts" }, 429);

  const given = String(body.invite || "").trim().slice(0, 128);
  if (!(await codesMatch(given, inviteCode))) {
    await recordFailedLogin(env, request);
    return json({ error: "invalid_invite" }, 403);
  }

  const name = String(body.username || body.name || "").trim().toLowerCase();
  const password = String(body.password || body.code || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const gender = body.gender === "female" ? "female" : "male";

  if (!SIGNUP_NAME_RE.test(name)) return json({ error: "bad_name" }, 400);
  if (!EMAIL_RE.test(email) || email.length > 120) return json({ error: "bad_email" }, 400);
  if (password.length < 8 || password.length > 128) return json({ error: "weak_password" }, 400);

  let result;
  try {
    result = await createDbUser(env, name, password, email, gender);
  } catch (err) {
    console.log("signup failed", String(err));
    return json({ error: "history_failed" }, 500);
  }
  if (result !== "ok") return json({ error: result }, 409);

  const token = await signSession(env, name);
  const usage = await getUsage(env, name);
  return json(
    { ok: true, user: name, gender, used: usage.used, limit: usage.limit },
    200,
    { "Set-Cookie": sessionCookie(token, SESSION_SECONDS) }
  );
}

export async function onRequest() {
  return json({ error: "method_not_allowed" }, 405);
}
