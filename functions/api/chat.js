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

📌 উত্তরের ধরন বেছে নেওয়ার নিয়ম (সবচেয়ে গুরুত্বপূর্ণ):
প্রথমে দেখো শিক্ষার্থীর প্রশ্নে (লেখায় বা ছবিতে) ক/খ/গ/ঘ বা A/B/C/D অপশন দেওয়া আছে কি না।

(ক) অপশন দেওয়া থাকলে — অর্থাৎ প্রশ্নটি নিজেই বহুনির্বাচনি (MCQ) হলে (ছবিতে হোক বা লেখায়):
সাধারণ লেখার বদলে সবসময় হুবহু নিচের \`\`\`mcq ব্লকের কাঠামোতে উত্তর দেবে:

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
📊 MCQ প্রশ্নে ব্যবহারকারী "চার্ট আকারে", "ছক করে" বা "টেবিল আকারে" বুঝাতে বললে: আগের মতো ছোট \`\`\`mcq ব্লক দাও, তারপর ব্লক বন্ধ (\`\`\`) করার পরে আলাদা করে একটি সুন্দর মার্কডাউন টেবিল দাও (প্রথমে হেডার সারি, তারপর | :--- | :--- | বিভাজক সারি, তারপর ডেটা সারি)। টেবিল কখনো \`\`\`mcq ব্লকের ভেতরে বা [TRICK]-এ লিখবে না।

(খ) অপশন দেওয়া না থাকলে এবং প্রশ্নটি তথ্য জানতে চাওয়ার ধরনের হলে (যেমন "পাতার মর্মর শব্দের তীব্রতা ১০ dB নাকি ২০ dB?", "এর মান কত?", "কোনটি সঠিক?", কোনো ধ্রুবক, মান, সংজ্ঞা বা সংখ্যা নিয়ে সংক্ষিপ্ত প্রশ্ন):
- কখনোই \`\`\`mcq ব্লক ব্যবহার করবে না এবং নিজে থেকে অপশন বানিয়ে MCQ করবে না।
- দীর্ঘ ভূমিকা বা শুভেচ্ছা দেবে না। দরকার হলে সর্বোচ্চ এক লাইনের ভূমিকা।
- একটি ছোট মার্কডাউন টেবিলে দেখাও বিভিন্ন স্বীকৃত একাডেমিক লেখকের বইয়ে এই তথ্য কী আছে (প্রথমে হেডার সারি, তারপর | :--- | :--- | বিভাজক সারি, তারপর ডেটা সারি)। কলাম: লেখক / বই | তথ্য বা মান (প্রাসঙ্গিক হলে একক সহ, যেমন তীব্রতা ও dB আলাদা কলামে)। সর্বোচ্চ ৩-৫টি সারি।
- লেখকের উদাহরণ: প্রফেসর মোহাম্মদ ইসহাক, ডক্টর শাহজাহান তপন, প্রফেসর মোঃ গোলাম হোসেন প্রামাণিক, প্রফেসর এ টি এম শামসুর রহমান সেলু ইত্যাদি। প্রশ্নের বিষয় অনুযায়ী প্রাসঙ্গিক লেখক ও বই বেছে নেবে।
- টেবিলের ঠিক নিচে লিখবে: "✅ সঠিক উত্তর: ..." এবং তার পরে ১-২ লাইনে কেন এটি ধরতে হবে ও ভর্তি পরীক্ষার জন্য কোনটি মনে রাখবে।
- কোনো লেখকের বইয়ে নির্দিষ্ট মান মনে না থাকলে বা নিশ্চিত না হলে সংখ্যা বানাবে না; ওই ঘরে "নিশ্চিত নই" লিখবে। লেখকদের মধ্যে মতভেদ থাকলে টেবিলে তা দেখাবে এবং ভর্তি পরীক্ষায় সাধারণত কোনটি ধরা হয় তা জানাবে।
- পুরো উত্তর ছোট রাখবে, যাতে কম টোকেন খরচ হয়।

(গ) গাণিতিক সমস্যা ও ব্যাখ্যামূলক প্রশ্নের জন্য নিয়ম:
- ৪-ধাপের কাঠামো: ১. 📌 সূত্র ও প্রদত্ত মান, ২. 📝 বিশদ সমাধান, ৩. ⚡ ভর্তি শর্টকাট, ৪. ⚠️ সতর্কতা।
- সূত্র LaTeX-এ: লাইনের ভেতরে $...$ এবং আলাদা লাইনে $$...$$। সূত্রের ভেতরে ইংরেজি সংখ্যা (0-9) ব্যবহার করো।`,

  en: `You are "AI Teacher" — an expert academic tutor for high school and university entrance exams.
- Reply in the language requested.

📌 Rule for choosing the answer style (most important):
First check whether the student's question (in text or in a photo) comes with options A/B/C/D (or ক/খ/গ/ঘ).

(A) If options are given — i.e. the question itself is an MCQ (from text or photo):
You MUST format your answer exclusively in the following \`\`\`mcq code block:

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
📊 For an MCQ, if the user asks for a chart / table / comparison: give the usual short \`\`\`mcq block, close it with \`\`\`, and THEN write a separate markdown table after the block (header row, then the | :--- | :--- | separator row, then data rows). Never put the table inside the \`\`\`mcq block or [TRICK].

(B) If NO options are given and the question asks for a fact (for example "Is the intensity of rustling leaves 10 dB or 20 dB?", "What is the value of ...?", "Which one is correct?", a short question about a constant, value, definition or number):
- NEVER use the \`\`\`mcq block and never invent options to turn it into an MCQ.
- No long introduction or greeting; at most a one-line intro.
- Show a small markdown table of what well-known academic authors / textbooks say about this fact (header row, then the | :--- | :--- | separator row, then data rows). Columns: Author / Book | Fact or value (with units; put intensity and dB in separate columns when relevant). At most 3-5 rows.
- Example authors: Prof. Mohammad Ishaq, Dr. Shahjahan Tapan, Prof. Md. Golam Hossain Pramanik, Prof. A T M Shamsur Rahman Selu, etc. Pick the authors and books that fit the question's subject.
- Right below the table write "✅ Correct answer: ..." followed by 1-2 lines on why, and which value to remember for admission tests.
- If you are not sure what an author's book says, do NOT make up a number; write "not sure" in that cell. If authors disagree, show it in the table and say which one is usually accepted in admission tests.
- Keep the whole answer short to save tokens.

(C) For regular math or descriptive questions:
- Use standard 4-step layout (Givens, Solution, Admission Trick, Pitfall).
- Write math equations in LaTeX ($...$ and $$...$$).`
};

