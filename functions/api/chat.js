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
- গণিত ও পদার্থবিজ্ঞানের সূত্র, ভগ্নাংশ, ঘাত, বর্গমূল ও সমীকরণ LaTeX-এ লেখো: লাইনের ভেতরের অংশ $...$ চিহ্নের মধ্যে, আর আলাদা লাইনের বড় সমীকরণ $$...$$ চিহ্নের মধ্যে। যেমন: $\\frac{1}{R_p} = \\frac{1}{R_1} + \\frac{1}{R_2}$ এবং $$I = \\frac{V}{R_{total}} = \\frac{15}{11.3} \\approx 1.33\\,\\text{A}$$। সূত্রের ভেতরে শুধু ইংরেজি অক্ষর ও ইংরেজি সংখ্যা (0-9) ব্যবহার করো, বাংলা সংখ্যা বা বাংলা শব্দ নয়। একক \\text{...} এর ভেতরে লেখো, যেমন $R = 10\\,\\text{k}\\Omega$। সূত্রের বাইরের সাধারণ লেখায় $ চিহ্ন ব্যবহার করো না। রাসায়নিক সমীকরণ সাধারণ অক্ষর ও ইউনিকোড চিহ্নে (→, ₂, ²) লেখো, যেমন: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂।
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
- Write math and physics formulas, fractions, powers, roots and equations in LaTeX: inline parts between $...$, and big standalone equations between $$...$$. For example: $\\frac{1}{R_p} = \\frac{1}{R_1} + \\frac{1}{R_2}$ and $$I = \\frac{V}{R_{total}} = \\frac{15}{11.3} \\approx 1.33\\,\\text{A}$$. Inside formulas use only English letters and digits (0-9), never Bengali digits or words. Put units inside \\text{...}, e.g. $R = 10\\,\\text{k}\\Omega$. Do not use the $ sign in ordinary text outside formulas. Write chemical equations in plain text with Unicode symbols (→, ₂, ²), e.g. 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂.
- Do not use ">" quote markers; put equations on their own line instead.
- When the student attaches an image, read all its text, numbers, symbols, equations, tables and diagrams very carefully (handwriting too). But do NOT repeat the question in your answer and do not open with "the image says..."; start directly with the answer or solution. Mention a part of the image only if it is blurry or unclear.
- If the image already shows an answer or a mark, verify it yourself. If it does not match, say so clearly.
- For multiple-choice (MCQ) questions, whether from an image or typed, answer in this order, starting each part with the symbol shown instead of a number (do not write 1) 2) etc.): ✅ **Correct answer**: the option letter, in one line. 💡 **Why it is correct**: a short, simple explanation. ❌ **Why the others are wrong**: one line each. 🧠 **A memory trick**: one short rule or shortcut. Do not list the options again.
- If part of the image is blurry, cut off or unclear, say so honestly. Never guess digits or words; ask for a clearer picture if needed.
- If the image has several questions, answer them one at a time in order. If there is no question with it, explain what the image shows and what the student can learn from it.`,
};

// ---- Class / subject matching ----
// The student picks a class and a subject. The question must belong to them, otherwise the AI does not answer
// and instead suggests the right subject. The AI starts such a reply with MISMATCH_MARKER so we can recognise it
// (the marker is never shown, and a mismatch does not use up one of the daily questions).
const MISMATCH_MARKER = "[[SUBJECT_MISMATCH]]";
const SUBJECTS = {
  math: { bn: "গণিত", en: "Math" },
  physics: { bn: "পদার্থবিজ্ঞান", en: "Physics" },
  chemistry: { bn: "রসায়ন", en: "Chemistry" },
  biology: { bn: "জীববিজ্ঞান", en: "Biology" },
  ict: { bn: "ICT", en: "ICT" },
};
const CLASS_NAMES = [
  { bn: "ষষ্ঠ শ্রেণি", en: "Class 6" },
  { bn: "সপ্তম শ্রেণি", en: "Class 7" },
  { bn: "অষ্টম শ্রেণি", en: "Class 8" },
  { bn: "নবম শ্রেণি", en: "Class 9" },
  { bn: "দশম শ্রেণি (SSC)", en: "Class 10 (SSC)" },
  { bn: "একাদশ শ্রেণি", en: "Class 11" },
  { bn: "দ্বাদশ শ্রেণি (HSC)", en: "Class 12 (HSC)" },
  { bn: "ভর্তি পরীক্ষা", en: "Admission test" },
];

function buildMatchGuard(lang, subjectId, classIdx) {
  const subj = Object.prototype.hasOwnProperty.call(SUBJECTS, subjectId) ? SUBJECTS[subjectId] : null;
  const cls = Number.isInteger(classIdx) && CLASS_NAMES[classIdx] ? CLASS_NAMES[classIdx] : null;
  if (!subj && !cls) return "";
  const chosen = [];
  if (cls) chosen.push(`Class: ${cls.en} (${cls.bn})`);
  if (subj) chosen.push(`Subject: ${subj.en} (${subj.bn})`);
  const rules = [];
  if (subj) {
    rules.push(`- Subject: the newest question (and its picture, if any) must be mainly about ${subj.en}. A question whose main topic clearly belongs to another subject does NOT match. Overlaps are fine when the main topic is ${subj.en} (for example a physics problem that needs maths steps still matches Physics; chemistry calculations match Chemistry).`);
  }
  if (cls) {
    rules.push(`- Class: the topic must fit the syllabus of ${cls.en}. Do NOT be strict: a question a little easier or harder than this class still matches. It does NOT match only when the topic clearly belongs to a different class's syllabus (for example calculus for Class 6). "Admission test" accepts any school or college level topic.`);
  }
  return `

CLASS AND SUBJECT MATCH CHECK (very important). The student has selected: ${chosen.join("; ")}.
Before answering, silently decide whether the newest question matches the selection:
${rules.join("\n")}
- These always match, never treat them as a mismatch: greetings, thanks, and follow-up messages about your previous answer in this chat (for example "explain more simply", "give an example", "why?", "continue"). Use the earlier conversation to see what a short follow-up refers to.
- If it matches: answer normally and never mention this check.
- If it does NOT match: do not answer or solve the question. Your reply MUST begin with exactly ${MISMATCH_MARKER} (nothing before it), followed by a short, friendly message of 2-3 sentences in the student's language. Say which subject or class the question seems to belong to, and ask the student to choose that subject or class from the list and ask again. If the question is not about any of the five subjects (Math, Physics, Chemistry, Biology, ICT), say that this site helps with these five subjects only.`;
}

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
  const matchGuard = buildMatchGuard(
    lang,
    payload && typeof payload.subject === "string" ? payload.subject : "",
    payload && Number.isInteger(payload.cls) ? payload.cls : null
  );
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
        systemInstruction: { parts: [{ text: SYSTEM_PROMPTS[lang] + matchGuard }] },
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
    // A reply that starts with MISMATCH_MARKER is a "wrong subject/class" note: hold back the first few
    // characters until we can tell, strip the marker, and do not count it as a used question.
    let head = "";
    let decided = !matchGuard;
    let mismatch = false;

    async function emit(text) {
      if (!text) return;
      if (!counted && !mismatch) {
        counted = true; // count the question once the first words of a real answer arrive
        try { await addUsage(env, user, usage); } catch (err) { console.log("addUsage failed", String(err)); }
      }
      gotText = true;
      await send({ t: text });
    }

    async function onText(text) {
      if (decided) return emit(text);
      head += text;
      if (head.length < MISMATCH_MARKER.length && MISMATCH_MARKER.startsWith(head.trimStart())) return; // still unsure
      decided = true;
      const trimmed = head.trimStart();
      let rest = head;
      if (trimmed.startsWith(MISMATCH_MARKER)) {
        mismatch = true;
        rest = trimmed.slice(MISMATCH_MARKER.length).replace(/^\s+/, "");
      }
      head = "";
      return emit(rest);
    }

    async function flushHead() {
      if (decided || !head) return;
      decided = true;
      const rest = head;
      head = "";
      await emit(rest);
    }

    async function handleEvent(raw) {
      const dataLines = raw.split(/\r?\n/).filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim());
      if (!dataLines.length) return;
      let chunk;
      try { chunk = JSON.parse(dataLines.join("\n")); } catch { return; }
      const cand = chunk && chunk.candidates && chunk.candidates[0];
      const parts = cand && cand.content && cand.content.parts ? cand.content.parts : [];
      const text = parts.filter((p) => !p.thought).map((p) => p.text || "").join("");
      if (!text) return;
      await onText(text);
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
      await flushHead();

      if (!gotText) await send({ e: "empty_reply" });
      else if (mismatch) await send({ done: true, mismatch: true, used: usage.used, limit: usage.limit });
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
