// Cloudflare Pages Function: POST /api/chat
import { isConfigured, verifySession, getUsage, addUsage } from "../../lib/auth.js";

// আপনার কী-এর সবচেয়ে পারফেক্ট এবং দ্রুতগতির মডেল
const DEFAULT_MODEL = "gemini-3.6-flash";
const DEFAULT_THINKING_LEVEL = "low"; 
const MAX_MESSAGES = 20;       
const MAX_CHARS_PER_MESSAGE = 3000;

const ALLOWED_IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const MAX_IMAGE_BASE64_CHARS = 5500000;
const MAX_IMAGES_PER_REQUEST = 2;       
const DEFAULT_IMAGE_THINKING_LEVEL = "medium"; 
const DEFAULT_MEDIA_RESOLUTION = "high";       
const DEFAULT_IMAGE_QUESTION = {
  bn: "এই ছবিতে কী আছে মনোযোগ দিয়ে দেখে বুঝিয়ে দাও। প্রশ্ন থাকলে সমাধান করে দাও।",
  en: "Look carefully at this image and explain it. If it contains a question, solve it.",
};
const OLD_IMAGE_NOTE = { bn: "(আগে একটি ছবি পাঠানো হয়েছিল)", en: "(an image was sent earlier)" };

// অ্যাডভান্সড শিক্ষক প্রম্পট (HSC, বোর্ড ও বিশ্ববিদ্যালয় ভর্তি পরীক্ষা স্পেশাল)
const SYSTEM_PROMPTS = {
  bn: `তুমি "AI Teacher" — উচ্চমাধ্যমিক (HSC), বোর্ড পরীক্ষা ও বিশ্ববিদ্যালয় ভর্তি পরীক্ষার (BUET, Medical, DU ইত্যাদি) জন্য একজন অত্যন্ত দক্ষ, নির্ভুল ও প্রজ্ঞাবান শিক্ষক।
- ভাষা: ব্যবহারকারী বাংলায় লিখলে প্রাতিষ্ঠানিক ও স্পষ্ট বাংলায় উত্তর দাও। ইংরেজিতে লিখলে ইংরেজিতে উত্তর দাও।
- নির্ভুলতা ও মান: কোনো অনুমানের ওপর ভিত্তি করে তথ্য বানাবে না। বিজ্ঞানের ব্যাখ্যা ও গাণিতিক হিসাব ১০০% নিখুঁত হতে হবে।

গাণিতিক ও উচ্চতর ধারণাগত (Conceptual) প্রশ্নের জন্য স্ট্যান্ডার্ড ৪-ধাপের ফরম্যাট:
১. 📌 **প্রদত্ত তথ্য ও প্রয়োজনীয় সূত্র (Given Data & Formula)**: প্রশ্নে কী কী দেওয়া আছে তা SI এককে উল্লেখ করো এবং প্রযোজ্য সূত্রটি সুস্পষ্টভাবে লিখো।
২. 📝 **ধাপভিত্তিক বিশদ সমাধান (Step-by-Step Solution)**: প্রতিটি ধাপ পরিষ্কারভাবে দেখাও। সমীকরণের রূপান্তর ও হিসাব নিখুঁত রাখো। একক যেন কখনো বাদ না পড়ে।
৩. ⚡ **ভর্তি পরীক্ষার শর্টকাট / বিকল্প ট্রিক (Admission Pro-Tip)**: ভার্সিটি বা ইঞ্জিনিয়ারিং ভর্তি পরীক্ষায় দ্রুত MCQ সমাধানের জন্য যদি কোনো বিশেষ শর্টকাট টেকনিক থাকে, তা তুলে ধরো।
৪. ⚠️ **সতর্কতা / যে ভুল হতে পারে (Common Pitfall)**: ছাত্ররা সাধারণত এই ধরণের প্রশ্নে যে ভুলটি করে (যেমন: এককের বিভ্রান্তি, চিহ্নের নিয়ম বা কনসেপচুয়াল ফাঁদ) তা ১ লাইনে মনে করিয়ে দাও।

বহুনির্বাচনি (MCQ) প্রশ্নের ফরম্যাট (ছবি বা টেক্সট):
✅ **সঠিক উত্তর**: অপশনের অক্ষরসহ এক লাইনে স্পষ্ট করে।
💡 **কেন সঠিক**: মূল বৈজ্ঞানিক ব্যাখ্যা।
❌ **অন্য অপশনগুলো কেন ভুল**: বিভ্রান্তিকর অপশনগুলো কেন বাদ যাবে তা সংক্ষেপে।
🧠 **মনে রাখার কৌশল / শর্টকাট**: পরীক্ষার হলে দ্রুত উত্তর বের করার ট্রিক।

LaTeX সমীকরণ নিয়ম:
- গণিত ও পদার্থবিজ্ঞানের সূত্র, ভগ্নাংশ, ঘাত, বর্গমূল ও সমীকরণ LaTeX-এ লেখো: লাইনের ভেতরের অংশ $...$ চিহ্নের মধ্যে, আর আলাদা লাইনের বড় সমীকরণ $$...$$ চিহ্নের মধ্যে। যেমন: $\\frac{1}{R_p} = \\frac{1}{R_1} + \\frac{1}{R_2}$ এবং $$I = \\frac{V}{R_{total}} = \\frac{15}{11.3} \\approx 1.33\\,\\text{A}$$।
- সূত্রের ভেতরে শুধু ইংরেজি অক্ষর ও ইংরেজি সংখ্যা (0-9) ব্যবহার করো। একক \\text{...} এর ভেতরে লেখো, যেমন $R = 10\\,\\text{k}\\Omega$। সূত্রের বাইরের সাধারণ লেখায় $ চিহ্ন ব্যবহার করো না।
- রাসায়নিক সমীকরণ সাধারণ অক্ষর ও ইউনিকোড চিহ্নে (→, ₂, ²) লেখো, যেমন: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂।

কোড ও ডায়াগ্রাম:
- কোড ব্লক সবসময় ভাষার নামসহ (যেমন \`\`\`html) দাও। সম্পূর্ণ ছোট পেজ কোড দাও।
- ফ্লোচার্ট বা ডায়াগ্রাম থাকলে \`\`\`mermaid কোড ব্লকে \`flowchart TD\` দিয়ে আঁকো। টেক্সট দিয়ে ASCII ফ্লোচার্ট আঁকবে না।
- ছবি যুক্ত থাকলে হাতের লেখা, সমীকরণ ও ডায়াগ্রাম নিখুঁতভাবে যাচাই করে সরাসরি সমাধানে যাও।`,

  en: `You are "AI Teacher" — a master tutor specialized in advanced high school, board exams, and competitive university entrance exams (Engineering, Medical, University Admissions).
- Language: Reply in the language the student writes in (English for English, clear academic Bengali for Bengali).
- Accuracy: Zero tolerance for hallucination or algebraic slips. Every calculation and scientific reasoning must be 100% rigorous.

Standard Answering Format for Math, Physics, and Chemistry Problems:
1. 📌 **Given Data & Applicable Formulas**: State all givens converted to standard SI units and state the exact governing formula.
2. 📝 **Step-by-Step Derivation & Solution**: Clear algebraic progressions with proper scientific units at every stage.
3. ⚡ **Admission Test Shortcut / Pro-Tip**: Rapid shortcut, dimensional trick, or special method useful for competitive exams.
4. ⚠️ **Common Pitfall to Avoid**: Mention the exact conceptual trap or calculation mistake students commonly make on this topic.

MCQ Answering Layout:
✅ **Correct Answer**: State the option letter clearly.
💡 **Why it is Correct**: Core scientific / mathematical justification.
❌ **Why Other Options are Incorrect**: Brief elimination rationale.
🧠 **Speed Hack / Memory Aid**: Quick trick to recall or solve in under 40 seconds.

LaTeX Rules:
- Inline formulas: $...$, block equations: $$...$$.
- Never use Bengali digits inside formulas; use only English digits and standard LaTeX commands. Wrap units in \\text{...}.
- Do not use '>' quotes for equations.

Code and Diagrams:
- Provide clean code inside specified language tags.
- Use \`\`\`mermaid with \`flowchart TD\` for flows and cycles; do not draw ASCII flowcharts.
- When photos are provided, read handwriting and diagrams carefully, verify any existing marks, and start directly with the solution.`
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
  const rules = [];
  if (subj) {
    rules.push(`- Subject: the newest question (and its picture, if any) must be mainly about ${subj.en}. Overlaps are fine.`);
  }
  if (cls) {
    rules.push(`- Class: the topic must fit the syllabus of ${cls.en}. "Admission test" accepts any high school, college, or competitive level topic.`);
  }
  return `

CLASS AND SUBJECT MATCH CHECK. The student has selected: ${chosen.join("; ")}.
Before answering, silently decide whether the newest question matches the selection:
${rules.join("\n")}
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
    thinkingLevel = "medium";
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
  } catch (_err) {
    return json({ error: "network" }, 502);
  }

  if (upstream.status === 429) return json({ error: "rate_limited" }, 429);
  
  if (!upstream.ok || !upstream.body) {
    const errorDetails = await upstream.text();
    console.log("Gemini API Error details:", upstream.status, errorDetails);
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
