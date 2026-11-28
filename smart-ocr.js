/* ============================================================
   AI Teacher — Smart Notes: ছবি → লেখা (OCR)
   - ছবির লেখা ব্যবহারকারীর ব্রাউজারেই পড়া হয় (Tesseract.js) -> API টোকেন লাগে না, ছবি সার্ভারে যায় না
   - ফলাফল Smart Notes-এর টেক্সট বক্সে বসে; ব্যবহারকারী ঠিক করে নিয়ে "নোট ও সারসংক্ষেপ তৈরি করো" চাপলে তবেই API ব্যবহার হয়
   - script.js / পুরনো ফাইল বদলানো হয়নি; শুধু #smartNotesModal-এর ভেতরে টুলবার যোগ করে
   - Tesseract প্রথমবার ব্যবহারের সময় লোড হয় (তার আগে পেজ হালকাই থাকে)
   ============================================================ */
(function () {
  'use strict';

  var TESS_SRC = 'https://cdn.jsdelivr.net/npm/tesseract.js@7/dist/tesseract.min.js';
  var LOCAL_LANG = '/ocr-lang';          // ঐচ্ছিক: ben.traineddata.gz + eng.traineddata.gz এখানে রাখলে নিজের সাইট থেকেই নামবে
  var TARGET_W = 2400;                   // লেখার সাইজ ঠিক রাখতে ছবি এই চওড়ার কাছাকাছি আনা হয়
  var MAX_W = 2800, MAX_UP = 3.5, MAX_PIXELS = 12e6;
  var MIN_CONF = 45;                     // এর নিচের আত্মবিশ্বাসের লাইন (হাতের দাগ/ময়লা) বাদ যায়
  var MAX_FILE = 25 * 1024 * 1024;
  var IDLE_MS = 90000;                   // কাজ শেষে ৯০ সেকেন্ড পর মেমরি ছেড়ে দেয়

  /*PURE-START*/
  /* প্রতি পিক্সেলে লাল ও সবুজের বড়টা নিয়ে ধূসর ছবি বানায়: লাল কালির দাগ/বক্স এবং সবুজ/হলুদ হাইলাইটার মিলিয়ে যায়,
     কালো লেখা থাকে। তারপর কনট্রাস্ট টেনে দেয় */
  function toInkGray(d, n) {
    var hist = new Uint32Array(256), i, v;
    for (i = 0; i < n; i++) hist[d[i * 4] > d[i * 4 + 1] ? d[i * 4] : d[i * 4 + 1]]++;
    var lo = 0, hi = 255, acc = 0, cut = n * 0.01;
    for (i = 0; i < 256; i++) { acc += hist[i]; if (acc >= cut) { lo = i; break; } }
    acc = 0; cut = n * 0.01;
    for (i = 255; i >= 0; i--) { acc += hist[i]; if (acc >= cut) { hi = i; break; } }
    if (hi - lo < 40) { lo = 0; hi = 255; }
    var k = 255 / (hi - lo);
    for (i = 0; i < n; i++) {
      v = ((d[i * 4] > d[i * 4 + 1] ? d[i * 4] : d[i * 4 + 1]) - lo) * k; v = v < 0 ? 0 : (v > 255 ? 255 : v);
      d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255;
    }
  }

  /* লাইন ধরে লেখা বানায়: অস্পষ্ট লাইন বাদ; পুরো-চওড়া লাইন (যা পরের লাইনে গড়িয়েছে) জোড়া, ছোট/শেষ লাইন আলাদা */
  function buildText(blocks, minConf) {
    var paras = [], dropped = 0, kept = 0;
    (blocks || []).forEach(function (b) {
      (b.paragraphs || []).forEach(function (p) {
        var rows = [], maxW = 0;
        (p.lines || []).forEach(function (l) {
          var t = String(l.text || '').replace(/\s+/g, ' ').trim();
          if (!t) return;
          if ((l.confidence || 0) < minConf) { dropped++; return; }
          var w = l.bbox ? (l.bbox.x1 - l.bbox.x0) : t.length;
          if (w > maxW) maxW = w;
          kept++; rows.push({ t: t, w: w });
        });
        if (!rows.length) return;
        var out = rows[0].t;
        for (var i = 1; i < rows.length; i++) {
          var prev = rows[i - 1], join = prev.w >= 0.8 * maxW && !/[।?!:;]$/.test(prev.t);
          out += (join ? ' ' : '\n') + rows[i].t;
        }
        paras.push(out);
      });
    });
    return { text: paras.join('\n'), dropped: dropped, kept: kept };
  }

  /* ছোটখাটো চেনা ভুল ঠিক: দাঁড়ির জায়গায় | বা ৷, বাড়তি ফাঁকা */
  function cleanChars(t) {
    t = String(t || '').normalize('NFC').replace(/[​﻿]/g, '');
    t = t.replace(/৷/g, '।').replace(/([ঀ-৿\)])[ \t]*\|(?=\s|$)/g, '$1।');
    t = t.split('\n').map(function (l) { return l.replace(/[ \t]{2,}/g, ' ').trim(); }).join('\n');
    return t.replace(/\n{3,}/g, '\n\n').trim();
  }

  /* "(a) (b) (c) (d)" অপশন-চিহ্ন ভুল পড়া হলে ঠিক করে (শুধু যে লাইনে ঠিক ৪টি চিহ্ন আছে) */
  function fixOptions(text) {
    var SETS = ['abcd', 'ABCD', '1234', '১২৩৪', 'কখগঘ'];
    return String(text).split('\n').map(function (line) {
      var re = /[(（]\s*([^()（）\s]{1,2})\s*[)）]/g, m = [], x;
      while ((x = re.exec(line))) m.push(x[1]);
      if (m.length !== 4) return line;
      var best = -1, bestSet = null;
      SETS.forEach(function (s) {
        var c = 0; for (var i = 0; i < 4; i++) if (m[i] === s.charAt(i)) c++;
        if (c > best) { best = c; bestSet = s; }
      });
      if (best === 4) return line;
      if (best < 2) { if (/[কখগঘ]/.test(m.join(''))) return line; bestSet = 'abcd'; }
      var i2 = 0;
      var out = line.replace(re, function () { return '(' + bestSet.charAt(i2++) + ')'; });
      return out.replace(/^\s*[^\sঀ-৿A-Za-z(（]{1,2}\s+(?=[(（])/, '');
    }).join('\n');
  }
  /*PURE-END*/

  /* ---------- ভাষা ---------- */
  var TX = {
    bn: {
      pick: 'ছবি থেকে লেখা', langBe: 'বাংলা + ইংরেজি', langB: 'শুধু বাংলা', langE: 'শুধু ইংরেজি',
      clean: 'অস্পষ্ট লাইন/হাতের দাগ বাদ দিন', cancel: '✕ বাতিল',
      hint: 'ছবির লেখা আপনার ফোন/কম্পিউটারেই পড়া হয় — কোনো টোকেন লাগে না। ভুল থাকলে নিচের বক্সে ঠিক করে নিন।',
      free: 'ছবি থেকে লেখা বের করতে টোকেন লাগে না', chars: ' অক্ষর',
      making: 'ছবি তৈরি হচ্ছে…', loading: 'টুল ও ভাষার ডেটা নামছে (শুধু প্রথমবার)… ', reading: 'লেখা পড়া হচ্ছে… ',
      tessFail: 'লেখা-পড়ার টুল লোড হয়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন।',
      badImg: 'ছবিটি খোলা যায়নি। JPG বা PNG ছবি দিন।', notImg: 'শুধু ছবি দিন।', big: 'ছবি অনেক বড় (২৫ MB-এর বেশি)।',
      none: 'কোনো লেখা পাওয়া যায়নি। স্পষ্ট ও সোজা করে তোলা ছবি দিন।',
      cancelled: 'বাতিল করা হয়েছে।', failed: 'লেখা পড়া যায়নি, আবার চেষ্টা করুন।',
      done: function (k, d) { return '✓ ' + bn(k) + 'টি লাইন যোগ হয়েছে' + (d ? ' • ' + bn(d) + 'টি অস্পষ্ট লাইন বাদ গেছে' : '') + ' • সারসংক্ষেপের আগে একবার দেখে নিন'; },
      optFix: ' • অপশনের চিহ্ন (a)(b)(c)(d) ঠিক করা হয়েছে',
      drop: 'ছবি এখানে ছেড়ে দিন'
    },
    en: {
      pick: 'Text from image', langBe: 'Bangla + English', langB: 'Bangla only', langE: 'English only',
      clean: 'Skip unclear lines / handwriting marks', cancel: '✕ Cancel',
      hint: 'The image is read on your own device — no tokens are used. Fix any mistakes in the box below.',
      free: 'Reading text from an image uses no tokens', chars: ' characters',
      making: 'Preparing image…', loading: 'Downloading the tool and language data (first time only)… ', reading: 'Reading text… ',
      tessFail: 'Could not load the text reader. Check your internet and try again.',
      badImg: 'Could not open the image. Please use a JPG or PNG.', notImg: 'Please choose an image.', big: 'Image is too large (over 25 MB).',
      none: 'No text found. Use a clear, straight photo.',
      cancelled: 'Cancelled.', failed: 'Could not read the text, please try again.',
      done: function (k, d) { return '✓ ' + k + ' lines added' + (d ? ' • ' + d + ' unclear lines skipped' : '') + ' • please check it before summarising'; },
      optFix: ' • option markers fixed to (a)(b)(c)(d)',
      drop: 'Drop the image here'
    }
  };
  function lang() { try { return currentLanguage === 'en' ? 'en' : 'bn'; } catch (e) { return 'bn'; } }
  function T() { return TX[lang()]; }
  function bn(n) { return lang() === 'bn' ? String(n).replace(/\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'.charAt(d); }) : String(n); }
  function $(id) { return document.getElementById(id); }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} }

  /* ---------- Tesseract (প্রথমবার লাগলে লোড) ---------- */
  var tessP = null, worker = null, workerKey = '', idleT = null, langPathP = null, runId = 0, busy = false;
  var progressCb = function () {};

  function loadTess() {
    if (window.Tesseract) return Promise.resolve();
    if (tessP) return tessP;
    tessP = new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = TESS_SRC; s.async = true;
      s.onload = function () { res(); };
      s.onerror = function () { tessP = null; rej(new Error('load')); };
      document.head.appendChild(s);
    });
    return tessP;
  }
  function headOk(url) {
    return fetch(url, { method: 'HEAD', cache: 'no-store' }).then(function (r) {
      return r.ok && !/text\/html/i.test(r.headers.get('content-type') || '');
    }).catch(function () { return false; });
  }
  function detectLangPath() {            // নিজের সাইটে /ocr-lang থাকলে সেটা, না থাকলে Tesseract-এর ডিফল্ট CDN
    if (!langPathP) langPathP = Promise.all([headOk(LOCAL_LANG + '/ben.traineddata.gz'), headOk(LOCAL_LANG + '/eng.traineddata.gz')])
      .then(function (a) { return a[0] && a[1] ? LOCAL_LANG : undefined; });
    return langPathP;
  }
  function killWorker() {
    clearTimeout(idleT);
    if (worker) { try { worker.terminate(); } catch (e) {} }
    worker = null; workerKey = '';
  }
  function getWorker(langs, onProgress) {
    progressCb = onProgress;             // চলতি কাজের প্রগ্রেস (worker পুনর্ব্যবহার হলেও ঠিক থাকে)
    if (worker && workerKey === langs) return Promise.resolve(worker);
    killWorker();
    return Promise.all([loadTess(), detectLangPath()]).then(function (r) {
      var opts = {
        logger: function (m) {
          if (!m) return;
          if (m.status === 'recognizing text') progressCb('reading', m.progress);
          else if (/load|initializ/i.test(m.status || '')) progressCb('loading', m.progress);
        }
      };
      if (r[1]) opts.langPath = r[1];
      return window.Tesseract.createWorker(langs, 1, opts);
    }).then(function (w) {
      return w.setParameters({ tessedit_pageseg_mode: '3', preserve_interword_spaces: '1' }).then(function () {
        worker = w; workerKey = langs; return w;
      });
    });
  }

  /* ---------- ছবি তৈরি ---------- */
  function viaImg(file) {
    return new Promise(function (res, rej) {
      var u = URL.createObjectURL(file), im = new Image();
      im.onload = function () { URL.revokeObjectURL(u); res(im); };
      im.onerror = function () { URL.revokeObjectURL(u); rej(new Error('decode')); };
      im.src = u;
    });
  }
  function loadBitmap(file) {
    if (window.createImageBitmap) {
      return createImageBitmap(file, { imageOrientation: 'from-image' }).catch(function () { return viaImg(file); });
    }
    return viaImg(file);
  }
  function prepCanvas(src) {
    var w = src.naturalWidth || src.width, h = src.naturalHeight || src.height;
    if (!w || !h) throw new Error('decode');
    var sc = Math.min(Math.max(TARGET_W / w, 1), MAX_UP);
    if (w * sc > MAX_W) sc = MAX_W / w;
    if (w * sc * h * sc > MAX_PIXELS) sc = Math.sqrt(MAX_PIXELS / (w * h));
    var cw = Math.max(1, Math.round(w * sc)), ch = Math.max(1, Math.round(h * sc));
    var c = document.createElement('canvas'); c.width = cw; c.height = ch;
    var x = c.getContext('2d', { willReadFrequently: true });
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    x.fillStyle = '#fff'; x.fillRect(0, 0, cw, ch);
    x.drawImage(src, 0, 0, cw, ch);
    if (src.close) { try { src.close(); } catch (e) {} }
    var id = x.getImageData(0, 0, cw, ch);
    toInkGray(id.data, cw * ch);
    x.putImageData(id, 0, 0);
    return c;
  }

  /* ---------- UI ---------- */
  function setMsg(text, kind) {
    var m = $('soMsg'); if (!m) return;
    m.textContent = text || ''; m.className = 'so-msg' + (kind ? ' ' + kind : '');
  }
  function setProg(p) {
    var bar = $('soProg'); if (!bar) return;
    if (p == null) { bar.hidden = true; return; }
    bar.hidden = false; $('soProgBar').style.width = Math.max(3, Math.min(100, Math.round(p * 100))) + '%';
  }
  function setBusy(b) {
    busy = b;
    var pick = $('soPick'); if (pick) pick.disabled = b;
    var c = $('soCancel'); if (c) c.hidden = !b;
    var m = $('smartNotesModal'); if (m) m.classList.toggle('so-busy', b);
  }
  function count() {
    var ta = $('smartNotesContent'), el = $('soCount'); if (!ta || !el) return;
    el.textContent = bn(ta.value.length) + T().chars;
  }
  function insertText(t) {
    var ta = $('smartNotesContent'); if (!ta) return;
    var cur = ta.value.replace(/\s+$/, '');
    ta.value = cur ? cur + '\n\n' + t : t;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    count(); ta.focus();
    try { ta.setSelectionRange(ta.value.length, ta.value.length); } catch (e) {}
  }

  function run(file) {
    if (busy) return;
    if (!file || !/^image\//.test(file.type || '')) { setMsg(T().notImg, 'err'); return; }
    if (file.size > MAX_FILE) { setMsg(T().big, 'err'); return; }
    var id = ++runId, langs = $('soLang').value, minConf = $('soClean').checked ? MIN_CONF : 0;
    ls('so_lang', langs); ls('so_clean', $('soClean').checked ? '1' : '0');
    setBusy(true); setMsg(T().making); setProg(0.03);
    var canvas;
    loadBitmap(file).then(function (src) { canvas = prepCanvas(src); })
      .catch(function () { throw new Error('BADIMG'); })
      .then(function () {
        if (id !== runId) throw new Error('CANCEL');
        setMsg(T().loading);
        return getWorker(langs, function (kind, p) {
          if (id !== runId) return;
          if (kind === 'loading') { setMsg(T().loading + bn(Math.round((p || 0) * 100)) + '%'); setProg(p || 0.05); }
          else { setMsg(T().reading + bn(Math.round((p || 0) * 100)) + '%'); setProg(p || 0.05); }
        });
      })
      .then(function (w) {
        if (id !== runId) throw new Error('CANCEL');
        return w.recognize(canvas, {}, { text: true, blocks: true });
      })
      .then(function (res) {
        if (id !== runId) throw new Error('CANCEL');
        var data = res.data || {}, built = buildText(data.blocks, minConf), text = built.text;
        if (!text && !data.blocks) text = String(data.text || '');
        var fixed = fixOptions(cleanChars(text));
        var optFixed = fixed !== cleanChars(text);
        if (!fixed.trim()) { setMsg(T().none, 'err'); return; }
        insertText(fixed);
        setMsg(T().done(built.kept || fixed.split('\n').length, built.dropped) + (optFixed ? T().optFix : ''), 'ok');
      })
      .catch(function (e) {
        var m = e && e.message;
        if (m === 'CANCEL') { setMsg(T().cancelled); return; }
        if (m === 'BADIMG') { setMsg(T().badImg, 'err'); return; }
        if (m === 'load') { setMsg(T().tessFail, 'err'); return; }
        killWorker(); setMsg(T().failed, 'err');
      })
      .then(function () {
        if (id === runId) { setBusy(false); setProg(null); idleT = setTimeout(killWorker, IDLE_MS); }
      });
  }
  function cancel() {
    runId++; killWorker(); setBusy(false); setProg(null); setMsg(T().cancelled);
  }

  function imageFrom(items) {
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.kind === 'file' && /^image\//.test(it.type)) return it.getAsFile();
    }
    return null;
  }

  function texts() {
    var t = T();
    var set = function (id, v) { var e = $(id); if (e) e.textContent = v; };
    set('soPickTx', t.pick); set('soCleanTx', t.clean); set('soHint', t.hint); set('soFree', t.free);
    $('soCancel').textContent = t.cancel; $('soDropTx').textContent = t.drop;
    var s = $('soLang'); s.options[0].textContent = t.langBe; s.options[1].textContent = t.langB; s.options[2].textContent = t.langE;
    count();
  }

  function build() {
    var modal = $('smartNotesModal'), ta = $('smartNotesContent');
    if (!modal || !ta || $('soBar')) return;
    var body = ta.parentNode;
    var bar = document.createElement('div');
    bar.id = 'soBar'; bar.className = 'so-wrap';
    bar.innerHTML =
      '<div class="so-bar">' +
        '<button type="button" class="so-btn" id="soPick"><span class="so-ic">🖼️</span><span id="soPickTx"></span></button>' +
        '<select id="soLang" class="so-sel" aria-label="OCR language">' +
          '<option value="ben+eng"></option><option value="ben"></option><option value="eng"></option></select>' +
        '<label class="so-chk"><input type="checkbox" id="soClean"><span id="soCleanTx"></span></label>' +
        '<button type="button" class="so-cancel" id="soCancel" hidden></button>' +
        '<input type="file" id="soFile" accept="image/*" hidden>' +
      '</div>' +
      '<div class="so-prog" id="soProg" hidden><i id="soProgBar"></i></div>' +
      '<div class="so-msg" id="soMsg"></div>' +
      '<div class="so-hint" id="soHint"></div>';
    body.insertBefore(bar, ta);
    var foot = document.createElement('div');
    foot.className = 'so-foot';
    foot.innerHTML = '<span id="soCount"></span><span class="so-free" id="soFree"></span>';
    body.insertBefore(foot, ta.nextSibling);
    var drop = document.createElement('div');
    drop.className = 'so-drop'; drop.innerHTML = '<span id="soDropTx"></span>';
    body.style.position = body.style.position || 'relative';
    body.appendChild(drop);

    $('soLang').value = ls('so_lang') || 'ben+eng';
    if (!$('soLang').value) $('soLang').value = 'ben+eng';
    $('soClean').checked = ls('so_clean') !== '0';
    texts();

    $('soPick').addEventListener('click', function () { $('soFile').click(); });
    $('soFile').addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) run(f);
    });
    $('soCancel').addEventListener('click', cancel);
    ta.addEventListener('input', count);
    ta.addEventListener('paste', function (e) {
      var f = e.clipboardData && imageFrom(e.clipboardData.items || []);
      if (f) { e.preventDefault(); run(f); }
    });
    var depth = 0;
    body.addEventListener('dragenter', function (e) { if (hasFiles(e)) { depth++; body.classList.add('so-over'); } });
    body.addEventListener('dragleave', function () { depth = Math.max(0, depth - 1); if (!depth) body.classList.remove('so-over'); });
    body.addEventListener('dragover', function (e) { if (hasFiles(e)) e.preventDefault(); });
    body.addEventListener('drop', function (e) {
      depth = 0; body.classList.remove('so-over');
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) { e.preventDefault(); run(f); }
    });
    function hasFiles(e) { var t = e.dataTransfer && e.dataTransfer.types; return t && [].indexOf.call(t, 'Files') > -1; }

    // মডাল বন্ধ হলে চলতি কাজ থামে ও মেমরি ছাড়ে
    var cb = [$('btnCloseSmartNotes'), $('btnCancelSmartNotes')];
    cb.forEach(function (b) { if (b) b.addEventListener('click', function () { if (busy) cancel(); else { clearTimeout(idleT); idleT = setTimeout(killWorker, 5000); } }); });
    // Smart Notes খোলার সময় চুপচাপ টুলের স্ক্রিপ্ট আনা শুরু (ছোট ফাইল), ভাষার ডেটা নয়
    ['btnSmartNotes', 'csNotes'].forEach(function (id) {
      var b = $(id); if (b) b.addEventListener('click', function () { loadTess().catch(function () {}); count(); });
    });
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('#csNotes')) { loadTess().catch(function () {}); count(); }
    });
    setInterval(count, 800);

    // ভাষা বদলালে লেখাও বদলায়
    if (typeof window.setLanguage === 'function') {
      var orig = window.setLanguage;
      window.setLanguage = function () { var r = orig.apply(this, arguments); try { texts(); } catch (e) {} return r; };
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
  window.SmartOCR = { run: run };
})();
