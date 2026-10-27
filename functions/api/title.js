// POST /api/title  { lang, question, answer }  ->  { ok: true, title }
// Makes a short topic title (2-5 words) for the chat history list. It does not use up the member's daily questions.

import { json, isConfigured, verifySession } from "../../lib/auth.js";

const DEFAULT_MODEL = "gemini-3.6-flash";

export async function onRequestPost({ request, env }) {
  if (!env.GEMINI_API_KEY || !isConfigured(env)) return json({ error: "server_not_configured" }, 500);
  const user = await verifySession(env, request);
  if (!user) return json({ error: "unauthorized" }, 401);

  let body;
  try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }

  const lang = body && body.lang === "en" ? "en" : "bn";
  const question = String((body && body.question) || "").slice(0, 300);
  const answer = String((body && body.answer) || "").slice(0, 1500);
  if (!answer.trim()) return json({ error: "bad_request" }, 400);

  const instruction =
    "Below are a student's question (it may have come from a picture, so it can be empty) and the tutor's answer. " +
    "Reply with ONLY a short topic title for a chat history list: 2 to 5 words naming the subject being studied " +
    "(for example: সালোকসংশ্লেষণ, দ্বিঘাত সমীকরণ, Present Perfect Tense, Newton's laws). " +
    "Write it in the same language as the tutor's answer, or " + (lang === "en" ? "English" : "Bengali") + " if unsure. " +
    "No quotes, no emoji, no full stop, nothing else.\n\n" +
    "Question: " + (question || "(only a picture)") + "\n\nAnswer:\n" + answer;

  const model = (env.GEMINI_MODEL || DEFAULT_MODEL).trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  function call(withThinking) {
    const generationConfig = { maxOutputTokens: 200, temperature: 0.2 };
    if (withThinking) generationConfig.thinkingConfig = { thinkingLevel: "minimal" };
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: instruction }] }], generationConfig }),
    });
  }

  let upstream;
  try {
    upstream = await call(true);
    if (upstream.status === 400) upstream = await call(false); // model may not accept the thinking setting
  } catch {
    return json({ error: "network" }, 502);
  }
  if (!upstream.ok) {
    console.log("title error", upstream.status, (await upstream.text()).slice(0, 300));
    return json({ error: "upstream_error" }, 502);
  }

  let data;
  try { data = await upstream.json(); } catch { return json({ error: "upstream_error" }, 502); }
  const parts = data && data.candidates && data.candidates[0] && data.candidates[0].content
    ? data.candidates[0].content.parts || []
    : [];
  let title = parts.filter((p) => !p.thought).map((p) => p.text || "").join("");
  title = title
    .split(/\r?\n/)[0]
    .replace(/[*#`"'“”‘’]/g, "")
    .replace(/[.।!?:;,\s]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 50);
  if (!title) return json({ error: "upstream_error" }, 502);

  return json({ ok: true, title });
}

export async function onRequest() {
  return json({ error: "method_not_allowed" }, 405);
}
