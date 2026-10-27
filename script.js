(function () {
  "use strict";

  var TEXT = {
    bn: {
      tagline: "প্রশ্ন করুন, সহজ ভাষায় বুঝে নিন",
      placeholder: "এখানে আপনার প্রশ্ন লিখুন…",
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
      usage: function (user, used, limit) { return user + " · আজ " + used + "/" + limit + " প্রশ্ন"; },
      loginTitle: "লগইন করুন",
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
        generic: "দুঃখিত, উত্তর আনতে সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।"
      }
    },
    en: {
      tagline: "Ask a question and learn step by step",
      placeholder: "Type your question here…",
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
      usage: function (user, used, limit) { return user + " · " + used + "/" + limit + " questions today"; },
      loginTitle: "Log in",
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
  var taglineEl = document.getElementById("tagline");
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

  function renderMarkdown(raw) {
    var text = escapeHtml(cleanLatex(raw)).replace(/\r\n/g, "\n");
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
    chatEl.scrollTop = chatEl.scrollHeight;
    return el;
  }

  function setBusy(state) {
    busy = state;
    sendEl.disabled = state;
    inputEl.disabled = state;
    attachEl.disabled = state;
    previewRemoveEl.disabled = state;
    if (!state) inputEl.focus();
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

  async function handleFileChosen() {
    var file = fileEl.files && fileEl.files[0];
    if (!file || busy || !authed) return;

    clearPendingImage();
    preparing = true;
    sendEl.disabled = true;
    showPreview(file.name || "", TEXT[lang].imageReading);

    try {
      var prepared = await prepareImage(file);
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
    inputEl.style.height = Math.min(inputEl.scrollHeight, 160) + "px";
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
    taglineEl.textContent = t.tagline;
    inputEl.placeholder = t.placeholder;
    sendEl.textContent = t.send;
    newChatEl.textContent = t.newChat;
    logoutEl.textContent = t.logout;
    attachEl.title = t.attach;
    attachEl.setAttribute("aria-label", t.attach);
    previewRemoveEl.title = t.removeImage;
    previewRemoveEl.setAttribute("aria-label", t.removeImage);
    if (preparing) previewStatusEl.textContent = t.imageReading;
    noteEl.textContent = t.note;
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
    clearPendingImage();
    chatEl.innerHTML = "";
    suggestionsEl.classList.remove("hidden");
    addMessage("bot", TEXT[lang].welcome);
  }

  function setLanguage(next) {
    lang = next;
    try { localStorage.setItem("aiteacher_lang", lang); } catch (e) { /* ignore */ }
    applyLanguage();
    if (authed && history.length === 0) resetChat(); // only refresh the welcome text if no conversation yet
  }

  // ---------- login state ----------
  function showApp(data) {
    authed = true;
    user = data.user || "";
    usage = { used: data.used || 0, limit: data.limit || 0 };
    loginErrorKey = null;
    appEl.classList.remove("logged-out");
    applyLanguage();
    resetChat();
    inputEl.focus();
  }

  function showLogin(errorKey) {
    authed = false;
    user = "";
    history = [];
    clearPendingImage();
    chatEl.innerHTML = "";
    appEl.classList.add("logged-out");
    loginErrorKey = errorKey || null;
    loginCode.value = "";
    applyLanguage();
  }

  async function checkSession() {
    try {
      var res = await fetch("/api/me");
      var data = null;
      try { data = await res.json(); } catch (e) { /* ignore */ }
      if (res.ok && data && data.ok) showApp(data);
      else showLogin(data && data.error === "server_not_configured" ? "server_not_configured" : null);
    } catch (e) {
      showLogin("network");
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
    showLogin(null);
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

    suggestionsEl.classList.add("hidden");
    addUserMessage(q, image);
    history.push({ role: "user", text: q, image: image });
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
        body: JSON.stringify({ lang: lang, messages: buildMessages() })
      });
      var type = res.headers.get("Content-Type") || "";

      if (res.ok && res.body && type.indexOf("text/event-stream") !== -1) {
        await readStream(res, typing);
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
  async function readStream(res, typing) {
    var reader = res.body.getReader();
    var decoder = new TextDecoder("utf-8");
    var buffer = "";
    var answer = "";
    var botEl = null;
    var finished = false;
    var failKey = null;
    var paintQueued = false;

    function paint() {
      paintQueued = false;
      if (!botEl) return;
      var nearBottom = chatEl.scrollHeight - chatEl.scrollTop - chatEl.clientHeight < 80;
      botEl.innerHTML = renderMarkdown(answer);
      if (nearBottom) chatEl.scrollTop = chatEl.scrollHeight;
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
          botEl = addMessage("bot", "");
          botEl.classList.add("streaming");
        }
        answer += ev.t;
        queuePaint();
      } else if (ev.done) {
        finished = true;
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
      history.push({ role: "assistant", text: answer });
      if (!finished) addMessage("error", errorText(failKey || "network"));
    } else {
      handleFailure(failKey || "generic", null);
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

  applyLanguage();
  autosize();
  checkSession();
})();
