/**
 * AI Teacher - Geometry / science diagram add-on (loads AFTER script.js)
 *
 * Problem: the AI drew shapes (rhombus, triangle...) with Mermaid, which is a flowchart
 * tool and cannot draw real geometry.
 * Fix: 1) ```svg code blocks are now drawn as real pictures in the answer.
 *      2) When the question asks to draw something, the AI is told to use SVG
 *         (and Mermaid only for flowcharts).
 * script.js / style.css / ui-update.css do not need any change.
 */
(function () {
  'use strict';

  /* ---------- styles (injected) ---------- */
  var css = document.createElement('style');
  css.textContent =
    '.msg-bubble .svg-box{margin:1rem 0 1.2rem 0;padding:1rem;background:#ffffff;' +
    'border:1.5px solid #bfdbfe;border-radius:14px;box-shadow:0 6px 18px rgba(37,99,235,.08);' +
    'text-align:center;overflow-x:auto;}' +
    '.msg-bubble .svg-box img{max-width:100%;max-height:420px;height:auto;}' +
    '.msg-bubble .svg-box.svg-loading{color:#64748b;font-size:.95rem;}';
  document.head.appendChild(css);

  /* ---------- 1. draw ```svg blocks as pictures ---------- */
  var origCodeBlock = window.codeBlockHtml;
  if (typeof origCodeBlock === 'function') {
    window.codeBlockHtml = function (lang, code, final) {
      if (lang === 'svg') {
        if (!final) {
          return '<div class="svg-box svg-loading">✏️ ছবি আঁকা হচ্ছে…</div>';
        }
        var svg = String(code || '').trim();
        if (!/<svg[\s>]/i.test(svg)) return '';
        svg = svg.replace(/<script[\s\S]*?<\/script>/gi, '');
        if (!/xmlns\s*=/.test(svg)) {
          svg = svg.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        // shown through <img>, so nothing inside the SVG can run as a script
        return '<div class="svg-box"><img alt="চিত্র" src="data:image/svg+xml;charset=utf-8,' +
          encodeURIComponent(svg) + '"></div>';
      }
      return origCodeBlock.apply(this, arguments);
    };
  }

  /* ---------- 2. tell the AI to use SVG when a drawing is asked ---------- */
  var DRAW_WORDS = /(আঁক|এঁক|আকো|আকুন|অঙ্কন|অংকন|চিত্র|ডায়াগ্রাম|নকশা|ছবি\s*(আঁক|এঁক|দাও|বানা)|draw|diagram|figure|sketch)/i;

  var HINT =
    'চিত্র আঁকার নিয়ম (এই নিয়ম উত্তরে উল্লেখ করবে না): ' +
    'ত্রিভুজ, চতুর্ভুজ, রম্বস, বৃত্ত, কোণ, সমান্তরাল রেখা, বলের চিত্র, বর্তনী ইত্যাদি জ্যামিতিক বা বিজ্ঞানের চিত্র ' +
    'কখনো Mermaid দিয়ে আঁকবে না। এগুলোর জন্য শুধু ```svg কোড ব্লক ব্যবহার করবে। ' +
    'SVG-তে viewBox="0 0 400 300" ও xmlns="http://www.w3.org/2000/svg" দেবে এবং আকৃতির সঠিক স্থানাঙ্ক হিসাব করে বসাবে ' +
    '(যেমন রম্বসের চার বাহু সমান, কর্ণ পরস্পরকে সমকোণে ছেদ করে; সমকোণী ত্রিভুজে সমকোণ চিহ্ন থাকে)। ' +
    'বিন্দুর নাম (A, B, C...) ও মাপ <text> দিয়ে লিখবে; সাধারণ টেক্সট ও ° চিহ্ন ব্যবহার করবে, LaTeX বা $ ব্যবহার করবে না। ' +
    'সমান বাহু ও সমকোণ চিহ্ন দিয়ে দেখাবে। <script> বা বাইরের ছবি ব্যবহার করবে না। ' +
    'Mermaid শুধু ফ্লোচার্ট, প্রক্রিয়ার ধাপ বা শ্রেণিবিভাগের জন্য ব্যবহার করবে। ' +
    'চিত্রের আগে বা পরে সংক্ষেপে বৈশিষ্ট্যগুলো বুঝিয়ে লিখবে।';

  var origBuild = window.buildMessages;
  if (typeof origBuild === 'function') {
    window.buildMessages = function () {
      var msgs = origBuild.apply(this, arguments);
      try {
        for (var i = msgs.length - 1; i >= 0; i--) {
          if (msgs[i].role !== 'user') continue;
          // only the latest user message, and only when it asks for a drawing
          if (DRAW_WORDS.test(msgs[i].text || '')) {
            msgs[i].text = (msgs[i].text || '') + '\n\n[' + HINT + ']';
          }
          break;
        }
      } catch (e) { /* never block sending a question */ }
      return msgs;
    };
  }
})();
