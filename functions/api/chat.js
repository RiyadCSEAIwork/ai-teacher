// Cloudflare Pages Function: POST /api/chat
import { isConfigured, verifySession, getUsage, addUsage } from "../../lib/auth.js";

const DEFAULT_MODEL = "gemini-3.6-flash";
const DEFAULT_THINKING_LEVEL = "low"; 
const MAX_MESSAGES = 20;       
const MAX_CHARS_PER_MESSAGE = 3000;

const ALLOWED_IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const MAX_IMAGE_BASE64_CHARS = 5500000;
// OPTIMIZATION: Only send the active current image to save Gemini free tier TPM quota
const DEFAULT_FALLBACK_MODELS = "gemini-3.8-flash,gemini-3.5-flash-lite";
const RETRY_STATUSES = [404, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524]; // 52x = Cloudflare/Google timeout errors
const THINKING_BUDGET = { minimal: 0, low: 1024, medium: 4096, high: 8192 }; // Gemini 2.5 এর জন্য
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// A request that sends nothing for ~100 s is cut by Cloudflare (error 524). So we wait at most
// FIRST_BYTE_TIMEOUT_MS for Gemini to start answering, then try the next model, and stop
// everything after TOTAL_BUDGET_MS so the student gets a clear message instead of a 524.
const DEFAULT_FIRST_BYTE_TIMEOUT_MS = 40000;
const TOTAL_BUDGET_MS = 88000;

const MAX_IMAGES_PER_REQUEST = 1;       
const DEFAULT_IMAGE_THINKING_LEVEL = "low"; 
const DEFAULT_MEDIA_RESOLUTION = "medium";       
const DEFAULT_IMAGE_QUESTION = {
  bn: "এই ছবিতে কী আছে মনোযোগ দিয়ে দেখে বুঝিয়ে দাও। প্রশ্ন থাকলে সমাধান করে দাও।",
  en: "Look carefully at this image and explain it. If it contains a question, solve it.",
};
const OLD_IMAGE_NOTE = { bn: "(আগে একটি ছবি পাঠানো হয়েছিল)", en: "(an image was sent earlier)" };

// DRAWING REQUESTS: when the student asks to draw / sketch / construct something,
// the model gets the precision rules below (and optionally a higher thinking level).
const DRAW_REGEX = /(আঁক|এঁক|আকো|আকুন|অঙ্কন|অংকন|চিত্র|ডায়াগ্রাম|নকশা|ছবি\s*(আঁক|এঁক|দাও|বানা)|draw|diagram|figure|sketch|construct)/i;
// "low" keeps drawing fast on the free tier. Set GEMINI_THINKING_LEVEL_DRAW=medium in Cloudflare for more accuracy (slower).
const DEFAULT_DRAW_THINKING_LEVEL = "low";
const DRAW_MAX_OUTPUT_TOKENS = 8192;

