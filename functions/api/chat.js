// Cloudflare Pages Function: POST /api/chat
// The Gemini API key lives only here (as an environment variable), never in the browser.

import { isConfigured, verifySession, getUsage, addUsage } from "../../lib/auth.js";

const DEFAULT_MODEL = "gemini-3.6-flash";
const MAX_MESSAGES = 20;        // how many recent messages we accept
const MAX_CHARS_PER_MESSAGE = 3000;

const SYSTEM_PROMPTS = {
  bn: `তুমি "AI Teacher" — একজন ধৈর্যশীল, বন্ধুসুলভ শিক্ষক।
- ব্যবহারকারী বাংলায় লিখলে সহজ, স্পষ্ট বাংলায় উত্তর দাও। ইংরেজিতে লিখলে ইংরেজিতে উত্তর দাও।
- কঠিন বিষয় ধাপে ধাপে বোঝাও, দরকার হলে ছোট উদাহরণ দাও।
- গণিত বা যুক্তির প্রশ্নে সমাধানের ধাপগুলো দেখাও, শুধু চূড়ান্ত উত্তর নয়।
- নিশ্চিত না হলে সেটা সৎভাবে বলো, অনুমান করে তথ্য বানিয়ে বোলো না।
- উত্তর সংক্ষিপ্ত ও গোছানো রাখো। শেষে প্রয়োজন হলে একটা ছোট প্রশ্ন করে বুঝে নেওয়ার সুযোগ দাও।
- চিকিৎসা, আইন বা আর্থিক বিষয়ে সাধারণ শিক্ষামূলক ব্যাখ্যা দাও এবং বিশেষজ্ঞের পরামর্শ নিতে বলো।
- গাণিতিক বা রাসায়নিক লেখায় LaTeX বা ডলার ($) চিহ্ন ব্যবহার করবে না। সাধারণ অক্ষর ও ইউনিকোড চিহ্ন (→, ×, ², ₂, √) ব্যবহার করো, যেমন: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂।
- উদ্ধৃতি চিহ্ন (>) ব্যবহার না করে সমীকরণ আলাদা লাইনে লেখো।`,
  en: `You are "AI Teacher", a patient and friendly tutor.
- Reply in the language the student writes in: English for English, simple clear Bengali (বাংলা) for Bengali.
- Explain hard topics step by step and use short examples when they help.
- For math or reasoning questions, show the solution steps, not just the final answer.
- If you are not sure, say so honestly; never invent facts.
- Keep answers concise and well organized. When useful, end with a short question to check understanding.
- For medical, legal or financial topics, give general educational explanations and suggest consulting a professional.
- Do not use LaTeX or dollar signs ($) for math or chemistry. Use plain text and Unicode symbols (→, ×, ², ₂, √), e.g. 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂.
- Do not use ">" quote markers; put equations on their own line instead.`,
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.GEMINI_API_KEY || !isConfigured(env)) {
    return json({ error: "server_not_configured" }, 500);
  }

  // Only logged-in members may ask, and each has a daily limit (plus one limit for the whole site).
  const user = await verifySession(env, request);
  if (!user) return json({ error: "unauthorized" }, 401);

  const usage = await getUsage(env, user);
  if (usage.used >= usage.limit) {
    return json({ error: "daily_limit", used: usage.used, limit: usage.limit }, 429);
  }
  if (usage.globalUsed >= usage.globalLimit) {
    return json({ error: "global_limit" }, 429);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  const lang = payload && payload.lang === "en" ? "en" : "bn";
  const incoming = Array.isArray(payload && payload.messages) ? payload.messages : [];

  // Keep only valid user/assistant text messages, trim size, keep the most recent ones.
  const cleaned = incoming
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.text === "string")
    .map((m) => ({ role: m.role, text: m.text.trim().slice(0, MAX_CHARS_PER_MESSAGE) }))
    .filter((m) => m.text.length > 0)
    .slice(-MAX_MESSAGES);

  // The conversation must start with and end on a user message.
  while (cleaned.length && cleaned[0].role !== "user") cleaned.shift();
  if (!cleaned.length || cleaned[cleaned.length - 1].role !== "user") {
    return json({ error: "bad_request" }, 400);
  }

  const model = (env.GEMINI_MODEL || DEFAULT_MODEL).trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPTS[lang] }] },
    contents: cleaned.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text }],
    })),
    generationConfig: { maxOutputTokens: 2048 },
  };

  let upstream;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify(body),
    });
  } catch {
    return json({ error: "network" }, 502);
  }

  if (upstream.status === 429) return json({ error: "rate_limited" }, 429);
  if (!upstream.ok) {
    // Log details for you (visible in Cloudflare logs), but never send raw upstream errors to the browser.
    console.log("Gemini error", upstream.status, (await upstream.text()).slice(0, 500));
    return json({ error: "upstream_error" }, 502);
  }

  const data = await upstream.json();
  const parts = data && data.candidates && data.candidates[0] && data.candidates[0].content
    ? data.candidates[0].content.parts || []
    : [];
  const reply = parts.map((p) => p.text || "").join("").trim();

  if (!reply) return json({ error: "empty_reply" }, 502);

  await addUsage(env, user, usage); // count it only now that the answer succeeded
  return json({ reply, used: usage.used + 1, limit: usage.limit });
}

// Any other method gets a clear answer instead of a confusing error.
export async function onRequest() {
  return json({ error: "method_not_allowed" }, 405);
}
