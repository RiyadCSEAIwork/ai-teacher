(function () {
  "use strict";

  var TEXT = {
    bn: {
      tagline: "প্রশ্ন করুন, সহজ ভাষায় বুঝে নিন",
      placeholder: "এখানে আপনার প্রশ্ন লিখুন…",
      followPlaceholder: "উত্তর নিয়ে আরও কিছু জানতে চাইলে এখানে লিখুন…",
      send: "পাঠান",
      newChat: "নতুন চ্যাট",
      logout: "লগআউট",
      note: "AI ভুল করতে পারে, গুরুত্বপূর্ণ তথ্য যাচাই করে নিন।",
      welcome: "আসসালামু আলাইকুম! আমি AI Teacher। যেকোনো বিষয়ে প্রশ্ন করো, আমি ধাপে ধাপে বুঝিয়ে দেব।",
      thinking: "ভাবছি",
      attach: "গ্যালারি থেকে ছবি দিন",
      removeImage: "ছবি সরান",
      imageReading: "ছবি প্রস্তুত হচ্ছে…",
      imageOnly: "(ছবি)",
      copy: "কপি",
      copied: "কপি হয়েছে",
      historyBtn: "পূর্ববর্তী আলোচনা",
      navHome: "হোম",
      navAsk: "প্রশ্ন করুন",
      heroTitle1: "পড়াশোনা হোক আরও সহজ ও স্মার্ট",
      heroSub: "যে কোনো বিষয়ে আপনার প্রশ্ন করুন, AI দেবে সহজ ও নির্ভুল উত্তর।",
      homePlaceholder: "আপনার প্রশ্ন লিখুন…",
      homeAsk: "প্রশ্ন করুন",
      askTitle: "প্রশ্ন করুন",
      answerTitle: "AI-এর উত্তর",
      addImage: "ছবি যোগ করুন",
      getAnswer: "উত্তর দেখুন",
      meLabel: "আমি",
      aiLabel: "AI Teacher",
      today: "আজ",
      yesterday: "গতকাল",
      secondsUnit: "সেকেন্ড",
      classLabel: "শ্রেণি নির্বাচন",
      subjectLabel: "বিষয় নির্বাচন",
      classes: ["ষষ্ঠ শ্রেণি", "সপ্তম শ্রেণি", "অষ্টম শ্রেণি", "নবম শ্রেণি", "দশম শ্রেণি (SSC)", "একাদশ শ্রেণি", "দ্বাদশ শ্রেণি (HSC)", "ভর্তি পরীক্ষা"],
      subjects: { math: "গণিত", physics: "পদার্থবিজ্ঞান", chemistry: "রসায়ন", biology: "জীববিজ্ঞান", ict: "ICT" },
      context: function (cls, subj) {
        var parts = [];
        if (cls) parts.push("শ্রেণি: " + cls);
        if (subj) parts.push("বিষয়: " + subj);
        return "[প্রসঙ্গ — " + parts.join("; ") + "। এই স্তর অনুযায়ী উত্তর দাও, প্রসঙ্গটা উত্তরে আবার লিখো না।]\n";
      },
      defaultImageQuestion: "এই ছবিতে কী আছে মনোযোগ দিয়ে দেখে বুঝিয়ে দাও। প্রশ্ন থাকলে সমাধান করে দাও।",
      historyTitle: "চ্যাটের ইতিহাস",
      noChats: "এখনো কোনো চ্যাট সেভ হয়নি।",
      loadingChats: "লোড হচ্ছে…",
      deleteChat: "চ্যাট মুছুন",
      deleteAsk: "এই চ্যাটটা মুছে ফেলবেন?",
      untitled: "চ্যাট",
      followups: ["আরও সহজ করে বলো", "একটা উদাহরণ দাও", "আমাকে একটা প্রশ্ন করো"],
      usage: function (user, used, limit) { return user + " · আজ " + used + "/" + limit + " প্রশ্ন"; },
      loginTitle: "লগইন করুন",
      loginOpen: "লগইন",
      loginHint: "শুধু অনুমোদিত সদস্যদের জন্য। আপনার নাম ও অ্যাক্সেস কোড দিন।",
      nameLabel: "নাম",
      codeLabel: "অ্যাক্সেস কোড",
      loginBtn: "প্রবেশ করুন",
      loggingIn: "অপেক্ষা করুন…",
      suggestions: [
        "সালোকসংশ্লেষণ কী?",
        "দ্বিঘাত সমীকরণ কীভাবে সমাধান করব?",
        "Explain Newton's laws simply",
        "ইংরেজিতে Present Perfect Tense বুঝিয়ে দাও"
      ],
      errors: {
        rate_limited: "এই মুহূর্তে অনেক অনুরোধ এসেছে। এক মিনিট পরে আবার চেষ্টা করুন।",
        network: "ইন্টারনেট সংযোগে সমস্যা হচ্ছে। সংযোগ দেখে আবার চেষ্টা করুন।",
        server_not_configured: "সার্ভার এখনো ঠিকমতো সেট করা হয়নি (লগইন বা সংরক্ষণের সেটিং বাকি)।",
        invalid_login: "নাম বা অ্যাক্সেস কোড ভুল।",
        too_many_attempts: "অনেকবার ভুল চেষ্টা হয়েছে। এক ঘণ্টা পরে আবার চেষ্টা করুন।",
        unauthorized: "লগইনের মেয়াদ শেষ। আবার লগইন করুন।",
        daily_limit: "আজকের প্রশ্নের সীমা শেষ। কাল আবার চেষ্টা করুন।",
        global_limit: "আজকের জন্য সাইটের মোট সীমা শেষ। কাল আবার চেষ্টা করুন।",
        bad_image: "ছবিটা পাঠানো যায়নি। অন্য একটা ছবি দিয়ে আবার চেষ্টা করুন।",
        image_type: "এই ধরনের ফাইল চলবে না। JPG, PNG, WebP, GIF বা HEIC ছবি দিন।",
        image_too_big: "ছবিটা অনেক বড় (সর্বোচ্চ ২০ MB)। ছোট একটা ছবি দিন।",
        image_failed: "ছবিটা খুলতে পারিনি। অন্য ছবি বা JPG/PNG ফরম্যাটে চেষ্টা করুন।",
        history_not_configured: "ইতিহাস সংরক্ষণ এখনো চালু করা হয়নি (Cloudflare-এ D1 ডাটাবেস যুক্ত করা বাকি)।",
        history_failed: "ইতিহাস লোড করতে সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।",
        generic: "দুঃখিত, উত্তর আনতে সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।"
      }
    },
    en: {
      tagline: "Ask a question and learn step by step",
      placeholder: "Type your question here…",
      followPlaceholder: "Ask a follow-up question…",
      send: "Send",
      newChat: "New chat",
      logout: "Log out",
      note: "AI can make mistakes. Please double-check important information.",
      welcome: "Hi! I'm AI Teacher. Ask me anything and I'll explain it step by step. You can write in English or বাংলা.",
      thinking: "Thinking",
      attach: "Add a picture from your gallery",
      removeImage: "Remove picture",
      imageReading: "Preparing picture…",
      imageOnly: "(picture)",
      copy: "Copy",
      copied: "Copied",
      historyBtn: "History",
      navHome: "Home",
      navAsk: "Ask Question",
      heroTitle1: "Ask a question,",
      heroTitle2: "get an answer",
      heroSub: "Ask about any subject and the AI gives a simple, accurate answer.",
      homePlaceholder: "Type your question…",
      homeAsk: "Ask",
      askTitle: "Ask a question",
      answerTitle: "AI's answer",
      addImage: "Add picture",
      getAnswer: "Get answer",
      meLabel: "Me",
      aiLabel: "AI Teacher",
      today: "Today",
      yesterday: "Yesterday",
      secondsUnit: "s",
      classLabel: "Choose class",
      subjectLabel: "Choose subject",
      classes: ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10 (SSC)", "Class 11", "Class 12 (HSC)", "Admission test"],
      subjects: { math: "Math", physics: "Physics", chemistry: "Chemistry", biology: "Biology", ict: "ICT" },
      context: function (cls, subj) {
        var parts = [];
        if (cls) parts.push("Class: " + cls);
        if (subj) parts.push("Subject: " + subj);
        return "[Context — " + parts.join("; ") + ". Answer at this level and do not repeat this context in your reply.]\n";
      },
      defaultImageQuestion: "Look carefully at this image and explain it. If it contains a question, solve it.",
      historyTitle: "Chat history",
      noChats: "No saved chats yet.",
      loadingChats: "Loading…",
      deleteChat: "Delete chat",
      deleteAsk: "Delete this chat?",
      untitled: "Chat",
      followups: ["Explain it more simply", "Give me an example", "Quiz me on this"],
      usage: function (user, used, limit) { return user + " · " + used + "/" + limit + " questions today"; },
      loginTitle: "Log in",
      loginOpen: "Log in",
      loginHint: "For approved members only. Enter your name and access code.",
      nameLabel: "Name",
      codeLabel: "Access code",
      loginBtn: "Enter",
      loggingIn: "Please wait…",
      suggestions: [
        "What is photosynthesis?",
        "How do I solve a quadratic equation?",
        "নিউটনের গতিসূত্র সহজ করে বলো",
        "Explain the present perfect tense"
      ],
      errors: {
        rate_limited: "Too many requests right now. Please wait a minute and try again.",
        network: "Network problem. Check your connection and try again.",
        server_not_configured: "The server isn't fully set up yet (login or storage setting missing).",
        invalid_login: "Wrong name or access code.",
        too_many_attempts: "Too many failed attempts. Please try again in an hour.",
        unauthorized: "Your login has expired. Please log in again.",
        daily_limit: "You've used all of today's questions. Please try again tomorrow.",
        global_limit: "The site's total limit for today has been reached. Please try again tomorrow.",
        bad_image: "The picture couldn't be sent. Please try a different picture.",
        image_type: "That file type isn't supported. Please choose a JPG, PNG, WebP, GIF or HEIC picture.",
        image_too_big: "That picture is too large (max 20 MB). Please choose a smaller one.",
        image_failed: "Couldn't open that picture. Try another one, or a JPG/PNG version.",
        history_not_configured: "Chat history isn't switched on yet (the D1 database still needs to be connected in Cloudflare).",
        history_failed: "Couldn't load the chat history. Please try again shortly.",
        generic: "Sorry, something went wrong getting the answer. Please try again shortly."
      }
    }
  };

  var MAX_HISTORY = 12;

  // Picture settings. Photos are shrunk in the browser first so uploads are quick and fit the server limits.
  var MAX_IMAGE_FILE_BYTES = 20 * 1024 * 1024; // refuse files above 20 MB before even opening them
  var MAX_IMAGE_SIDE = 2048;                    // longest side in pixels; keeps small print readable
  var MAX_IMAGE_BASE64 = 5000000;               // must stay under the server's 5.5 million limit
  var KEEP_IMAGES_IN_REQUEST = 2;               // only the newest pictures are sent along with the chat
  var IMAGE_EXT = /\.(jpe?g|png|webp|gif|heic|heif)$/i;

  var appEl = document.getElementById("app");
  var chatEl = document.getElementById("chat");
  var formEl = document.getElementById("form");
  var inputEl = document.getElementById("input");
  var sendEl = document.getElementById("send");
  var newChatEl = document.getElementById("new-chat");
  var logoutEl = document.getElementById("logout");
  var usageEl = document.getElementById("usage");
  var suggestionsEl = document.getElementById("suggestions");
  var noteEl = document.getElementById("note");
  var langBn = document.getElementById("lang-bn");
  var langEn = document.getElementById("lang-en");
  var attachEl = document.getElementById("attach");
  var fileEl = document.getElementById("file");
  var previewEl = document.getElementById("preview");
  var previewImgEl = document.getElementById("preview-img");
  var previewStatusEl = document.getElementById("preview-status");
  var previewNameEl = document.getElementById("preview-name");
  var previewRemoveEl = document.getElementById("preview-remove");

  var historyBtn = document.getElementById("history-btn");
  var drawerEl = document.getElementById("drawer");
  var backdropEl = document.getElementById("backdrop");
  var drawerTitleEl = document.getElementById("drawer-title");
  var drawerCloseEl = document.getElementById("drawer-close");
  var drawerNewEl = document.getElementById("drawer-new");
  var drawerMsgEl = document.getElementById("drawer-msg");
  var chatListEl = document.getElementById("chat-list");

  // new layout: home page + ask page
  var navHome = document.getElementById("nav-home");
  var navAsk = document.getElementById("nav-ask");
  var navHomeLabel = document.getElementById("nav-home-label");
  var navAskLabel = document.getElementById("nav-ask-label");
  var historyLabelEl = document.getElementById("history-label");
  var logoutLabelEl = document.getElementById("logout-label");
  var loginOpenEl = document.getElementById("login-open");
  var loginOpenLabelEl = document.getElementById("login-open-label");
  var heroT1 = document.getElementById("hero-t1");
  var heroT2 = document.getElementById("hero-t2");
  var heroSub = document.getElementById("hero-sub");
  var homeForm = document.getElementById("home-form");
  var homeInput = document.getElementById("home-input");
  var homeAttach = document.getElementById("home-attach");
  var homeSend = document.getElementById("home-send");
  var homeSendLabel = document.getElementById("home-send-label");
  var homeChipsEl = document.getElementById("home-chips");
  var subjectListEl = document.getElementById("subject-list");
  var askTitleEl = document.getElementById("ask-title");
  var answerTitleEl = document.getElementById("answer-title");
  var attachLabelEl = document.getElementById("attach-label");
  var sendLabelEl = document.getElementById("send-label");
  var classSel = document.getElementById("class-sel");
  var subjectSel = document.getElementById("subject-sel");
  var counterEl = document.getElementById("counter");
  var askMainEl = document.querySelector(".ask-main");
  var answerCardEl = document.querySelector(".answer-card");
  var welcomeEl = document.getElementById("welcome");

  // The answer box shows only once the chat has something in it; the page (not the box) scrolls.
  function syncHasChat() {
    var has = chatEl.children.length > 0;
    if (askMainEl.classList.contains("has-chat") === has) return;
    askMainEl.classList.toggle("has-chat", has);
    inputEl.rows = has ? 1 : 3; // a slim box for follow-up questions
    updatePlaceholder();
    autosize();
  }
  function updatePlaceholder() {
    var t = TEXT[lang];
    inputEl.placeholder = askMainEl.classList.contains("has-chat") ? t.followPlaceholder : t.placeholder;
  }
  new MutationObserver(syncHasChat).observe(chatEl, { childList: true });
  function scrollChat() { askMainEl.scrollTop = askMainEl.scrollHeight; }

  var loginForm = document.getElementById("login-form");
  var loginTitle = document.getElementById("login-title");
  var loginHint = document.getElementById("login-hint");
  var loginNameLabel = document.getElementById("login-name-label");
  var loginCodeLabel = document.getElementById("login-code-label");
  var loginName = document.getElementById("login-name");
  var loginCode = document.getElementById("login-code");
  var loginError = document.getElementById("login-error");
  var loginBtn = document.getElementById("login-btn");

  var lang = "bn";
  try {
    var saved = localStorage.getItem("aiteacher_lang");
    if (saved === "bn" || saved === "en") lang = saved;
  } catch (e) { /* storage may be blocked; ignore */ }

  var history = []; // {role: 'user'|'assistant', text}
  var busy = false;
  var authed = false;
  var user = "";
  var usage = { used: 0, limit: 0 };
  var loginErrorKey = null;
  var pendingImage = null; // {mime, data (base64), url (data: URL for the preview)} chosen but not sent yet
  var preparing = false;   // true while a chosen picture is being shrunk
  var view = "home";       // "home", "ask" or "login"
  var afterLogin = null;   // what to do once a visitor has logged in: {view, question, subject}
  var chatId = null;       // id of the chat being saved (null until the first answer arrives)
  var chatTitle = "";      // short title shown in the history list

  // ---------- safe rendering (escape first, then add a little formatting) ----------
  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function inline(s) {
    return s
      .replace(/`([^`\n]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  }

  // Gemini sometimes writes math as LaTeX ($\rightarrow$). We don't render LaTeX,
  // so turn the common bits into plain Unicode instead of showing raw code.
  var LATEX_MAP = {
    "\\rightarrow": "→", "\\to": "→", "\\leftarrow": "←", "\\Rightarrow": "⇒", "\\leftrightarrow": "↔",
    "\\times": "×", "\\cdot": "·", "\\div": "÷", "\\pm": "±",
    "\\leq": "≤", "\\le": "≤", "\\geq": "≥", "\\ge": "≥", "\\neq": "≠", "\\approx": "≈",
    "\\pi": "π", "\\theta": "θ", "\\alpha": "α", "\\beta": "β", "\\gamma": "γ", "\\delta": "δ",
    "\\Delta": "Δ", "\\lambda": "λ", "\\mu": "μ", "\\sigma": "σ", "\\omega": "ω", "\\infty": "∞",
    "\\degree": "°", "\\circ": "°"
  };
  var SUPERSCRIPT = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻", "+": "⁺" };
  var SUBSCRIPT = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉" };

  function mapChars(str, table) {
    var out = "";
    for (var i = 0; i < str.length; i++) {
      if (!table[str[i]]) return null; // can't convert everything, leave as is
      out += table[str[i]];
    }
    return out;
  }

  function latexToText(inner) {
    var s = inner;
    s = s.replace(/\\text\{([^{}]*)\}/g, "$1").replace(/\\mathrm\{([^{}]*)\}/g, "$1");
    s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)");
    s = s.replace(/\\sqrt\{([^{}]*)\}/g, "√($1)");
    s = s.replace(/\\[a-zA-Z]+/g, function (cmd) { return LATEX_MAP[cmd] || cmd; });
    s = s.replace(/\^\{?([0-9+-]+)\}?/g, function (m, d) { return mapChars(d, SUPERSCRIPT) || m; });
    s = s.replace(/_\{?([0-9]+)\}?/g, function (m, d) { return mapChars(d, SUBSCRIPT) || m; });
    return s.replace(/[{}]/g, "").replace(/\s+/g, " ").trim();
  }

  function cleanLatex(raw) {
    // Only touch $...$ spans that really contain a backslash command, so prices like "$5 and $10" stay intact.
    return raw
      .replace(/\$\$([^$]*\\[^$]*)\$\$/g, function (m, inner) { return latexToText(inner); })
      .replace(/\$([^$\n]*\\[^$\n]*)\$/g, function (m, inner) { return latexToText(inner); });
  }

  // Maths between $...$ (inside a line) or $$...$$ (own line), also \(...\) and \[...\], is drawn with KaTeX.
  // Each formula is swapped for a small marker first, so the normal text formatting cannot disturb it.
  function mathToken(maths, tex, display) {
    maths.push({ tex: tex.trim(), display: display });
    return "\uE000" + (maths.length - 1) + "\uE001";
  }

  function extractMath(raw, maths) {
    var parts = raw.split("```"); // code blocks (odd parts) are left alone
    for (var i = 0; i < parts.length; i += 2) {
      parts[i] = parts[i]
        .replace(/\$\$([\s\S]+?)\$\$/g, function (m, tex) { return mathToken(maths, tex, true); })
        .replace(/\\\[([\s\S]+?)\\\]/g, function (m, tex) { return mathToken(maths, tex, true); })
        .replace(/\\\(([\s\S]+?)\\\)/g, function (m, tex) { return mathToken(maths, tex, false); })
        // $5 and $10 is money, not maths: the closing $ must follow a non-space and must not be followed by a digit
        .replace(/\$(?!\s)([^$\n]*?[^\s$])\$(?!\d)/g, function (m, tex) { return mathToken(maths, tex, false); });
    }
    return parts.join("```");
  }

  var mathCache = {};
  function renderTex(item) {
    var key = (item.display ? "D:" : "I:") + item.tex;
    if (mathCache[key]) return mathCache[key];
    var html;
    try {
      html = window.katex.renderToString(item.tex, { displayMode: item.display, throwOnError: false, strict: "ignore", output: "html" });
    } catch (e) {
      html = "<code>" + escapeHtml(item.tex) + "</code>";
    }
    mathCache[key] = html;
    return html;
  }

  function renderMarkdown(raw) {
    var maths = [];
    var useMath = !!(window.katex && window.katex.renderToString);
    var source = useMath ? extractMath(raw, maths) : cleanLatex(raw); // no KaTeX: show formulas as plain text
    var text = escapeHtml(source).replace(/\r\n/g, "\n");
    var out = [];
    var parts = text.split(/```/);
    for (var i = 0; i < parts.length; i++) {
      if (i % 2 === 1) {
        // code block: drop an optional language tag on the first line
        var code = parts[i].replace(/^[a-zA-Z0-9_-]*\n/, "");
        out.push("<pre><code>" + code.replace(/\n$/, "") + "</code></pre>");
        continue;
      }
      var lines = parts[i].split("\n");
      var para = [];
      var list = null; // {tag, items}
      var flushPara = function () {
        if (para.length) { out.push("<p>" + inline(para.join("<br>")) + "</p>"); para = []; }
      };
      var flushList = function () {
        if (list) {
          out.push("<" + list.tag + ">" + list.items.map(function (li) { return "<li>" + inline(li) + "</li>"; }).join("") + "</" + list.tag + ">");
          list = null;
        }
      };
      for (var j = 0; j < lines.length; j++) {
        var line = lines[j].replace(/^\s*&gt;\s?/, ""); // drop "> " quote markers
        if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { // ---  ***  ___  become a thin divider line
          flushPara(); flushList();
          out.push("<hr>");
          continue;
        }
        var heading = line.match(/^#{1,6}\s+(.*)$/);
        if (heading) {
          flushPara(); flushList();
          out.push("<p><strong>" + inline(heading[1]) + "</strong></p>");
          continue;
        }
        var ul = line.match(/^\s*[-*•]\s+(.*)$/);
        var ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
        if (ul || ol) {
          flushPara();
          var tag = ul ? "ul" : "ol";
          if (!list || list.tag !== tag) { flushList(); list = { tag: tag, items: [] }; }
          list.items.push((ul || ol)[1]);
        } else if (line.trim() === "") {
          flushPara(); flushList();
        } else {
          flushList(); para.push(line);
        }
      }
      flushPara(); flushList();
    }
    var html = out.join("");
    if (useMath) {
      html = html.replace(/\uE000(\d+)\uE001/g, function (m, n) { return maths[Number(n)] ? renderTex(maths[Number(n)]) : ""; });
    }
    return html;
  }

  // ---------- UI helpers ----------
  function addMessage(kind, text) {
    var el = document.createElement("div");
    el.className = "msg " + (kind === "user" ? "user" : "bot") + (kind === "error" ? " error" : "");
    if (kind === "bot") el.innerHTML = renderMarkdown(text);
    else el.textContent = text;
    chatEl.appendChild(el);
    scrollChat();
    return el;
  }

  // ---------- time record: "Me · 5:00 PM" above each question, "AI Teacher · 5:00 PM · ⚡ 3.2 s" above each answer ----------
  var lastMetaDay = ""; // so a date line is added only when the day changes

  function dayKey(ts) {
    var d = new Date(ts);
    return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
  }

  function locale() { return lang === "bn" ? "bn-BD" : "en-US"; }

  function fmtTime(ts) {
    try {
      return new Date(ts).toLocaleTimeString(locale(), { hour: "numeric", minute: "2-digit", hour12: true });
    } catch (e) { return ""; }
  }

  function fmtDay(ts) {
    var t = TEXT[lang];
    var key = dayKey(ts);
    if (key === dayKey(Date.now())) return t.today;
    if (key === dayKey(Date.now() - 86400000)) return t.yesterday;
    try {
      return new Date(ts).toLocaleDateString(locale(), { day: "numeric", month: "long", year: "numeric" });
    } catch (e) { return ""; }
  }

  function fmtDuration(ms) {
    if (!ms || ms < 0) return "";
    var s = ms < 10000 ? Math.round(ms / 100) / 10 : Math.round(ms / 1000);
    var num;
    try { num = s.toLocaleString(locale(), { minimumFractionDigits: s % 1 ? 1 : 0 }); } catch (e) { num = String(s); }
    return "⚡ " + num + " " + TEXT[lang].secondsUnit;
  }

  function renderMeta(el) {
    var t = TEXT[lang];
    var who = el.getAttribute("data-role") === "user" ? t.meLabel : t.aiLabel;
    var parts = [who, fmtTime(Number(el.getAttribute("data-ts")))];
    var dur = Number(el.getAttribute("data-dur"));
    if (dur) parts.push(fmtDuration(dur));
    el.textContent = parts.filter(Boolean).join(" · ");
  }

  function renderDaySep(el) { el.textContent = fmtDay(Number(el.getAttribute("data-ts"))); }

  // Adds the small label (and, when the day changes, a date line) in front of the next bubble.
  function addMeta(role, ts, dur) {
    if (!ts) return null;
    var key = dayKey(ts);
    if (key !== lastMetaDay) {
      lastMetaDay = key;
      var sep = document.createElement("div");
      sep.className = "day-sep";
      sep.setAttribute("data-ts", String(ts));
      renderDaySep(sep);
      chatEl.appendChild(sep);
    }
    var el = document.createElement("div");
    el.className = "msg-meta " + (role === "user" ? "from-user" : "from-bot");
    el.setAttribute("data-role", role);
    el.setAttribute("data-ts", String(ts));
    if (dur) el.setAttribute("data-dur", String(dur));
    renderMeta(el);
    chatEl.appendChild(el);
    return el;
  }

  // When the language is switched, the labels already on screen follow it.
  function refreshMeta() {
    var metas = chatEl.querySelectorAll(".msg-meta");
    for (var i = 0; i < metas.length; i++) renderMeta(metas[i]);
    var seps = chatEl.querySelectorAll(".day-sep");
    for (var j = 0; j < seps.length; j++) renderDaySep(seps[j]);
  }

  // A question bubble that can also show the picture that was sent with it.
  function addUserMessage(text, image) {
    var el = document.createElement("div");
    el.className = "msg user";
    if (image && image.url) {
      var img = document.createElement("img");
      img.className = "msg-img";
      img.alt = "";
      img.src = image.url;
      img.addEventListener("click", function () { openLightbox(image.url); });
      el.appendChild(img);
    }
    if (text) {
      var span = document.createElement("div");
      span.textContent = text;
      el.appendChild(span);
    }
    chatEl.appendChild(el);
    scrollChat();
    return el;
  }

  // ---------- actions under the latest answer: copy + quick follow-ups ----------
  function removeActions() {
    var old = chatEl.querySelectorAll(".actions");
    for (var i = 0; i < old.length; i++) old[i].remove();
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand("copy");
        ta.remove();
        ok ? resolve() : reject(new Error("copy"));
      } catch (e) { reject(e); }
    });
  }

  // What gets copied: the answer without markdown marks (**bold**, ## headings, --- dividers).
  function plainAnswer(text) {
    return cleanLatex(text)
      .replace(/\*\*([^*\n]+)\*\*/g, "$1")
      .replace(/`([^`\n]+)`/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^\s*([-*_])(\s*\1){2,}\s*$/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function addAnswerActions(answerText) {
    removeActions();
    var t = TEXT[lang];
    var bar = document.createElement("div");
    bar.className = "actions";

    var copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "action-btn";
    copyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg><span></span>';
    copyBtn.lastChild.textContent = t.copy;
    copyBtn.addEventListener("click", function () {
      copyText(plainAnswer(answerText)).then(function () {
        copyBtn.lastChild.textContent = TEXT[lang].copied;
        setTimeout(function () { copyBtn.lastChild.textContent = TEXT[lang].copy; }, 1600);
      }, function () { /* clipboard blocked: nothing to do */ });
    });
    bar.appendChild(copyBtn);

    t.followups.forEach(function (label) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "action-btn";
      b.textContent = label;
      b.addEventListener("click", function () { ask(label); });
      bar.appendChild(b);
    });

    chatEl.appendChild(bar);
  }

  function setBusy(state) {
    busy = state;
    sendEl.disabled = state;
    inputEl.disabled = state;
    attachEl.disabled = state;
    homeInput.disabled = state;
    homeSend.disabled = state;
    homeAttach.disabled = state;
    classSel.disabled = state;
    subjectSel.disabled = state;
    previewRemoveEl.disabled = state;
    if (!state && view === "ask") inputEl.focus({ preventScroll: true });
  }

  // ---------- picture from the gallery ----------
  function showPreview(nameText, statusText) {
    previewEl.classList.remove("hidden");
    previewEl.classList.toggle("loading", preparing);
    previewNameEl.textContent = nameText || "";
    previewStatusEl.textContent = statusText || "";
    previewRemoveEl.title = TEXT[lang].removeImage;
    previewRemoveEl.setAttribute("aria-label", TEXT[lang].removeImage);
    if (pendingImage && pendingImage.url) previewImgEl.src = pendingImage.url;
    else previewImgEl.removeAttribute("src");
  }

  function sizeLabel(image) {
    var kb = (image.data.length * 0.75) / 1024;
    return kb < 1024 ? Math.max(1, Math.round(kb)) + " KB" : (kb / 1024).toFixed(1) + " MB";
  }

  // Click a picture in the chat to see it large; click again or press Esc to close.
  function openLightbox(src) {
    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    var big = document.createElement("img");
    big.src = src;
    big.alt = "";
    box.appendChild(big);
    function close() { document.removeEventListener("keydown", onKey); box.remove(); }
    function onKey(e) { if (e.key === "Escape") close(); }
    box.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    document.body.appendChild(box);
  }

  function clearPendingImage() {
    pendingImage = null;
    preparing = false;
    previewImgEl.removeAttribute("src");
    previewEl.classList.add("hidden");
    previewEl.classList.remove("loading");
    previewNameEl.textContent = "";
    previewStatusEl.textContent = "";
    fileEl.value = ""; // so choosing the same picture again still triggers "change"
  }

  function loadImageElement(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { resolve({ img: img, url: url }); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("decode")); };
      img.src = url;
    });
  }

  function readAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(String(r.result)); };
      r.onerror = function () { reject(new Error("read")); };
      r.readAsDataURL(file);
    });
  }

  // Turns the chosen file into {mime, data, url}. Normal pictures are redrawn on a canvas, which also
  // fixes phone-camera rotation and shrinks very large photos. Throws an error key (see TEXT.errors).
  async function prepareImage(file) {
    var type = (file.type || "").toLowerCase();
    var looksLikeImage = type.indexOf("image/") === 0 || IMAGE_EXT.test(file.name || "");
    if (!looksLikeImage) throw new Error("image_type");
    if (file.size > MAX_IMAGE_FILE_BYTES) throw new Error("image_too_big");

    var loaded = null;
    try {
      loaded = await loadImageElement(file);
    } catch (e) {
      // Some browsers can't open HEIC. Gemini can read it directly, so send the original if it is small enough.
      var isHeic = /heic|heif/.test(type) || /\.(heic|heif)$/i.test(file.name || "");
      if (isHeic && file.size <= 3.5 * 1024 * 1024) {
        var rawUrl = await readAsDataUrl(file);
        return { mime: /heif$/.test(type) ? "image/heif" : "image/heic", data: rawUrl.split(",")[1], url: "" };
      }
      throw new Error("image_failed");
    }

    try {
      var img = loaded.img;
      var w = img.naturalWidth, h = img.naturalHeight;
      if (!w || !h) throw new Error("image_failed");

      var scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(w, h));
      var cw = Math.max(1, Math.round(w * scale));
      var ch = Math.max(1, Math.round(h * scale));

      var canvas = document.createElement("canvas");
      canvas.width = cw;
      canvas.height = ch;
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff"; // transparent PNGs would turn black as JPEG, so paint white first
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, 0, 0, cw, ch);

      // JPEG at high quality keeps handwriting and small print sharp; lower it only if the result is still too big.
      var qualities = [0.92, 0.85, 0.75, 0.6];
      var dataUrl = "";
      for (var i = 0; i < qualities.length; i++) {
        dataUrl = canvas.toDataURL("image/jpeg", qualities[i]);
        if (dataUrl.length - 23 <= MAX_IMAGE_BASE64) break;
      }
      var base64 = dataUrl.split(",")[1] || "";
      if (!base64 || base64.length > MAX_IMAGE_BASE64) throw new Error("image_too_big");
      return { mime: "image/jpeg", data: base64, url: dataUrl };
    } finally {
      URL.revokeObjectURL(loaded.url);
    }
  }

  // A small JPEG copy (about 900 px, under ~190 KB) that is saved with the chat for the history.
  async function makeThumb(dataUrl) {
    if (!dataUrl) return "";
    try {
      var img = await new Promise(function (resolve, reject) {
        var i = new Image();
        i.onload = function () { resolve(i); };
        i.onerror = function () { reject(new Error("thumb")); };
        i.src = dataUrl;
      });
      var w = img.naturalWidth, h = img.naturalHeight;
      if (!w || !h) return "";
      var scale = Math.min(1, 900 / Math.max(w, h));
      var canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(w * scale));
      canvas.height = Math.max(1, Math.round(h * scale));
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      var qualities = [0.72, 0.58, 0.45, 0.35];
      for (var q = 0; q < qualities.length; q++) {
        var out = (canvas.toDataURL("image/jpeg", qualities[q]).split(",")[1]) || "";
        if (out && out.length <= 250000) return out;
      }
    } catch (e) { /* no copy: the history just shows a picture marker */ }
    return "";
  }

  async function handleFileChosen() {
    var file = fileEl.files && fileEl.files[0];
    if (!file || busy || !authed) return;

    clearPendingImage();
    preparing = true;
    sendEl.disabled = true;
    showPreview(file.name || "", TEXT[lang].imageReading);

    try {
      var prepared = await prepareImage(file);
      prepared.thumb = await makeThumb(prepared.url);
      if (!preparing) return; // the user removed it while it was being prepared
      // A HEIC picture sent as is has no preview image (the browser can't draw it); the file name is shown instead.
      pendingImage = prepared;
      preparing = false;
      showPreview(file.name || "", sizeLabel(prepared));
    } catch (e) {
      var key = e && e.message && TEXT[lang].errors[e.message] ? e.message : "image_failed";
      clearPendingImage();
      addMessage("error", errorText(key));
    } finally {
      preparing = false;
      if (!busy) sendEl.disabled = false;
    }
  }

  function autosize() {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, window.innerWidth <= 720 ? 120 : 200) + "px";
    counterEl.textContent = inputEl.value.length + "/" + inputEl.maxLength;
  }

  // ---------- pages (home / ask), subjects, class ----------
  var SUBJECT_IDS = ["math", "physics", "chemistry", "biology", "ict"];
  var SVG_OPEN = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var SUBJECT_ICONS = {
    math: SVG_OPEN + '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8 7.5h8"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 15.5h.01M12 15.5h.01M15.5 15.5h.01"/></svg>',
    physics: SVG_OPEN + '<circle cx="12" cy="12" r="1.6"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/></svg>',
    chemistry: SVG_OPEN + '<path d="M9 3h6M10 3v6l-5.2 9.2A2 2 0 0 0 6.5 21h11a2 2 0 0 0 1.7-2.8L14 9V3"/><path d="M7.5 15h9"/></svg>',
    biology: SVG_OPEN + '<path d="M20 4C10 4 5 9 5 15c0 2 .8 3.6.8 3.6S7.6 20 10 20c6.5 0 10-5.5 10-16z"/><path d="M5 21c3-5.5 6-8.5 10.5-11"/></svg>',
    ict: SVG_OPEN + '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>'
  };

  function setView(next) {
    view = next;
    appEl.setAttribute("data-view", next);
    navHome.classList.toggle("active", next === "home");
    navAsk.classList.toggle("active", next === "ask");
    if (next === "ask") autosize();
  }

  function option(value, label) {
    var o = document.createElement("option");
    o.value = value;
    o.textContent = label;
    return o;
  }

  function fillSelects() {
    var t = TEXT[lang];
    var cv = classSel.value;
    var sv = subjectSel.value;
    classSel.innerHTML = "";
    classSel.appendChild(option("", t.classLabel));
    t.classes.forEach(function (c, i) { classSel.appendChild(option(String(i), c)); });
    subjectSel.innerHTML = "";
    subjectSel.appendChild(option("", t.subjectLabel));
    SUBJECT_IDS.forEach(function (id) { subjectSel.appendChild(option(id, t.subjects[id])); });
    classSel.value = cv;
    subjectSel.value = sv;
    if (classSel.value !== cv) classSel.value = "";
    if (subjectSel.value !== sv) subjectSel.value = "";
  }

  function markSubject() {
    var items = subjectListEl.children;
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle("active", items[i].getAttribute("data-id") === subjectSel.value);
    }
  }

  function pickSubject(id) {
    subjectSel.value = id;
    markSubject();
  }

  // The subject list on the ask page and the subject chips on the home page.
  function renderSubjects() {
    var t = TEXT[lang];
    subjectListEl.innerHTML = "";
    homeChipsEl.innerHTML = "";
    SUBJECT_IDS.forEach(function (id) {
      var li = document.createElement("li");
      li.className = "subject-item sub-" + id;
      li.setAttribute("data-id", id);
      var b = document.createElement("button");
      b.type = "button";
      b.innerHTML = SUBJECT_ICONS[id] + "<span></span>";
      b.lastChild.textContent = t.subjects[id];
      b.addEventListener("click", function () { pickSubject(subjectSel.value === id ? "" : id); });
      li.appendChild(b);
      subjectListEl.appendChild(li);

      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip sub-" + id;
      chip.innerHTML = SUBJECT_ICONS[id] + "<span></span>";
      chip.lastChild.textContent = t.subjects[id];
      chip.addEventListener("click", function () {
        if (!authed) { goToLogin({ view: "ask", subject: id }); return; }
        pickSubject(id);
        setView("ask");
        inputEl.focus();
      });
      homeChipsEl.appendChild(chip);
    });
    markSubject();
  }

  // The chosen class and subject, as readable words. Sent with the question so the answer fits the level.
  function currentContext() {
    var t = TEXT[lang];
    var cls = classSel.value === "" ? "" : (t.classes[Number(classSel.value)] || "");
    var subj = subjectSel.value === "" ? "" : (t.subjects[subjectSel.value] || "");
    return (cls || subj) ? {
      cls: cls,
      subj: subj,
      subjId: subjectSel.value,                                          // sent to the server so it can check the question matches
      clsIdx: classSel.value === "" ? null : Number(classSel.value)
    } : null;
  }

  function errorText(key) {
    var errs = TEXT[lang].errors;
    return errs[key] || errs.generic;
  }

  function renderUsage() {
    usageEl.textContent = authed ? TEXT[lang].usage(user, usage.used, usage.limit) : "";
  }

  function applyLanguage() {
    var t = TEXT[lang];
    document.documentElement.lang = lang;
    updatePlaceholder();
    sendLabelEl.textContent = t.getAnswer;
    newChatEl.textContent = t.newChat;
    logoutLabelEl.textContent = t.logout;
    logoutEl.title = t.logout;
    logoutEl.setAttribute("aria-label", t.logout);
    loginOpenLabelEl.textContent = t.loginOpen;
    historyLabelEl.textContent = t.historyBtn;
    navHomeLabel.textContent = t.navHome;
    navAskLabel.textContent = t.navAsk;
    heroT1.textContent = t.heroTitle1;
    heroT2.textContent = t.heroTitle2;
    heroSub.textContent = t.heroSub;
    homeInput.placeholder = t.homePlaceholder;
    homeSendLabel.textContent = t.homeAsk;
    homeAttach.title = t.attach;
    homeAttach.setAttribute("aria-label", t.attach);
    askTitleEl.textContent = t.askTitle;
    answerTitleEl.textContent = t.answerTitle;
    attachLabelEl.textContent = t.addImage;
    fillSelects();
    renderSubjects();
    refreshMeta();
    drawerTitleEl.textContent = t.historyTitle;
    drawerNewEl.textContent = "+ " + t.newChat;
    attachEl.title = t.attach;
    attachEl.setAttribute("aria-label", t.attach);
    previewRemoveEl.title = t.removeImage;
    previewRemoveEl.setAttribute("aria-label", t.removeImage);
    if (preparing) previewStatusEl.textContent = t.imageReading;
    noteEl.textContent = t.note;
    welcomeEl.textContent = t.welcome;
    loginTitle.textContent = t.loginTitle;
    loginHint.textContent = t.loginHint;
    loginNameLabel.textContent = t.nameLabel;
    loginCodeLabel.textContent = t.codeLabel;
    loginBtn.textContent = t.loginBtn;
    loginError.textContent = loginErrorKey ? errorText(loginErrorKey) : "";
    langBn.classList.toggle("active", lang === "bn");
    langEn.classList.toggle("active", lang === "en");
    langBn.setAttribute("aria-pressed", lang === "bn");
    langEn.setAttribute("aria-pressed", lang === "en");
    renderUsage();

    suggestionsEl.innerHTML = "";
    t.suggestions.forEach(function (q) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = q;
      b.addEventListener("click", function () { ask(q); });
      suggestionsEl.appendChild(b);
    });
  }

  function resetChat() {
    history = [];
    chatId = null;
    chatTitle = "";
    clearPendingImage();
    chatEl.innerHTML = "";
    lastMetaDay = "";
    suggestionsEl.classList.remove("hidden");
    askMainEl.scrollTop = 0;
  }

  function setLanguage(next) {
    lang = next;
    removeActions();
    try { localStorage.setItem("aiteacher_lang", lang); } catch (e) { /* ignore */ }
    applyLanguage();
    if (authed && history.length === 0) resetChat(); // only refresh the welcome text if no conversation yet
  }

  // ---------- login state ----------
  // A visitor who is not logged in sees the home page. Asking a question sends them to the login card,
  // and after logging in we carry on with what they wanted to do.
  function goToLogin(after) {
    afterLogin = after || null;
    loginErrorKey = null;
    loginError.textContent = "";
    setView("login");
    loginName.focus();
  }

  function continueAfterLogin() {
    var next = afterLogin;
    afterLogin = null;
    if (!next || next.view !== "ask") return;
    if (next.subject) pickSubject(next.subject);
    if (next.question) {
      homeInput.value = "";
      ask(next.question);
    } else {
      setView("ask");
      inputEl.focus();
    }
  }

  function showApp(data) {
    authed = true;
    user = data.user || "";
    usage = { used: data.used || 0, limit: data.limit || 0 };
    loginErrorKey = null;
    appEl.classList.remove("logged-out");
    applyLanguage();
    resetChat();
    setView("home");
    continueAfterLogin();
  }

  // Not logged in. goLogin = true opens the login card (used for errors and expired logins); false shows the home page.
  function showGuest(errorKey, goLogin) {
    authed = false;
    user = "";
    history = [];
    afterLogin = null;
    clearPendingImage();
    chatEl.innerHTML = "";
    chatId = null;
    chatTitle = "";
    closeDrawer();
    appEl.classList.add("logged-out");
    loginErrorKey = errorKey || null;
    loginCode.value = "";
    applyLanguage();
    setView(goLogin ? "login" : "home");
  }

  function showLogin(errorKey) { showGuest(errorKey, true); }

  async function checkSession() {
    try {
      var res = await fetch("/api/me");
      var data = null;
      try { data = await res.json(); } catch (e) { /* ignore */ }
      if (res.ok && data && data.ok) showApp(data);
      else if (data && data.error === "server_not_configured") showLogin("server_not_configured");
      else showGuest(null, false); // not logged in: the visitor sees the home page first
    } catch (e) {
      showLogin("network");
    } finally {
      appEl.classList.remove("checking");
    }
  }

  async function doLogin(e) {
    e.preventDefault();
    if (loginBtn.disabled) return;
    loginBtn.disabled = true;
    loginBtn.textContent = TEXT[lang].loggingIn;
    loginError.textContent = "";
    try {
      var res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: loginName.value, code: loginCode.value })
      });
      var data = null;
      try { data = await res.json(); } catch (err) { /* ignore */ }
      if (res.ok && data && data.ok) {
        loginCode.value = "";
        showApp(data);
      } else {
        loginErrorKey = (data && data.error) || "generic";
        loginCode.value = "";
        loginError.textContent = errorText(loginErrorKey);
      }
    } catch (err) {
      loginErrorKey = "network";
      loginError.textContent = errorText("network");
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = TEXT[lang].loginBtn;
    }
  }

  async function doLogout() {
    try { await fetch("/api/logout", { method: "POST" }); } catch (e) { /* ignore */ }
    showGuest(null, false);
  }

  // ---------- talking to the backend ----------
  // Recent chat for the server. Pictures stay attached only for the newest few; older ones become a short note.
  function buildMessages() {
    var recent = history.slice(-MAX_HISTORY);
    var imagesLeft = KEEP_IMAGES_IN_REQUEST;
    var out = [];
    for (var i = recent.length - 1; i >= 0; i--) {
      var m = recent[i];
      var item = { role: m.role, text: m.text };
      // The newest question carries the chosen class and subject as a short hint for the AI.
      if (m.role === "user" && m.ctx && i === recent.length - 1) {
        item.text = TEXT[lang].context(m.ctx.cls, m.ctx.subj) + (m.text || TEXT[lang].defaultImageQuestion);
      }
      if (m.image && imagesLeft > 0) {
        item.image = { mime: m.image.mime, data: m.image.data };
        imagesLeft--;
      }
      // A picture-only question gets its default wording from the server; earlier ones need some text.
      if (!item.text && i !== recent.length - 1) item.text = TEXT[lang].imageOnly;
      out.unshift(item);
    }
    return out;
  }

  async function ask(question) {
    var q = (question || "").trim();
    var image = pendingImage;
    if ((!q && !image) || busy || preparing || !authed) return;
    setView("ask");

    suggestionsEl.classList.add("hidden");
    removeActions();
    var askedAt = Date.now();
    addMeta("user", askedAt);
    addUserMessage(q, image);
    history.push({ role: "user", text: q, image: image, ctx: currentContext(), ts: askedAt });
    clearPendingImage();
    inputEl.value = "";
    autosize();
    setBusy(true);

    var typing = addMessage("bot", "");
    typing.classList.add("typing");
    typing.textContent = TEXT[lang].thinking;

    try {
      var res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang: lang,
          subject: (history[history.length - 1].ctx && history[history.length - 1].ctx.subjId) || "",
          cls: history[history.length - 1].ctx ? history[history.length - 1].ctx.clsIdx : null,
          messages: buildMessages()
        })
      });
      var type = res.headers.get("Content-Type") || "";

      if (res.ok && res.body && type.indexOf("text/event-stream") !== -1) {
        await readStream(res, typing, askedAt);
      } else {
        // Errors (login expired, daily limit, ...) still arrive as plain JSON.
        var data = null;
        try { data = await res.json(); } catch (e) { /* non-JSON response */ }
        typing.remove();
        handleFailure(data && data.error, data);
      }
    } catch (e) {
      typing.remove();
      addMessage("error", errorText("network"));
      history.pop();
    } finally {
      setBusy(false);
    }
  }

  // Shared handling for any failed question: undo the dangling turn and show a clear message.
  function handleFailure(key, data) {
    history.pop(); // let the user retry the same question without a dangling turn
    if (key === "unauthorized") {
      showLogin("unauthorized");
      return;
    }
    if (key === "daily_limit" && data) {
      usage = { used: data.limit || usage.limit, limit: data.limit || usage.limit };
      renderUsage();
    }
    addMessage("error", errorText(key));
  }

  // Reads the answer piece by piece and shows it as it grows.
  async function readStream(res, typing, askedAt) {
    var answerTs = 0;     // when the first words of the answer arrived
    var metaEl = null;    // the "AI Teacher · time" label above the answer
    var reader = res.body.getReader();
    var decoder = new TextDecoder("utf-8");
    var buffer = "";
    var answer = "";
    var botEl = null;
    var finished = false;
    var failKey = null;
    var mismatch = false;  // the AI said the question does not fit the chosen class / subject
    var paintQueued = false;
    var needAlign = false; // once, bring the start of a new answer to the top so it can be read from the beginning

    function paint() {
      paintQueued = false;
      if (!botEl) return;
      botEl.innerHTML = renderMarkdown(answer);
      if (needAlign) { needAlign = false; botEl.scrollIntoView({ block: "start" }); }
    }

    function queuePaint() {
      if (paintQueued) return;
      paintQueued = true;
      requestAnimationFrame(paint);
    }

    function handleEvent(raw) {
      var lines = raw.split(/\r?\n/);
      var payload = "";
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf("data:") === 0) payload += lines[i].slice(5).trim();
      }
      if (!payload) return;
      var ev;
      try { ev = JSON.parse(payload); } catch (e) { return; }

      if (typeof ev.t === "string" && ev.t) {
        if (!botEl) {
          typing.remove();
          answerTs = Date.now();
          metaEl = addMeta("bot", answerTs);
          botEl = addMessage("bot", "");
          botEl.classList.add("streaming");
          needAlign = true;
        }
        answer += ev.t;
        queuePaint();
      } else if (ev.done) {
        finished = true;
        if (ev.mismatch) mismatch = true;
        if (typeof ev.used === "number") {
          usage = { used: ev.used, limit: ev.limit || usage.limit };
          renderUsage();
        }
      } else if (ev.e) {
        failKey = ev.e;
      }
    }

    try {
      while (true) {
        var chunk = await reader.read();
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });
        var m;
        while ((m = /\r?\n\r?\n/.exec(buffer))) {
          var raw = buffer.slice(0, m.index);
          buffer = buffer.slice(m.index + m[0].length);
          handleEvent(raw);
        }
      }
      if (buffer.trim()) handleEvent(buffer);
    } catch (e) {
      failKey = failKey || "network";
    }

    if (botEl) {
      botEl.classList.remove("streaming");
      paint();
    } else {
      typing.remove();
    }

    if (answer) {
      // Show whatever arrived. It counts as a question already, so keep it in the history.
      // How long the answer took, counted from the moment the question was sent until it finished.
      var took = finished && askedAt ? Date.now() - askedAt : 0;
      if (metaEl && took) { metaEl.setAttribute("data-dur", String(took)); renderMeta(metaEl); }
      history.push({ role: "assistant", text: answer, ts: answerTs || Date.now(), dur: took || undefined });
      saveChat();
      if (!finished) addMessage("error", errorText(failKey || "network"));
      else if (!mismatch) addAnswerActions(answer); // a "wrong subject" note has nothing to simplify or copy
    } else {
      handleFailure(failKey || "generic", null);
    }
  }