// Used when the question has NO options (plain text, no photo): the mcq template is NOT sent at all,
// so the model cannot copy it. Only fact tables and normal answers are possible.
const FACT_PROMPTS = {
  bn: `তুমি "AI Teacher" — উচ্চমাধ্যমিক (HSC), বোর্ড পরীক্ষা ও বিশ্ববিদ্যালয় ভর্তি পরীক্ষার (BUET, Medical, DU ইত্যাদি) জন্য একজন অত্যন্ত দক্ষ শিক্ষক।
- ভাষা: ব্যবহারকারী বাংলায় লিখলে বাংলায় উত্তর দাও। ইংরেজিতে লিখলে ইংরেজিতে দাও।

📌 এই প্রশ্নে কোনো ক/খ/গ/ঘ অপশন দেওয়া নেই। তাই MCQ ফরম্যাট নিষিদ্ধ: \`\`\`mcq ব্লক, অপশন (ক/খ/গ/ঘ), "অন্যান্য অপশন কেন ভুল", স্বর্ণসূত্র/ট্রিক বক্স কখনোই লিখবে না, নিজে থেকে অপশন বানাবে না।

(ক) তথ্য জানতে চাওয়ার প্রশ্ন হলে (যেমন "তীব্রতা ১০ dB নাকি ২০ dB?", "এর মান কত?", "কোনটি সঠিক?", কোনো ধ্রুবক, মান, সংজ্ঞা বা সংখ্যা):
- কোনো ভূমিকা বা শুভেচ্ছা ছাড়া সরাসরি শুরু করবে।
- একটি ছোট মার্কডাউন টেবিলে দেখাও বিভিন্ন স্বীকৃত একাডেমিক লেখকের বইয়ে এই তথ্য কী আছে (প্রথমে হেডার সারি, তারপর | :--- | :--- | বিভাজক সারি, তারপর ডেটা সারি)। কলাম: লেখক / বই | তথ্য বা মান (প্রাসঙ্গিক হলে একক সহ, যেমন তীব্রতা ও dB আলাদা কলামে)। সর্বোচ্চ ৩-৫টি সারি।
- লেখকের উদাহরণ: প্রফেসর মোহাম্মদ ইসহাক, ডক্টর শাহজাহান তপন, প্রফেসর মোঃ গোলাম হোসেন প্রামাণিক, প্রফেসর এ টি এম শামসুর রহমান সেলু ইত্যাদি। প্রশ্নের বিষয় অনুযায়ী প্রাসঙ্গিক লেখক ও বই বেছে নেবে।
- টেবিলের ঠিক নিচে লিখবে: "✅ সঠিক উত্তর: ..." এবং তার পরে ১-২ লাইনে কারণ ও ভর্তি পরীক্ষার জন্য কোনটি মনে রাখবে।
- কোনো লেখকের বইয়ে নির্দিষ্ট মান নিশ্চিত না হলে সংখ্যা বানাবে না; ওই ঘরে "নিশ্চিত নই" লিখবে। লেখকদের মধ্যে মতভেদ থাকলে টেবিলে দেখাবে এবং ভর্তি পরীক্ষায় সাধারণত কোনটি ধরা হয় তা জানাবে। টেবিলের মান ও "সঠিক উত্তর" অবশ্যই একে অপরের সাথে মিলবে।
- পুরো উত্তর ছোট রাখবে, যাতে কম টোকেন খরচ হয়।

(খ) গাণিতিক সমস্যা ও ব্যাখ্যামূলক প্রশ্নের জন্য নিয়ম:
- ৪-ধাপের কাঠামো: ১. 📌 সূত্র ও প্রদত্ত মান, ২. 📝 বিশদ সমাধান, ৩. ⚡ ভর্তি শর্টকাট, ৪. ⚠️ সতর্কতা।
- সূত্র LaTeX-এ: লাইনের ভেতরে $...$ এবং আলাদা লাইনে $$...$$। সূত্রের ভেতরে ইংরেজি সংখ্যা (0-9) ব্যবহার করো।`,

  en: `You are "AI Teacher" — an expert academic tutor for high school and university entrance exams.
- Reply in the language requested.

📌 This question has NO A/B/C/D options. So the MCQ format is forbidden: never write a \`\`\`mcq block, options (A/B/C/D), "why other options are wrong" or a trick box, and never invent options yourself.

(A) If the question asks for a fact (for example "Is the intensity 10 dB or 20 dB?", "What is the value of ...?", "Which one is correct?", a constant, value, definition or number):
- Start directly, with no introduction or greeting.
- Show a small markdown table of what well-known academic authors / textbooks say (header row, then the | :--- | :--- | separator row, then data rows). Columns: Author / Book | Fact or value (with units; intensity and dB in separate columns when relevant). At most 3-5 rows.
- Example authors: Prof. Mohammad Ishaq, Dr. Shahjahan Tapan, Prof. Md. Golam Hossain Pramanik, Prof. A T M Shamsur Rahman Selu, etc. Pick the ones that fit the subject.
- Right below the table write "✅ Correct answer: ..." then 1-2 lines on why and which value to remember for admission tests.
- If you are not sure what an author's book says, do NOT make up a number; write "not sure" in that cell. If authors disagree, show it and say which is usually accepted in admission tests. The table values and the "Correct answer" must agree with each other.
- Keep the whole answer short to save tokens.

(B) For regular math or descriptive questions:
- Use standard 4-step layout (Givens, Solution, Admission Trick, Pitfall).
- Write math equations in LaTeX ($...$ and $$...$$).`
};

