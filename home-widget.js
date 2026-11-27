/* ============ AI Teacher — Home Widget (Dashboard Time + premium mic/image icons) ============
   Loads AFTER home-v2.js. Does not change any existing file.
   - Adds a "Dashboard Time" card (live clock, date, Bangla date, weather, month calendar)
     to the bottom row of the home page, for guests AND logged-in users.
   - Replaces the emoji mic / image buttons in the home ask box with the same premium
     SVG icons used on the chat page.
   home-v2.js rebuilds the page with innerHTML on every render, so a MutationObserver
   re-applies everything after each render. */
(function () {
  'use strict';

  var LAT = 23.8103, LON = 90.4125;            // Dhaka (weather)
  var BN_DIGITS = '০১২৩৪৫৬৭৮৯';
  var WD = {
    bn: ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  };
  var MON = {
    bn: ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };
  var BMON = ['বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন', 'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'];
  // Bangladesh revised Bangla calendar: [gregorian month (0-based), day, index in BMON]
  var BSTART = [[3, 14, 0], [4, 15, 1], [5, 15, 2], [6, 16, 3], [7, 16, 4], [8, 16, 5], [9, 16, 6], [10, 15, 7], [11, 15, 8], [0, 14, 9], [1, 13, 10], [2, 15, 11]];

  var TXT = {
    bn: { title: 'DASHBOARD TIME', live: 'LIVE', foot: 'আজই নতুন কিছু শিখুন!', today: 'আজকের তারিখে ফিরুন', wxLoad: 'লোড হচ্ছে…' },
    en: { title: 'DASHBOARD TIME', live: 'LIVE', foot: 'Learn something new today!', today: 'Back to today', wxLoad: 'Loading…' }
  };
  var DAYS_HEAD = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // WMO weather code -> [emoji day, emoji night, bn, en]
  function wxInfo(code, isDay) {
    var d = isDay !== 0;
    if (code === 0) return [d ? '☀️' : '🌙', d ? '☀️' : '🌙', 'পরিষ্কার আকাশ', 'Clear'];
    if (code === 1) return [d ? '🌤️' : '🌙', '', 'প্রায় পরিষ্কার', 'Mostly clear'];
    if (code === 2) return [d ? '⛅' : '☁️', '', 'আংশিক মেঘলা', 'Partly cloudy'];
    if (code === 3) return ['☁️', '', 'মেঘলা', 'Cloudy'];
    if (code === 45 || code === 48) return ['🌫️', '', 'কুয়াশা', 'Fog'];
    if (code >= 51 && code <= 57) return ['🌦️', '', 'গুঁড়ি গুঁড়ি বৃষ্টি', 'Drizzle'];
    if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return ['🌧️', '', 'বৃষ্টি', 'Rain'];
    if (code >= 71 && code <= 77) return ['❄️', '', 'তুষার', 'Snow'];
    if (code >= 95) return ['⛈️', '', 'ঝড়বৃষ্টি', 'Thunderstorm'];
    return ['🌡️', '', 'আবহাওয়া', 'Weather'];
  }

  var ICON_MIC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>';
  var ICON_IMG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';

  var view = null;                 // {y, m} month shown in the calendar
  var wx = null;                   // {t, code, day}
  var lastKey = '';

  /* ---------- helpers ---------- */
  function lang() { try { return currentLanguage === 'en' ? 'en' : 'bn'; } catch (e) { return 'bn'; } }
  function bn(s) { return String(s).replace(/\d/g, function (d) { return BN_DIGITS.charAt(d); }); }
  function num(n) { return lang() === 'bn' ? bn(n) : String(n); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function root() { return document.getElementById('hv2'); }

  function timeStr(d) {
    var h = d.getHours() % 12 || 12;
    return pad(h) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + ' ' + (d.getHours() < 12 ? 'AM' : 'PM');
  }
  function banglaDate(d) {
    var today = new Date(d.getFullYear(), d.getMonth(), d.getDate()), best = null, y = d.getFullYear();
    [y, y - 1].forEach(function (yy) {
      BSTART.forEach(function (s) {
        var sd = new Date(yy, s[0], s[1]);
        if (sd <= today && (!best || sd > best.sd)) best = { sd: sd, i: s[2] };
      });
    });
    var day = Math.round((today - best.sd) / 864e5) + 1;
    var year = today >= new Date(y, 3, 14) ? y - 593 : y - 594;
    return bn(day) + ' ' + BMON[best.i] + ' ' + bn(year);
  }
  function dateLine(d) {
    var l = lang();
    if (l === 'en') return WD.en[d.getDay()] + ', ' + MON.en[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    return WD.bn[d.getDay()] + ', ' + bn(d.getDate()) + ' ' + MON.bn[d.getMonth()] + ' ' + bn(d.getFullYear());
  }

  /* ---------- calendar ---------- */
  function calendarHTML(now) {
    if (!view) view = { y: now.getFullYear(), m: now.getMonth() };
    var first = new Date(view.y, view.m, 1).getDay();
    var count = new Date(view.y, view.m + 1, 0).getDate();
    var html = DAYS_HEAD.map(function (h) { return '<span class="hvw-h">' + h + '</span>'; }).join('');
    for (var i = 0; i < first; i++) html += '<span></span>';
    for (var d = 1; d <= count; d++) {
      var isToday = d === now.getDate() && view.m === now.getMonth() && view.y === now.getFullYear();
      html += '<span class="hvw-d' + (isToday ? ' hvw-today' : '') + '">' + d + '</span>';
    }
    return html;
  }
  function inner() {
    var l = lang(), tx = TXT[l], now = new Date();
    if (!view) view = { y: now.getFullYear(), m: now.getMonth() };
    return '<div class="hvw-top"><div class="hvw-title"><span class="hvw-clk">🕒</span>' + tx.title + '</div>' +
        '<span class="hvw-live"><i></i>' + tx.live + '</span></div>' +
      '<div class="hvw-main"><div class="hvw-left">' +
        '<div class="hvw-time">' + timeStr(now) + '</div>' +
        '<div class="hvw-date">' + dateLine(now) + '</div>' +
        '<div class="hvw-bdate">' + banglaDate(now) + '</div></div>' +
      '<div class="hvw-wx"><div class="hvw-wxi" data-wx="i">⛅</div><b data-wx="t">--°C</b><small data-wx="d">' + tx.wxLoad + '</small></div></div>' +
      '<div class="hvw-cal"><div class="hvw-cal-h">' +
        '<button type="button" data-w="prev" aria-label="Previous month">‹</button>' +
        '<span class="hvw-mon" data-w="today" title="' + tx.today + '">' + MON.en[view.m] + ' ' + view.y + '</span>' +
        '<button type="button" data-w="next" aria-label="Next month">›</button></div>' +
        '<div class="hvw-grid">' + calendarHTML(now) + '</div></div>' +
      '<div class="hvw-foot"><span>🎓</span> ' + tx.foot + ' ✨</div>';
  }

  /* ---------- weather (Open-Meteo, free, no key) ---------- */
  function paintWeather() {
    var w = root() && root().querySelector('.hvw'); if (!w || !wx) return;
    var info = wxInfo(wx.code, wx.day), l = lang();
    var set = function (k, v) { var el = w.querySelector('[data-wx="' + k + '"]'); if (el) el.textContent = v; };
    set('i', info[0]);
    set('t', num(Math.round(wx.t)) + '°C');
    set('d', l === 'bn' ? info[2] : info[3]);
  }
  function loadWeather() {
    try {
      var c = JSON.parse(localStorage.getItem('hvw_wx') || 'null');
      if (c && Date.now() - c.ts < 30 * 60 * 1000) { wx = c; paintWeather(); return; }
    } catch (e) {}
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + LAT + '&longitude=' + LON +
      '&current=temperature_2m,weather_code,is_day&timezone=auto';
    fetch(url).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (!j || !j.current) return;
      wx = { t: j.current.temperature_2m, code: j.current.weather_code, day: j.current.is_day, ts: Date.now() };
      try { localStorage.setItem('hvw_wx', JSON.stringify(wx)); } catch (e) {}
      paintWeather();
    }).catch(function () {});
  }

  /* ---------- inject into the home page ---------- */
  function onWidgetClick(e) {
    var b = e.target.closest('[data-w]'); if (!b) return;
    var a = b.getAttribute('data-w'), now = new Date();
    if (!view) view = { y: now.getFullYear(), m: now.getMonth() };
    if (a === 'prev') { view.m--; if (view.m < 0) { view.m = 11; view.y--; } }
    else if (a === 'next') { view.m++; if (view.m > 11) { view.m = 0; view.y++; } }
    else if (a === 'today') { view = { y: now.getFullYear(), m: now.getMonth() }; }
    var w = e.currentTarget;
    w.querySelector('.hvw-mon').textContent = MON.en[view.m] + ' ' + view.y;
    w.querySelector('.hvw-grid').innerHTML = calendarHTML(now);
  }
  function ensure() {
    var r = root(); if (!r) return;
    // 1) premium icons (same look as the chat page input bar)
    var mic = r.querySelector('.hv2-ic[data-a="mic"]'), img = r.querySelector('.hv2-ic[data-a="img"]');
    if (mic && !mic.getAttribute('data-hvw')) { mic.innerHTML = ICON_MIC; mic.setAttribute('data-hvw', '1'); }
    if (img && !img.getAttribute('data-hvw')) { img.innerHTML = ICON_IMG; img.setAttribute('data-hvw', '1'); }
    // 2) dashboard widget
    var bottom = r.querySelector('.hv2-bottom');
    if (!bottom || bottom.querySelector('.hvw')) return;
    bottom.classList.add('hvw-3');
    var w = document.createElement('section');
    w.className = 'hv2-box hvw';
    w.innerHTML = inner();
    w.addEventListener('click', onWidgetClick);
    bottom.appendChild(w);
    lastKey = new Date().toDateString() + lang();
    paintWeather();
  }

  function tick() {
    var r = root(), w = r && r.querySelector('.hvw'); if (!w) return;
    var now = new Date(), key = now.toDateString() + lang();
    if (key !== lastKey) { lastKey = key; w.innerHTML = inner(); paintWeather(); return; }   // new day / language change
    var t = w.querySelector('.hvw-time'); if (t) t.textContent = timeStr(now);
  }

  var queued = false;
  function schedule() {
    if (queued) return; queued = true;
    requestAnimationFrame(function () { queued = false; ensure(); });
  }

  function init() {
    var r = root(); if (!r) return;
    new MutationObserver(schedule).observe(r, { childList: true });   // home-v2.js re-renders via innerHTML
    ensure();
    loadWeather();
    setInterval(tick, 1000);
    setInterval(loadWeather, 30 * 60 * 1000);
  }
  window.HomeWidget = { banglaDate: banglaDate, dateLine: dateLine, timeStr: timeStr };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
