// GET /api/me  ->  who is logged in, their avatar gender and how many questions are left today
import { json, isConfigured, verifySession, getUsage, getGender } from "../../lib/auth.js";

export async function onRequestGet({ request, env }) {
  if (!isConfigured(env)) return json({ error: "server_not_configured" }, 500);

  const user = await verifySession(env, request);
  if (!user) return json({ error: "unauthorized" }, 401);

  const usage = await getUsage(env, user);
  const gender = await getGender(env, user);
  return json({ ok: true, user, username: user, gender, used: usage.used, limit: usage.limit });
}

export async function onRequest() {
  return json({ error: "method_not_allowed" }, 405);
}