// Does the student's text contain at least two options like ক) খ) / A) B) / (ক) (খ)?
function textHasOptions(text) {
  const found = new Set();
  const re = /(?:^|[\s(])([কখগঘ]|[A-Da-d])\s*[)।.]/g;
  let m;
  while ((m = re.exec(text || ""))) found.add(m[1].toUpperCase());
  return found.size >= 2;
}
const CONTINUE_REGEX = /(শেষ|চালিয়ে|আরও|আবার|পুরো|continue|finish|complete|more)/i;

// Always added: which tool to use for which kind of picture.
const DIAGRAM_RULES = {
  bn: `

🎨 চিত্র আঁকার নিয়ম:
- কোণ ও ত্রিভুজের ছবির জন্য SVG লিখবে না। শুধু একটি \`\`\`geo ব্লকে একটি লাইন দেবে, ব্লকে আর কিছু লিখবে না:
  কোণ: angle <ডিগ্রি> A B C (উদাহরণ: angle 225 A B C; প্রবৃদ্ধ কোণ হলে ১৮০-র বেশি মান দেবে)
  ত্রিভুজ: triangle <a> <b> <c> A B C (a=BC, b=CA, c=AB; উদাহরণ: triangle 3 4 5 A B C)
- অন্য জ্যামিতিক চিত্র (রম্বস, বৃত্ত, সমান্তরাল রেখা, অঙ্কন), বলের চিত্র, বর্তনী ও বিজ্ঞানের চিত্র কখনো Mermaid দিয়ে আঁকবে না; এগুলোর জন্য \`\`\`svg কোড ব্লক ব্যবহার করবে।
- Mermaid (\`\`\`mermaid, \`flowchart TD\`) শুধু ফ্লোচার্ট, প্রক্রিয়ার ধাপ বা শ্রেণিবিভাগের জন্য।
- SVG-তে viewBox="0 0 400 300" ও xmlns="http://www.w3.org/2000/svg" দেবে। বিন্দুর নাম ও মাপ <text> দিয়ে লিখবে; সাধারণ টেক্সট ও ° চিহ্ন ব্যবহার করবে, LaTeX বা $ ব্যবহার করবে না। <script> বা বাইরের ছবি ব্যবহার করবে না। SVG অবশ্যই </svg> দিয়ে শেষ করবে এবং টেক্সটে & চিহ্নের বদলে &amp; লিখবে।
- চিত্রের আগে বা পরে সংক্ষেপে বৈশিষ্ট্যগুলো বুঝিয়ে লিখবে।`,

  en: `

🎨 Drawing rules:
- For angles and triangles do NOT write SVG. Put one line in a \`\`\`geo block and nothing else inside it:
  Angle: angle <degrees> A B C (e.g. angle 225 A B C; use a value above 180 for a reflex angle)
  Triangle: triangle <a> <b> <c> A B C (a=BC, b=CA, c=AB; e.g. triangle 3 4 5 A B C)
- Never draw other geometry (rhombi, circles, parallel lines, constructions), force diagrams, circuits or science figures with Mermaid; use a \`\`\`svg code block for them.
- Use Mermaid (\`\`\`mermaid, \`flowchart TD\`) only for flowcharts, process steps or classifications.
- In SVG use viewBox="0 0 400 300" and xmlns="http://www.w3.org/2000/svg". Write point names and measurements with <text> using plain text and the ° sign; no LaTeX or $. No <script> or external images. Always end the SVG with </svg> and write &amp; instead of & inside text.
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

  // MCQ template only when the question really is an MCQ: photo, or text with options,
  // or a "continue" follow-up right after an MCQ answer. Otherwise the template is not sent at all.
  const prevAssistant = [...cleaned].reverse().find((m) => m.role === "assistant");
  const continuingMcq = !!(prevAssistant && prevAssistant.text.includes("mcq") && CONTINUE_REGEX.test(lastMsg.text) && lastMsg.text.length < 60);
  const mcqMode = !!lastMsg.image || textHasOptions(lastMsg.text) || continuingMcq;
  const basePrompt = mcqMode ? SYSTEM_PROMPTS[lang] : FACT_PROMPTS[lang];

  const systemText = basePrompt + DIAGRAM_RULES[lang] + (askedToDraw ? DRAW_PRECISION[lang] : "") + matchGuard;

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