// ---------- chat history (saved on the server for each login) ----------
  var MAX_SAVED_MESSAGES = 40;

  function newChatId() {
    return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function titleFrom(text) {
    var t = (text || "").replace(/\s+/g, " ").trim();
    if (!t) t = TEXT[lang].imageOnly;
    return t.length > 50 ? t.slice(0, 50) + "…" : t;
  }

  // Saves the whole conversation after each answer. Best effort: a failure never disturbs the chat.
  async function saveChat() {
    if (!authed || !history.length) return;
    if (!chatId) chatId = newChatId();
    var needTitle = false;
    if (!chatTitle) {
      var first = null;
      for (var i = 0; i < history.length; i++) {
        if (history[i].role === "user") { first = history[i]; break; }
      }
      chatTitle = titleFrom(first && first.text);
      // A first question that came with a picture gets a topic title made from the answer.
      needTitle = !!(first && first.image);
    }
    var id = chatId;

    // New pictures: save a small copy first, so the history can show them again later.
    for (var k = 0; k < history.length; k++) {
      var im = history[k].image;
      if (im && im.thumb && !im.imgId) {
        var newId = newChatId();
        if (await uploadImage(id, newId, im.thumb)) im.imgId = newId;
        else im.thumb = ""; // limit reached or offline: this picture stays a plain marker
      }
    }

    var msgs = history.slice(-MAX_SAVED_MESSAGES).map(function (m) {
      return {
        role: m.role,
        text: m.text || "",
        img: !!(m.image || m.img),
        imgId: (m.image && m.image.imgId) || m.imgId || undefined,
        ts: m.ts || undefined,
        dur: m.dur || undefined
      };
    });
    var ok = false;
    try {
      var res = await fetch("/api/chats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id, title: chatTitle, messages: msgs })
      });
      if (res.status === 401) showLogin("unauthorized");
      ok = res.ok;
    } catch (e) { /* ignore */ }
    if (ok && needTitle) improveTitle(id);
  }

  async function uploadImage(chat, imgId, base64) {
    try {
      var res = await fetch("/api/chats?img=" + encodeURIComponent(imgId) + "&chat=" + encodeURIComponent(chat), {
        method: "PUT",
        headers: { "Content-Type": "text/plain" },
        body: base64
      });
      if (res.status === 401) showLogin("unauthorized");
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  // Asks the server for a 2-5 word topic title (e.g. "সালোকসংশ্লেষণ") and saves the chat again with it.
  async function improveTitle(id) {
    var question = "";
    var answer = "";
    for (var i = 0; i < history.length; i++) {
      if (history[i].role === "user" && !question) question = history[i].text || "";
      if (history[i].role === "assistant" && !answer) answer = history[i].text || "";
    }
    if (!answer) return;
    try {
      var res = await fetch("/api/title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang: lang, question: question, answer: answer })
      });
      var data = await readJson(res);
      if (!res.ok || !data || !data.ok || !data.title) return;
      if (id !== chatId) return; // the student already moved to another chat
      chatTitle = data.title;
      if (!busy) saveChat(); // otherwise the next save (after the answer) carries the new title
    } catch (e) { /* keep the first title */ }
  }

  function openDrawer() {
    if (!authed) return;
    drawerEl.classList.add("open");
    backdropEl.classList.add("show");
    drawerEl.setAttribute("aria-hidden", "false");
    loadChatList();
  }

  function closeDrawer() {
    drawerEl.classList.remove("open");
    backdropEl.classList.remove("show");
    drawerEl.setAttribute("aria-hidden", "true");
  }

  async function readJson(res) {
    try { return await res.json(); } catch (e) { return null; }
  }

  async function loadChatList() {
    drawerMsgEl.textContent = TEXT[lang].loadingChats;
    chatListEl.innerHTML = "";
    try {
      var res = await fetch("/api/chats");
      var data = await readJson(res);
      if (res.status === 401) { showLogin("unauthorized"); return; }
      if (!res.ok || !data || !data.ok) {
        drawerMsgEl.textContent = errorText(data && data.error === "history_not_configured" ? "history_not_configured" : "history_failed");
        return;
      }
      renderChatList(data.chats || []);
    } catch (e) {
      drawerMsgEl.textContent = errorText("network");
    }
  }

  function renderChatList(chats) {
    chatListEl.innerHTML = "";
    drawerMsgEl.textContent = chats.length ? "" : TEXT[lang].noChats;
    chats.forEach(function (c) {
      var li = document.createElement("li");
      li.className = "chat-item" + (c.id === chatId ? " active" : "");

      var open = document.createElement("button");
      open.type = "button";
      open.className = "chat-open";
      open.textContent = c.title || TEXT[lang].untitled;
      open.addEventListener("click", function () { openChat(c.id); });

      var del = document.createElement("button");
      del.type = "button";
      del.className = "chat-del";
      del.title = TEXT[lang].deleteChat;
      del.setAttribute("aria-label", TEXT[lang].deleteChat);
      del.innerHTML = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>';
      del.addEventListener("click", function () { deleteChatById(c.id); });

      li.appendChild(open);
      li.appendChild(del);
      chatListEl.appendChild(li);
    });
  }

  // Shows a saved chat and lets the student carry on from where it stopped.
  function showChat(chat) {
    resetChat();
    chatEl.innerHTML = ""; // drop the welcome bubble
    lastMetaDay = "";
    suggestionsEl.classList.add("hidden");
    chatId = chat.id;
    chatTitle = chat.title || "";
    var placeholders = [TEXT.bn.imageOnly, TEXT.en.imageOnly];
    (chat.messages || []).forEach(function (m) {
      if (m.role === "user") {
        var raw = (m.img && placeholders.indexOf(m.text) !== -1) ? "" : (m.text || "");
        addMeta("user", m.ts);
        if (m.img && m.imgId) {
          // the saved small copy of the picture is loaded from the server
          addUserMessage(raw, { url: "/api/chats?img=" + encodeURIComponent(m.imgId) });
        } else {
          addUserMessage((m.img ? "🖼 " : "") + (raw || (m.img ? TEXT[lang].imageOnly : "")), null);
        }
        history.push({ role: "user", text: raw, image: null, img: !!m.img, imgId: m.imgId || "", ts: m.ts });
      } else {
        addMeta("bot", m.ts, m.dur);
        addMessage("bot", m.text || "");
        history.push({ role: "assistant", text: m.text || "", ts: m.ts, dur: m.dur });
      }
    });
    var last = history[history.length - 1];
    if (last && last.role === "assistant") addAnswerActions(last.text);
    scrollChat();
    // Older chats that were saved with the plain "(ছবি)" title get a proper topic title now.
    if (placeholders.indexOf(chatTitle) !== -1) improveTitle(chatId);
  }

  async function openChat(id) {
    if (busy || !authed) return;
    if (id === chatId) { setView("ask"); closeDrawer(); return; }
    drawerMsgEl.textContent = TEXT[lang].loadingChats;
    try {
      var res = await fetch("/api/chats?id=" + encodeURIComponent(id));
      var data = await readJson(res);
      if (res.status === 401) { showLogin("unauthorized"); return; }
      if (!res.ok || !data || !data.ok || !data.chat) {
        drawerMsgEl.textContent = errorText("history_failed");
        return;
      }
      showChat(data.chat);
      setView("ask");
      closeDrawer();
    } catch (e) {
      drawerMsgEl.textContent = errorText("network");
    }
  }

  async function deleteChatById(id) {
    if (busy || !authed) return;
    if (!window.confirm(TEXT[lang].deleteAsk)) return;
    try {
      var res = await fetch("/api/chats?id=" + encodeURIComponent(id), { method: "DELETE" });
      if (res.status === 401) { showLogin("unauthorized"); return; }
      if (!res.ok) { drawerMsgEl.textContent = errorText("history_failed"); return; }
      if (id === chatId) resetChat();
      loadChatList();
    } catch (e) {
      drawerMsgEl.textContent = errorText("network");
    }
  }

  // ---------- events ----------
  formEl.addEventListener("submit", function (e) {
    e.preventDefault();
    ask(inputEl.value);
  });

  inputEl.addEventListener("input", autosize);
  inputEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      formEl.requestSubmit();
    }
  });

  attachEl.addEventListener("click", function () { if (!busy && !preparing && authed) fileEl.click(); });
  fileEl.addEventListener("change", handleFileChosen);
  previewRemoveEl.addEventListener("click", function () { if (!busy) clearPendingImage(); });

  loginForm.addEventListener("submit", doLogin);
  logoutEl.addEventListener("click", function () { if (!busy) doLogout(); });
  newChatEl.addEventListener("click", function () { if (!busy && authed) resetChat(); });
  langBn.addEventListener("click", function () { setLanguage("bn"); });
  langEn.addEventListener("click", function () { setLanguage("en"); });

