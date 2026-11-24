/* ============ AI Teacher — Home V2 (guest + logged-in) ============
   An overlay (#hv2) shown ONLY while the old page is on its home state.
   It drives your existing code (script.js functions + the existing ids), nothing there is changed:
     - ask      -> userQuestionInput + handleQuestionSubmit()  (login check, limits, streaming all stay)
     - subject  -> existing .chip-btn buttons,   class -> #classSelect
     - history  -> openHistoryDrawer() / openChat(id)
     - login    -> openAuthModal(),  logout -> #btnLogout
   When a chat starts, script.js adds body.chat-active -> overlay hides.
   "নতুন চ্যাট"/logo in the old header removes it -> overlay comes back.            */
(function () {
  'use strict';

  var HERO = ['hero-v2.webp', 'hero.webp'];       // tried in this order, emoji if both missing
  var EXAMPLES = [
    { q: 'নিউটনের তৃতীয় সূত্রটি লিখ।', s: 'physics', c: 'Physics' },
    { q: 'H₂O এর মোলার ভর কত?', s: 'chemistry', c: 'Chemistry' },
    { q: 'ত্রিভুজের অন্তঃকোণগুলোর সমষ্টি কত?', s: 'math', c: 'Math' }
  ];
  var EXAMPLES_EN = [
    { q: "Write Newton's third law.", s: 'physics', c: 'Physics' },
    { q: 'What is the molar mass of H₂O?', s: 'chemistry', c: 'Chemistry' },
    { q: 'What is the sum of the angles of a triangle?', s: 'math', c: 'Math' }
  ];
  var SUBJECTS = [
    ['physics', '⚛️', 'Physics'], ['chemistry', '🧪', 'Chemistry'], ['math', 'π', 'Math'],
    ['biology', '🌿', 'Biology'], ['ict', '🖥️', 'ICT'], ['others', '•••', 'Others']
  ];

  var T = {
    bn: {
      tagline: 'Academic Excellence & Admission Guidance', newQ: 'নতুন প্রশ্ন', oldQ: 'পুরানো প্রশ্ন', notes: 'Smart Notes',
      mcq: 'MCQ প্র্যাকটিস', adm: 'অ্যাডমিশন গাইড', login: 'লগইন', logout: 'লগআউট',
      welcome: 'Welcome to AI Teacher', h1a: 'পড়াশোনা হোক', h1b: 'আরও সহজ ও স্মার্ট',
      sub: 'যেকোনো প্রশ্ন করুন, AI দেবে সহজ ও নির্ভুল উত্তর!', ph: 'আপনার প্রশ্ন লিখুন বা ছবি যুক্ত করুন...',
      ask: 'প্রশ্ন করুন', pickSub: 'বিষয় নির্বাচন করুন', allSub: 'সকল বিষয় দেখুন', cls: 'শ্রেণি নির্বাচন',
      physics: 'পদার্থবিজ্ঞান', chemistry: 'রসায়ন', math: 'গণিত', biology: 'জীববিজ্ঞান', ict: 'তথ্য ও যোগাযোগ প্রযুক্তি', others: 'অন্যান্য',
      f1: 'Instant Answer', f1s: 'দ্রুত উত্তর পান', f2: 'Smart Notes', f2s: 'গুরুত্বপূর্ণ নোট তৈরি করুন',
      f3: 'MCQ Practice', f3s: 'নিজেকে যাচাই করুন', f4: 'Admission Guide', f4s: 'ভর্তি প্রস্তুতির সঠিক দিকনির্দেশনা',
      f5: 'Trusted & Secure', f5s: 'নিরাপদ ও নির্ভরযোগ্য',
      exTitle: 'কিছু উদাহরণ প্রশ্ন', more: 'আরও দেখুন', ctaH: 'এখনই শুরু করুন!', ctaP: 'একটি প্রশ্ন করুন অথবা নতুন অ্যাকাউন্ট তৈরি করুন।',
      signup: 'বিনামূল্যে সাইন আপ করুন', ctaNote: 'সাইন আপ না করে আপনি কিছু ফিচার ব্যবহার করতে পারবেন।',
      q1: 'কনসেপ্ট বুঝুন', q1s: 'কঠিন বিষয় সহজভাবে শিখুন', q2: 'MCQ প্র্যাকটিস', q2s: 'নিজেকে যাচাই করুন',
      q3: 'Smart Notes', q3s: 'গুরুত্বপূর্ণ নোট তৈরি করুন', q4: 'Admission Guide', q4s: 'ভর্তি প্রস্তুতির সঠিক দিকনির্দেশনা',
      recent: 'সর্বশেষ প্রশ্নসমূহ', noRecent: 'এখনো কোনো প্রশ্ন করেননি।', cont: 'Continue Learning',
      contS: 'আপনার সর্বশেষ যে পাঠ এখান থেকে চালিয়ে যান', start: 'এবার শুরু করুন', untitled: 'পূর্ববর্তী প্রশ্ন',
      soon: 'এই ফিচারটি শীঘ্রই আসছে', left: 'আজকের বাকি প্রশ্ন: ', img: 'ছবি যুক্ত হয়েছে', micErr: 'এই ব্রাউজারে ভয়েস সাপোর্ট নেই',
      listening: 'শুনছি… বলুন', ago: ' আগে', min: ' মিনিট', hr: ' ঘণ্টা', day: ' দিন', now: 'এইমাত্র'
    },
    en: {
      tagline: 'Academic Excellence & Admission Guidance', newQ: 'New question', oldQ: 'Past questions', notes: 'Smart Notes',
      mcq: 'MCQ Practice', adm: 'Admission Guide', login: 'Login', logout: 'Logout',
      welcome: 'Welcome to AI Teacher', h1a: 'Make studying', h1b: 'easier & smarter',
      sub: 'Ask any question — AI gives simple, accurate answers!', ph: 'Type your question or attach a photo...',
      ask: 'Ask', pickSub: 'Choose a subject', allSub: 'View all subjects', cls: 'Select class',
      physics: 'Physics', chemistry: 'Chemistry', math: 'Math', biology: 'Biology', ict: 'ICT', others: 'Others',
      f1: 'Instant Answer', f1s: 'Get quick answers', f2: 'Smart Notes', f2s: 'Create key notes',
      f3: 'MCQ Practice', f3s: 'Test yourself', f4: 'Admission Guide', f4s: 'Right guidance for admission prep',
      f5: 'Trusted & Secure', f5s: 'Safe and reliable',
      exTitle: 'Example questions', more: 'See more', ctaH: 'Start now!', ctaP: 'Ask a question or create a new account.',
      signup: 'Sign up for free', ctaNote: 'You can use some features without signing up.',
      q1: 'Understand concepts', q1s: 'Learn hard topics easily', q2: 'MCQ Practice', q2s: 'Test yourself',
      q3: 'Smart Notes', q3s: 'Create key notes', q4: 'Admission Guide', q4s: 'Right guidance for admission prep',
      recent: 'Recent questions', noRecent: "You haven't asked anything yet.", cont: 'Continue Learning',
      contS: 'Continue your latest lesson from here', start: 'Start now', untitled: 'Earlier question',
      soon: 'This feature is coming soon', left: 'Questions left today: ', img: 'Image attached', micErr: 'Voice is not supported in this browser',
      listening: 'Listening… speak now', ago: ' ago', min: ' min', hr: ' h', day: ' d', now: 'just now'
    }
  };

  var root, state = { user: null, chats: [], theme: 'dark' }, rec = null;

  /* ---------- helpers ---------- */
  function lang() { try { return currentLanguage === 'en' ? 'en' : 'bn'; } catch (e) { return 'bn'; } }
  function t(k) { return T[lang()][k] || k; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} }
  function $(id) { return document.getElementById(id); }
  function inp() { return root.querySelector('#hv2in'); }
  function toast(msg) {
    var el = root.querySelector('.hv2-toast'); if (!el) return;
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }
  function ago(ms) {
    var ts = Number(ms); if (!ts) return '';
    var m = Math.max(0, Math.round((Date.now() - ts) / 60000));
    if (m < 1) return t('now');
    if (m < 60) return m + t('min') + t('ago');
    if (m < 1440) return Math.round(m / 60) + t('hr') + t('ago');
    return Math.round(m / 1440) + t('day') + t('ago');
  }
  function locked() { try { return !!contextLocked; } catch (e) { return false; } }
  function curSubject() { try { return selectedSubject || ''; } catch (e) { return ''; } }
  function curClass() { try { return selectedClass === undefined ? '' : String(selectedClass); } catch (e) { return ''; } }

  /* ---------- bridge to the existing app ---------- */
  function setSubject(id) {                      // uses the real chip buttons, so all existing logic runs
    if (locked()) return;
    var cur = curSubject();
    if (id === 'others' || !id) { if (cur) { var c0 = document.querySelector('.chip-btn[data-subject="' + cur + '"]'); if (c0) c0.click(); } }
    else if (cur !== id) { var b = document.querySelector('.chip-btn[data-subject="' + id + '"]'); if (b) b.click(); }
    paintSubjects();
  }
  function setClass(v) {
    if (locked()) return;
    var sel = $('classSelect'); if (!sel) return;
    sel.value = v; sel.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function paintSubjects() {
    var cur = curSubject();
    [].forEach.call(root.querySelectorAll('.hv2-sub'), function (b) { b.classList.toggle('active', b.dataset.s === cur); });
    var sel = root.querySelector('#hv2cls'); if (sel) sel.value = curClass();
  }
  function ask(text) {
    text = (text || '').trim();
    var area = $('userQuestionInput');
    if (!area) return;
    if (!text && typeof pendingImage !== 'undefined' && !pendingImage) { inp().focus(); return; }
    area.value = text;
    if (typeof autosizeInput === 'function') autosizeInput();
    handleQuestionSubmit();        // guest -> login popup (question is kept); logged in -> chat starts
    if (state.user) inp().value = '';
  }
  function openLogin(signup) {
    resumeAfterAuth = false;
    openAuthModal();
    var tab = $(signup ? 'tabSignup' : 'tabLogin'); if (tab) tab.click();
  }

  /* ---------- data ---------- */
  function loadUser() {
    return fetch('/api/me', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        var name = j && j.ok && (j.username || (typeof j.user === 'string' ? j.user : ''));
        state.user = name ? { username: name, gender: j.gender || 'male', used: j.used || 0, limit: j.limit || 30 } : null;
      }).catch(function () { state.user = null; });
  }
  function loadChats() {
    if (!state.user) { state.chats = []; return Promise.resolve(); }
    return fetch('/api/chats', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { state.chats = (j && j.ok && j.chats) ? j.chats.slice(0, 20) : []; })
      .catch(function () { state.chats = []; });
  }

  /* ---------- render ---------- */
  function avatar() {
    try { return avatarFor({ username: state.user.username, gender: state.user.gender }); } catch (e) { return '👤'; }
  }
  function headerHTML() {
    var u = state.user;
    return '<header class="hv2-head"><div class="hv2-head-in">' +
      '<button class="hv2-logo" data-a="home"><span class="hv2-logo-ic">🎓</span><span><b>AI Teacher</b><small>' + t('tagline') + '</small></span></button>' +
      '<nav class="hv2-nav" id="hv2nav">' +
        '<button class="hv2-primary" data-a="new">＋ ' + t('newQ') + '</button>' +
        '<button data-a="old">' + t('oldQ') + '</button>' +
        '<button data-a="notes">' + t('notes') + '</button>' +
        '<button data-a="mcq">' + t('mcq') + ' <span class="hv2-badge">New</span></button>' +
        '<button data-a="adm">' + t('adm') + '</button>' +
      '</nav><div class="hv2-tools">' +
        '<button class="hv2-pill hv2-round" data-a="theme">' + (state.theme === 'dark' ? '🌙' : '☀️') + '</button>' +
        '<button class="hv2-pill" data-a="lang">' + (lang() === 'bn' ? 'বাংলা' : 'English') + ' ⇄</button>' +
        (u ? '<div class="hv2-user"><button class="hv2-pill" data-a="umenu"><span class="hv2-av">' + avatar() + '</span><span class="hv2-lbl">' + esc(u.username) + '</span> ▾</button>' +
             '<div class="hv2-menu" id="hv2menu"><button data-a="logout">' + t('logout') + '</button></div></div>'
           : '<button class="hv2-pill" data-a="login">👤 ' + t('login') + '</button>') +
        '<button class="hv2-pill hv2-round hv2-burger" data-a="burger">☰</button></div></div></header>';
  }
  function classOptions() {
    var names; try { names = CLASS_NAMES; } catch (e) { names = []; }
    return '<option value="">' + esc(t('cls')) + '</option>' + names.map(function (c, i) { return '<option value="' + i + '">' + esc(c[lang()]) + '</option>'; }).join('');
  }
  function heroHTML() {
    var u = state.user, left = '';
    if (u) left = '<div class="hv2-note">' + t('left') + Math.max(0, u.limit - u.used) + ' / ' + u.limit + '</div>';
    return '<section class="hv2-hero"><div>' +
      (u ? '' : '<div class="hv2-welcome">✨ ' + t('welcome') + '</div>') +
      '<h1>' + t('h1a') + '<br><span>' + t('h1b') + '</span></h1><p>' + t('sub') + '</p>' +
      '<form class="hv2-ask" id="hv2form" autocomplete="off"><span>🔍</span>' +
        '<input id="hv2in" type="text" placeholder="' + esc(t('ph')) + '">' +
        '<button type="button" class="hv2-ic" data-a="mic" id="hv2mic" title="Voice">🎤</button>' +
        '<button type="button" class="hv2-ic" data-a="img" title="Image">🖼️</button>' +
        '<button type="submit" class="hv2-go">▶ ' + t('ask') + '</button></form>' +
      '<div class="hv2-ctxrow"><select id="hv2cls" class="hv2-select">' + classOptions() + '</select>' +
        '<span class="hv2-attach" id="hv2att" style="display:none">🖼️ ' + t('img') + ' <button type="button" data-a="rmimg">✕</button></span></div>' +
      left + '</div>' +
      '<div class="hv2-art"><img id="hv2hero" alt="" src="' + HERO[0] + '"><div class="hv2-tag"><i>Learn</i><i>Grow</i><i>Achieve</i></div></div></section>';
  }
  function subjectsHTML() {
    return '<div class="hv2-sec-h"><h2>🟦 ' + t('pickSub') + '</h2><button data-a="allsub">' + t('allSub') + ' →</button></div><div class="hv2-subjects">' +
      SUBJECTS.map(function (s) {
        return '<button class="hv2-sub" data-a="subject" data-s="' + s[0] + '"><span class="e">' + s[1] + '</span><span><b>' + s[2] + '</b><small>' + t(s[0]) + '</small></span><span class="a">→</span></button>';
      }).join('') + '</div>';
  }
  function guestBody() {
    var feats = [['⚡', 'f1', 'f1s'], ['📘', 'f2', 'f2s'], ['✅', 'f3', 'f3s'], ['🏆', 'f4', 'f4s'], ['🛡️', 'f5', 'f5s']];
    var ex = lang() === 'en' ? EXAMPLES_EN : EXAMPLES;
    return subjectsHTML() +
      '<div class="hv2-feats">' + feats.map(function (f) { return '<div class="hv2-feat"><span class="e">' + f[0] + '</span><span><b>' + t(f[1]) + '</b><small>' + t(f[2]) + '</small></span></div>'; }).join('') + '</div>' +
      '<div class="hv2-bottom"><div class="hv2-box"><div class="hv2-sec-h" style="margin:0"><h2>⭐ ' + t('exTitle') + '</h2></div><ul class="hv2-list">' +
      ex.map(function (e, i) { return '<li><button data-a="ex" data-i="' + i + '"><span class="t">' + esc(e.q) + '</span><span class="hv2-chip">' + e.c + '</span><span>→</span></button></li>'; }).join('') +
      '</ul></div><div class="hv2-box hv2-cta"><h3>' + t('ctaH') + '</h3><p>' + t('ctaP') + '</p>' +
      '<div class="hv2-cta-btns"><button class="hv2-pill solid" data-a="signup">👤 ' + t('signup') + '</button><button class="hv2-pill" data-a="login">' + t('login') + '</button></div>' +
      '<div class="hv2-note">ⓘ ' + t('ctaNote') + '</div></div></div>';
  }
  function userBody() {
    var q = [['📖', 'q1', 'q1s', 'concept'], ['📝', 'q2', 'q2s', 'mcq'], ['🗒️', 'q3', 'q3s', 'notes'], ['🏆', 'q4', 'q4s', 'adm']];
    var list = state.chats.slice(0, 3), last = state.chats[0];
    return '<div class="hv2-quick">' + q.map(function (x) {
      return '<button class="hv2-q" data-a="' + x[3] + '"><span class="e">' + x[0] + '</span><span><b>' + t(x[1]) + '</b><small>' + t(x[2]) + '</small></span><span class="a">→</span></button>';
    }).join('') + '</div>' + subjectsHTML() +
      '<div class="hv2-bottom"><div class="hv2-box"><div class="hv2-sec-h" style="margin:0"><h2>🕘 ' + t('recent') + '</h2><button data-a="old">' + t('more') + ' →</button></div>' +
      (list.length ? '<ul class="hv2-list">' + list.map(function (c) {
        return '<li><button data-a="chat" data-id="' + esc(c.id) + '"><span>📄</span><span class="t">' + esc(c.title || t('untitled')) + '</span><span class="m">🕒 ' + ago(c.updated) + '</span></button></li>';
      }).join('') + '</ul>' : '<div class="hv2-empty">' + t('noRecent') + '</div>') +
      '</div><div class="hv2-box hv2-cta"><h3 style="font-size:26px;color:#fff">⭐ ' + t('cont') + '</h3><p style="font-size:16px">' + t('contS') + '</p>' +
      (last ? '<div class="hv2-cont">⚛️ <b>' + esc(last.title || t('untitled')) + '</b></div>' : '') +
      '<div class="hv2-cta-btns"><button class="hv2-pill solid" data-a="' + (last ? 'chat' : 'ask') + '" data-id="' + esc(last ? last.id : '') + '">' + t('start') + ' →</button></div></div></div>';
  }
  function render() {
    var keep = inp() ? inp().value : '';
    root.setAttribute('data-theme', state.theme);
    root.innerHTML = headerHTML() + '<main class="hv2-wrap">' + heroHTML() + (state.user ? userBody() : guestBody()) + '</main><div class="hv2-toast"></div>';
    inp().value = keep;
    var img = root.querySelector('#hv2hero'), n = 0;
    img.onerror = function () { n++; if (n < HERO.length) img.src = HERO[n]; else img.outerHTML = '<div class="hv2-fallback">🎓📖</div>'; };
    paintSubjects(); paintAttach();
  }
  function refresh() { return loadUser().then(loadChats).then(render); }

  function paintAttach() {
    var el = root.querySelector('#hv2att'); if (!el) return;
    var has = false; try { has = !!pendingImage; } catch (e) {}
    el.style.display = has ? 'inline-flex' : 'none';
  }
  function watchImage() {
    var f = $('fileImageInput'); if (!f) return;
    f.addEventListener('change', function () {
      var tries = 0, iv = setInterval(function () {
        tries++; paintAttach();
        var busy = false; try { busy = preparingImage; } catch (e) {}
        if (!busy || tries > 40) clearInterval(iv);
      }, 250);
    });
  }

  /* ---------- voice (own, independent of voice.js) ---------- */
  function toggleMic() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast(t('micErr')); return; }
    var btn = root.querySelector('#hv2mic');
    if (rec) { try { rec.stop(); } catch (e) {} return; }
    rec = new SR(); rec.lang = lang() === 'en' ? 'en-US' : 'bn-BD'; rec.interimResults = true; rec.continuous = false;
    var finalText = '';
    rec.onstart = function () { btn.classList.add('rec'); toast(t('listening')); };
    rec.onresult = function (e) {
      var txt = ''; for (var i = 0; i < e.results.length; i++) { txt += e.results[i][0].transcript; if (e.results[i].isFinal) finalText = txt; }
      inp().value = txt;
    };
    rec.onerror = function () {};
    rec.onend = function () { rec = null; var b = root.querySelector('#hv2mic'); if (b) b.classList.remove('rec'); if (finalText.trim()) ask(finalText); };
    try { rec.start(); } catch (e) { rec = null; }
  }

  /* ---------- events ---------- */
  function onClick(e) {
    var b = e.target.closest('[data-a]'); if (!b || !root.contains(b)) return;
    var a = b.getAttribute('data-a');
    var menu = root.querySelector('#hv2menu'); if (menu && a !== 'umenu') menu.classList.remove('open');
    var nav = root.querySelector('#hv2nav'); if (nav && a !== 'burger') nav.classList.remove('open');
    switch (a) {
      case 'home': case 'new': case 'ask': case 'concept': root.scrollTo({ top: 0, behavior: 'smooth' }); inp().focus(); break;
      case 'old': openHistoryDrawer(); break;
      case 'notes': $('btnSmartNotes').click(); break;
      case 'mcq': $('btnMcqPractice').click(); break;
      case 'adm': setClass('7'); root.scrollTo({ top: 0, behavior: 'smooth' }); inp().focus(); break;   // 7 = ভর্তি পরীক্ষা
      case 'allsub': toast(t('soon')); break;
      case 'theme': state.theme = state.theme === 'dark' ? 'light' : 'dark'; ls('hv2_theme', state.theme); render(); break;
      case 'lang': setLanguage(lang() === 'bn' ? 'en' : 'bn'); render(); break;
      case 'umenu': if (menu) menu.classList.toggle('open'); break;
      case 'burger': nav.classList.toggle('open'); break;
      case 'logout': $('btnLogout').click(); break;
      case 'login': openLogin(false); break;
      case 'signup': openLogin(true); break;
      case 'subject': setSubject(b.dataset.s); inp().focus(); break;
      case 'ex': var ex = (lang() === 'en' ? EXAMPLES_EN : EXAMPLES)[+b.dataset.i]; setSubject(ex.s); ask(ex.q); break;
      case 'chat': var id = b.dataset.id; if (id) openChat(id); else inp().focus(); break;
      case 'mic': toggleMic(); break;
      case 'img': var f = $('fileImageInput'); if (f) f.click(); break;
      case 'rmimg': if (typeof clearPendingImage === 'function') clearPendingImage(); paintAttach(); break;
    }
  }
  function onSubmit(e) { if (e.target.id !== 'hv2form') return; e.preventDefault(); ask(inp().value); }
  function onChange(e) { if (e.target.id === 'hv2cls') { setClass(e.target.value); paintSubjects(); } }

  function syncVisibility() {
    var inChat = document.body.classList.contains('chat-active');
    if (inChat) root.classList.add('hv2-hidden');
    else if (root.classList.contains('hv2-hidden')) { root.classList.remove('hv2-hidden'); refresh(); }
  }

  /* ---------- init ---------- */
  function init() {
    root = $('hv2') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'hv2' }));
    state.theme = ls('hv2_theme') || 'dark';
    root.setAttribute('data-theme', state.theme);
    root.addEventListener('click', onClick);
    root.addEventListener('submit', onSubmit);
    root.addEventListener('change', onChange);
    document.addEventListener('click', function (e) { var m = root.querySelector('#hv2menu'); if (m && !e.target.closest('.hv2-user')) m.classList.remove('open'); });

    // keep overlay and old app in sync: chat starts -> hide, "new chat" -> show again
    new MutationObserver(syncVisibility).observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // after login/signup the old code calls checkAuth(); re-draw the home when it finishes
    if (typeof checkAuth === 'function') {
      var orig = checkAuth;
      window.checkAuth = function () { return Promise.resolve(orig.apply(this, arguments)).then(function () { refresh(); }); };
    }
    watchImage();
    syncVisibility();
    refresh();
    window.HomeV2 = { refresh: refresh };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
