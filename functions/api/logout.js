// POST /api/logout  ->  clears the login cookie
import { json, sessionCookie } from "../../lib/auth.js";

export async function onRequestPost() {
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("", 0) });
}

export async function onRequest() {
  return json({ error: "method_not_allowed" }, 405);
}
