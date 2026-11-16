/**
 * AI Teacher - Voice question add-on (loads AFTER script.js)
 * Mic button -> speak -> text appears in the question box -> sent automatically.
 * The AI still answers in text only. Uses the browser's Web Speech API (free).
 * Nothing in script.js / style.css / ui-update.css needs to change.
 */
(function () {
  'use strict';

  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var input = document.getElementById('userQuestionInput');
  var row = document.querySelector('.input-main-row');
  var sendBtn = document.getElementById('btnSubmitQuestion');
  if (!SR || !input || !row || !sendBtn) return; // unsupported browser: no mic button

  /* ---------- styles (injected, so no CSS file edit is needed) ---------- */
  var css = document.createElement('style');
  css.textContent =
    '.btn-mic{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;' +
    'width:42px;height:42px;border-radius:50%;border:1.5px solid #bfdbfe;background:#eff6ff;' +
    'color:#1d4ed8;cursor:pointer;padding:0;transition:background .15s,color .15s,border-color .15s;}' +
    '.btn-mic:hover{background:#dbeafe;}' +
    '.btn-mic:disabled{opacity:.5;cursor:not-allowed;}' +
    '.btn-mic svg{width:20px;height:20px;}' +
    '.btn-mic.listening{background:#ef4444;border-color:#ef4444;color:#fff;animation:micPulse 1.2s infinite;}' +
    '@keyframes micPulse{0%{box-shadow:0 0 0 0 rgba(239,68,68,.55);}70%{box-shadow:0 0 0 12px rgba(239,68,68,0);}100%{box-shadow:0 0 0 0 rgba(239,68,68,0);}}';
  document.head.appendChild(css);

  /* ---------- mic button ---------- */
  var mic = document.createElement('button');
  mic.type = 'button';
  mic.className = 'btn-mic';
  mic.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/>' +
    '<line x1="12" y1="18" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>';
  row.insertBefore(mic, sendBtn);

  function isEn() { return document.body.classList.contains('lang-en'); }
  function T(bn, en) { return isEn() ? en : bn; }
  function toast(msg) { if (typeof showToast === 'function') showToast(msg); }
  function setTitle() { mic.title = listening ? T('থামুন ও পাঠান', 'Stop and send') : T('ভয়েসে প্রশ্ন করুন', 'Ask by voice'); mic.setAttribute('aria-label', mic.title); }

  /* ---------- recognition ---------- */
  var rec = null;
  var listening = false;
  var baseText = '';
  var finalText = '';
  var savedPlaceholder = '';
  var failed = false;

  function show(text) {
    input.value = text;
    if (typeof autosizeInput === 'function') autosizeInput();
  }

  function start() {
    if (listening || input.disabled) return;
    failed = false;
    finalText = '';
    baseText = input.value.trim();
    savedPlaceholder = input.placeholder;

    rec = new SR();
    rec.lang = isEn() ? 'en-US' : 'bn-BD';
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;

    rec.onstart = function () {
      listening = true;
      mic.classList.add('listening');
      input.placeholder = T('শুনছি… আপনার প্রশ্নটি বলুন', 'Listening… say your question');
      setTitle();
    };

    rec.onresult = function (e) {
      var interim = '';
      for (var i = e.resultIndex; i < e.results.length; i++) {
        var part = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += part + ' ';
        else interim += part;
      }
      show((baseText ? baseText + ' ' : '') + (finalText + interim).trim());
    };

    rec.onerror = function (e) {
      failed = true;
      var code = e && e.error;
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        toast(T('মাইক্রোফোনের অনুমতি দিন (ব্রাউজারের সেটিং থেকে)।', 'Please allow microphone access in your browser.'));
      } else if (code === 'no-speech') {
        toast(T('কিছু শোনা যায়নি। আবার চেষ্টা করুন।', 'Did not hear anything. Please try again.'));
      } else if (code === 'network') {
        toast(T('ভয়েস চিনতে ইন্টারনেট সংযোগ লাগবে।', 'Voice recognition needs an internet connection.'));
      } else if (code !== 'aborted') {
        toast(T('ভয়েস ইনপুটে সমস্যা হয়েছে।', 'Voice input failed.'));
      }
    };

    rec.onend = function () {
      listening = false;
      mic.classList.remove('listening');
      input.placeholder = savedPlaceholder;
      setTitle();
      rec = null;
      var text = input.value.trim();
      // auto-send: only when something new was actually heard
      if (!failed && finalText.trim() && text && typeof handleQuestionSubmit === 'function') {
        handleQuestionSubmit();
      }
    };

    try { rec.start(); } catch (err) { listening = false; rec = null; }
  }

  function stop() {
    if (rec) { try { rec.stop(); } catch (err) { /* ignore */ } }
  }

  mic.addEventListener('click', function () {
    if (listening) stop(); else start();
  });

  /* keep the mic disabled while an answer is streaming (the textarea is disabled then) */
  new MutationObserver(function () { mic.disabled = input.disabled; })
    .observe(input, { attributes: true, attributeFilter: ['disabled'] });

  setTitle();
})();