const SYSTEM_PROMPTS = {
  bn: `তুমি "AI Teacher" — উচ্চমাধ্যমিক (HSC), বোর্ড পরীক্ষা ও বিশ্ববিদ্যালয় ভর্তি পরীক্ষার (BUET, Medical, DU ইত্যাদি) জন্য একজন অত্যন্ত দক্ষ শিক্ষক।
- ভাষা: ব্যবহারকারী বাংলায় লিখলে বাংলায় উত্তর দাও। ইংরেজিতে লিখলে ইংরেজিতে দাও।

📌 বহুনির্বাচনি (MCQ) প্রশ্নের জন্য বাধ্যতামূলক নিয়ম:
প্রশ্নটি যদি কোনো বহুনির্বাচনি (MCQ) প্রশ্ন হয় (ছবিতে হোক বা লেখায়), তবে সাধারণ লেখার বদলে সবসময় হুবহু নিচের \`\`\`mcq ব্লকের কাঠামোতে উত্তর দেবে:

\`\`\`mcq
[QUESTION]
এখানে মূল প্রশ্নটি লিখবে (যেমন: বাক্যটিতে ব্যবহৃত ক্রিয়াপদটি—)

[OPTIONS]
ক) প্রথম অপশন
খ) দ্বিতীয় অপশন
*গ) তৃতীয় অপশন (সঠিক অপশনটির শুরুতে সবসময় একটি স্টার * চিহ্ন দেবে)
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

গাণিতিক ও সাধারণ বর্ণনামূলক প্রশ্নের জন্য নিয়ম:
- ৪-ধাপের কাঠামো: ১. 📌 সূত্র ও প্রদত্ত মান, ২. 📝 বিশদ সমাধান, ৩. ⚡ ভর্তি শর্টকাট, ৪. ⚠️ সতর্কতা।
- সূত্র LaTeX-এ: লাইনের ভেতরে $...$ এবং আলাদা লাইনে $$...$$। সূত্রের ভেতরে ইংরেজি সংখ্যা (0-9) ব্যবহার করো।`,

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

// Always added: which tool to use for which kind of picture.
const DIAGRAM_RULES = {
  bn: `

🎨 চিত্র আঁকার নিয়ম:
- ত্রিভুজ, চতুর্ভুজ, রম্বস, বৃত্ত, কোণ, সমান্তরাল রেখা, জ্যামিতিক অঙ্কন, বলের চিত্র, বর্তনী ও বিজ্ঞানের অন্যান্য চিত্র কখনো Mermaid দিয়ে আঁকবে না। এগুলোর জন্য শুধু \`\`\`svg কোড ব্লক ব্যবহার করবে।
- Mermaid (\`\`\`mermaid, \`flowchart TD\`) শুধু ফ্লোচার্ট, প্রক্রিয়ার ধাপ বা শ্রেণিবিভাগের জন্য।
- SVG-তে viewBox="0 0 400 300" ও xmlns="http://www.w3.org/2000/svg" দেবে। বিন্দুর নাম (A, B, C...) ও মাপ <text> দিয়ে লিখবে; সাধারণ টেক্সট ও ° চিহ্ন ব্যবহার করবে, LaTeX বা $ ব্যবহার করবে না। <script> বা বাইরের ছবি ব্যবহার করবে না। SVG অবশ্যই </svg> দিয়ে শেষ করবে এবং টেক্সটে & চিহ্নের বদলে &amp; লিখবে।
- চিত্রের আগে বা পরে সংক্ষেপে বৈশিষ্ট্যগুলো বুঝিয়ে লিখবে।`,

  en: `

🎨 Drawing rules:
- Never draw triangles, quadrilaterals, rhombi, circles, angles, parallel lines, geometric constructions, force diagrams, circuits or other science figures with Mermaid. Use only a \`\`\`svg code block for them.
- Use Mermaid (\`\`\`mermaid, \`flowchart TD\`) only for flowcharts, process steps or classifications.
- In SVG use viewBox="0 0 400 300" and xmlns="http://www.w3.org/2000/svg". Write point names (A, B, C...) and measurements with <text> using plain text and the ° sign; no LaTeX or $. No <script> or external images. Always end the SVG with </svg> and write &amp; instead of & inside text.
- Briefly explain the properties before or after the figure.`
};

// Added only when the student asks to draw something: accuracy rules.
const DRAW_PRECISION = {
  bn: `

📐 নির্ভুল চিত্রের নিয়ম (এই নিয়ম উত্তরে উল্লেখ করবে না):
- SVG কোডের শুরুতে একটি <!-- --> মন্তব্যে (পাঠক দেখবে না) আগে হিসাব লিখে নেবে: প্রতিটি বিন্দুর স্থানাঙ্ক, কোন বিন্দু কোন রেখা বা বৃত্তের ওপর আছে, কোন বাহু বা কোণ সমান। মন্তব্যটি ছোট রাখবে (সর্বোচ্চ ১২ লাইন) এবং তাতে দুটি হাইফেন পরপর (--) লিখবে না।
- যে বিন্দু কোনো রেখার ওপর থাকবে (যেমন A রেখা BG-র ওপর, H হলো দুই রেখার ছেদবিন্দু), তার স্থানাঙ্ক আন্দাজে বসাবে না; P = B + t(G − B) বা দুই রেখার ছেদ বের করার সূত্রে হিসাব করবে।
- ছবি বা বইয়ের পাতা দেখে আঁকলে ছবির প্রতিটি বিন্দু, রেখা, রশ্মি, চাপ (arc), সমান-চিহ্ন ও কোণ এক এক করে মিলিয়ে নেবে। কোনো বিন্দু বা রেখা বাদ দেবে না, কোণের মাপ ছবির মতো রাখবে, নামকরণ করা প্রতিটি বিন্দুতে ছোট গোল ডট দেবে।
- লেখা যেন রেখা, চাপ বা বিন্দুর গায়ে না লাগে (৮-১২ একক দূরে বসাবে) এবং ছবি যেন পুরো ক্যানভাস জুড়ে আঁকা হয়।
- আঁকার পর মনে মনে যাচাই করবে: সব বিন্দু ঠিক রেখার ওপর পড়েছে কি না, সমান বাহুগুলো সত্যিই সমান কি না, কোণগুলো ঠিক আছে কি না।
- SVG কোড ছোট রাখবে: পূর্ণসংখ্যার স্থানাঙ্ক ব্যবহার করবে এবং একই স্টাইল বারবার না লিখে <g stroke="..."> দিয়ে একবারে দেবে, যাতে উত্তর দ্রুত আসে।`,

  en: `

📐 Accuracy rules for figures (do not mention these rules in the answer):
- Start the SVG code with an <!-- --> comment (the reader will not see it) and first work out: the coordinates of every point, which point lies on which line or circle, which sides or angles are equal. Keep the comment short (at most 12 lines) and never write two hyphens in a row (--) inside it.
- A point that lies on a line (for example A on line BG, or H as the intersection of two lines) must not be placed by guesswork; compute it with P = B + t(G − B) or by finding the intersection of the two lines.
- When drawing from a picture or a textbook page, match every point, line, ray, arc, tick mark and angle one by one. Do not omit any point or line, keep angle sizes like the original, and put a small dot on every named point.
- Keep labels clear of lines, arcs and points (8-12 units away) and let the figure fill the whole canvas.
- After drawing, check: every point really lies on its line, equal sides are really equal, angles are right.
- Keep the SVG code short: use whole-number coordinates and set repeated styles once with <g stroke="..."> instead of on every element, so the answer arrives quickly.`
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
  // Is the student asking for a drawing? (checked on the student's own words, before any default text)
  const askedToDraw = DRAW_REGEX.test(lastMsg.text || "");
  if (!lastMsg.text) lastMsg.text = DEFAULT_IMAGE_QUESTION[lang];
  const hasImage = cleaned.some((m) => m.image);

  const primaryModel = (env.GEMINI_MODEL || DEFAULT_MODEL).trim();
  const fallbackModels = (env.GEMINI_FALLBACK_MODELS || DEFAULT_FALLBACK_MODELS)
    .split(",").map((s) => s.trim()).filter(Boolean);
  const MODEL_CHAIN = [primaryModel, ...fallbackModels.filter((m) => m !== primaryModel)];

  const isAdvancedLevel = classIdx === 5 || classIdx === 6 || classIdx === 7;
  let thinkingLevel = DEFAULT_THINKING_LEVEL;
  if (hasImage) {
    thinkingLevel = env.GEMINI_THINKING_LEVEL_IMAGE || DEFAULT_IMAGE_THINKING_LEVEL;
  } else if (isAdvancedLevel) {
    thinkingLevel = "low";
  } else if (env.GEMINI_THINKING_LEVEL) {
    thinkingLevel = env.GEMINI_THINKING_LEVEL;
  }
  // Drawing requests can use their own thinking level
  if (askedToDraw) {
    thinkingLevel = env.GEMINI_THINKING_LEVEL_DRAW || DEFAULT_DRAW_THINKING_LEVEL;
  }
  thinkingLevel = thinkingLevel.trim().toLowerCase();

  const mediaLevel = (env.GEMINI_MEDIA_RESOLUTION || DEFAULT_MEDIA_RESOLUTION).trim().toLowerCase();

  const contents = cleaned.map((m) => {
    const parts = [];
    if (m.text) parts.push({ text: m.text });
    if (m.image) parts.push({ inlineData: { mimeType: m.image.mime, data: m.image.data } });
    return { role: m.role === "assistant" ? "model" : "user", parts };
  });

  const baseConfig = {
    maxOutputTokens: askedToDraw ? DRAW_MAX_OUTPUT_TOKENS : ((hasImage || isAdvancedLevel) ? 4096 : 2500),
  };

  const systemText = SYSTEM_PROMPTS[lang] + DIAGRAM_RULES[lang] + (askedToDraw ? DRAW_PRECISION[lang] : "") + matchGuard;

  const FIRST_BYTE_TIMEOUT_MS = Number(env.GEMINI_FIRST_BYTE_TIMEOUT_MS) || DEFAULT_FIRST_BYTE_TIMEOUT_MS;

  function callGemini(model, withExtras, timeoutMs) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`;
    const generationConfig = Object.assign({}, baseConfig);
    if (withExtras) {
      if (thinkingLevel !== "off" && thinkingLevel !== "") {
        if (/^gemini-3/.test(model)) {
          generationConfig.thinkingConfig = { thinkingLevel };
        } else if (THINKING_BUDGET[thinkingLevel] !== undefined) {
          generationConfig.thinkingConfig = { thinkingBudget: THINKING_BUDGET[thinkingLevel] };
        }
      }
      if (hasImage && mediaLevel !== "off" && mediaLevel !== "") {
        generationConfig.mediaResolution = "MEDIA_RESOLUTION_" + mediaLevel.toUpperCase();
      }
    }
    // The timer only guards the wait for the first response; once Gemini starts, it is cleared.
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemText }] },
        contents,
        generationConfig,
      }),
      signal: ctrl.signal,
    })
      .catch((err) => {
        if (ctrl.signal.aborted) return new Response("timeout", { status: 524 });
        throw err;
      })
      .finally(() => clearTimeout(timer));
  }

  const startedAt = Date.now();
  const timeLeft = () => TOTAL_BUDGET_MS - (Date.now() - startedAt);
  let upstream = new Response("timeout", { status: 524 });
  try {
    outer:
    for (const model of MODEL_CHAIN) {
      for (let attempt = 0; attempt < 2; attempt++) {
        if (timeLeft() < 6000) break outer; // not enough time left for another try
        upstream = await callGemini(model, true, Math.min(FIRST_BYTE_TIMEOUT_MS, timeLeft() - 1500));
        if (upstream.status === 400 && timeLeft() > 6000) {
          upstream = await callGemini(model, false, Math.min(FIRST_BYTE_TIMEOUT_MS, timeLeft() - 1500));
        }
        if (upstream.ok || !RETRY_STATUSES.includes(upstream.status)) break outer;
        if (upstream.status === 524) break; // this model was too slow: go to the next model
        if (attempt === 0) await sleep(1200); // একই মডেলে একবার আবার চেষ্টা
      }
      // এই মডেল ব্যস্ত, লুপ পরের মডেলে যাবে
    }
  } catch (_err) {
    return json({ error: "network" }, 502);
  }

  if (upstream.status === 429) {
    return json({ error: "rate_limited" }, 429);
  }
  if (RETRY_STATUSES.includes(upstream.status)) {
    return json({ error: "busy" }, 503);
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
