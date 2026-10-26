// Cloudflare Pages Function: POST /api/chat
// The Gemini API key lives only here (as an environment variable), never in the browser.

import { isConfigured, verifySession, getUsage, addUsage } from "../../lib/auth.js";

const DEFAULT_MODEL = "gemini-3.6-flash";
const DEFAULT_THINKING_LEVEL = "low"; // faster first words; "medium" is the model default
const MAX_MESSAGES = 20;       // how many recent messages we accept
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
  // alt=sse makes Gemini send the answer piece by piece instead of all at once.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`;

  // Lower "thinking" makes the first words arrive much sooner. Set GEMINI_THINKING_LEVEL
  // (minimal | low | medium | high) in Cloudflare to change it, or "off" to leave the model default.
  const thinkingLevel = (env.GEMINI_THINKING_LEVEL || DEFAULT_THINKING_LEVEL).trim().toLowerCase();

  const baseBody = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPTS[lang] }] },
    contents: cleaned.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text }],
    })),
    generationConfig: { maxOutputTokens: 2048 },
  };

  function callGemini(withThinking) {
    const body = JSON.parse(JSON.stringify(baseBody));
    if (withThinking) body.generationConfig.thinkingConfig = { thinkingLevel };
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify(body),
    });
  }

  const useThinking = thinkingLevel !== "off" && thinkingLevel !== "";
  let upstream;
  try {
    upstream = await callGemini(useThinking);
    if (useThinking && upstream.status === 400) {
      // This model may not accept that thinking setting; log it and retry once without it.
      console.log("Gemini 400 with thinkingLevel, retrying without:", (await upstream.text()).slice(0, 300));
      upstream = await callGemini(false);
    }
  } catch {
    return json({ error: "network" }, 502);
  }

  if (upstream.status === 429) return json({ error: "rate_limited" }, 429);
  if (!upstream.ok || !upstream.body) {
    // Log details for you (visible in Cloudflare logs), but never send raw upstream errors to the browser.
    console.log("Gemini error", upstream.status, (await upstream.text()).slice(0, 500));
    return json({ error: "upstream_error" }, 502);
  }

  // From here on we answer with a stream of small events: {"t": "text piece"}, then {"done": true, used, limit}
  // (or {"e": "error_key"} if something fails midway).
  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const send = (obj) => writer.write(encoder.encode("data: " + JSON.stringify(obj) + "\n\n"));

  const pump = (async () => {
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let counted = false;
    let gotText = false;

    async function handleEvent(raw) {
      const dataLines = raw.split(/\r?\n/).filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim());
      if (!dataLines.length) return;
      let chunk;
      try { chunk = JSON.parse(dataLines.join("\n")); } catch { return; }
      const cand = chunk && chunk.candidates && chunk.candidates[0];
      const parts = cand && cand.content && cand.content.parts ? cand.content.parts : [];
      const text = parts.filter((p) => !p.thought).map((p) => p.text || "").join("");
      if (!text) return;
      if (!counted) {
        counted = true; // count the question once the first words of a real answer arrive
        try { await addUsage(env, user, usage); } catch (err) { console.log("addUsage failed", String(err)); }
      }
      gotText = true;
      await send({ t: text });
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let m;
        while ((m = /\r?\n\r?\n/.exec(buffer))) {
          const raw = buffer.slice(0, m.index);
          buffer = buffer.slice(m.index + m[0].length);
          await handleEvent(raw);
        }
      }
      if (buffer.trim()) await handleEvent(buffer);

      if (!gotText) await send({ e: "empty_reply" });
      else await send({ done: true, used: usage.used + 1, limit: usage.limit });
    } catch (err) {
      console.log("stream error", String(err));
      try { await send({ e: "network" }); } catch { /* browser already left */ }
      try { await reader.cancel(); } catch { /* ignore */ }
    } finally {
      try { await writer.close(); } catch { /* ignore */ }
    }
  })();

  // Keep the function alive until the whole answer has been sent.
  context.waitUntil(pump);

  return new Response(readable, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

// Any other method gets a clear answer instead of a confusing error.
export async function onRequest() {
  return json({ error: "method_not_allowed" }, 405);
}
