# AI Teacher — ডেপ্লয় গাইড (GitHub + Cloudflare Pages)

## ফোল্ডারের গঠন

```
ai-teacher/
├── index.html
├── style.css
├── script.js
├── functions/
│   └── api/
│       └── chat.js      ← ব্যাকএন্ড (API key এখানেই ব্যবহার হয়)
└── DEPLOY.md
```

`functions/api/chat.js` ফাইলের পথ হুবহু এই রকম থাকতে হবে। Cloudflare এই পথ দেখেই `/api/chat` ঠিকানা বানায়।

## ধাপ ক: GitHub-এ আপলোড

1. GitHub-এ **New repository** চাপুন। নাম দিন `ai-teacher`, **Public** রাখলেও চলবে (API key কোডে নেই), **Create repository** চাপুন।
2. রিপোজিটরির পেজে **uploading an existing file** লিংকে যান।
3. `ai-teacher` ফোল্ডারের ভেতরের সব ফাইল ও `functions` ফোল্ডারটা টেনে এনে ছাড়ুন। `functions/api/chat.js` যেন ফোল্ডারসহ ওঠে, সেটা আপলোডের তালিকায় দেখে নিন।
4. **Commit changes** চাপুন।

## ধাপ খ: Cloudflare Pages-এ লাইভ করা

1. Cloudflare ড্যাশবোর্ডে **Workers & Pages** এ যান, তারপর **Create application**।
2. **Pages** অপশন বেছে **Connect to Git** চাপুন এবং GitHub অ্যাকাউন্ট যুক্ত করে `ai-teacher` রিপোজিটরি বাছুন।
3. বিল্ড সেটিংস:
   - Framework preset: **None**
   - Build command: **খালি রাখুন**
   - Build output directory: **`/`** (বা খালি)
4. **Save and Deploy** চাপুন। প্রথম ডেপ্লয় শেষ হলে `xxxx.pages.dev` ঠিকানা পাবেন।

## ধাপ গ: API key বসানো (সবচেয়ে জরুরি)

1. Cloudflare-এ আপনার Pages প্রজেক্ট খুলে **Settings** এ যান, তারপর **Variables and Secrets** (বা Environment variables)।
2. **Production** এনভায়রনমেন্টে যোগ করুন:
   - নাম: `GEMINI_API_KEY`, মান: আপনার Google AI Studio key, ধরন: **Secret**
   - (ঐচ্ছিক) নাম: `GEMINI_MODEL`, মান: `gemini-3.6-flash`
3. সেভ করার পর **Deployments** থেকে সর্বশেষ ডেপ্লয়টা **Retry deployment** করুন, নইলে নতুন ভ্যারিয়েবল কাজ করবে না।

মডেলের ফ্রি লিমিট কম মনে হলে `GEMINI_MODEL` এর মান `gemini-3.5-flash-lite` করে আবার ডেপ্লয় করুন। কোডে হাত দিতে হবে না।

## ধাপ ঘ: পরীক্ষা

`xxxx.pages.dev` খুলে একটা প্রশ্ন করুন। উত্তর না এলে নিচের টেবিল দেখুন।

| সমস্যা | সম্ভাব্য কারণ |
|---|---|
| "সার্ভার এখনো ঠিকমতো সেট করা হয়নি" | `GEMINI_API_KEY` বসানো হয়নি, অথবা বসানোর পর রিডেপ্লয় করা হয়নি |
| "দুঃখিত, উত্তর আনতে সমস্যা হয়েছে" | key ভুল, অথবা `GEMINI_MODEL` এর নাম ভুল। Cloudflare-এ Functions এর লগ দেখুন |
| "অনেক অনুরোধ এসেছে" | ফ্রি টিয়ারের মিনিট/দিনের সীমা পেরিয়েছে। অপেক্ষা করুন বা `gemini-3.5-flash-lite` ব্যবহার করুন |
| `/api/chat` এ 404 | `functions/api/chat.js` ভুল পথে আপলোড হয়েছে |

## নিরাপত্তা নোট

- API key কখনো কোডে, GitHub-এ বা কারো সাথে চ্যাটে শেয়ার করবেন না। শেয়ার করে ফেললে AI Studio থেকে key মুছে নতুন বানান।
- ফ্রি টিয়ারে পাঠানো প্রশ্ন Google মডেল উন্নত করতে ব্যবহার করতে পারে। ব্যবহারকারীদের ব্যক্তিগত তথ্য লিখতে নিরুৎসাহিত করুন।
- সাইট পাবলিক হলে যে কেউ আপনার কোটা ব্যবহার করতে পারে। পরবর্তী ধাপে আমরা রেট-লিমিট যোগ করব।
