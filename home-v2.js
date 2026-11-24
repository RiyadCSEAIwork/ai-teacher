/* ============ AI Teacher — Home V2 (guest + logged-in) ============
   Draws the new home as a full-screen overlay (#hv2) on top of the existing page.
   script.js / chat.js / voice.js / ui-tweaks.js are NOT modified: this file only
   "drives" the old UI (fills #userQuestionInput, clicks #btnSubmitQuestion, calls openChat()).
   Load it AFTER ui-tweaks.js (last script in index.html). */
(function () {
  'use strict';

  /* ---------------- CONFIG ---------------- */
  var CFG = {
    hero: '/hero-v2.webp',        // NEW hero art (3D cap + book). Optional.
    heroFallback: 'hero.webp',    // your existing hero image, used if the new one is missing
    sel: {                        // each item = list of selectors, tried in order (all verified against index.html)
      input:    ['#userQuestionInput'],
      send:     ['#btnSubmitQuestion'],
      file:     ['#fileImageInput'],
      removeImg:['#btnRemovePreview'],
      login:    ['#btnOpenLogin'],
      signupTab:['#tabSignup'],
      newChat:  ['#btnNewChat'],
      history:  ['#btnHistory'],
      notes:    ['#btnSmartNotes'],
      logout:   ['#btnLogout'],
      langBn:   ['#btnLangBn'],
      langEn:   ['#btnLangEn'],
      // voice.js was not shared, so these are guesses (first match wins) — see note in chat
      mic:      ['#btnMic', '#btnVoice', '#micBtn', '#voiceBtn', '.btn-mic', '.btn-voice', '.mic-btn', '[data-voice]',
                 '[aria-label*="voice" i]', '[aria-label*="মাইক"]', '[title*="voice" i]', '[title*="ভয়েস"]', '[title*="মাইক"]',
                 '.input-main-row button:not(.btn-submit-question)']
    }
  };

  /* ---------------- text ---------------- */
  var T = {
    bn: {
      tagline:'Academic Excellence & Admission Guidance', newQ:'নতুন প্রশ্ন', oldQ:'পুরানো প্রশ্ন',
      notes:'Smart Notes', mcq:'MCQ প্র্যাকটিস', adm:'অ্যাডমিশন গাইড', login:'লগইন', logout:'লগআউট',
      welcome:'Welcome to AI Teacher', h1a:'পড়াশোনা হোক', h1b:'আরও সহজ ও স্মার্ট',
      sub:'যেকোনো প্রশ্ন করুন, AI দেবে সহজ ও নির্ভুল উত্তর!', ph:'আপনার প্রশ্ন লিখুন বা ছবি যুক্ত করুন...',
      ask:'প্রশ্ন করুন', pickSub:'বিষয় নির্বাচন করুন',
      physics:'পদার্থবিজ্ঞান', chemistry:'রসায়ন', math:'গণিত', biology:'জীববিজ্ঞান', ict:'তথ্য ও যোগাযোগ প্রযুক্তি', others:'অন্যান্য',
      f1:'Instant Answer', f1s:'দ্রুত উত্তর পান', f2:'Smart Notes', f2s:'গুরুত্বপূর্ণ নোট তৈরি করুন',
      f3:'MCQ Practice', f3s:'নিজেকে যাচাই করুন', f4:'Admission Guide', f4s:'ভর্তি প্রস্তুতির সঠিক দিকনির্দেশনা',
      f5:'Trusted & Secure', f5s:'নিরাপদ ও নির্ভরযোগ্য',
      exTitle:'কিছু উদাহরণ প্রশ্ন',
      ctaH:'এখনই শুরু করুন!', ctaP:'একটি প্রশ্ন করুন অথবা নতুন অ্যাকাউন্ট তৈরি করুন।',
      signup:'বিনামূল্যে সাইন আপ করুন', ctaNote:'প্রশ্ন করতে লগইন প্রয়োজন হবে।',
      q1:'কনসেপ্ট বুঝুন', q1s:'কঠিন বিষয় সহজভাবে শিখুন', q2:'MCQ প্র্যাকটিস', q2s:'নিজেকে যাচাই করুন',
      q3:'Smart Notes', q3s:'গুরুত্বপূর্ণ নোট তৈরি করুন', q4:'Admission Guide', q4s:'ভর্তি প্রস্তুতির সঠিক দিকনির্দেশনা',
      recent:'সর্বশেষ প্রশ্নসমূহ', more:'আরও দেখুন', noRecent:'এখনো কোনো প্রশ্ন করেননি।', cont:'Continue Learning',
      contS:'আপনার সর্বশেষ যে পাঠ এখান থেকে চালিয়ে যান', start:'এবার শুরু করুন', untitled:'পূর্ববর্তী প্রশ্ন',
      soon:'এই ফিচারটি শীঘ্রই আসছে', listening:'🎤 মাইক চালু হয়েছে, বলুন…',
      left:'আজকের বাকি প্রশ্ন: ', imgReady:'ছবি যুক্ত হয়েছে', imgPrep:'ছবি প্রস্তুত হচ্ছে…',
      min:' মিনিট আগে', hr:' ঘণ্টা আগে', day:' দিন আগে', now:'এইমাত্র'
    },
    en: {
      tagline:'Academic Excellence & Admission Guidance', newQ:'New question', oldQ:'Past questions',
      notes:'Smart Notes', mcq:'MCQ Practice', adm:'Admission Guide', login:'Login', logout:'Logout',
      welcome:'Welcome to AI Teacher', h1a:'Make studying', h1b:'easier & smarter',
      sub:'Ask any question — AI gives simple, accurate answers!', ph:'Type your question or attach a photo...',
      ask:'Ask', pickSub:'Choose a subject',
      physics:'Physics', chemistry:'Chemistry', math:'Math', biology:'Biology', ict:'ICT', others:'Others',
      f1:'Instant Answer', f1s:'Get quick answers', f2:'Smart Notes', f2s:'Create key notes',
      f3:'MCQ Practice', f3s:'Test yourself', f4:'Admission Guide', f4s:'Right guidance for admission prep',
      f5:'Trusted & Secure', f5s:'Safe and reliable',
      exTitle:'Example questions',
      ctaH:'Start now!', ctaP:'Ask a question or create a new account.',
      signup:'Sign up for free', ctaNote:'You need to log in to ask a question.',
      q1:'Understand concepts', q1s:'Learn hard topics easily', q2:'MCQ Practice', q2s:'Test yourself',
      q3:'Smart Notes', q3s:'Create key notes', q4:'Admission Guide', q4s:'Right guidance for admission prep',
      recent:'Recent questions', more:'See more', noRecent:"You haven't asked anything yet.", cont:'Continue Learning',
      contS:'Continue your latest lesson from here', start:'Start now', untitled:'Earlier question',
      soon:'This feature is coming soon', listening:'🎤 Mic is on, speak now…',
      left:'Questions left today: ', imgReady:'Image attached', imgPrep:'Preparing image…',
      min:' min ago', hr:' h ago', day:' d ago', now:'just now'
    }
  };
  var EXAMPLES = [
    { q: 'নিউটনের তৃতীয় সূত্রটি লিখ।', s: 'physics', c: 'Physics' },
    { q: 'H₂O এর মোলার ভর কত?', s: 'chemistry', c: 'Chemistry' },
    { q: 'ত্রিভুজের অন্তঃকোণগুলোর সমষ্টি কত?', s: 'math', c: 'Math' }
  ];
  var SUBJECTS = [
    ['physics', '⚛️', 'Physics'], ['chemistry', '🧪', 'Chemistry'], ['math', 'π', 'Math'],
    ['biology', '🌿', 'Biology'], ['ict', '🖥️', 'ICT'], ['others', '•••', 'Others']
  ];

  /* ---------------- helpers ---------------- */
  var root;
  var state = { user: null, chats: [], lang: 'bn', theme: 'dark', subject: '', draft: '', visible: true, attachKey: '' };

  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} }
  function t(k) { return (T[state.lang] || T.bn)[k] || k; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function pick(list) { // first element (outside overlay) matching any selector, tried in order
    for (var i = 0; i < list.length; i++) {
      var found;
      try { found = document.querySelectorAll(list[i]); } catch (e) { continue; }
      for (var j = 0; j < found.length; j++) if (!root.contains(found[j])) return found[j];
    }
    return null;
  }
  function toast(msg) {
    var el = root.querySelector('.hv2-toast'); if (!el) return;
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(function () { el.classList.remove('show'); }, 2300);
  }
  function setNative(el, val) {
    var proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function ago(ms) {
    if (!ms) return '';
    var m = Math.max(0, Math.round((Date.now() - ms) / 60000));
    if (m < 1) return t('now');
    if (m < 60) return m + t('min');
    if (m < 1440) return Math.round(m / 60) + t('hr');
    return Math.round(m / 1440) + t('day');
  }
  // state of the old app (script.js uses top-level let/const, readable from here)
  function oldPendingImage() { try { return typeof pendingImage !== 'undefined' ? pendingImage : null; } catch (e) { return null; } }
  function oldPreparing()    { try { return typeof preparingImage !== 'undefined' && preparingImage; } catch (e) { return false; } }
  function oldResume()       { try { return typeof resumeAfterAuth !== 'undefined' && resumeAfterAuth; } catch (e) { return false; } }
  function shown(id) { var el = document.getElementById(id); return !!el && el.style.display !== 'none' && el.style.display !== ''; }

  /* ---------------- bridge to the existing app ---------------- */
  function applySubject(key) {
    var target = key && key !== 'others' ? key : '';
    var chips = document.querySelectorAll('.chip-btn');
    var active = null, want = null;
    for (var i = 0; i < chips.length; i++) {
      if (chips[i].classList.contains('active')) active = chips[i];
      if (chips[i].dataset.subject === target) want = chips[i];
    }
    if (!target) { if (active) active.click(); return; }       // clear a stale selection
    if (want && !want.classList.contains('active')) want.click(); // chip click toggles
  }
  function ask(text, subject) {
    text = (text || '').trim();
    var input = pick(CFG.sel.input), send = pick(CFG.sel.send);
    if (!input || !send) { toast('Input / send button not found'); return; }
    if (!text && !oldPendingImage()) return;
    applySubject(subject === undefined ? state.subject : subject);
    setNative(input, text);
    send.click(); // old code: guest -> login modal (text kept, resumes after login); member -> chat starts
  }
  function click(list) { var el = pick(list); if (el) { el.click(); return true; } return false; }
  function openChatById(id) {
    if (typeof window.openChat === 'function') window.openChat(id);
    else toast('openChat() not found');
  }

  /* ---------------- data ---------------- */
  function loadUser() {
    return fetch('/api/me', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        var name = j && j.ok && (j.username || (typeof j.user === 'string' ? j.user : ''));
        state.user = name ? { name: name, gender: j.gender, used: j.used || 0, limit: j.limit || 0 } : null;
      }).catch(function () { state.user = null; });
  }
  function loadChats() {
    if (!state.user) { state.chats = []; return Promise.resolve(); }
    return fetch('/api/chats', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { state.chats = ((j && j.chats) || []).slice(0, 20); })
      .catch(function () { state.chats = []; });
  }

  /* ---------------- render ---------------- */
  function headerHTML() {
    var u = state.user;
    return '<header class="hv2-head"><div class="hv2-head-in">' +
      '<button class="hv2-logo" data-a="home"><span class="hv2-logo-ic">🎓</span><span><b>AI Teacher</b><small>' + t('tagline') + '</small></span></button>' +
      '<nav class="hv2-nav" id="hv2nav">' +
        '<button class="hv2-primary" data-a="new">＋ ' + t('newQ') + '</button>' +
        '<button data-a="old">' + t('oldQ') + '</button>' +
        '<button data-a="notes">' + t('notes') + '</button>' +
        '<button data-a="soon">' + t('mcq') + ' <span class="hv2-badge">New</span></button>' +
        '<button data-a="soon">' + t('adm') + '</button>' +
      '</nav>' +
      '<div class="hv2-tools">' +
        '<button class="hv2-pill hv2-round" data-a="theme" title="Theme">' + (state.theme === 'dark' ? '🌙' : '☀️') + '</button>' +
        '<button class="hv2-pill" data-a="lang">' + (state.lang === 'bn' ? 'বাংলা' : 'English') + ' ⇄</button>' +
        (u ? '<div class="hv2-user"><button class="hv2-pill" data-a="umenu">' + (u.gender === 'female' ? '👩' : '👨') +
             ' <span class="hv2-lbl">' + esc(u.name) + '</span> ▾</button>' +
             '<div class="hv2-menu" id="hv2menu"><button data-a="logout">' + t('logout') + '</button></div></div>'
           : '<button class="hv2-pill" data-a="login">👤 ' + t('login') + '</button>') +
        '<button class="hv2-pill hv2-round hv2-burger" data-a="burger">☰</button>' +
      '</div></div></header>';
  }
  function heroHTML() {
    var left = state.user && state.user.limit
      ? '<div class="hv2-note">' + t('left') + Math.max(0, state.user.limit - state.user.used) + ' / ' + state.user.limit + '</div>' : '';
    return '<section class="hv2-hero"><div>' +
      (state.user ? '' : '<div class="hv2-welcome">✨ ' + t('welcome') + '</div>') +
      '<h1>' + t('h1a') + '<br><span>' + t('h1b') + '</span></h1><p>' + t('sub') + '</p>' +
      '<form class="hv2-ask" id="hv2form" autocomplete="off">' +
        '<span>🔍</span><input id="hv2in" type="text" placeholder="' + esc(t('ph')) + '" value="' + esc(state.draft) + '">' +
        '<button type="button" class="hv2-ic" data-a="mic" title="Voice">🎤</button>' +
        '<button type="button" class="hv2-ic" data-a="img" title="Image">🖼️</button>' +
        '<button type="submit" class="hv2-go">▶ ' + t('ask') + '</button></form>' +
      '<div class="hv2-attach" id="hv2attach" style="display:none"></div>' + left + '</div>' +
      '<div class="hv2-art"><img id="hv2hero" src="' + CFG.hero + '" alt="">' +
      '<div class="hv2-tag"><i>Learn</i><i>Grow</i><i>Achieve</i></div></div></section>';
  }
  function subjectsHTML() {
    return '<div class="hv2-sec-h"><h2>🟦 ' + t('pickSub') + '</h2></div><div class="hv2-subjects">' +
      SUBJECTS.map(function (s) {
        return '<button class="hv2-sub' + (state.subject === s[0] ? ' sel' : '') + '" data-a="subject" data-s="' + s[0] + '">' +
          '<span class="e">' + s[1] + '</span><span><b>' + s[2] + '</b><small>' + t(s[0]) + '</small></span><span class="a">→</span></button>';
      }).join('') + '</div>';
  }
  function guestBody() {
    var feats = [['⚡', 'f1', 'f1s'], ['📘', 'f2', 'f2s'], ['✅', 'f3', 'f3s'], ['🏆', 'f4', 'f4s'], ['🛡️', 'f5', 'f5s']];
    return subjectsHTML() +
      '<div class="hv2-feats">' + feats.map(function (f) {
        return '<div class="hv2-feat"><span class="e">' + f[0] + '</span><span><b>' + t(f[1]) + '</b><small>' + t(f[2]) + '</small></span></div>';
      }).join('') + '</div>' +
      '<div class="hv2-bottom"><div class="hv2-box"><div class="hv2-sec-h" style="margin:0"><h2>⭐ ' + t('exTitle') + '</h2></div><ul class="hv2-list">' +
        EXAMPLES.map(function (e, i) {
          return '<li><button data-a="ex" data-i="' + i + '"><span class="t">' + esc(e.q) + '</span><span class="hv2-chip">' + e.c + '</span><span>→</span></button></li>';
        }).join('') +
      '</ul></div><div class="hv2-box hv2-cta"><h3>' + t('ctaH') + '</h3><p>' + t('ctaP') + '</p>' +
        '<div class="hv2-cta-btns"><button class="hv2-pill solid" data-a="signup">👤 ' + t('signup') + '</button>' +
        '<button class="hv2-pill" data-a="login">' + t('login') + '</button></div>' +
        '<div class="hv2-note">ⓘ ' + t('ctaNote') + '</div></div></div>';
  }
  function userBody() {
    var q = [['📖', 'q1', 'q1s', 'focus'], ['📝', 'q2', 'q2s', 'soon'], ['🗒️', 'q3', 'q3s', 'notes'], ['🏆', 'q4', 'q4s', 'soon']];
    var rec = state.chats.slice(0, 3), last = state.chats[0];
    return '<div class="hv2-quick">' + q.map(function (x) {
      return '<button class="hv2-q" data-a="' + x[3] + '"><span class="e">' + x[0] + '</span><span><b>' + t(x[1]) + '</b><small>' + t(x[2]) +
        '</small></span><span class="a">→</span></button>';
    }).join('') + '</div>' + subjectsHTML() +
    '<div class="hv2-bottom"><div class="hv2-box"><div class="hv2-sec-h" style="margin:0"><h2>🕘 ' + t('recent') + '</h2><button data-a="old">' + t('more') + ' →</button></div>' +
      (rec.length ? '<ul class="hv2-list">' + rec.map(function (c) {
        return '<li><button data-a="chat" data-id="' + esc(c.id) + '"><span>📄</span><span class="t">' + esc(c.title || t('untitled')) +
          '</span><span class="m">🕒 ' + ago(c.updated) + '</span></button></li>';
      }).join('') + '</ul>' : '<div class="hv2-empty">' + t('noRecent') + '</div>') +
    '</div><div class="hv2-box hv2-cta"><h3 style="font-size:26px;color:#fff">⭐ ' + t('cont') + '</h3><p style="font-size:16px">' + t('contS') + '</p>' +
      (last ? '<div class="hv2-cont">📘 <b>' + esc(last.title || t('untitled')) + '</b></div>' : '') +
      '<div class="hv2-cta-btns"><button class="hv2-pill solid" data-a="' + (last ? 'chat' : 'focus') + '" data-id="' + esc(last ? last.id : '') + '">' + t('start') + ' →</button></div></div></div>';
  }
  function render() {
    var cur = root.querySelector('#hv2in'); if (cur) state.draft = cur.value;
    root.setAttribute('data-theme', state.theme);
    root.innerHTML = headerHTML() + '<main class="hv2-wrap">' + heroHTML() + (state.user ? userBody() : guestBody()) + '</main><div class="hv2-toast"></div>';
    var img = root.querySelector('#hv2hero');
    img.onerror = function () {
      if (!img.dataset.fb) { img.dataset.fb = '1'; img.src = CFG.heroFallback; }
      else { img.outerHTML = '<div class="hv2-fallback">🎓📖</div>'; }
    };
    state.attachKey = ''; updateAttach();
  }
  function refresh() { return loadUser().then(loadChats).then(render); }

  /* picture attached through the overlay (the old app keeps it in pendingImage) */
  function updateAttach() {
    var box = root.querySelector('#hv2attach'); if (!box) return;
    var p = oldPendingImage(), prep = oldPreparing();
    var key = prep ? 'p' : (p ? 'i' + (p.url ? p.url.length : 0) : '');
    if (key === state.attachKey) return;
    state.attachKey = key;
    if (!key) { box.style.display = 'none'; box.innerHTML = ''; return; }
    box.style.display = 'flex';
    box.innerHTML = (p && p.url ? '<img src="' + p.url + '" alt="">' : '<span>🖼️</span>') +
      '<span>' + (prep ? t('imgPrep') : t('imgReady')) + '</span>' +
      (prep ? '' : '<button type="button" data-a="rmimg" title="✕">✕</button>');
  }

  /* ---------------- show / hide (declarative) ---------------- */
  function wantVisible() {
    if (document.body.classList.contains('chat-active')) return false; // a chat is on screen
    if (shown('authModal') || shown('smartNotesModal')) return false;   // old modals need the stage
    var drawer = document.getElementById('historyDrawer');
    if (drawer && drawer.classList.contains('open')) return false;
    if (oldResume()) return false;                                      // guest asked, waiting for login
    return true;
  }
  function sync() {
    var v = wantVisible();
    if (v !== state.visible) {
      state.visible = v;
      root.classList.toggle('hv2-hidden', !v);
      if (v) refresh();                                                 // back on home: reload user + recent chats
      else if (document.body.classList.contains('chat-active')) state.draft = '';
    }
    if (v) updateAttach();
  }

  /* ---------------- events ---------------- */
  function onClick(e) {
    var b = e.target.closest('[data-a]'); if (!b || !root.contains(b)) return;
    var a = b.getAttribute('data-a');
    var menu = root.querySelector('#hv2menu'); if (menu && a !== 'umenu') menu.classList.remove('open');
    var input = root.querySelector('#hv2in');
    switch (a) {
      case 'home': case 'new': case 'focus':
        root.scrollTo({ top: 0, behavior: 'smooth' }); if (input) input.focus(); break;
      case 'old': click(CFG.sel.history); break;
      case 'notes': click(CFG.sel.notes); break;
      case 'soon': toast(t('soon')); break;
      case 'theme': state.theme = state.theme === 'dark' ? 'light' : 'dark'; ls('hv2_theme', state.theme); render(); break;
      case 'lang':
        state.lang = state.lang === 'bn' ? 'en' : 'bn'; ls('hv2_lang', state.lang);
        click(state.lang === 'bn' ? CFG.sel.langBn : CFG.sel.langEn); // keep the old app's language in step
        render(); break;
      case 'umenu': if (menu) menu.classList.toggle('open'); break;
      case 'burger': root.querySelector('#hv2nav').classList.toggle('open'); break;
      case 'logout': click(CFG.sel.logout); break;               // old handler: POST /api/logout + reload
      case 'login': click(CFG.sel.login); break;                 // old auth modal (login tab)
      case 'signup': if (click(CFG.sel.login)) click(CFG.sel.signupTab); break;
      case 'subject':
        var k = b.getAttribute('data-s');
        state.subject = state.subject === k ? '' : k;
        [].forEach.call(root.querySelectorAll('.hv2-sub'), function (el) { el.classList.toggle('sel', el.getAttribute('data-s') === state.subject); });
        if (input) input.focus(); break;
      case 'ex': var ex = EXAMPLES[+b.getAttribute('data-i')]; ask(ex.q, ex.s); break;
      case 'chat': var id = b.getAttribute('data-id'); if (id) openChatById(id); else if (input) input.focus(); break;
      case 'mic':
        if (click(CFG.sel.mic)) toast(t('listening')); else toast('Mic button not found (voice.js)');
        break;
      case 'img': if (!click(CFG.sel.file)) toast('File input not found'); break;
      case 'rmimg': click(CFG.sel.removeImg); state.attachKey = 'x'; setTimeout(updateAttach, 50); break;
    }
  }
  function onSubmit(e) {
    if (e.target.id !== 'hv2form') return;
    e.preventDefault();
    var i = root.querySelector('#hv2in'); state.draft = i.value;
    ask(i.value);
  }
  function onInput(e) { if (e.target.id === 'hv2in') state.draft = e.target.value; }

  /* ---------------- init ---------------- */
  function init() {
    root = document.createElement('div'); root.id = 'hv2';
    state.lang = ls('hv2_lang') === 'en' ? 'en' : 'bn';
    state.theme = ls('hv2_theme') === 'light' ? 'light' : 'dark';
    document.body.appendChild(root);
    root.addEventListener('click', onClick);
    root.addEventListener('submit', onSubmit);
    root.addEventListener('input', onInput);
    document.addEventListener('click', function (e) {
      var m = root.querySelector('#hv2menu'); if (m && !e.target.closest('.hv2-user')) m.classList.remove('open');
    });
    if (state.lang === 'en') click(CFG.sel.langEn);               // old app starts in Bengali every time

    // react quickly when the old UI changes, plus a light heartbeat as a backstop
    var mo = new MutationObserver(sync);
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    ['authModal', 'smartNotesModal'].forEach(function (id) {
      var el = document.getElementById(id); if (el) mo.observe(el, { attributes: true, attributeFilter: ['style'] });
    });
    var dr = document.getElementById('historyDrawer'); if (dr) mo.observe(dr, { attributes: true, attributeFilter: ['class'] });
    setInterval(sync, 300);

    refresh();
    window.HomeV2 = { refresh: refresh, sync: sync };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
