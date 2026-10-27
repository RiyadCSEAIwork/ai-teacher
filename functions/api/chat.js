// Cloudflare Pages Function: POST /api/chat
// The Gemini API key lives only here (as an environment variable), never in the browser.

import { isConfigured, verifySession, getUsage, addUsage } from "../../lib/auth.js";

const DEFAULT_MODEL = "gemini-3.6-flash";
const DEFAULT_THINKING_LEVEL = "low"; // faster first words; "medium" is the model default
const MAX_MESSAGES = 20;       // how many recent messages we accept
const MAX_CHARS_PER_MESSAGE = 3000;

// Image upload limits. The browser already shrinks photos before sending, so these are just a safety net.
const ALLOWED_IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const MAX_IMAGE_BASE64_CHARS = 5500000; // about 4 MB of image data per picture
const MAX_IMAGES_PER_REQUEST = 2;       // only the newest pictures are sent, older ones are dropped
const DEFAULT_IMAGE_THINKING_LEVEL = "medium"; // reading a picture carefully is worth a little more thinking
const DEFAULT_MEDIA_RESOLUTION = "high";       // lets the model see fine print and handwriting
const DEFAULT_IMAGE_QUESTION = {
  bn: "এই ছবিতে কী আছে মনোযোগ দিয়ে দেখে বুঝিয়ে দাও। প্রশ্ন থাকলে সমাধান করে দাও।",
  en: "Look carefully at this image and explain it. If it contains a question, solve it.",
};
const OLD_IMAGE_NOTE = { bn: "(আগে একটি ছবি পাঠানো হয়েছিল)", en: "(an image was sent earlier)" };

