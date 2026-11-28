/* ============================================================
   AI Teacher — Chat page V2 (loads AFTER script.js, voice.js, ui-tweaks.js, home-v2.js)
   - builds the left "চ্যাট হিস্ট্রি" sidebar + promo card (shown only in a chat, desktop)
   - quota pill text: "বাকি 28/30 প্রশ্ন"
   script.js / APIs are NOT changed.
   ============================================================ */
(function () {
  'use strict';

  var TX = {
    bn: { hist: 'চ্যাট হিস্ট্রি', search: 'খুঁজুন...', empty: 'এখনো কোনো আলোচনা নেই।', none: 'কিছু পাওয়া যায়নি।',
          guest: 'লগইন করলে আপনার পুরনো আলোচনা এখানে দেখা যাবে।', today: 'আজ', yest: 'গতকাল', untitled: 'পূর্ববর্তী প্রশ্ন',
          del: 'মুছুন', learn: 'শিখুন, এগিয়ে যান', withAi: 'AI Teacher এর সাথে', notes: 'Smart Notes দেখুন →',
          quota: function (u, l) { return 'বাকি ' + Math.max(0, l - u) + '/' + l + ' প্রশ্ন'; } },
    en: { hist: 'Chat history', search: 'Search...', empty: 'No chats yet.', none: 'Nothing found.',
          guest: 'Log in to see your earlier chats here.', today: 'Today', yest: 'Yesterday', untitled: 'Earlier question',
          del: 'Delete', learn: 'Learn and move ahead', withAi: 'with AI Teacher', notes: 'Open Smart Notes →',
          quota: function (u, l) { return Math.max(0, l - u) + '/' + l + ' left'; } }
  };
  var MAX_ITEMS = 10;                 // sidebar shows at most this many chats (older ones: search / history drawer)
  var state = { chats: [], q: '', authed: true, side: null };

  function lang() { try { return currentLanguage === 'en' ? 'en' : 'bn'; } catch (e) { return 'bn'; } }
  function T() { return TX[lang()]; }
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function curId() { try { return currentChatId || ''; } catch (e) { return ''; } }

  /* ---------- quota text ("বাকি 28/30 প্রশ্ন") ---------- */
  try {
    if (typeof TEXT !== 'undefined') { TEXT.bn.quota = TX.bn.quota; TEXT.en.quota = TX.en.quota; }
    if (typeof currentUser !== 'undefined' && currentUser && typeof updateQuota === 'function') updateQuota();
  } catch (e) { /* ignore */ }

  /* ---------- date label: "আজ, 06:27 PM" / "গতকাল, 09:15 PM" / "20 Nov 2025" ---------- */
  function when(ms) {
    var d = new Date(Number(ms)); if (isNaN(d)) return '';
    var now = new Date(), t = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    var day = function (x) { return new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime(); };
    var diff = Math.round((day(now) - day(d)) / 86400000);
    if (diff === 0) return T().today + ', ' + t;
    if (diff === 1) return T().yest + ', ' + t;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  /* ---------- sidebar ---------- */
  var ART = '<svg viewBox="0 0 420 300" xmlns="http://www.w3.org/2000/svg"><defs>' +
    '<linearGradient id="sg1" x1="0" x2="1"><stop offset="0" stop-color="#1d5bff"/><stop offset="1" stop-color="#6a3dff"/></linearGradient>' +
    '<linearGradient id="sg2" x1="0" x2="1"><stop offset="0" stop-color="#0fb7a8"/><stop offset="1" stop-color="#1b86ff"/></linearGradient>' +
    '<linearGradient id="sg3" x1="0" x2="1"><stop offset="0" stop-color="#ff9f1c"/><stop offset="1" stop-color="#ff5d8f"/></linearGradient>' +
    '<linearGradient id="sgc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b3f9e"/><stop offset="1" stop-color="#0c1a5e"/></linearGradient></defs>' +
    '<g fill="#2fd16b"><path d="M70 262c-6-44 18-74 58-84 4 44-14 76-58 84z"/><path d="M360 262c6-44-18-74-58-84-4 44 14 76 58 84z"/></g>' +
    '<rect x="95" y="212" width="230" height="38" rx="7" fill="url(#sg1)"/><rect x="105" y="250" width="214" height="9" rx="3" fill="#eaf1ff"/>' +
    '<rect x="115" y="176" width="195" height="36" rx="7" fill="url(#sg2)"/><rect x="123" y="205" width="180" height="7" rx="3" fill="#eaf1ff" opacity=".9"/>' +
    '<rect x="132" y="142" width="160" height="34" rx="7" fill="url(#sg3)"/><rect x="140" y="170" width="146" height="6" rx="3" fill="#fff4e0" opacity=".9"/>' +
    '<g transform="translate(0,-22)"><path d="M212 62 328 104 212 146 96 104z" fill="url(#sgc)" stroke="#6fb3ff" stroke-width="2.5"/>' +
    '<path d="M150 124v34c0 12 27 22 62 22s62-10 62-22v-34l-62 22z" fill="#0f2377" stroke="#6fb3ff" stroke-width="2"/>' +
    '<path d="M212 104 306 118v38" fill="none" stroke="#ffd21f" stroke-width="3"/><circle cx="306" cy="160" r="6" fill="#ffd21f"/>' +
    '<path d="M300 164l-3 26M306 166v28M312 164l3 26" stroke="#ffd21f" stroke-width="3.2" stroke-linecap="round"/></g>' +
    '<g fill="#ffe27a"><path d="M52 90l4 10 10 4-10 4-4 10-4-10-10-4 10-4z"/><path d="M372 60l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/></g></svg>';

  function build() {
    var main = document.querySelector('.main-container'); if (!main || $('chatSide')) return;
    var side = document.createElement('aside');
    side.id = 'chatSide'; side.className = 'cs-side';
    side.innerHTML =
      '<div class="cs-card cs-hist"><div class="cs-title"><i>💬</i><span id="csTitle"></span></div>' +
      '<div class="cs-search"><span>🔍</span><input id="csSearch" type="text" autocomplete="off"></div>' +
      '<div class="cs-list" id="csList"></div></div>' +
      '<div class="cs-promo"><div id="csArt">' + ART + '</div><b id="csLearn"></b><span id="csWith"></span><button type="button" id="csNotes"></button></div>';
    main.insertBefore(side, main.firstChild);
    state.side = side;

    $('csSearch').addEventListener('input', function (e) { state.q = e.target.value.trim().toLowerCase(); render(); });
    $('csNotes').addEventListener('click', function () { var b = $('btnSmartNotes'); if (b) b.click(); });
    $('csList').addEventListener('click', function (e) {
      var del = e.target.closest('.cs-del'), item = e.target.closest('.cs-item'); if (!item) return;
      var id = item.getAttribute('data-id');
      if (del) { e.stopPropagation(); removeChat(id); return; }
      try { if (isStreamingResponse) return; } catch (x) {}
      if (id !== curId() && typeof openChat === 'function') openChat(id);
    });
  }

  function render() {
    if (!state.side) return;
    var t = T();
    $('csTitle').textContent = t.hist; $('csSearch').placeholder = t.search;
    $('csLearn').textContent = t.learn; $('csWith').textContent = t.withAi; $('csNotes').textContent = t.notes;
    var box = $('csList');
    if (!state.authed) { box.innerHTML = '<div class="cs-empty">' + esc(t.guest) + '</div>'; return; }
    var list = state.chats.filter(function (c) { return !state.q || String(c.title || t.untitled).toLowerCase().indexOf(state.q) > -1; }).slice(0, MAX_ITEMS);
    if (!list.length) { box.innerHTML = '<div class="cs-empty">' + esc(state.chats.length ? t.none : t.empty) + '</div>'; return; }
    var cur = curId();
    box.innerHTML = list.map(function (c) {
      return '<div class="cs-item' + (c.id === cur ? ' active' : '') + '" data-id="' + esc(c.id) + '"><span class="cs-ic">💬</span>' +
        '<span class="cs-txt"><b>' + esc(c.title || t.untitled) + '</b><small>' + esc(when(c.updated)) + '</small></span>' +
        '<span class="cs-go">›</span><button type="button" class="cs-del" title="' + esc(t.del) + '">✕</button></div>';
    }).join('');
  }
  /* top menu button: same "চ্যাট হিস্ট্রি" wording as the sidebar title */
  function setHistBtn() {
    var b = $('btnHistory'); if (!b) return;
    var s = b.querySelector('.btn-text'); if (s && s.textContent !== T().hist) s.textContent = T().hist;
  }
  function markActive() {
    var cur = curId();
    [].forEach.call(document.querySelectorAll('#csList .cs-item'), function (el) { el.classList.toggle('active', el.getAttribute('data-id') === cur); });
  }

  function refresh() {
    return fetch('/api/chats', { credentials: 'same-origin', cache: 'no-store' })
      .then(function (r) { if (r.status === 401) { state.authed = false; state.chats = []; return null; } return r.ok ? r.json() : null; })
      .then(function (j) { if (j && j.ok) { state.authed = true; state.chats = j.chats || []; } render(); setHistBtn(); })
      .catch(function () { render(); setHistBtn(); });
  }

  function removeChat(id) {
    var ask = 'Delete?'; try { ask = tx().deleteAsk; } catch (e) {}
    if (!window.confirm(ask)) return;
    fetch('/api/chats?id=' + encodeURIComponent(id), { method: 'DELETE', credentials: 'same-origin' })
      .catch(function () {})
      .then(function () {
        state.chats = state.chats.filter(function (c) { return c.id !== id; });
        if (id === curId() && typeof resetChatSession === 'function') resetChatSession();
        render();
      });
  }

  /* ---------- hooks into the existing app (wrappers; originals still run) ---------- */
  function wrap(name, after) {
    var orig = window[name]; if (typeof orig !== 'function') return;
    window[name] = function () {
      var r = orig.apply(this, arguments);
      Promise.resolve(r).then(after, after);
      return r;
    };
  }
  wrap('saveChat', refresh);          // new chat / new title -> list updates
  wrap('openChat', markActive);
  wrap('resetChatSession', markActive);
  wrap('renderUserNav', refresh);     // login / logout
  wrap('setLanguage', function () { render(); setHistBtn(); try { updateQuota(); } catch (e) {} });

  // desktop: the "চ্যাট হিস্ট্রি" menu button focuses the sidebar search instead of opening the old drawer
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('#btnHistory'); if (!b) return;
    if (document.body.classList.contains('chat-active') && window.innerWidth > 1100 && $('csSearch')) {
      e.stopImmediatePropagation(); e.preventDefault(); $('csSearch').focus();
    }
  }, true);

  // MCQ option keys: "ক)" -> "ক" (cleaner circle badge, like the mockup)
  function trimKeys() {
    [].forEach.call(document.querySelectorAll('.mcq-opt-key'), function (k) {
      var t = k.textContent; if (/[)）]\s*$/.test(t)) k.textContent = t.replace(/[)）]\s*$/, '');
    });
  }
  function init() {
    var ta = $('userQuestionInput');
    if (ta) { ta.setAttribute('data-gramm', 'false'); ta.setAttribute('data-gramm_editor', 'false'); ta.setAttribute('data-enable-grammarly', 'false'); ta.setAttribute('spellcheck', 'false'); }
    build(); render(); refresh(); setHistBtn(); setTimeout(setHistBtn, 700);
    var cm = $('chatMessages');
    if (cm) { new MutationObserver(trimKeys).observe(cm, { childList: true, subtree: true }); trimKeys(); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.ChatV2 = { refresh: refresh };
})();
