/**
 * AI Teacher - Geometry / science diagram add-on (loads AFTER script.js)
 *
 * The AI now draws geometry and science figures as ```svg blocks (the server prompt in
 * functions/api/chat.js tells it to). This file turns those blocks into real pictures.
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

  /* ---------- draw ```svg blocks as pictures ---------- */
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
        // the AI's private working notes live in <!-- --> comments; drop them before drawing
        svg = svg.replace(/<!--[\s\S]*?-->/g, '');
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
})();
