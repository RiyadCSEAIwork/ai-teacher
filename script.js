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
      diagramTitle: "ফ্লোচার্ট / ডায়াগ্রাম",
      diagramLoading: "ডায়াগ্রাম আঁকা হচ্ছে…",
      diagramFailed: "ডায়াগ্রাম আঁকা যায়নি। কোডটা নিচে দেওয়া হলো।",
      outputTitle: "আউটপুট — ব্রাউজারে যেমন দেখাবে",
      runOutput: "আউটপুট চালান",
      treeTitle: "ট্যাগের কাঠামো (ডায়াগ্রাম)",
      likeTip: "উত্তরটি কাজে লেগেছে",
      dislikeTip: "উত্তরটি কাজে লাগেনি",
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
      loginHint: "শুধু অনুমোদিত সদস্যদের জন্য। আপনার নাম ও পাসওয়ার্ড দিন।",
      nameLabel: "নাম",
      codeLabel: "পাসওয়ার্ড",
      toSignup: "নতুন আইডি খুলুন",
      toLogin: "আগে থেকেই আইডি আছে? লগইন করুন",
      signupTitle: "নতুন আইডি খুলুন",
      signupHint: "ইনভাইট কোড লাগবে, যা শিক্ষক বা অ্যাডমিন দেবেন। আইডির সংখ্যা খুব সীমিত।",
      signupNameLabel: "ইউজারনেম (৩–২০ অক্ষর: a-z, ০-৯, _ বা -)",
      signupPassLabel: "পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)",
      signupPass2Label: "পাসওয়ার্ড আবার লিখুন",
      signupInviteLabel: "ইনভাইট কোড",
      signupBtn: "আইডি খুলুন",
      signingUp: "অপেক্ষা করুন…",
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
        server_not_configured: "সার্ভার এখনো ঠিকমতো সেট করা হয়নি।",
        invalid_login: "নাম বা পাসওয়ার্ড ভুল।",
        signup_closed: "নতুন আইডি খোলা বন্ধ আছে।",
        signup_full: "আইডি খোলার সব জায়গা ভরে গেছে।",
        invalid_invite: "ইনভাইট কোড ভুল।",
        name_taken: "এই ইউজারনেম আগেই নেওয়া হয়েছে।",
        bad_name: "ইউজারনেম ৩–২০ অক্ষরের হতে হবে।",
        weak_password: "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।",
        password_mismatch: "দুইবার লেখা পাসওয়ার্ড মিলছে না।",
        too_many_attempts: "অনেকবার ভুল চেষ্টা হয়েছে।",
        unauthorized: "লগইনের মেয়াদ শেষ।",
        daily_limit: "আজকের প্রশ্নের সীমা শেষ। কাল আবার চেষ্টা করুন।",
        global_limit: "আজকের জন্য মোট সীমা শেষ।",
        bad_image: "ছবিটা পাঠানো যায়নি।",
        image_type: "ফাইল ফরম্যাট সঠিক নয়।",
        image_too_big: "ছবি অনেক বড় (সর্বোচ্চ ২০ MB)।",
        image_failed: "ছবি খুলতে পারিনি।",
        history_not_configured: "ইতিহাস ডাটাবেস যুক্ত করা বাকি।",
        history_failed: "ইতিহাস লোড করতে সমস্যা হয়েছে।",
        generic: "দুঃখিত, উত্তর আনতে সমস্যা হয়েছে।"
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
      welcome: "Hi! I'm AI Teacher. Ask me anything and I'll explain it step by step.",
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
      diagramTitle: "Flowchart / diagram",
      diagramLoading: "Drawing the diagram…",
      diagramFailed: "The diagram could not be drawn.",
      outputTitle: "Output — how it looks in a browser",
      runOutput: "Run output",
      treeTitle: "Tag structure (diagram)",
      likeTip: "This answer helped",
      dislikeTip: "This answer did not help",
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
        return "[Context — " + parts.join("; ") + ". Answer at this level.]\n";
      },
      defaultImageQuestion: "Look carefully at this image and explain it.",
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
      loginHint: "For approved members only.",
      toSignup: "Create a new ID",
      toLogin: "Already have an ID? Log in",
      signupTitle: "Create a new ID",
      signupHint: "You need the invite code from your teacher.",
      signupNameLabel: "Username",
      signupPassLabel: "Password",
      signupPass2Label: "Repeat password",
      signupInviteLabel: "Invite code",
      signupBtn: "Create ID",
      signingUp: "Please wait…",
      nameLabel: "Name",
      codeLabel: "Password",
      loginBtn: "Enter",
      loggingIn: "Please wait…",
      suggestions: ["What is photosynthesis?", "How do I solve quadratic equations?"],
      errors: { generic: "Sorry, something went wrong getting the answer." }
    }
  };

  var MAX_HISTORY = 12;
  var MAX_IMAGE_FILE_BYTES = 20 * 1024 * 1024;
  var MAX_IMAGE_SIDE = 2048;                    
  var MAX_IMAGE_BASE64 = 5000000;               
  var KEEP_IMAGES_IN_REQUEST = 2;               
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
  var ctxChipEl = document.getElementById("ctx-chip");
  var answerCardEl = document.querySelector(".answer-card");
  var welcomeEl = document.getElementById("welcome");

  function syncHasChat() {
    var has = chatEl.children.length > 0;
    if (askMainEl.classList.contains("has-chat") === has) return;
    askMainEl.classList.toggle("has-chat", has);
    inputEl.rows = has ? 1 : 3;
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
  var signupForm = document.getElementById("signup-form");
  var signupName = document.getElementById("signup-name");
  var signupPass = document.getElementById("signup-pass");
  var signupPass2 = document.getElementById("signup-pass2");
  var signupInvite = document.getElementById("signup-invite");
  var signupError = document.getElementById("signup-error");
  var signupBtn = document.getElementById("signup-btn");
  var toSignupEl = document.getElementById("to-signup");
  var toLoginEl = document.getElementById("to-login");

  var lang = "bn";
  try {
    var saved = localStorage.getItem("aiteacher_lang");
    if (saved === "bn" || saved === "en") lang = saved;
  } catch (e) {}

  var history = [];
  var busy = false;
  var authed = false;
  var user = "";
  var usage = { used: 0, limit: 0 };
  var loginErrorKey = null;
  var pendingImage = null;
  var preparing = false;
  var view = "home";
  var afterLogin = null;
  var chatId = null;
  var chatTitle = "";
  var chatCtx = null;

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function inline(s) {
    return s
      .replace(/&lt;br\s*\/?&gt;/gi, "<br>")
      .replace(/`([^`\n]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[\s(])\*(?!\s)([^*\n]*[^\s*])\*(?![\w*])/g, "$1<em>$2</em>")
      .replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  }

  function mathToken(maths, tex, display) {
    maths.push({ tex: tex.trim(), display: display });
    return "\uE000" + (maths.length - 1) + "\uE001";
  }

  function extractMath(raw, maths) {
    var parts = raw.split("```");
    for (var i = 0; i < parts.length; i += 2) {
      parts[i] = parts[i]
        .replace(/\$\$([\s\S]+?)\$\$/g, function (m, tex) { return mathToken(maths, tex, true); })
        .replace(/\\\[([\s\S]+?)\\\]/g, function (m, tex) { return mathToken(maths, tex, true); })
        .replace(/\\\(([\s\S]+?)\\\)/g, function (m, tex) { return mathToken(maths, tex, false); })
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
      if (window.katex && window.katex.renderToString) {
        html = window.katex.renderToString(item.tex, { displayMode: item.display, throwOnError: false, strict: "ignore", output: "html" });
      } else {
        html = "<code>" + escapeHtml(item.tex) + "</code>";
      }
    } catch (e) {
      html = "<code>" + escapeHtml(item.tex) + "</code>";
    }
    mathCache[key] = html;
    return html;
  }

  function unescapeHtml(s) {
    return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
  }

  // ===== অল-ইন-ওয়ান স্মার্ট MCQ কার্ড রেন্ডারার =====
  function buildMcqHtml(question, options, explanation, whyWrong, trick) {
    var html = '<div class="mcq-card-ui">';
    if (question) {
      html += '<div class="mcq-header"><span class="mcq-badge">MCQ</span><h4 class="mcq-q-title">' + inline(escapeHtml(question)) + '</h4></div>';
    }

    if (options.length) {
      html += '<div class="mcq-grid">';
      options.forEach(function (opt) {
        var cls = "mcq-opt-item" + (opt.correct ? " is-correct" : "");
        html += '<div class="' + cls + '">';
        html += '<span class="mcq-opt-key">' + escapeHtml(opt.key) + '</span>';
        html += '<span class="mcq-opt-text">' + inline(escapeHtml(opt.text)) + '</span>';
        if (opt.correct) {
          html += '<span class="mcq-check-icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg></span>';
        }
        html += '</div>';
      });
      html += '</div>';
    }

    if (explanation.length) {
      html += '<div class="mcq-exp-box"><div class="mcq-exp-head">ব্যাখ্যা</div>';
      html += '<div class="mcq-exp-body">' + inline(escapeHtml(explanation.join("<br>"))) + '</div></div>';
    }

    if (whyWrong.length) {
      html += '<details class="mcq-wrong-details"><summary class="mcq-wrong-summary">';
      html += '<span>অন্যান্য অপশন কেন ভুল?</span>';
      html += '<span class="mcq-plus-icon">+</span></summary><div class="mcq-wrong-body"><ul>';
      whyWrong.forEach(function (w) {
        html += '<li>' + inline(escapeHtml(w)) + '</li>';
      });
      html += '</ul></div></details>';
    }

    if (trick.length) {
      html += '<div class="mcq-trick-box"><strong>💡 মনে রাখার কৌশল:</strong> ' + inline(escapeHtml(trick.join(" "))) + '</div>';
    }

    html += '</div>';
    return html;
  }

  // সাধারণ টেক্সট থেকে MCQ চিনে সুন্দর কার্ড বানানোর স্বয়ংক্রিয় লজিক
  function parseNaturalMcq(text) {
    if (!/([কখগঘA-D]\s*[\).:-]).*([কখগঘA-D]\s*[\).:-])/s.test(text) && !/MCQ/i.test(text)) return null;
    var lines = text.split(/\r?\n/);
    var question = "";
    var options = [];
    var explanation = [];
    var whyWrong = [];
    var trick = [];
    var section = "q";

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line || line === "MCQ") continue;

      if (/^(ব্যাখ্যা|Explanation)/i.test(line)) { section = "e"; continue; }
      if (/^(অন্যান্য অপশন|বাকি অপশন|অন্য অপশন|Why other)/i.test(line)) { section = "w"; continue; }
      if (/^(মনে রাখার কৌশল|শর্টকাট|Memory trick)/i.test(line)) { section = "t"; continue; }

      var optMatch = line.match(/^(\*?\s*)([কখগঘA-Da-d][\).:-]?)\s*(.*)$/);
      if (optMatch && section !== "e" && section !== "w" && section !== "t") {
        var isCorrect = optMatch[1].indexOf("*") !== -1 || line.indexOf("✓") !== -1 || line.indexOf("সঠিক") !== -1;
        var optText = optMatch[3].replace(/[✓✔]/g, "").replace(/\(সঠিক\)/g, "").trim();
        options.push({ key: optMatch[2], text: optText, correct: isCorrect });
        continue;
      }

      if (section === "q" && !options.length) {
        question += (question ? " " : "") + line;
      } else if (section === "e") {
        explanation.push(line);
      } else if (section === "w") {
        whyWrong.push(line.replace(/^[-*•▶\s]+/, ""));
      } else if (section === "t") {
        trick.push(line.replace(/^(💡|🧠)\s*/, ""));
      }
    }

    if (options.length >= 2) {
      return buildMcqHtml(question, options, explanation, whyWrong, trick);
    }
    return null;
  }

  function renderMarkdown(raw, final) {
    // যদি AI সম্পূর্ণ টেক্সটটিকে MCQ আকারে দেয়, সরাসরি ইন্টারেক্টিভ কার্ডে রূপান্তর
    var naturalMcq = parseNaturalMcq(raw);
    if (naturalMcq) return naturalMcq;

    var maths = [];
    var source = extractMath(raw, maths);
    var text = escapeHtml(source).replace(/\r\n/g, "\n");
    var out = [];
    var parts = text.split(/```/);

    for (var i = 0; i < parts.length; i++) {
      if (i % 2 === 1) {
        var codeRaw = unescapeHtml(parts[i].replace(/^[a-zA-Z0-9_+#-]*\n/, "")).replace(/\n$/, "");
        out.push('<pre><code>' + escapeHtml(codeRaw) + '</code></pre>');
        continue;
      }
      var lines = parts[i].split("\n");
      var para = [];
      for (var j = 0; j < lines.length; j++) {
        var line = lines[j];
        if (line.trim() === "") {
          if (para.length) { out.push("<p>" + inline(para.join("<br>")) + "</p>"); para = []; }
        } else {
          para.push(line);
        }
      }
      if (para.length) out.push("<p>" + inline(para.join("<br>")) + "</p>");
    }

    var html = out.join("");
    html = html.replace(/\uE000(\d+)\uE001/g, function (m, n) { return maths[Number(n)] ? renderTex(maths[Number(n)]) : ""; });
    return html;
  }

  function addMessage(kind, text) {
    var el = document.createElement("div");
    el.className = "msg " + (kind === "user" ? "user" : "bot") + (kind === "error" ? " error" : "");
    if (kind === "bot") { el.innerHTML = renderMarkdown(text, true); }
    else el.textContent = text;
    chatEl.appendChild(el);
    scrollChat();
    return el;
  }

  function renderMeta(el) {
    var t = TEXT[lang];
    var who = el.getAttribute("data-role") === "user" ? t.meLabel : t.aiLabel;
    el.textContent = who + " · " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function addMeta(role) {
    var el = document.createElement("div");
    el.className = "msg-meta " + (role === "user" ? "from-user" : "from-bot");
    el.setAttribute("data-role", role);
    renderMeta(el);
    chatEl.appendChild(el);
    return el;
  }

  function addUserMessage(text, image) {
    var el = document.createElement("div");
    el.className = "msg user";
    if (image && image.url) {
      var img = document.createElement("img");
      img.className = "msg-img";
      img.src = image.url;
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

  function addAnswerActions(answerText) {
    var old = chatEl.querySelectorAll(".actions");
    for (var i = 0; i < old.length; i++) old[i].remove();
    var bar = document.createElement("div");
    bar.className = "actions";
    var copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "action-btn";
    copyBtn.textContent = "কপি";
    copyBtn.addEventListener("click", function () {
      navigator.clipboard.writeText(answerText);
      copyBtn.textContent = "কপি হয়েছে";
      setTimeout(function () { copyBtn.textContent = "কপি"; }, 1500);
    });
    bar.appendChild(copyBtn);
    chatEl.appendChild(bar);
  }

  function setBusy(state) {
    busy = state;
    sendEl.disabled = state;
    inputEl.disabled = state;
    homeInput.disabled = state;
    homeSend.disabled = state;
  }

  function autosize() {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 180) + "px";
  }

  var SUBJECT_IDS = ["math", "physics", "chemistry", "biology", "ict"];

  function setView(next) {
    view = next;
    appEl.setAttribute("data-view", next);
    navHome.classList.toggle("active", next === "home");
    navAsk.classList.toggle("active", next === "ask");
    if (next === "ask") autosize();
  }

  function fillSelects() {
    var t = TEXT[lang];
    classSel.innerHTML = '<option value="">' + t.classLabel + '</option>';
    t.classes.forEach(function (c, i) { classSel.innerHTML += '<option value="' + i + '">' + c + '</option>'; });
    subjectSel.innerHTML = '<option value="">' + t.subjectLabel + '</option>';
    SUBJECT_IDS.forEach(function (id) { subjectSel.innerHTML += '<option value="' + id + '">' + t.subjects[id] + '</option>'; });
  }

  function renderSubjects() {
    var t = TEXT[lang];
    subjectListEl.innerHTML = "";
    homeChipsEl.innerHTML = "";
    SUBJECT_IDS.forEach(function (id) {
      var li = document.createElement("li");
      li.className = "subject-item";
      li.innerHTML = '<button type="button">' + t.subjects[id] + '</button>';
      li.querySelector("button").addEventListener("click", function () {
        subjectSel.value = id;
        setView("ask");
      });
      subjectListEl.appendChild(li);

      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = t.subjects[id];
      chip.addEventListener("click", function () {
        if (!authed) { goToLogin({ view: "ask", subject: id }); return; }
        subjectSel.value = id;
        setView("ask");
      });
      homeChipsEl.appendChild(chip);
    });
  }

  function applyLanguage() {
    var t = TEXT[lang];
    sendLabelEl.textContent = t.getAnswer;
    navHomeLabel.textContent = t.navHome;
    navAskLabel.textContent = t.navAsk;
    historyLabelEl.textContent = t.historyBtn;
    heroT1.textContent = t.heroTitle1;
    heroSub.textContent = t.heroSub;
    homeInput.placeholder = t.homePlaceholder;
    homeSendLabel.textContent = t.homeAsk;
    askTitleEl.textContent = t.askTitle;
    answerTitleEl.textContent = t.answerTitle;
    attachLabelEl.textContent = t.addImage;
    welcomeEl.textContent = t.welcome;
    fillSelects();
    renderSubjects();
    drawerTitleEl.textContent = t.historyTitle;
    drawerNewEl.textContent = "+ " + t.newChat;
    langBn.classList.toggle("active", lang === "bn");
    langEn.classList.toggle("active", lang === "en");
  }

  function goToLogin(after) {
    afterLogin = after || null;
    setView("login");
  }

  function showApp(data) {
    authed = true;
    user = data.user || "";
    appEl.classList.remove("logged-out");
    applyLanguage();
    setView("home");
  }

  async function checkSession() {
    try {
      var res = await fetch("/api/me");
      var data = await res.json();
      if (res.ok && data && data.ok) showApp(data);
      else setView("home");
    } catch (e) {
      setView("home");
    } finally {
      appEl.classList.remove("checking");
    }
  }

  async function ask(question) {
    var q = (question || "").trim();
    var image = pendingImage;
    if ((!q && !image) || busy) return;
    setView("ask");
    addMeta("user");
    addUserMessage(q, image);
    history.push({ role: "user", text: q, image: image });
    pendingImage = null;
    inputEl.value = "";
    autosize();
    setBusy(true);

    var typing = addMessage("bot", "");
    typing.classList.add("typing");
    typing.textContent = "ভাবছি…";

    try {
      var res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang: lang, messages: history })
      });

      var text = "";
      typing.remove();
      var botEl = addMessage("bot", "");

      var reader = res.body.getReader();
      var decoder = new TextDecoder("utf-8");
      var buffer = "";

      while (true) {
        var chunk = await reader.read();
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });
        var lines = buffer.split("\n\n");
        buffer = lines.pop();
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (line.startsWith("data:")) {
            try {
              var ev = JSON.parse(line.slice(5).trim());
              if (ev.t) { text += ev.t; botEl.innerHTML = renderMarkdown(text, false); }
            } catch (err) {}
          }
        }
      }
      botEl.innerHTML = renderMarkdown(text, true);
      history.push({ role: "assistant", text: text });
      addAnswerActions(text);
    } catch (e) {
      addMessage("error", "উত্তর আনতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setBusy(false);
    }
  }

  // ইভেন্ট লিসেনার
  formEl.addEventListener("submit", function (e) { e.preventDefault(); ask(inputEl.value); });
  homeForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!authed) { goToLogin({ view: "ask" }); return; }
    var q = homeInput.value.trim();
    homeInput.value = "";
    ask(q);
  });
  inputEl.addEventListener("input", autosize);

  historyBtn.addEventListener("click", function () { drawerEl.classList.add("open"); backdropEl.classList.add("show"); });
  drawerCloseEl.addEventListener("click", function () { drawerEl.classList.remove("open"); backdropEl.classList.remove("show"); });
  backdropEl.addEventListener("click", function () { drawerEl.classList.remove("open"); backdropEl.classList.remove("show"); });

  navHome.addEventListener("click", function () { setView("home"); });
  navAsk.addEventListener("click", function () { setView("ask"); });

  applyLanguage();
  checkSession();
})();
