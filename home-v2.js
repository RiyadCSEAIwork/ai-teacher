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
    ['biology', '🌿', 'Biology'], ['ict', '🖥️', 'ICT']
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
  function doLogout() {            // independent of the old header button; verifies the session really ended
    toast(lang() === 'en' ? 'Logging out…' : 'লগআউট হচ্ছে…');
    var finished = false;
    function finish() {
      if (finished) return; finished = true;
      try { localStorage.removeItem('token'); localStorage.removeItem('auth_token'); } catch (e) {}
      try { document.cookie.split(';').forEach(function (c) { var n = c.split('=')[0].trim(); if (n) document.cookie = n + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'; }); } catch (e) {}
      location.replace(location.pathname + '?lo=' + Date.now());
    }
    fetch('/api/logout', { method: 'POST', credentials: 'same-origin', cache: 'no-store' })
      .catch(function () {})
      .then(function () { return fetch('/api/me', { credentials: 'same-origin', cache: 'no-store' }); })
      .then(function (r) {
        if (!r.ok) return finish();                       // session gone -> reload as guest
        // server still says logged in: try the old header button once, then report
        try { $('btnLogout').click(); } catch (e) {}
        toast(lang() === 'en' ? 'Logout did not complete — try again' : 'লগআউট সম্পূর্ণ হয়নি — আবার চেষ্টা করুন');
        setTimeout(finish, 2500);
      })
      .catch(finish);
  }
  function openLogin(signup) {
    resumeAfterAuth = false;
    openAuthModal();
    var tab = $(signup ? 'tabSignup' : 'tabLogin'); if (tab) tab.click();
  }

  /* ---------- data ---------- */
  function loadUser() {
    return fetch('/api/me', { credentials: 'same-origin', cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        var name = j && j.ok && (j.username || (typeof j.user === 'string' ? j.user : ''));
        state.user = name ? { username: name, gender: j.gender || 'male', used: j.used || 0, limit: j.limit || 30 } : null;
      }).catch(function () { state.user = null; });
  }
  function loadChats() {
    if (!state.user) { state.chats = []; return Promise.resolve(); }
    return fetch('/api/chats', { credentials: 'same-origin', cache: 'no-store' })
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
    var list = state.chats.slice(0, 3), last = state.chats[0];
    return subjectsHTML() +
      '<div class="hv2-bottom"><div class="hv2-box"><div class="hv2-sec-h" style="margin:0"><h2>🕘 ' + t('recent') + '</h2><button data-a="old">' + t('more') + ' →</button></div>' +
      (list.length ? '<ul class="hv2-list">' + list.map(function (c) {
        return '<li><button data-a="chat" data-id="' + esc(c.id) + '"><span>📄</span><span class="t">' + esc(c.title || t('untitled')) + '</span><span class="m">🕒 ' + ago(c.updated) + '</span></button></li>';
      }).join('') + '</ul>' : '<div class="hv2-empty">' + t('noRecent') + '</div>') +
      '</div><div class="hv2-box hv2-cta hv2-cta-cont"><div class="hv2-cont-art" id="hv2cart"><img src="continue-v2.webp" alt=""></div><div class="hv2-cont-txt"><h3 style="font-size:26px;color:#fff">⭐ ' + t('cont') + '</h3><p style="font-size:16px">' + t('contS') + '</p>' +
      (last ? '<div class="hv2-cont">⚛️ <b>' + esc(last.title || t('untitled')) + '</b></div>' : '') +
      '<div class="hv2-cta-btns"><button class="hv2-pill solid" data-a="' + (last ? 'chat' : 'ask') + '" data-id="' + esc(last ? last.id : '') + '">' + t('start') + ' →</button></div></div></div></div>';
  }

  /* ---------- picture beside "Continue Learning": continue-v2.webp if present, else this drawing ---------- */
  var CONT_SVG = '<svg viewBox="0 0 420 300" xmlns="http://www.w3.org/2000/svg"><defs>' +
    '<radialGradient id="cg" cx="50%" cy="55%" r="55%"><stop offset="0" stop-color="#4aa3ff" stop-opacity=".75"/><stop offset="1" stop-color="#4aa3ff" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="b1" x1="0" x2="1"><stop offset="0" stop-color="#1d5bff"/><stop offset="1" stop-color="#6a3dff"/></linearGradient>' +
    '<linearGradient id="b2" x1="0" x2="1"><stop offset="0" stop-color="#0fb7a8"/><stop offset="1" stop-color="#1b86ff"/></linearGradient>' +
    '<linearGradient id="b3" x1="0" x2="1"><stop offset="0" stop-color="#ff9f1c"/><stop offset="1" stop-color="#ff5d8f"/></linearGradient>' +
    '<linearGradient id="cap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b3f9e"/><stop offset="1" stop-color="#0c1a5e"/></linearGradient></defs>' +
    '<ellipse cx="215" cy="170" rx="200" ry="120" fill="url(#cg)"/>' +
    '<g fill="#2fd16b" opacity=".95"><path d="M70 262c-6-44 18-74 58-84 4 44-14 76-58 84z"/><path d="M58 262c-24-34-20-72 6-96 14 36 10 72-6 96z" fill="#1fae55"/><path d="M360 262c6-44-18-74-58-84-4 44 14 76 58 84z"/><path d="M372 262c24-34 20-72-6-96-14 36-10 72 6 96z" fill="#1fae55"/></g>' +
    '<g><rect x="95" y="212" width="230" height="38" rx="7" fill="url(#b1)"/><rect x="105" y="250" width="214" height="9" rx="3" fill="#eaf1ff"/><rect x="108" y="224" width="40" height="5" rx="2.5" fill="#fff" opacity=".55"/>' +
    '<rect x="115" y="176" width="195" height="36" rx="7" fill="url(#b2)"/><rect x="123" y="205" width="180" height="7" rx="3" fill="#eaf1ff" opacity=".9"/><rect x="128" y="188" width="36" height="5" rx="2.5" fill="#fff" opacity=".55"/>' +
    '<rect x="132" y="142" width="160" height="34" rx="7" fill="url(#b3)"/><rect x="140" y="170" width="146" height="6" rx="3" fill="#fff4e0" opacity=".9"/><rect x="146" y="153" width="32" height="5" rx="2.5" fill="#fff" opacity=".55"/></g>' +
    '<g transform="translate(0,-22)"><path d="M212 62 328 104 212 146 96 104z" fill="url(#cap)" stroke="#6fb3ff" stroke-width="2.5"/><path d="M150 124v34c0 12 27 22 62 22s62-10 62-22v-34l-62 22z" fill="#0f2377" stroke="#6fb3ff" stroke-width="2"/>' +
    '<path d="M212 104 306 118v38" fill="none" stroke="#ffd21f" stroke-width="3"/><circle cx="306" cy="160" r="6" fill="#ffd21f"/><path d="M300 164l-3 26M306 166v28M312 164l3 26" stroke="#ffd21f" stroke-width="3.2" stroke-linecap="round"/></g>' +
    '<g fill="#ffe27a"><path d="M52 90l4 10 10 4-10 4-4 10-4-10-10-4 10-4z"/><path d="M372 60l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/><circle cx="92" cy="48" r="3"/><circle cx="338" cy="40" r="2.5"/></g></svg>';
  function setupContArt() {
    var wrap = root.querySelector('#hv2cart'); if (!wrap) return;
    var im = wrap.querySelector('img');
    im.onerror = function () { wrap.innerHTML = CONT_SVG; };
  }

  /* ---------- titles: never show a blank / generic title (also for photo-only questions) ---------- */
  var GENERIC = ['ছবির প্রশ্ন', 'picture question', 'chat', 'পূর্ববর্তী প্রশ্ন', 'earlier question', '(ছবি)', '🖼️ (ছবি)', '🖼️ (image)'];
  function isGeneric(s) { s = String(s || '').trim().toLowerCase(); return !s || GENERIC.indexOf(s) > -1; }
  function titleFrom(text) {
    var s = String(text || '').replace(/```[\s\S]*?```/g, ' ').replace(/\$\$[\s\S]*?\$\$/g, ' ').replace(/\$[^$\n]*\$/g, ' ');
    var lines = s.split(/\n+/);
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i].replace(/^[\s#>*\-•·]+/, '').replace(/^\[[^\]]*\]\s*/, '').replace(/[*_`|]/g, '')
        .replace(/^(উত্তর|প্রশ্ন|answer|question)\s*[\d০-৯]*\s*[:：.)]\s*/i, '').trim();
      if (l.length >= 6) return l.length > 42 ? l.slice(0, 42).replace(/\s+\S*$/, '') + '…' : l;
    }
    return '';
  }
  var titleCache = {};
  function resolveTitles() {                       // display-only: old chats saved with a generic title
    var todo = state.chats.slice(0, 4).filter(function (c) { return isGeneric(c.title) && !titleCache[c.id]; });
    if (!todo.length) return Promise.resolve();
    return Promise.all(todo.map(function (c) {
      return fetch('/api/chats?id=' + encodeURIComponent(c.id), { credentials: 'same-origin' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) {
          var m = (j && j.chat && j.chat.messages) || [], tt = '';
          for (var i = 0; i < m.length && !tt; i++) if (m[i].role === 'user' && m[i].text) tt = titleFrom(m[i].text);
          for (var k = 0; k < m.length && !tt; k++) if (m[k].role === 'assistant') tt = titleFrom(m[k].text);
          if (tt) titleCache[c.id] = tt;
        }).catch(function () {});
    })).then(function () {
      var changed = false;
      state.chats.forEach(function (c) { if (isGeneric(c.title) && titleCache[c.id]) { c.title = titleCache[c.id]; changed = true; } });
      if (changed) render();
    });
  }
  function patchTitleMaker() {                     // new chats: photo-only question still gets a topic title
    if (typeof generateTitle !== 'function') return;
    var orig = generateTitle;
    window.generateTitle = function (q, a) {
      var qq = String(q || '').trim(), fb = titleFrom(a);
      return Promise.resolve(orig.call(this, qq || fb || 'photo question', a)).then(function () {
        try { if (isGeneric(currentChatTitle) && fb) { currentChatTitle = fb; return saveChat(); } } catch (e) {}
      });
    };
  }

  function render() {
    var keep = inp() ? inp().value : '';
    root.setAttribute('data-theme', state.theme);
    root.innerHTML = headerHTML() + '<main class="hv2-wrap">' + heroHTML() + (state.user ? userBody() : guestBody()) + '</main><div class="hv2-toast"></div>';
    inp().value = keep;
    var img = root.querySelector('#hv2hero'), n = 0;
    img.onerror = function () { n++; if (n < HERO.length) img.src = HERO[n]; else img.outerHTML = '<div class="hv2-fallback">🎓📖</div>'; };
    paintSubjects(); paintAttach(); setupContArt();
  }
  function refresh() { return loadUser().then(loadChats).then(render).then(resolveTitles); }

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
      case 'logout': doLogout(); break;
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
    patchTitleMaker();
    watchImage();
    syncVisibility();
    refresh();
    window.HomeV2 = { refresh: refresh };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