const SYSTEM_PROMPTS = {
  bn: `তুমি "AI Teacher" — একজন ধৈর্যশীল, বন্ধুসুলভ শিক্ষক।
- ব্যবহারকারী বাংলায় লিখলে সহজ, স্পষ্ট বাংলায় উত্তর দাও। ইংরেজিতে লিখলে ইংরেজিতে উত্তর দাও।
- কঠিন বিষয় ধাপে ধাপে বোঝাও, দরকার হলে ছোট উদাহরণ দাও।
- গণিত বা যুক্তির প্রশ্নে সমাধানের ধাপগুলো দেখাও, শুধু চূড়ান্ত উত্তর নয়।
- নিশ্চিত না হলে সেটা সৎভাবে বলো, অনুমান করে তথ্য বানিয়ে বোলো না।
- উত্তর সংক্ষিপ্ত ও গোছানো রাখো। শেষে প্রয়োজন হলে একটা ছোট প্রশ্ন করে বুঝে নেওয়ার সুযোগ দাও।
- চিকিৎসা, আইন বা আর্থিক বিষয়ে সাধারণ শিক্ষামূলক ব্যাখ্যা দাও এবং বিশেষজ্ঞের পরামর্শ নিতে বলো।
- গাণিতিক বা রাসায়নিক লেখায় LaTeX বা ডলার ($) চিহ্ন ব্যবহার করবে না। সাধারণ অক্ষর ও ইউনিকোড চিহ্ন (→, ×, ², ₂, √) ব্যবহার করো, যেমন: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂।
- উদ্ধৃতি চিহ্ন (>) ব্যবহার না করে সমীকরণ আলাদা লাইনে লেখো।
- ব্যবহারকারী ছবি দিলে তার লেখা, সংখ্যা, চিহ্ন, সমীকরণ, টেবিল ও ডায়াগ্রাম খুব মনোযোগ দিয়ে পড়ো (হাতের লেখা হলেও)। কিন্তু প্রশ্নটা উত্তরে আবার লিখে দেখিয়ো না এবং "ছবিতে এই লেখা আছে" ধরনের ভূমিকাও দিয়ো না; সরাসরি উত্তর বা সমাধান দিয়ে শুরু করো। শুধু কোনো অংশ ঝাপসা বা অস্পষ্ট হলে সেই অংশটুকুর কথা বলো।
- ছবিতে উত্তর বা দাগ দেওয়া থাকলেও নিজে যাচাই করে নাও। না মিললে সেটা পরিষ্কার জানাও।
- বহুনির্বাচনি (MCQ) প্রশ্ন হলে (ছবির হোক বা লেখা) এই ক্রমে উত্তর দাও, প্রতিটি অংশের শুরুতে নম্বরের বদলে নিচের চিহ্ন ব্যবহার করো (১), ২) ইত্যাদি লিখো না): ✅ **সঠিক উত্তর**: অপশনের অক্ষরসহ এক লাইনে। 💡 **কেন সঠিক**: সহজ ভাষায় ছোট ব্যাখ্যা। ❌ **বাকি অপশন কেন ভুল**: প্রতিটি এক লাইনে। 🧠 **মনে রাখার কৌশল**: একটা ছোট সূত্র বা উপায়। অপশনের তালিকা আবার লিখো না।
- ছবির কোনো অংশ ঝাপসা, কাটা বা অস্পষ্ট হলে সেটা সৎভাবে বলো। অনুমান করে সংখ্যা বা শব্দ বসিয়ো না। দরকার হলে আরও স্পষ্ট ছবি দিতে বলো।
- ছবিতে একাধিক প্রশ্ন থাকলে ক্রমানুসারে একটা একটা করে উত্তর দাও। সাথে কোনো প্রশ্ন না থাকলে ছবিতে কী আছে তা ব্যাখ্যা করো এবং পড়াশোনার দিক থেকে কী শেখার আছে তা বলো।`,
  en: `You are "AI Teacher", a patient and friendly tutor.
- Reply in the language the student writes in: English for English, simple clear Bengali (বাংলা) for Bengali.
- Explain hard topics step by step and use short examples when they help.
- For math or reasoning questions, show the solution steps, not just the final answer.
- If you are not sure, say so honestly; never invent facts.
- Keep answers concise and well organized. When useful, end with a short question to check understanding.
- For medical, legal or financial topics, give general educational explanations and suggest consulting a professional.
- Do not use LaTeX or dollar signs ($) for math or chemistry. Use plain text and Unicode symbols (→, ×, ², ₂, √), e.g. 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂.
- Do not use ">" quote markers; put equations on their own line instead.
- When the student attaches an image, read all its text, numbers, symbols, equations, tables and diagrams very carefully (handwriting too). But do NOT repeat the question in your answer and do not open with "the image says..."; start directly with the answer or solution. Mention a part of the image only if it is blurry or unclear.
- If the image already shows an answer or a mark, verify it yourself. If it does not match, say so clearly.
- For multiple-choice (MCQ) questions, whether from an image or typed, answer in this order, starting each part with the symbol shown instead of a number (do not write 1) 2) etc.): ✅ **Correct answer**: the option letter, in one line. 💡 **Why it is correct**: a short, simple explanation. ❌ **Why the others are wrong**: one line each. 🧠 **A memory trick**: one short rule or shortcut. Do not list the options again.
- If part of the image is blurry, cut off or unclear, say so honestly. Never guess digits or words; ask for a clearer picture if needed.
- If the image has several questions, answer them one at a time in order. If there is no question with it, explain what the image shows and what the student can learn from it.`,
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

  // Keep only valid user/assistant messages, trim size, keep the most recent ones.
  // A user message may carry one picture: { mime, data } where data is base64 without the "data:" prefix.
  let badImage = false;
  const cleaned = incoming
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.text === "string")
    .map((m) => {
      let image = null;
      if (m.image) {
        const img = m.image;
        const ok = m.role === "user" && typeof img.mime === "string" && typeof img.data === "string"
          && ALLOWED_IMAGE_MIMES.has(img.mime) && img.data.length > 0
          && img.data.length <= MAX_IMAGE_BASE64_CHARS && /^[A-Za-z0-9+/]+={0,2}$/.test(img.data);
        if (ok) image = { mime: img.mime, data: img.data };
        else badImage = true;
      }
      return { role: m.role, text: m.text.trim().slice(0, MAX_CHARS_PER_MESSAGE), image };
    })
    .filter((m) => m.text.length > 0 || m.image)
    .slice(-MAX_MESSAGES);

  if (badImage) return json({ error: "bad_image" }, 400);

  // Send only the newest pictures; for older ones keep just a short note so the chat still makes sense.
  let imagesLeft = MAX_IMAGES_PER_REQUEST;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    if (!cleaned[i].image) continue;
    if (imagesLeft > 0) { imagesLeft--; continue; }
    cleaned[i].image = null;
    if (!cleaned[i].text) cleaned[i].text = OLD_IMAGE_NOTE[lang];
  }

  // The conversation must start with and end on a user message.
  while (cleaned.length && cleaned[0].role !== "user") cleaned.shift();
  if (!cleaned.length || cleaned[cleaned.length - 1].role !== "user") {
    return json({ error: "bad_request" }, 400);
  }

  // A picture sent without any words still gets a sensible question.
  const lastMsg = cleaned[cleaned.length - 1];
  if (!lastMsg.text) lastMsg.text = DEFAULT_IMAGE_QUESTION[lang];
  const hasImage = cleaned.some((m) => m.image);

  const model = (env.GEMINI_MODEL || DEFAULT_MODEL).trim();
  // alt=sse makes Gemini send the answer piece by piece instead of all at once.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`;

  // Lower "thinking" makes the first words arrive much sooner. Set GEMINI_THINKING_LEVEL
  // (minimal | low | medium | high) in Cloudflare to change it, or "off" to leave the model default.
  // Questions with a picture use GEMINI_THINKING_LEVEL_IMAGE (default "medium") for more careful reading.
  const thinkingLevel = (hasImage
    ? (env.GEMINI_THINKING_LEVEL_IMAGE || DEFAULT_IMAGE_THINKING_LEVEL)
    : (env.GEMINI_THINKING_LEVEL || DEFAULT_THINKING_LEVEL)).trim().toLowerCase();

  // GEMINI_MEDIA_RESOLUTION (low | medium | high | off) controls how much detail the model takes from a picture.
  const mediaLevel = (env.GEMINI_MEDIA_RESOLUTION || DEFAULT_MEDIA_RESOLUTION).trim().toLowerCase();

  const contents = cleaned.map((m) => {
    // Words first, then the picture (Google's advice for one image plus a question).
    const parts = [];
    if (m.text) parts.push({ text: m.text });
    if (m.image) parts.push({ inlineData: { mimeType: m.image.mime, data: m.image.data } });
    return { role: m.role === "assistant" ? "model" : "user", parts };
  });

  // Picture answers need more room because thinking tokens count towards the limit too.
  const baseConfig = { maxOutputTokens: hasImage ? 4096 : 2048 };

  function callGemini(withExtras) {
    const generationConfig = Object.assign({}, baseConfig);
    if (withExtras) {
      if (thinkingLevel !== "off" && thinkingLevel !== "") generationConfig.thinkingConfig = { thinkingLevel };
      if (hasImage && mediaLevel !== "off" && mediaLevel !== "") {
        generationConfig.mediaResolution = "MEDIA_RESOLUTION_" + mediaLevel.toUpperCase();
      }
    }
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPTS[lang] }] },
        contents,
        generationConfig,
      }),
    });
  }

  let upstream;
  try {
    upstream = await callGemini(true);
    if (upstream.status === 400) {
      // The model may not accept the thinking or picture-detail setting; log it and retry once without them.
      console.log("Gemini 400 with extra settings, retrying without:", (await upstream.text()).slice(0, 300));
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
