// Cloudflare Pages Function: POST /api/chat
import { isConfigured, verifySession, getUsage, addUsage } from "../../lib/auth.js";

const DEFAULT_MODEL = "gemini-3.6-flash";
const DEFAULT_THINKING_LEVEL = "low"; 
const MAX_MESSAGES = 20;       
const MAX_CHARS_PER_MESSAGE = 3000;

const ALLOWED_IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const MAX_IMAGE_BASE64_CHARS = 5500000;
// OPTIMIZATION: Only send the active current image to save Gemini free tier TPM quota
const MAX_IMAGES_PER_REQUEST = 1;       
const DEFAULT_IMAGE_THINKING_LEVEL = "low"; 
const DEFAULT_MEDIA_RESOLUTION = "medium";       
const DEFAULT_IMAGE_QUESTION = {
  bn: "এই ছবিতে কী আছে মনোযোগ দিয়ে দেখে বুঝিয়ে দাও। প্রশ্ন থাকলে সমাধান করে দাও।",
  en: "Look carefully at this image and explain it. If it contains a question, solve it.",
};
const OLD_IMAGE_NOTE = { bn: "(আগে একটি ছবি পাঠানো হয়েছিল)", en: "(an image was sent earlier)" };

const SYSTEM_PROMPTS = {
  bn: `তুমি "AI Teacher" — উচ্চমাধ্যমিক (HSC), বোর্ড পরীক্ষা ও বিশ্ববিদ্যালয় ভর্তি পরীক্ষার (BUET, Medical, DU ইত্যাদি) জন্য একজন অত্যন্ত দক্ষ শিক্ষক।
- ভাষা: ব্যবহারকারী বাংলায় লিখলে বাংলায় উত্তর দাও। ইংরেজিতে লিখলে ইংরেজিতে দাও।

📌 বহুনির্বাচনি (MCQ) প্রশ্নের জন্য বাধ্যতামূলক নিয়ম:
প্রশ্নটি যদি কোনো বহুনির্বাচনি (MCQ) প্রশ্ন হয় (ছবিতে হোক বা লেখায়), তবে সাধারণ লেখার বদলে সবসময় হুবহু নিচের \`\`\`mcq ব্লকের কাঠামোতে উত্তর দেবে:

\`\`\`mcq
[QUESTION]
এখানে মূল প্রশ্নটি লিখবে (যেমন: বাক্যটিতে ব্যবহৃত ক্রিয়াপদটি—)

[OPTIONS]
ক) প্রথম অপশন
খ) দ্বিতীয় অপশন
*গ) তৃতীয় অপশন (সঠিক অপশনটির শুরুতে সবসময় একটি স্টার * চিহ্ন দেবে)
ঘ) চতুর্থ অপশন

[EXPLANATION]
এখানে সঠিক উত্তরের সহজ ও প্রাতিষ্ঠানিক বিশদ বৈজ্ঞানিক ব্যাখ্যা লিখবে।

[WHY_WRONG]
- ক) কেন ভুল তার কারণ
- খ) কেন ভুল তার কারণ
- ঘ) কেন ভুল তার কারণ

[TRICK]
মনে রাখার শর্টকাট বা টেকনিক (যদি থাকে)
\`\`\`

⚠️ [TRICK] অংশ সবসময় খুব ছোট হবে: সর্বোচ্চ ১-২টি ছোট লাইন। এখানে কখনো টেবিল, ছক, চার্ট, হেডিং (###) বা --- দেবে না।
📊 ব্যবহারকারী "চার্ট আকারে", "ছক করে" বা "টেবিল আকারে" বুঝাতে বললে: আগের মতো ছোট \`\`\`mcq ব্লক দাও, তারপর ব্লক বন্ধ (\`\`\`) করার পরে আলাদা করে একটি সুন্দর মার্কডাউন টেবিল দাও (প্রথমে হেডার সারি, তারপর | :--- | :--- | বিভাজক সারি, তারপর ডেটা সারি)। টেবিল কখনো \`\`\`mcq ব্লকের ভেতরে বা [TRICK]-এ লিখবে না।

গাণিতিক ও সাধারণ বর্ণনামূলক প্রশ্নের জন্য নিয়ম:
- ৪-ধাপের কাঠামো: ১. 📌 সূত্র ও প্রদত্ত মান, ২. 📝 বিশদ সমাধান, ৩. ⚡ ভর্তি শর্টকাট, ৪. ⚠️ সতর্কতা।
- সূত্র LaTeX-এ: লাইনের ভেতরে $...$ এবং আলাদা লাইনে $$...$$। সূত্রের ভেতরে ইংরেজি সংখ্যা (0-9) ব্যবহার করো।
- ফ্লোচার্ট \`\`\`mermaid ব্লকে \`flowchart TD\` দিয়ে আঁকো।`,

  en: `You are "AI Teacher" — an expert academic tutor for high school and university entrance exams.
- Reply in the language requested.

📌 Mandatory Rule for Multiple Choice Questions (MCQ):
Whenever an MCQ question is given (from text or photo), you MUST format your answer exclusively in the following \`\`\`mcq code block:

\`\`\`mcq
[QUESTION]
The exact question text here

[OPTIONS]
A) First option
B) Second option
*C) Third option (Add an asterisk * right in front of the correct option)
D) Fourth option

[EXPLANATION]
Detailed and scientific explanation of why this answer is correct.

[WHY_WRONG]
- A) Explanation of why this is wrong
- B) Explanation of why this is wrong
- D) Explanation of why this is wrong

[TRICK]
Memory shortcut or speed hack (if applicable)
\`\`\`

⚠️ Keep [TRICK] very short: at most 1-2 short lines. Never put a table, chart, heading (###) or --- inside it.
📊 If the user asks for a chart / table / comparison: give the usual short \`\`\`mcq block, close it with \`\`\`, and THEN write a separate markdown table after the block (header row, then the | :--- | :--- | separator row, then data rows). Never put the table inside the \`\`\`mcq block or [TRICK].

For regular math or descriptive questions:
- Use standard 4-step layout (Givens, Solution, Admission Trick, Pitfall).
- Write math equations in LaTeX ($...$ and $$...$$).`
};

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
  return `

CLASS AND SUBJECT MATCH CHECK. The student selected: ${chosen.join("; ")}.
- Greetings, thanks, and follow-ups always match.
- If it matches: answer normally according to the advanced standard format.
- If it does NOT match: reply starting with exactly ${MISMATCH_MARKER} and politely explain which subject or class it belongs to.`;
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
  } catch (_e) {
    return json({ error: "bad_request" }, 400);
  }

  const lang = payload && payload.lang === "en" ? "en" : "bn";
  const classIdx = payload && Number.isInteger(payload.cls) ? payload.cls : null;
  const matchGuard = buildMatchGuard(
    lang,
    payload && typeof payload.subject === "string" ? payload.subject : "",
    classIdx
  );
  const incoming = Array.isArray(payload && payload.messages) ? payload.messages : [];

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

  // Keep only the most recent image in context to save tokens and prevent 429
  let imagesLeft = MAX_IMAGES_PER_REQUEST;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    if (!cleaned[i].image) continue;
    if (imagesLeft > 0) { imagesLeft--; continue; }
    cleaned[i].image = null;
    if (!cleaned[i].text) cleaned[i].text = OLD_IMAGE_NOTE[lang];
  }

  while (cleaned.length && cleaned[0].role !== "user") cleaned.shift();
  if (!cleaned.length || cleaned[cleaned.length - 1].role !== "user") {
    return json({ error: "bad_request" }, 400);
  }

  const lastMsg = cleaned[cleaned.length - 1];
  if (!lastMsg.text) lastMsg.text = DEFAULT_IMAGE_QUESTION[lang];
  const hasImage = cleaned.some((m) => m.image);

  const model = (env.GEMINI_MODEL || DEFAULT_MODEL).trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`;

  const isAdvancedLevel = classIdx === 5 || classIdx === 6 || classIdx === 7;
  let thinkingLevel = DEFAULT_THINKING_LEVEL;
  if (hasImage) {
    thinkingLevel = env.GEMINI_THINKING_LEVEL_IMAGE || DEFAULT_IMAGE_THINKING_LEVEL;
  } else if (isAdvancedLevel) {
    thinkingLevel = "low";
  } else if (env.GEMINI_THINKING_LEVEL) {
    thinkingLevel = env.GEMINI_THINKING_LEVEL;
  }
  thinkingLevel = thinkingLevel.trim().toLowerCase();

  const mediaLevel = (env.GEMINI_MEDIA_RESOLUTION || DEFAULT_MEDIA_RESOLUTION).trim().toLowerCase();

  const contents = cleaned.map((m) => {
    const parts = [];
    if (m.text) parts.push({ text: m.text });
    if (m.image) parts.push({ inlineData: { mimeType: m.image.mime, data: m.image.data } });
    return { role: m.role === "assistant" ? "model" : "user", parts };
  });

  const baseConfig = { maxOutputTokens: (hasImage || isAdvancedLevel) ? 4096 : 2500 };

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
      upstream = await callGemini(false);
    }
    // AUTO-RETRY ON 429: If Gemini bursts, wait 2 seconds and retry with lighter config
    if (upstream.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      upstream = await callGemini(false);
    }
  } catch (_err) {
    return json({ error: "network" }, 502);
  }

  if (upstream.status === 429) {
    return json({ error: "rate_limited" }, 429);
  }
  
  if (!upstream.ok || !upstream.body) {
    const errorDetails = await upstream.text();
    let msg = errorDetails;
    try {
      const parsed = JSON.parse(errorDetails);
      msg = parsed.error && parsed.error.message ? parsed.error.message : errorDetails;
    } catch (_e) {}
    return json({ error: "upstream_error", detail: "Google Error (" + upstream.status + "): " + msg }, 502);
  }

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
    let head = "";
    let decided = !matchGuard;
    let mismatch = false;

    async function emit(text) {
      if (!text) return;
      if (!counted && !mismatch) {
        counted = true;
        try { await addUsage(env, user, usage); } catch (err) { console.log("addUsage failed", String(err)); }
      }
      gotText = true;
      await send({ t: text });
    }

    async function onText(text) {
      if (decided) return emit(text);
      head += text;
      if (head.length < MISMATCH_MARKER.length && MISMATCH_MARKER.startsWith(head.trimStart())) return;
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
      try { chunk = JSON.parse(dataLines.join("\n")); } catch (_e) { return; }
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
    } catch (_err) {
      try { await send({ e: "network" }); } catch (_e) {}
      try { await reader.cancel(); } catch (_e) {}
    } finally {
      try { await writer.close(); } catch (_e) {}
    }
  })();

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

export async function onRequest() {
  return json({ error: "method_not_allowed" }, 405);
}
