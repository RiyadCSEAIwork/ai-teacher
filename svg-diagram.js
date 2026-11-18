/**
 * AI Teacher - Geometry / science diagram add-on (loads AFTER script.js)
 *
 * The AI draws geometry and science figures as ```svg blocks (the server prompt in
 * functions/api/chat.js tells it to). This file turns those blocks into real pictures.
 * It also repairs small SVG mistakes (missing closing tags, a bare "&", cut-off output)
 * and, if a picture still cannot be drawn, shows a message plus the SVG code to inspect.
 * script.js / style.css / ui-update.css do not need any change.
 */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  /* friendly message when the server answers "busy" (all AI models slow or overloaded) */
  try {
    if (typeof TEXT !== 'undefined') {
      TEXT.bn.errors.busy = 'AI সার্ভার এখন ব্যস্ত বা উত্তর দিতে দেরি করছে। কিছুক্ষণ পরে আবার চেষ্টা করুন। ছবি বড় বা জটিল হলে প্রয়োজনীয় অংশ ক্রপ করে দিলে দ্রুত হবে।';
      TEXT.en.errors.busy = 'The AI server is busy or slow right now. Please try again shortly. If the picture is large or complex, crop it to the part you need.';
    }
  } catch (e) { /* ignore */ }

  /* ---------- styles (injected) ---------- */
  var css = document.createElement('style');
  css.textContent =
    '.msg-bubble .svg-box{margin:1rem 0 1.2rem 0;padding:1rem;background:#ffffff;' +
    'border:1.5px solid #bfdbfe;border-radius:14px;box-shadow:0 6px 18px rgba(37,99,235,.08);' +
    'text-align:center;overflow-x:auto;}' +
    '.msg-bubble .svg-box img{max-width:100%;max-height:460px;height:auto;}' +
    '.msg-bubble .svg-box.svg-loading{color:#64748b;font-size:.95rem;}' +
    '.msg-bubble .svg-box .svg-err{display:none;color:#b91c1c;font-size:.92rem;margin:.4rem 0;}' +
    '.msg-bubble .svg-box.svg-failed img{display:none;}' +
    '.msg-bubble .svg-box.svg-failed .svg-err{display:block;}' +
    '.msg-bubble .svg-box .svg-src{margin-top:.6rem;text-align:left;font-size:.8rem;color:#475569;}' +
    '.msg-bubble .svg-box .svg-src pre{max-height:200px;overflow:auto;background:#f1f5f9;' +
    'padding:.6rem;border-radius:8px;white-space:pre-wrap;word-break:break-all;margin:.4rem 0 0 0;}';
  document.head.appendChild(css);

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Clean + repair the AI's SVG. The tolerant HTML parser closes open tags and escapes
     stray "&"; XMLSerializer then writes it back as well-formed SVG. */
  function repairSvg(raw) {
    var svg = String(raw || '').trim();
    if (!/<svg[\s>]/i.test(svg)) return '';
    svg = svg.replace(/<!--[\s\S]*?-->/g, '');            // the AI's private working notes
    svg = svg.replace(/<script[\s\S]*?<\/script>/gi, '');
    svg = svg.slice(svg.search(/<svg[\s>]/i));              // drop any text before <svg
    var end = svg.toLowerCase().lastIndexOf('</svg>');
    if (end !== -1) svg = svg.slice(0, end + 6);            // drop any text after </svg>

    try {
      var doc = new DOMParser().parseFromString(svg, 'text/html');
      var el = doc.querySelector('svg');
      if (el) {
        el.querySelectorAll('script,foreignObject,iframe').forEach(function (n) { n.remove(); });
        el.setAttribute('xmlns', NS);
        if (!el.getAttribute('viewBox') && !el.getAttribute('width')) el.setAttribute('viewBox', '0 0 400 300');
        return new XMLSerializer().serializeToString(el);
      }
    } catch (e) { /* fall through to the plain text version */ }

    if (!/xmlns\s*=/.test(svg)) svg = svg.replace(/<svg/i, '<svg xmlns="' + NS + '"');
    if (end === -1) svg += '</svg>';
    return svg;
  }

  /* ---------- draw ```svg blocks as pictures ---------- */
  var origCodeBlock = window.codeBlockHtml;
  if (typeof origCodeBlock === 'function') {
    window.codeBlockHtml = function (lang, code, final) {
      if (lang === 'svg') {
        if (!final) {
          return '<div class="svg-box svg-loading">✏️ ছবি আঁকা হচ্ছে…</div>';
        }
        var svg = repairSvg(code);
        if (!svg) return '';
        // shown through <img>, so nothing inside the SVG can run as a script
        return '<div class="svg-box">' +
          '<img alt="চিত্র" src="data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '"' +
          ' onerror="this.parentNode.classList.add(\'svg-failed\')">' +
          '<div class="svg-err">⚠️ ছবিটি আঁকা যায়নি। আবার প্রশ্ন করে দেখুন।</div>' +
          '<details class="svg-src"><summary>SVG কোড দেখুন</summary><pre>' + esc(svg) + '</pre></details>' +
          '</div>';
      }
      return origCodeBlock.apply(this, arguments);
    };
  }
})();
