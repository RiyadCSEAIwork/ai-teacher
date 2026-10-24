(function () {
  "use strict";

  var TEXT = {
    bn: {
      tagline: "প্রশ্ন করুন, সহজ ভাষায় বুঝে নিন",
      placeholder: "এখানে আপনার প্রশ্ন লিখুন…",
      send: "পাঠান",
      newChat: "নতুন চ্যাট",
      note: "AI ভুল করতে পারে, গুরুত্বপূর্ণ তথ্য যাচাই করে নিন।",
      welcome: "আসসালামু আলাইকুম! আমি AI Teacher। যেকোনো বিষয়ে প্রশ্ন করো, আমি ধাপে ধাপে বুঝিয়ে দেব।",
      thinking: "ভাবছি",
      suggestions: [
        "সালোকসংশ্লেষণ কী?",
        "দ্বিঘাত সমীকরণ কীভাবে সমাধান করব?",
        "Explain Newton's laws simply",
        "ইংরেজিতে Present Perfect Tense বুঝিয়ে দাও"
      ],
      errors: {
        rate_limited: "এই মুহূর্তে অনেক অনুরোধ এসেছে। এক মিনিট পরে আবার চেষ্টা করুন।",
        network: "ইন্টারনেট সংযোগে সমস্যা হচ্ছে। সংযোগ দেখে আবার চেষ্টা করুন।",
        server_not_configured: "সার্ভার এখনো ঠিকমতো সেট করা হয়নি (API key নেই)।",
        generic: "দুঃখিত, উত্তর আনতে সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।"
      }
    },
    en: {
      tagline: "Ask a question and learn step by step",
      placeholder: "Type your question here…",
      send: "Send",
      newChat: "New chat",
      note: "AI can make mistakes. Please double-check important information.",
      welcome: "Hi! I'm AI Teacher. Ask me anything and I'll explain it step by step. You can write in English or বাংলা.",
      thinking: "Thinking",
      suggestions: [
        "What is photosynthesis?",
        "How do I solve a quadratic equation?",
        "নিউটনের গতিসূত্র সহজ করে বলো",
        "Explain the present perfect tense"
      ],
      errors: {
        rate_limited: "Too many requests right now. Please wait a minute and try again.",
        network: "Network problem. Check your connection and try again.",
        server_not_configured: "The server isn't configured yet (missing API key).",
        generic: "Sorry, something went wrong getting the answer. Please try again shortly."
      }
    }
  };

  var MAX_HISTORY = 12;

  var chatEl = document.getElementById("chat");
  var formEl = document.getElementById("form");
  var inputEl = document.getElementById("input");
  var sendEl = document.getElementById("send");
  var newChatEl = document.getElementById("new-chat");
  var suggestionsEl = document.getElementById("suggestions");
  var taglineEl = document.getElementById("tagline");
  var noteEl = document.getElementById("note");
  var langBn = document.getElementById("lang-bn");
  var langEn = document.getElementById("lang-en");

  var lang = "bn";
  try {
    var saved = localStorage.getItem("aiteacher_lang");
    if (saved === "bn" || saved === "en") lang = saved;
  } catch (e) { /* storage may be blocked; ignore */ }

  var history = []; // {role: 'user'|'assistant', text}
  var busy = false;

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

  function renderMarkdown(raw) {
    var text = escapeHtml(raw).replace(/\r\n/g, "\n");
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
        var line = lines[j];
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
    return out.join("");
  }

  // ---------- UI helpers ----------
  function addMessage(kind, text) {
    var el = document.createElement("div");
    el.className = "msg " + (kind === "user" ? "user" : "bot") + (kind === "error" ? " error" : "");
    if (kind === "bot") el.innerHTML = renderMarkdown(text);
    else el.textContent = text;
    chatEl.appendChild(el);
    chatEl.scrollTop = chatEl.scrollHeight;
    return el;
  }

  function setBusy(state) {
    busy = state;
    sendEl.disabled = state;
    inputEl.disabled = state;
    if (!state) inputEl.focus();
  }

  function autosize() {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 160) + "px";
  }

  function applyLanguage() {
    var t = TEXT[lang];
    document.documentElement.lang = lang;
    taglineEl.textContent = t.tagline;
    inputEl.placeholder = t.placeholder;
    sendEl.textContent = t.send;
    newChatEl.textContent = t.newChat;
    noteEl.textContent = t.note;
    langBn.classList.toggle("active", lang === "bn");
    langEn.classList.toggle("active", lang === "en");
    langBn.setAttribute("aria-pressed", lang === "bn");
    langEn.setAttribute("aria-pressed", lang === "en");

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
    chatEl.innerHTML = "";
    suggestionsEl.classList.remove("hidden");
    addMessage("bot", TEXT[lang].welcome);
  }

  function setLanguage(next) {
    lang = next;
    try { localStorage.setItem("aiteacher_lang", lang); } catch (e) { /* ignore */ }
    applyLanguage();
    if (history.length === 0) resetChat(); // only refresh the welcome text if no conversation yet
  }

  // ---------- talking to the backend ----------
  async function ask(question) {
    var q = (question || "").trim();
    if (!q || busy) return;

    suggestionsEl.classList.add("hidden");
    addMessage("user", q);
    history.push({ role: "user", text: q });
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
        body: JSON.stringify({ lang: lang, messages: history.slice(-MAX_HISTORY) })
      });
      var data = null;
      try { data = await res.json(); } catch (e) { /* non-JSON response */ }
      typing.remove();

      if (res.ok && data && data.reply) {
        addMessage("bot", data.reply);
        history.push({ role: "assistant", text: data.reply });
      } else {
        var key = data && data.error;
        var msg = TEXT[lang].errors[key] || TEXT[lang].errors.generic;
        addMessage("error", msg);
        history.pop(); // let the user retry the same question without a dangling turn
      }
    } catch (e) {
      typing.remove();
      addMessage("error", TEXT[lang].errors.network);
      history.pop();
    } finally {
      setBusy(false);
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

  newChatEl.addEventListener("click", function () { if (!busy) resetChat(); });
  langBn.addEventListener("click", function () { setLanguage("bn"); });
  langEn.addEventListener("click", function () { setLanguage("en"); });

  applyLanguage();
  resetChat();
  autosize();
})();