historyBtn.addEventListener("click", openDrawer);
  drawerCloseEl.addEventListener("click", closeDrawer);
  backdropEl.addEventListener("click", closeDrawer);
  drawerNewEl.addEventListener("click", function () { if (!busy && authed) { resetChat(); setView("ask"); closeDrawer(); } });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });

  // top navigation
  navHome.addEventListener("click", function () { setView("home"); });
  navAsk.addEventListener("click", function () {
    if (!authed) { goToLogin({ view: "ask" }); return; }
    setView("ask");
    inputEl.focus();
  });
  loginOpenEl.addEventListener("click", function () { goToLogin({ view: "home" }); });

  // home page: ask bar and picture button
  homeForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = homeInput.value.trim();
    if (!q || busy) return;
    if (!authed) { goToLogin({ view: "ask", question: q }); return; }
    homeInput.value = "";
    ask(q);
  });
  homeAttach.addEventListener("click", function () {
    if (busy || preparing) return;
    if (!authed) { goToLogin({ view: "ask" }); return; }
    setView("ask");
    fileEl.click();
  });

  // class and subject choices
  subjectSel.addEventListener("change", markSubject);
  classSel.addEventListener("change", function () {
    try { localStorage.setItem("aiteacher_class", classSel.value); } catch (e) { /* ignore */ }
  });

  applyLanguage();
  try {
    var savedClass = localStorage.getItem("aiteacher_class");
    if (savedClass !== null && /^[0-9]*$/.test(savedClass) && classSel.querySelector('option[value="' + savedClass + '"]')) {
      classSel.value = savedClass;
    }
  } catch (e) { /* storage may be blocked; ignore */ }
  autosize();
  checkSession();
})();
