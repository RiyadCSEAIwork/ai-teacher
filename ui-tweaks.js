/**
 * AI Teacher - small UI tweak
 * Moves the image-upload button from the left of the input box to the right,
 * right next to the mic (voice) button: [ text ... ] [mic] [image] [ask]
 * script.js and voice.js are NOT changed. The upload button keeps its
 * existing id/listener, only its position moves.
 */
(function () {
  function place() {
    var row = document.querySelector('.input-main-row');
    var label = row && row.querySelector('.btn-upload-image');
    var submit = document.getElementById('btnSubmitQuestion');
    if (!row || !label || !submit || submit.parentNode !== row) return;
    // already directly before the Ask button (i.e. right after the mic)
    if (label.nextElementSibling === submit) return;
    row.insertBefore(label, submit);
  }

  function init() {
    place();
    var row = document.querySelector('.input-main-row');
    if (!row) return;
    // voice.js adds the mic a moment later; keep the image button right after it
    var obs = new MutationObserver(place);
    obs.observe(row, { childList: true });
    setTimeout(place, 500);
    setTimeout(place, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/**
 * Clear time label: Bengali digits at small size are hard to read
 * (e.g. "১১:২৬" looks like "৬৬:২৬"), so the clock time is shown with
 * normal digits: "11:26 AM". The "· 9.4 সেকেন্ড" part stays as it was.
 * Wraps timeLabel() from script.js; script.js is NOT changed.
 */
(function () {
  if (typeof window.timeLabel !== 'function') return;
  // false: today's messages show only the time; older messages (old history) also show the date
  // true : every message shows date + time
  var ALWAYS_SHOW_DATE = false;

  window.timeLabel = function (ts, dur) {
    if (!ts) return '';
    var label = '';
    try {
      var d = new Date(ts);
      label = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      var now = new Date();
      var sameDay = d.getFullYear() === now.getFullYear() &&
                    d.getMonth() === now.getMonth() &&
                    d.getDate() === now.getDate();
      if (ALWAYS_SHOW_DATE || !sameDay) {
        label = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + label;
      }
    } catch (e) { label = ''; }
    if (dur && dur > 0) {
      var en = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');
      label += ' · ' + (dur / 1000).toFixed(1) + (en ? 's' : ' সেকেন্ড');
    }
    return label;
  };
})();

/**
 * Image-question cleanup: when the AI reads a question from a photo it sometimes
 * writes an intro line before the real question, e.g.
 * "ছবিটিতে ... একটি প্রশ্ন রয়েছে। নিচে প্রশ্নটির নিখুঁত সমাধান দেওয়া হলো: <আসল প্রশ্ন>"
 * This wraps renderRich() so only the real question text is shown in the MCQ card.
 * script.js is NOT changed; saved chats are cleaned the same way when opened.
 */
(function () {
  if (typeof window.renderRich !== 'function') return;
  var original = window.renderRich;

  // up to "... সমাধান/উত্তর (নিচে) দেওয়া হলো:" -> remove
  var INTRO_END = /^[\s\S]*?(?:সমাধান|উত্তর)\s+(?:নিচে\s+)?(?:দেওয়া|দেয়া)\s+হলো\s*[:：।]\s*/;
  // a leading sentence that starts by talking about the picture -> remove
  var INTRO_PIC = /^\s*(?:প্রদত্ত\s+)?ছবি(?:টি)?(?:তে|র)?[^।?:]*[।:]\s*/;
  // same idea for English answers
  var INTRO_EN = /^[\s\S]*?(?:solution|answer)\s+(?:is\s+)?(?:given|provided)\s+below\s*[:.]\s*/i;

  function clean(inner) {
    var out = inner;
    var t = out.replace(INTRO_END, '');
    if (t.trim()) out = t;
    t = out.replace(INTRO_EN, '');
    if (t.trim()) out = t;
    t = out.replace(INTRO_PIC, '');
    if (t.trim()) out = t;
    return out;
  }

  window.renderRich = function (raw, final) {
    var html = original(raw, final);
    if (typeof html !== 'string' || html.indexOf('mcq-q-title') === -1) return html;
    return html.replace(/(<h4 class="mcq-q-title">)([\s\S]*?)(<\/h4>)/g, function (m, a, inner, c) {
      return a + clean(inner) + c;
    });
  };
})();
