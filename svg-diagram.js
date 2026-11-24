/**
 * AI Teacher - Geometry / science diagram add-on (loads AFTER script.js)
 *
 * 1) ```geo blocks  -> short tags, drawn exactly by this file (no AI-written SVG):
 *      angle 225 A B C        (any angle 1-359; arc is always fully visible)
 *      triangle 3 4 5 A B C   (sides a=BC, b=CA, c=AB; right-angle mark is automatic)
 * 2) ```svg blocks  -> still drawn (repaired), but the SVG code is NOT shown any more.
 */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  try {
    if (typeof TEXT !== 'undefined') {
      TEXT.bn.errors.busy = 'AI সার্ভার এখন ব্যস্ত বা উত্তর দিতে দেরি করছে। কিছুক্ষণ পরে আবার চেষ্টা করুন। ছবি বড় বা জটিল হলে প্রয়োজনীয় অংশ ক্রপ করে দিলে দ্রুত হবে।';
      TEXT.en.errors.busy = 'The AI server is busy or slow right now. Please try again shortly. If the picture is large or complex, crop it to the part you need.';
    }
  } catch (e) { /* ignore */ }

  var css = document.createElement('style');
  css.textContent =
    '.msg-bubble .svg-box{margin:1rem 0 1.2rem 0;padding:1rem;background:#ffffff;' +
    'border:1.5px solid #bfdbfe;border-radius:14px;box-shadow:0 6px 18px rgba(37,99,235,.08);' +
    'text-align:center;overflow-x:auto;}' +
    '.msg-bubble .svg-box img{max-width:100%;max-height:460px;height:auto;}' +
    '.msg-bubble .svg-box.svg-loading{color:#64748b;font-size:.95rem;}' +
    '.msg-bubble .svg-box .svg-err{display:none;color:#b91c1c;font-size:.92rem;margin:.4rem 0;}' +
    '.msg-bubble .svg-box.svg-failed img{display:none;}' +
    '.msg-bubble .svg-box.svg-failed .svg-err{display:block;}';
  document.head.appendChild(css);

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function f(n) { return Math.round(n * 10) / 10; }

  /* ---------- exact drawings from tags ---------- */
  var HEAD = '<svg viewBox="0 0 300 300" xmlns="' + NS + '" font-family="serif" font-size="18" text-anchor="middle">';

  function angleSvg(d, L) {
    if (!(d > 0 && d < 360)) return '';
    L = L || [];
    var A = L[0] || 'A', B = L[1] || 'B', C = L[2] || 'C';
    var c = 150, R = 110, r = 38, k = Math.PI / 180;
    function P(t, m) { return [c + m * Math.cos(t * k), c - m * Math.sin(t * k)]; }
    var a = P(d, R), q = P(0, R), s = P(0, r), e = P(d, r);
    var la = P(d, R + 16), lc = P(0, R + 16), lt = P(d / 2, r + 22);
    return HEAD +
      '<path d="M' + c + ' ' + c + 'L' + f(a[0]) + ' ' + f(a[1]) + 'M' + c + ' ' + c + 'L' + f(q[0]) + ' ' + f(q[1]) +
      '" stroke="#000" stroke-width="2" fill="none"/>' +
      '<path d="M' + f(s[0]) + ' ' + f(s[1]) + 'A' + r + ' ' + r + ' 0 ' + (d > 180 ? 1 : 0) + ' 0 ' + f(e[0]) + ' ' + f(e[1]) +
      '" stroke="#e11d48" stroke-width="2.5" fill="none"/>' +
      '<circle cx="' + c + '" cy="' + c + '" r="3"/>' +
      '<text x="' + f(la[0]) + '" y="' + f(la[1] + 6) + '">' + esc(A) + '</text>' +
      '<text x="' + (c - 12) + '" y="' + (c + 22) + '">' + esc(B) + '</text>' +
      '<text x="' + f(lc[0]) + '" y="' + f(lc[1] + 6) + '">' + esc(C) + '</text>' +
      '<text x="' + f(lt[0]) + '" y="' + f(lt[1] + 6) + '" fill="#e11d48">' + d + '°</text></svg>';
  }

  function triSvg(a, b, c, L) {
    if (!(a > 0 && b > 0 && c > 0) || a + b <= c || a + c <= b || b + c <= a) return '';
    L = L || [];
    var names = [L[0] || 'A', L[1] || 'B', L[2] || 'C'];
    var x = (c * c + a * a - b * b) / (2 * a), y = Math.sqrt(Math.max(c * c - x * x, 0));
    var minx = Math.min(0, x), w = Math.max(a, x) - minx;
    var s = Math.min(200 / w, 150 / y), ox = 50 - minx * s, oy = 205;
    function T(p) { return [ox + p[0] * s, oy - p[1] * s]; }
    var Ap = T([x, y]), Bp = T([0, 0]), Cp = T([a, 0]);
    var g = [(Ap[0] + Bp[0] + Cp[0]) / 3, (Ap[1] + Bp[1] + Cp[1]) / 3];
    function away(p, m) {
      var dx = p[0] - g[0], dy = p[1] - g[1], n = Math.sqrt(dx * dx + dy * dy) || 1;
      return [p[0] + dx / n * m, p[1] + dy / n * m];
    }
    function mid(p, q) { return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; }
    var out = HEAD +
      '<polygon points="' + [Ap, Bp, Cp].map(function (p) { return f(p[0]) + ',' + f(p[1]); }).join(' ') +
      '" stroke="#000" stroke-width="2" fill="#eff6ff" stroke-linejoin="round"/>';
    // right-angle marks
    [[Ap, Bp, Cp], [Bp, Cp, Ap], [Cp, Ap, Bp]].forEach(function (t) {
      var v = t[0], p = t[1], q = t[2];
      var u1 = [p[0] - v[0], p[1] - v[1]], u2 = [q[0] - v[0], q[1] - v[1]];
      var n1 = Math.sqrt(u1[0] * u1[0] + u1[1] * u1[1]), n2 = Math.sqrt(u2[0] * u2[0] + u2[1] * u2[1]);
      if (Math.abs(u1[0] * u2[0] + u1[1] * u2[1]) / (n1 * n2) < 0.001) {
        var e1 = [u1[0] / n1 * 14, u1[1] / n1 * 14], e2 = [u2[0] / n2 * 14, u2[1] / n2 * 14];
        out += '<path d="M' + f(v[0] + e1[0]) + ' ' + f(v[1] + e1[1]) + 'L' + f(v[0] + e1[0] + e2[0]) + ' ' + f(v[1] + e1[1] + e2[1]) +
          'L' + f(v[0] + e2[0]) + ' ' + f(v[1] + e2[1]) + '" stroke="#e11d48" stroke-width="2" fill="none"/>';
      }
    });
    [[Ap, names[0]], [Bp, names[1]], [Cp, names[2]]].forEach(function (v) {
      var p = away(v[0], 16);
      out += '<text x="' + f(p[0]) + '" y="' + f(p[1] + 6) + '">' + esc(v[1]) + '</text>';
    });
    [[mid(Bp, Cp), a], [mid(Cp, Ap), b], [mid(Ap, Bp), c]].forEach(function (v) {
      var p = away(v[0], 14);
      out += '<text x="' + f(p[0]) + '" y="' + f(p[1] + 5) + '" font-size="15" fill="#1d4ed8">' + v[1] + '</text>';
    });
    return out + '</svg>';
  }

  function geoSvg(code) {
    var t = String(code || '').trim().split(/\s+/), kind = (t.shift() || '').toLowerCase();
    if (kind === 'angle') return angleSvg(parseFloat(t[0]), t.slice(1));
    if (kind === 'triangle') return triSvg(parseFloat(t[0]), parseFloat(t[1]), parseFloat(t[2]), t.slice(3));
    return '';
  }

  /* ---------- repair for AI-written ```svg blocks (fallback) ---------- */
  function repairSvg(raw) {
    var svg = String(raw || '').trim();
    if (!/<svg[\s>]/i.test(svg)) return '';
    svg = svg.replace(/<!--[\s\S]*?-->/g, '');
    svg = svg.replace(/<script[\s\S]*?<\/script>/gi, '');
    svg = svg.slice(svg.search(/<svg[\s>]/i));
    var end = svg.toLowerCase().lastIndexOf('</svg>');
    if (end !== -1) svg = svg.slice(0, end + 6);
    try {
      var doc = new DOMParser().parseFromString(svg, 'text/html');
      var el = doc.querySelector('svg');
      if (el) {
        el.querySelectorAll('script,foreignObject,iframe').forEach(function (n) { n.remove(); });
        el.setAttribute('xmlns', NS);
        if (!el.getAttribute('viewBox') && !el.getAttribute('width')) el.setAttribute('viewBox', '0 0 400 300');
        return new XMLSerializer().serializeToString(el);
      }
    } catch (e) { /* fall through */ }
    if (!/xmlns\s*=/.test(svg)) svg = svg.replace(/<svg/i, '<svg xmlns="' + NS + '"');
    if (end === -1) svg += '</svg>';
    return svg;
  }

  function box(svg) {
    // shown through <img>, so nothing inside the SVG can run as a script
    return '<div class="svg-box">' +
      '<img alt="চিত্র" src="data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '"' +
      ' onerror="this.parentNode.classList.add(\'svg-failed\')">' +
      '<div class="svg-err">⚠️ ছবিটি আঁকা যায়নি। আবার প্রশ্ন করে দেখুন।</div></div>';
  }

  var origCodeBlock = window.codeBlockHtml;
  if (typeof origCodeBlock === 'function') {
    window.codeBlockHtml = function (lang, code, final) {
      if (lang === 'geo' || lang === 'svg') {
        if (!final) return '<div class="svg-box svg-loading">✏️ ছবি আঁকা হচ্ছে…</div>';
        var svg = lang === 'geo' ? geoSvg(code) : repairSvg(code);
        return svg ? box(svg) : '';
      }
      return origCodeBlock.apply(this, arguments);
    };
  }
})();
