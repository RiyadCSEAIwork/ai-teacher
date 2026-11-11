/**
 * AI Teacher - Client Side Application Logic
 * Login/Signup, class+subject selection, streaming chat (SSE), MCQ cards, KaTeX, Mermaid,
 * code blocks, chat history + titles (D1), Smart Notes, gender avatar.
 */

// DOM Elements
const brandLogo = document.getElementById('brandLogo');
const btnNewChat = document.getElementById('btnNewChat');
const btnHistory = document.getElementById('btnHistory');
const btnSmartNotes = document.getElementById('btnSmartNotes');
const btnMcqPractice = document.getElementById('btnMcqPractice');
const btnMobileToggle = document.getElementById('btnMobileToggle');
const navCenterMenu = document.getElementById('navCenterMenu');

// Language & Quota Elements
const btnLangBn = document.getElementById('btnLangBn');
const btnLangEn = document.getElementById('btnLangEn');
const userQuotaBadge = document.getElementById('userQuotaBadge');
const quotaText = document.getElementById('quotaText');

// Profile & Auth Elements
const btnOpenLogin = document.getElementById('btnOpenLogin');
const userProfilePill = document.getElementById('userProfilePill');
const userAvatarWrap = document.getElementById('userAvatarWrap');
const userNameLabel = document.getElementById('userNameLabel');
const btnLogout = document.getElementById('btnLogout');

// Chat & Input Elements
const heroSection = document.getElementById('heroSection');
const chatThread = document.getElementById('chatThread');
const chatMessages = document.getElementById('chatMessages');
const userQuestionInput = document.getElementById('userQuestionInput');
const btnSubmitQuestion = document.getElementById('btnSubmitQuestion');
const fileImageInput = document.getElementById('fileImageInput');
const imagePreviewBar = document.getElementById('imagePreviewBar');
const previewImg = document.getElementById('previewImg');
const btnRemovePreview = document.getElementById('btnRemovePreview');
const subjectChips = document.getElementById('subjectChips');

// Smart Notes Modal Elements
const smartNotesModal = document.getElementById('smartNotesModal');
const btnCloseSmartNotes = document.getElementById('btnCloseSmartNotes');
const btnCancelSmartNotes = document.getElementById('btnCancelSmartNotes');
const smartNotesContent = document.getElementById('smartNotesContent');
const btnProcessSmartNotes = document.getElementById('btnProcessSmartNotes');

// History Drawer Elements
const historyDrawer = document.getElementById('historyDrawer');
const btnCloseHistory = document.getElementById('btnCloseHistory');
const drawerBackdrop = document.getElementById('drawerBackdrop');
const historyItemsList = document.getElementById('historyItemsList');

// Auth Modal Elements
const authModal = document.getElementById('authModal');
const btnCloseAuth = document.getElementById('btnCloseAuth');
const tabLogin = document.getElementById('tabLogin');
const tabSignup = document.getElementById('tabSignup');
const formLogin = document.getElementById('formLogin');
const formSignup = document.getElementById('formSignup');

// SVGs for Male & Female Avatars
const MALE_AVATAR_SVG = `
  <svg class="avatar-svg" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#e0e7ff"/>
    <circle cx="16" cy="13" r="5" fill="#4338ca"/>
    <path d="M8 27C8 22 11.5 20 16 20C20.5 20 24 22 24 27" fill="#6366f1"/>
  </svg>
`;

const FEMALE_AVATAR_SVG = `
  <svg class="avatar-svg" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#fce7f3"/>
    <circle cx="16" cy="13" r="5" fill="#db2777"/>
    <path d="M10 11.5C9.5 15.5 11 18.5 11 18.5M22 11.5C22.5 15.5 21 18.5 21 18.5" stroke="#be185d" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M8 27C8 22 11.5 20 16 20C20.5 20 24 22 24 27" fill="#ec4899"/>
  </svg>
`;

/* ========================================================
   CONSTANTS
   ======================================================== */
const SUBJECTS = {
  math: { bn: 'গণিত', en: 'Math' },
  physics: { bn: 'পদার্থবিজ্ঞান', en: 'Physics' },
  chemistry: { bn: 'রসায়ন', en: 'Chemistry' },
  biology: { bn: 'জীববিজ্ঞান', en: 'Biology' },
  ict: { bn: 'ICT', en: 'ICT' }
};
const CLASS_NAMES = [
  { bn: 'ষষ্ঠ শ্রেণি', en: 'Class 6' },
  { bn: 'সপ্তম শ্রেণি', en: 'Class 7' },
  { bn: 'অষ্টম শ্রেণি', en: 'Class 8' },
  { bn: 'নবম শ্রেণি', en: 'Class 9' },
  { bn: 'দশম শ্রেণি (SSC)', en: 'Class 10 (SSC)' },
  { bn: 'একাদশ শ্রেণি', en: 'Class 11' },
  { bn: 'দ্বাদশ শ্রেণি (HSC)', en: 'Class 12 (HSC)' },
  { bn: 'ভর্তি পরীক্ষা', en: 'Admission test' }
];

const MAX_IMAGE_SIDE = 1600;
const MAX_IMAGE_BASE64 = 5400000;
const MAX_IMAGE_FILE_BYTES = 25 * 1024 * 1024;

const TEXT = {
  bn: {
    placeholder: 'আপনার প্রশ্ন লিখুন বা ছবি যুক্ত করুন...',
    follow: 'আপনার পরের প্রশ্নটি লিখুন...',
    submit: 'প্রশ্ন করুন',
    classLabel: 'শ্রেণি নির্বাচন',
    quota: (u, l) => `আজ ${u}/${l} প্রশ্ন`,
    thinking: 'AI উত্তর তৈরি করছে...',
    classWord: 'শ্রেণি',
    subjectWord: 'বিষয়',
    copy: '📋 কপি',
    copied: '✅ কপি হয়েছে!',
    simple: '💡 আরও সহজ করে বলো',
    example: '📖 একটি উদাহরণ দাও',
    quiz: '❓ আমাকে একটি প্রশ্ন করো',
    simplePrompt: 'এটি আরও সহজ ও সাবলীল ভাষায় বুঝিয়ে বলো।',
    examplePrompt: 'এর সাথে প্রাসঙ্গিক একটি বাস্তব উদাহরণ দাও।',
    quizPrompt: 'এই টপিকের ওপর আমাকে একটি গুরুত্বপূর্ণ MCQ বা সংক্ষিপ্ত প্রশ্ন জিজ্ঞাসা করো।',
    like: 'ভালো লেগেছে',
    dislike: 'উত্তরে ভুল আছে',
    preview: 'প্রিভিউ',
    hidePreview: 'প্রিভিউ বন্ধ',
    copyCode: 'কপি',
    imageReady: 'ছবি যুক্ত হয়েছে',
    imagePreparing: 'ছবি প্রস্তুত হচ্ছে…',
    pictureQuestion: 'ছবির প্রশ্ন',
    pictureTag: '🖼️ (ছবি)',
    oldImageNote: '(আগে একটি ছবি পাঠানো হয়েছিল)',
    noChats: 'কোনো পূর্ববর্তী আলোচনা পাওয়া যায়নি।',
    loadingChats: 'লোড হচ্ছে...',
    untitled: 'পূর্ববর্তী প্রশ্ন',
    deleteAsk: 'এই আলোচনাটি মুছে ফেলবেন?',
    errors: {
      unauthorized: 'প্রশ্ন করতে আগে লগইন করুন।',
      daily_limit: 'আজকের প্রশ্ন করার কোটা শেষ হয়েছে। আগামীকাল আবার চেষ্টা করুন।',
      global_limit: 'আজ পুরো সাইটের প্রশ্নের সীমা শেষ হয়ে গেছে। আগামীকাল আবার চেষ্টা করুন।',
      rate_limited: 'এখন অনেকে একসাথে প্রশ্ন করছে। কয়েক সেকেন্ড পর আবার চেষ্টা করুন।',
      server_not_configured: 'সার্ভারের সেটিং অসম্পূর্ণ আছে (GEMINI_API_KEY / লগইন সেটিং দেখুন)।',
      bad_image: 'ছবিটি পাঠানো গেল না। অন্য একটি ছবি দিয়ে চেষ্টা করুন।',
      empty_reply: 'AI এবার কোনো উত্তর দেয়নি। আবার চেষ্টা করুন।',
      network: 'ইন্টারনেট সংযোগে সমস্যা হচ্ছে। আবার চেষ্টা করুন।',
      generic: 'দুঃখিত, উত্তর আনতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
      image_type: 'শুধু ছবির ফাইল (JPG, PNG, WebP, HEIC) দেওয়া যাবে।',
      image_too_big: 'ছবিটি অনেক বড়। ছোট সাইজের ছবি দিন।',
      image_failed: 'ছবিটি পড়া গেল না। অন্য একটি ছবি দিন।'
    }
  },
  en: {
    placeholder: 'Ask your question or upload an image...',
    follow: 'Type your next question...',
    submit: 'Ask',
    classLabel: 'Select class',
    quota: (u, l) => `Today ${u}/${l}`,
    thinking: 'AI is preparing the answer...',
    classWord: 'Class',
    subjectWord: 'Subject',
    copy: '📋 Copy',
    copied: '✅ Copied!',
    simple: '💡 Explain more simply',
    example: '📖 Give an example',
    quiz: '❓ Quiz me',
    simplePrompt: 'Explain this again in simpler words.',
    examplePrompt: 'Give a real-life example related to this.',
    quizPrompt: 'Ask me one important MCQ or short question on this topic.',
    like: 'Good answer',
    dislike: 'Answer has a mistake',
    preview: 'Preview',
    hidePreview: 'Hide preview',
    copyCode: 'Copy',
    imageReady: 'Image attached',
    imagePreparing: 'Preparing image…',
    pictureQuestion: 'Picture question',
    pictureTag: '🖼️ (image)',
    oldImageNote: '(an image was sent earlier)',
    noChats: 'No earlier chats found.',
    loadingChats: 'Loading...',
    untitled: 'Earlier question',
    deleteAsk: 'Delete this chat?',
    errors: {
      unauthorized: 'Please log in first to ask a question.',
      daily_limit: "You have used today's question quota. Please try again tomorrow.",
      global_limit: "The site's daily question limit is used up. Please try again tomorrow.",
      rate_limited: 'Many people are asking right now. Please try again in a moment.',
      server_not_configured: 'Server settings are incomplete (check GEMINI_API_KEY / login settings).',
      bad_image: 'The image could not be sent. Try a different one.',
      empty_reply: 'The AI gave no answer this time. Please try again.',
      network: 'Connection problem. Please try again.',
      generic: 'Sorry, something went wrong. Please try again.',
      image_type: 'Only image files (JPG, PNG, WebP, HEIC) are allowed.',
      image_too_big: 'That image is too large. Use a smaller one.',
      image_failed: 'That image could not be read. Try another.'
    }
  }
};
function tx() { return TEXT[currentLanguage] || TEXT.bn; }

/* ========================================================
   STATE
   ======================================================== */
let currentUser = null;
let currentLanguage = 'bn';
let pendingImage = null;
let preparingImage = false;
let isStreamingResponse = false;
let chatLog = [];
let currentChatId = null;
let currentChatTitle = '';
let titleRequested = false;
let selectedSubject = '';
let selectedClass = '';
let contextLocked = false;
let resumeAfterAuth = false;
let saveQueue = Promise.resolve();
let heroBn = null;

const classSelect = document.getElementById('classSelect');
const ctxBadge = document.getElementById('ctxBadge');
const previewInfo = document.getElementById('previewInfo');
const txtHeroTitle = document.getElementById('txtHeroTitle');
const txtHeroSub = document.getElementById('txtHeroSub');
const txtSubmit = document.getElementById('txtSubmit');

/* ========================================================
   SMALL HELPERS
   ======================================================== */
function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function showToast(message) {
  const el = document.createElement('div');
  el.className = 'toast-msg';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function scrollToBottom(smooth) {
  window.scrollTo({ top: document.body.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
}

function timeLabel(ts, dur) {
  if (!ts) return '';
  let label = '';
  try {
    label = new Date(ts).toLocaleTimeString(currentLanguage === 'en' ? 'en-US' : 'bn-BD', { hour: '2-digit', minute: '2-digit' });
  } catch (e) { label = ''; }
  if (dur && dur > 0) label += ' · ' + (dur / 1000).toFixed(1) + (currentLanguage === 'en' ? 's' : ' সেকেন্ড');
  return label;
}

function avatarFor(user) {
  return user && user.gender === 'female' ? FEMALE_AVATAR_SVG : MALE_AVATAR_SVG;
}

function newChatId() {
  return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function currentCtx() {
  const ctx = {};
  if (selectedSubject) ctx.s = selectedSubject;
  if (selectedClass !== '') ctx.c = Number(selectedClass);
  return ctx;
}

/* ========================================================
   INITIALIZATION
   ======================================================== */
document.addEventListener('DOMContentLoaded', () => {
  heroBn = {
    title: txtHeroTitle ? txtHeroTitle.textContent : '',
    sub: txtHeroSub ? txtHeroSub.textContent : ''
  };
  if (window.mermaid) {
    try { window.mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' }); } catch (e) { /* ignore */ }
  }
  checkAuth();
  bindNavbarEvents();
  bindInputEvents();
  bindSmartNotesEvents();
  bindAuthModalEvents();
  bindContextSelectors();
  bindChatClicks();
  applyLanguageTexts();
});

/* ========================================================
   AUTHENTICATION & USER STATE
   ======================================================== */
async function checkAuth() {
  try {
    const res = await fetch('/api/me', { credentials: 'same-origin' });
    if (res.ok) {
      const data = await res.json();
      const username = typeof data.user === 'string' ? data.user : (data.user && (data.user.username || data.user.name)) || data.username;
      if (username) {
        currentUser = {
          username,
          gender: data.gender || 'male',
          used: data.used || 0,
          daily_limit: data.limit || 30
        };
        renderUserNav(currentUser);
        return;
      }
    }
  } catch (err) {
    console.warn('Auth check skipped / Guest session active', err);
  }
  currentUser = null;
  renderUserNav(null);
}

function updateQuota() {
  if (!currentUser) return;
  quotaText.textContent = tx().quota(currentUser.used || 0, currentUser.daily_limit || 30);
}

function renderUserNav(user) {
  if (user) {
    btnOpenLogin.style.display = 'none';
    userProfilePill.style.display = 'flex';
    userQuotaBadge.style.display = 'inline-flex';
    userNameLabel.textContent = user.username || 'ইউজার';
    userAvatarWrap.innerHTML = avatarFor(user);
    updateQuota();
  } else {
    btnOpenLogin.style.display = 'inline-block';
    userProfilePill.style.display = 'none';
    userQuotaBadge.style.display = 'none';
  }
}

/* ========================================================
   LANGUAGE
   ======================================================== */
function buildClassOptions() {
  const lang = currentLanguage;
  classSelect.innerHTML = '<option value="">' + escapeHtml(tx().classLabel) + '</option>' +
    CLASS_NAMES.map((c, i) => '<option value="' + i + '">' + escapeHtml(c[lang]) + '</option>').join('');
  classSelect.value = selectedClass;
}

function applyLanguageTexts() {
  const lang = currentLanguage;
  document.body.classList.remove('lang-bn', 'lang-en');
  document.body.classList.add('lang-' + lang);
  btnLangBn.classList.toggle('active', lang === 'bn');
  btnLangEn.classList.toggle('active', lang === 'en');
  userQuestionInput.placeholder = chatLog.length ? tx().follow : tx().placeholder;
  if (txtSubmit) txtSubmit.textContent = tx().submit;

  document.querySelectorAll('.chip-btn').forEach((btn) => {
    const label = btn.querySelector('.chip-label');
    const s = SUBJECTS[btn.dataset.subject];
    if (label && s) label.textContent = s[lang];
  });
  buildClassOptions();

  if (txtHeroTitle && txtHeroSub && heroBn) {
    if (lang === 'en') {
      txtHeroTitle.textContent = 'Make studying easier and smarter';
      txtHeroSub.textContent = 'Ask about any subject and the AI gives a simple, accurate answer.';
    } else {
      txtHeroTitle.textContent = heroBn.title;
      txtHeroSub.textContent = heroBn.sub;
    }
  }
  updateQuota();
  updateContextUI();
}

function setLanguage(lang) {
  currentLanguage = lang;
  applyLanguageTexts();
}

/* ========================================================
   CLASS + SUBJECT SELECTION
   ======================================================== */
function bindContextSelectors() {
  document.querySelectorAll('.chip-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (contextLocked) {
        showToast(currentLanguage === 'en'
          ? 'Class and subject are fixed for this chat. Start a new chat to change them.'
          : 'এই চ্যাটের শ্রেণি ও বিষয় ঠিক করা আছে। বদলাতে নতুন চ্যাট শুরু করুন।');
        return;
      }
      const id = btn.dataset.subject;
      selectedSubject = selectedSubject === id ? '' : id;
      updateContextUI();
      userQuestionInput.focus();
    });
  });

  classSelect.addEventListener('change', () => {
    if (contextLocked) { classSelect.value = selectedClass; return; }
    selectedClass = classSelect.value;
    updateContextUI();
  });
}

function setContextLocked(locked) {
  contextLocked = locked;
  updateContextUI();
}

function updateContextUI() {
  document.querySelectorAll('.chip-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.subject === selectedSubject);
    btn.disabled = contextLocked;
  });
  classSelect.value = selectedClass;
  classSelect.disabled = contextLocked;

  const chipsRow = document.getElementById('subjectChips');
  if (chipsRow) chipsRow.classList.toggle('unlocked', !contextLocked);

  const parts = [];
  if (selectedClass !== '' && CLASS_NAMES[Number(selectedClass)]) parts.push(tx().classWord + ': ' + CLASS_NAMES[Number(selectedClass)][currentLanguage]);
  if (selectedSubject && SUBJECTS[selectedSubject]) parts.push(tx().subjectWord + ': ' + SUBJECTS[selectedSubject][currentLanguage]);
  if (contextLocked && parts.length) {
    ctxBadge.textContent = '🔒 ' + parts.join(' · ');
    ctxBadge.style.display = 'inline-flex';
  } else {
    ctxBadge.style.display = 'none';
  }
}

/* ========================================================
   NAVBAR & CONTROLS BINDING
   ======================================================== */
function bindNavbarEvents() {
  btnMobileToggle.addEventListener('click', () => {
    navCenterMenu.classList.toggle('open');
  });

  btnNewChat.addEventListener('click', resetChatSession);
  brandLogo.addEventListener('click', (e) => {
    if (chatThread.style.display !== 'none') {
      e.preventDefault();
      resetChatSession();
    }
  });

  btnHistory.addEventListener('click', openHistoryDrawer);
  btnCloseHistory.addEventListener('click', closeHistoryDrawer);
  drawerBackdrop.addEventListener('click', closeHistoryDrawer);

  btnMcqPractice.addEventListener('click', () => {
    alert('MCQ প্র্যাকটিস এবং স্পেশাল মডেল টেস্ট ফিচারটি খুব শীঘ্রই আসছে!');
  });

  btnLangBn.addEventListener('click', () => setLanguage('bn'));
  btnLangEn.addEventListener('click', () => setLanguage('en'));

  btnLogout.addEventListener('click', async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    currentUser = null;
    renderUserNav(null);
    window.location.reload();
  });
}

/* ========================================================
   SMART NOTES FEATURE (MODAL & PROMPT CREATOR)
   ======================================================== */
function bindSmartNotesEvents() {
  btnSmartNotes.addEventListener('click', () => {
    smartNotesModal.style.display = 'flex';
    smartNotesContent.focus();
  });

  btnCloseSmartNotes.addEventListener('click', () => {
    smartNotesModal.style.display = 'none';
  });

  btnCancelSmartNotes.addEventListener('click', () => {
    smartNotesModal.style.display = 'none';
  });

  btnProcessSmartNotes.addEventListener('click', () => {
    const text = smartNotesContent.value.trim();
    if (!text) {
      alert('অনুগ্রহ করে সারসংক্ষেপ তৈরি করতে কিছু লেখা বা প্যারাগ্রাফ পেস্ট করুন।');
      return;
    }
    smartNotesModal.style.display = 'none';
    smartNotesContent.value = '';

    const generatedPrompt = `নিচের বিষয়টির একটি সম্পূর্ণ ও নির্ভুল 'Smart Notes' (সারসংক্ষেপ) তৈরি করে দাও। মূল বিষয়, প্রয়োজনীয় সূত্রাবলি, গুরুত্বপূর্ণ পয়েন্ট এবং পরীক্ষার জন্য প্রয়োজনীয় তথ্যগুলো বুলেট পয়েন্ট আকারে সুন্দরভাবে উপস্থাপন করো:\n\n${text}`;

    submitQuestion(generatedPrompt, null);
  });
}

/* ========================================================
   INPUT & IMAGE UPLOAD
   ======================================================== */
function autosizeInput() {
  userQuestionInput.style.height = 'auto';
  userQuestionInput.style.height = Math.min(userQuestionInput.scrollHeight, 140) + 'px';
}

function bindInputEvents() {
  userQuestionInput.addEventListener('input', autosizeInput);

  userQuestionInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      handleQuestionSubmit();
    }
  });

  btnSubmitQuestion.addEventListener('click', handleQuestionSubmit);
  fileImageInput.addEventListener('change', handleFileChosen);

  btnRemovePreview.addEventListener('click', () => {
    if (!isStreamingResponse) clearPendingImage();
  });
}

function setPendingImage(img) {
  pendingImage = img;
  previewImg.src = img.url || '';
  previewInfo.textContent = tx().imageReady;
  imagePreviewBar.style.display = 'flex';
}

function clearPendingImage() {
  pendingImage = null;
  fileImageInput.value = '';
  previewImg.removeAttribute('src');
  imagePreviewBar.style.display = 'none';
}

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image_failed')); };
    img.src = url;
  });
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('image_failed'));
    r.readAsDataURL(file);
  });
}

async function prepareImage(file) {
  const type = (file.type || '').toLowerCase();
  const looksLikeImage = type.indexOf('image/') === 0 || /\.(jpe?g|png|webp|gif|heic|heif|bmp)$/i.test(file.name || '');
  if (!looksLikeImage) throw new Error('image_type');
  if (file.size > MAX_IMAGE_FILE_BYTES) throw new Error('image_too_big');

  let loaded = null;
  try {
    loaded = await loadImageElement(file);
  } catch (e) {
    const isHeic = /heic|heif/.test(type) || /\.(heic|heif)$/i.test(file.name || '');
    if (isHeic && file.size <= 3.5 * 1024 * 1024) {
      const rawUrl = await readAsDataUrl(file);
      return { mime: /heif$/.test(type) ? 'image/heif' : 'image/heic', data: rawUrl.split(',')[1], url: '' };
    }
    throw new Error('image_failed');
  }

  try {
    const img = loaded.img;
    const w = img.naturalWidth, h = img.naturalHeight;
    if (!w || !h) throw new Error('image_failed');
    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(w, h));
    const cw = Math.max(1, Math.round(w * scale));
    const ch = Math.max(1, Math.round(h * scale));

    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, 0, 0, cw, ch);

    const qualities = [0.92, 0.85, 0.75, 0.6];
    let dataUrl = '';
    for (let i = 0; i < qualities.length; i++) {
      dataUrl = canvas.toDataURL('image/jpeg', qualities[i]);
      if (dataUrl.length - 23 <= MAX_IMAGE_BASE64) break;
    }
    const base64 = dataUrl.split(',')[1] || '';
    if (!base64 || base64.length > MAX_IMAGE_BASE64) throw new Error('image_too_big');
    return { mime: 'image/jpeg', data: base64, url: dataUrl };
  } finally {
    URL.revokeObjectURL(loaded.url);
  }
}

async function makeThumb(dataUrl) {
  if (!dataUrl) return '';
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('thumb'));
      i.src = dataUrl;
    });
    const w = img.naturalWidth, h = img.naturalHeight;
    if (!w || !h) return '';
    const scale = Math.min(1, 900 / Math.max(w, h));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const qualities = [0.72, 0.58, 0.45, 0.35];
    for (let q = 0; q < qualities.length; q++) {
      const out = canvas.toDataURL('image/jpeg', qualities[q]).split(',')[1] || '';
      if (out && out.length <= 250000) return out;
    }
  } catch (e) { /* no thumbnail */ }
  return '';
}

async function handleFileChosen(e) {
  const file = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!file || isStreamingResponse) return;
  preparingImage = true;
  previewImg.removeAttribute('src');
  previewInfo.textContent = tx().imagePreparing;
  imagePreviewBar.style.display = 'flex';
  try {
    setPendingImage(await prepareImage(file));
  } catch (err) {
    clearPendingImage();
    showToast(tx().errors[err && err.message] || tx().errors.image_failed);
  } finally {
    preparingImage = false;
  }
}

/* ========================================================
   RICH TEXT: MARKDOWN, MATH (KaTeX), CODE, MERMAID, MCQ CARD
   ======================================================== */
function inline(s) {
  return s
    .replace(/&lt;br\s*\/?&gt;/gi, '<br>')
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*(?!\s)([^*\n]*[^\s*])\*(?![\w*])/g, '$1<em>$2</em>')
    .replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

function mathToken(maths, tex, display) {
  maths.push({ tex: tex.trim(), display });
  return '' + (maths.length - 1) + '';
}

function extractMath(raw, maths) {
  const parts = raw.split('```');
  for (let i = 0; i < parts.length; i += 2) {
    parts[i] = parts[i]
      .replace(/\$\$([\s\S]+?)\$\$/g, (m, tex) => mathToken(maths, tex, true))
      .replace(/\\\[([\s\S]+?)\\\]/g, (m, tex) => mathToken(maths, tex, true))
      .replace(/\\\(([\s\S]+?)\\\)/g, (m, tex) => mathToken(maths, tex, false))
      .replace(/\$(?!\s)([^$\n]*?[^\s$])\$(?!\d)/g, (m, tex) => mathToken(maths, tex, false));
  }
  return parts.join('```');
}

const mathCache = {};
function renderTex(item) {
  const key = (item.display ? 'D:' : 'I:') + item.tex;
  if (mathCache[key]) return mathCache[key];
  let html;
  try {
    if (window.katex && window.katex.renderToString) {
      html = window.katex.renderToString(item.tex, { displayMode: item.display, throwOnError: false, strict: 'ignore', output: 'html' });
    } else {
      html = '<code>' + escapeHtml(item.tex) + '</code>';
    }
  } catch (e) {
    html = '<code>' + escapeHtml(item.tex) + '</code>';
  }
  mathCache[key] = html;
  return html;
}

function putMathBack(html, maths) {
  return html.replace(/(\d+)/g, (m, n) => (maths[Number(n)] ? renderTex(maths[Number(n)]) : ''));
}

function formatRichText(raw) {
  const maths = [];
  const source = extractMath(raw, maths);
  return putMathBack(inline(escapeHtml(source)), maths);
}

function toInt(str) {
  const bn = '০১২৩৪৫৬৭৮৯';
  return parseInt(String(str).replace(/[০-৯]/g, (d) => bn.indexOf(d)), 10);
}

function renderTextBlocks(text) {
  const lines = text.split('\n');
  const out = [];
  let para = [];
  let list = null;
  let table = null;

  const flushPara = () => { if (para.length) { out.push('<p>' + inline(para.join('<br>')) + '</p>'); para = []; } };
  const flushList = () => {
    if (!list) return;
    const start = list.type === 'ol' && list.start > 1 ? ' start="' + list.start + '"' : '';
    out.push('<' + list.type + start + '>' + list.items.map((i) => '<li>' + inline(i) + '</li>').join('') + '</' + list.type + '>');
    list = null;
  };
  const flushTable = () => {
    if (!table) return;
    const rows = table.map((r) => r.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim()));
    const isSep = rows.length > 1 && rows[1].every((c) => /^:?-{2,}:?$/.test(c));
    let html = '<div class="table-wrap"><table>';
    rows.forEach((cells, idx) => {
      if (isSep && idx === 1) return;
      const tag = isSep && idx === 0 ? 'th' : 'td';
      html += '<tr>' + cells.map((c) => '<' + tag + '>' + inline(c) + '</' + tag + '>').join('') + '</tr>';
    });
    out.push(html + '</table></div>');
    table = null;
  };
  const flushAll = () => { flushPara(); flushList(); flushTable(); };

  for (const raw of lines) {
    const t = raw.trim();
    if (!t) { flushAll(); continue; }
    let m;
    if ((m = t.match(/^(#{1,4})\s+(.*)$/))) {
      flushAll();
      const level = Math.min(5, m[1].length + 2);
      out.push('<h' + level + '>' + inline(m[2]) + '</h' + level + '>');
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) { flushAll(); out.push('<hr>'); continue; }
    if (t.length > 1 && t.charAt(0) === '|' && t.charAt(t.length - 1) === '|') {
      flushPara(); flushList();
      (table = table || []).push(t);
      continue;
    }
    flushTable();
    if ((m = t.match(/^[-*•]\s+(.*)$/))) {
      flushPara();
      if (!list || list.type !== 'ul') { flushList(); list = { type: 'ul', items: [] }; }
      list.items.push(m[1]);
      continue;
    }
    if ((m = t.match(/^([0-9০-৯]+)[.)]\s+(.*)$/))) {
      flushPara();
      if (!list || list.type !== 'ol') { flushList(); list = { type: 'ol', items: [], start: toInt(m[1]) || 1 }; }
      list.items.push(m[2]);
      continue;
    }
    flushList();
    para.push(raw.replace(/\s+$/, ''));
  }
  flushAll();
  return out.join('');
}

function codeBlockHtml(lang, code, final) {
  if (lang === 'mermaid' && final) {
    return '<div class="mermaid-box"><div class="mermaid">' + escapeHtml(code) + '</div></div>';
  }
  const T = tx();
  let buttons = '<button type="button" class="code-btn" data-act="copy-code">' + T.copyCode + '</button>';
  if (lang === 'html' && final) buttons = '<button type="button" class="code-btn" data-act="preview">' + T.preview + '</button>' + buttons;
  return '<div class="code-block"><div class="code-head"><span class="code-lang">' + escapeHtml(lang || 'code') + '</span>' +
    '<span class="code-actions">' + buttons + '</span></div><pre><code>' + escapeHtml(code) + '</code></pre></div>';
}

/* ---- MCQ answer card (compact math & separate cards) ---- */
function buildMcqHtml(question, options, explanation, whyWrong, trick, qNum) {
  const cleanQ = question.replace(/```(?:mcq)?/gi, '').replace(/^MCQ\s*/i, '').trim();
  let html = '<div class="mcq-card-ui" style="' + (qNum ? 'margin-bottom:1.25rem;' : '') + '">';
  if (cleanQ) {
    let badgeText = 'MCQ';
    if (qNum) {
      const bnDigits = ['১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '১০'];
      badgeText = 'MCQ ' + (currentLanguage === 'en' ? qNum : (bnDigits[qNum - 1] || qNum));
    }
    html += '<div class="mcq-header"><span class="mcq-badge">' + badgeText + '</span><h4 class="mcq-q-title">' + formatRichText(cleanQ) + '</h4></div>';
  }
  if (options.length) {
    html += '<div class="mcq-grid">';
    options.forEach((opt) => {
      html += '<div class="mcq-opt-item' + (opt.correct ? ' is-correct' : '') + '">';
      html += '<span class="mcq-opt-key">' + escapeHtml(opt.key) + '</span>';
      html += '<span class="mcq-opt-text">' + formatRichText(opt.text) + '</span>';
      if (opt.correct) {
        html += '<span class="mcq-check-icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg></span>';
      }
      html += '</div>';
    });
    html += '</div>';
  }
  if (explanation.length) {
    const cleanExp = explanation
      .map(l => l.trim())
      .filter((l, idx, arr) => !(l === '' && arr[idx - 1] === ''))
      .join('<br>')
      .replace(/```/g, '')
      .trim();

    html += '<div class="mcq-exp-box"><div class="mcq-exp-head">' + (currentLanguage === 'en' ? 'Explanation' : 'ব্যাখ্যা') + '</div>';
    html += '<div class="mcq-exp-body">' + formatRichText(cleanExp).replace(/<br>/g, '<br><i class="ln-gap"></i>') + '</div></div>';
  }
  if (whyWrong.length) {
    html += '<details class="mcq-wrong-details"><summary class="mcq-wrong-summary"><span>' +
      (currentLanguage === 'en' ? 'Why are the other options wrong?' : 'অন্যান্য অপশন কেন ভুল?') +
      '</span><span class="mcq-plus-icon">+</span></summary><div class="mcq-wrong-body"><ul>';
    whyWrong.forEach((w) => { html += '<li>' + formatRichText(w.replace(/```/g, '').trim()) + '</li>'; });
    html += '</ul></div></details>';
  }
  if (trick.length) {
    html += '<div class="mcq-trick-box"><strong>💡 ' + (currentLanguage === 'en' ? 'Memory trick:' : 'মনে রাখার কৌশল / স্বর্ণসূত্র:') + '</strong> ' +
      formatRichText(trick.join(' ').replace(/```/g, '').trim()) + '</div>';
  }
  return html + '</div>';
}

function parseNaturalMcq(text) {
  if (!/\[OPTIONS\]|```mcq/i.test(text)) return null;
  const lines = text.split(/\r?\n/);
  const mcqs = [];
  let current = { question: '', options: [], explanation: [], whyWrong: [], trick: [] };
  let section = 'q';
  // Anything written AFTER the mcq block (e.g. a chart/table) is kept here and drawn below the card(s)
  const extra = [];
  let closed = false;

  function pushCurrent() {
    if (current.options.length >= 2 || current.question.trim()) {
      mcqs.push(current);
      current = { question: '', options: [], explanation: [], whyWrong: [], trick: [] };
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === '```') {
      if (current.options.length >= 2) closed = true;
      continue;
    }
    if (closed && /^\[QUESTION\]/i.test(line)) closed = false;
    if (closed && line !== '```mcq') { extra.push(lines[i]); continue; }

    if (!line || line === 'MCQ' || line === '```mcq') continue;

    // a separator / heading / table inside WHY_WRONG or TRICK starts the extra part (chart etc.)
    if ((section === 't' || section === 'w') &&
        (/^(-{3,}|\*{3,}|_{3,})$/.test(line) || /^#{1,4}\s/.test(line) || line.charAt(0) === '|')) {
      closed = true;
      extra.push(lines[i]);
      continue;
    }

    if (/^\[QUESTION\]/i.test(line)) {
      if (current.options.length >= 2) pushCurrent();
      section = 'q';
      continue;
    }
    if (/^\[OPTIONS\]/i.test(line)) { section = 'o'; continue; }
    if (/^\[EXPLANATION\]/i.test(line)) { section = 'e'; continue; }
    if (/^\[WHY_WRONG\]/i.test(line)) { section = 'w'; continue; }
    if (/^\[TRICK\]/i.test(line)) { section = 't'; continue; }

    if (section === 'o' || section === 'q') {
      const optMatch = line.match(/^(\*?\s*)\(?([কখগঘA-Da-d1-4])\)?[).:-]?\s*(.*)$/);
      if (optMatch && section === 'o') {
        const isCorrect = optMatch[1].indexOf('*') !== -1 || /[✓✔]|\(সঠিক\)/.test(line);
        const keyLabel = optMatch[2] + ')';
        const optText = optMatch[3].replace(/[✓✔]/g, '').replace(/\(সঠিক\)/g, '').replace(/```/g, '').trim();

        if (current.options.length >= 4 && (keyLabel.startsWith('ক') || keyLabel.startsWith('A') || keyLabel.startsWith('a') || keyLabel.startsWith('1'))) {
          if (current.explanation.length || current.whyWrong.length || current.trick.length) {
            pushCurrent();
            section = 'o';
          }
        }

        current.options.push({ key: keyLabel, text: optText, correct: isCorrect });
        continue;
      }
    }

    if (section === 'q') current.question += (current.question ? ' ' : '') + line;
    else if (section === 'e') current.explanation.push(line);
    else if (section === 'w') current.whyWrong.push(line.replace(/^[-*•▶\s]+/, ''));
    else if (section === 't') current.trick.push(line.replace(/^(💡|🧠)\s*/, ''));
    else if (section === 'o' && current.options.length) current.options[current.options.length - 1].text += ' ' + line;
  }
  pushCurrent();

  if (!mcqs.length) return null;

  const finalMcqs = [];
  mcqs.forEach((item) => {
    if (item.options.length > 4 && item.options.length % 4 === 0) {
      const count = item.options.length / 4;
      const cleanQ = item.question.replace(/হ্যালো![^।]+।/g, '').replace(/সবকটি বহুর্নির্বাচনি প্রশ্নের উত্তর নিচে দেওয়া হলো:?/g, '').trim();
      let qList = cleanQ.match(/([^<>\n?]+(?:\?|ঃ|:))/g);
      if (!qList || qList.length < count) {
        qList = cleanQ.split(/(?<=\?|\n)/).map(s => s.trim()).filter(s => s.length > 5);
      }

      let expList = [];
      if (item.explanation.length) {
        const fullExp = item.explanation.join('\n');
        expList = fullExp.split(/(?:\n\s*\n|(?=\b[১-৬]\.))/g).map(s => s.trim()).filter(Boolean);
      }

      for (let k = 0; k < count; k++) {
        const qText = (qList && qList[k]) ? qList[k].trim() : ((qList && qList.length === 1 && k === 0) ? qList[0] : `প্রশ্ন ${(k + 1)}`);
        const subOpts = item.options.slice(k * 4, (k + 1) * 4);
        const subExp = (expList && expList[k]) ? [expList[k]] : (item.explanation.length ? item.explanation : []);
        finalMcqs.push({
          question: qText,
          options: subOpts,
          explanation: subExp,
          whyWrong: k === count - 1 ? item.whyWrong : [],
          trick: k === count - 1 ? item.trick : []
        });
      }
    } else {
      finalMcqs.push(item);
    }
  });

  const valid = finalMcqs.filter(m => m.options.length >= 2);
  if (!valid.length) return null;

  const cards = valid.map((m, idx) => buildMcqHtml(m.question, m.options, m.explanation, m.whyWrong, m.trick, valid.length > 1 ? idx + 1 : null)).join('');
  const extraText = extra.join('\n').replace(/^\s*(-{3,}|\*{3,}|_{3,})\s*$/gm, '').trim();
  return cards + (extraText ? '<div class="mcq-extra">' + renderRich(extraText, true) + '</div>' : '');
}

function renderRich(raw, final) {
  const mcq = parseNaturalMcq(raw);
  if (mcq) return mcq;

  if (/\[(QUESTION|OPTIONS)\]|```mcq/i.test(raw)) {
    raw = raw.replace(/^\s*\[(QUESTION|OPTIONS|EXPLANATION|WHY_WRONG|TRICK)\]\s*$/gim, '').replace(/```mcq/gi, '');
  }

  const maths = [];
  const source = extractMath(raw, maths).replace(/\r\n/g, '\n');
  const parts = source.split('```');
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      out.push(renderTextBlocks(escapeHtml(parts[i])));
      continue;
    }
    const part = parts[i];
    let lang = '';
    let code = part;
    const nl = part.indexOf('\n');
    if (nl !== -1) {
      const first = part.slice(0, nl).trim();
      if (/^[A-Za-z0-9_+#-]*$/.test(first)) { lang = first.toLowerCase(); code = part.slice(nl + 1); }
    } else if (/^[A-Za-z0-9_+#-]*$/.test(part.trim())) {
      lang = part.trim().toLowerCase();
      code = '';
    }
    out.push(codeBlockHtml(lang, code.replace(/\n$/, ''), final));
  }
  return putMathBack(out.join(''), maths);
}

function runMermaid(container) {
  if (!window.mermaid) return;
  const nodes = container.querySelectorAll('.mermaid');
  if (!nodes.length) return;
  try {
    const res = window.mermaid.run({ nodes: Array.from(nodes) });
    if (res && res.catch) res.catch(() => {});
  } catch (e) { /* ignore */ }
}

function plainAnswer(text) {
  return text
    .replace(/\[\/?(QUESTION|OPTIONS|EXPLANATION|WHY_WRONG|TRICK)\]/gi, '')
    .replace(/```(?:mcq)?/gi, '')
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')
    .replace(/`([^`\n]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function bindChatClicks() {
  chatMessages.addEventListener('click', (e) => {
    const btn = e.target.closest('.code-btn');
    if (!btn) return;
    const block = btn.closest('.code-block');
    if (!block) return;
    const code = block.querySelector('code').textContent;
    if (btn.dataset.act === 'copy-code') {
      try { navigator.clipboard.writeText(code); } catch (err) { /* ignore */ }
      const old = btn.textContent;
      btn.textContent = '✓';
      setTimeout(() => { btn.textContent = old; }, 1400);
    } else if (btn.dataset.act === 'preview') {
      let prev = block.querySelector('.code-preview');
      if (prev) { prev.remove(); btn.textContent = tx().preview; return; }
      prev = document.createElement('div');
      prev.className = 'code-preview';
      const frame = document.createElement('iframe');
      frame.setAttribute('sandbox', 'allow-scripts');
      frame.srcdoc = code;
      prev.appendChild(frame);
      block.appendChild(prev);
      btn.textContent = tx().hidePreview;
    }
  });
}

/* ========================================================
   MESSAGE DOM HELPERS
   ======================================================== */
function enterChatView() {
  document.body.classList.add('chat-active');
  heroSection.style.display = 'none';
  chatThread.style.display = 'block';
}

function appendUserMessage(entry) {
  const card = document.createElement('div');
  card.className = 'message-card user-msg';
  let imgSrc = '';
  if (entry.image && entry.image.url) imgSrc = entry.image.url;
  else if (entry.imgId) imgSrc = '/api/chats?img=' + encodeURIComponent(entry.imgId);
  let imgHtml = '';
  if (imgSrc) imgHtml = '<img src="' + imgSrc + '" alt="">';
  else if (entry.hadImage) imgHtml = '<p>' + tx().pictureTag + '</p>';

  card.innerHTML =
    '<div class="msg-avatar">' + avatarFor(currentUser) + '</div>' +
    '<div class="msg-col">' +
    '<div class="msg-meta"><span class="msg-name">Me</span>' +
    '<span class="msg-time">' + escapeHtml(timeLabel(entry.ts)) + '</span></div>' +
    '<div class="msg-bubble">' + imgHtml +
    (entry.text ? '<p>' + escapeHtml(entry.text) + '</p>' : '') +
    '</div></div>';
  chatMessages.appendChild(card);
  scrollToBottom(true);
}

function appendAiMessage(showTyping) {
  const card = document.createElement('div');
  card.className = 'message-card ai-msg';
  card.innerHTML =
    '<div class="msg-avatar"><svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18C5 19.94 8.13 22 12 22C15.87 22 19 19.94 19 17.18V13.18L12 17L5 13.18Z"/></svg></div>' +
    '<div class="ai-col">' +
    '<div class="msg-meta"><span class="msg-name">AI Teacher</span><span class="msg-time"></span></div>' +
    '<div class="msg-bubble"><div class="ai-body">' +
    (showTyping ? '<div class="typing-indicator">' + escapeHtml(tx().thinking) + '</div>' : '') +
    '</div></div></div>';
  chatMessages.appendChild(card);
  scrollToBottom(true);
  return {
    card,
    col: card.querySelector('.ai-col'),
    body: card.querySelector('.ai-body'),
    timeEl: card.querySelector('.msg-time')
  };
}

function removeQuickActions() {
  chatMessages.querySelectorAll('.quick-actions-bar').forEach((el) => el.remove());
}

function appendQuickActions(ai, entry) {
  removeQuickActions();
  const T = tx();
  const bar = document.createElement('div');
  bar.className = 'quick-actions-bar';
  bar.innerHTML =
    '<button type="button" class="quick-btn" data-act="simple">' + T.simple + '</button>' +
    '<button type="button" class="quick-btn" data-act="example">' + T.example + '</button>' +
    '<button type="button" class="quick-btn" data-act="quiz">' + T.quiz + '</button>' +
    '<button type="button" class="quick-btn" data-act="copy">' + T.copy + '</button>' +
    '<div class="review-group">' +
    '<button type="button" class="quick-btn btn-thumb fb-up" data-act="up" title="' + escapeHtml(T.like) + '">👍</button>' +
    '<button type="button" class="quick-btn btn-thumb fb-down" data-act="down" title="' + escapeHtml(T.dislike) + '">👎</button>' +
    '</div>';

  const thumbs = bar.querySelectorAll('.btn-thumb');
  const syncThumbs = () => thumbs.forEach((b) => b.setAttribute('aria-pressed', entry.fb === b.dataset.act ? 'true' : 'false'));
  syncThumbs();

  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('.quick-btn');
    if (!btn) return;
    const act = btn.dataset.act;
    if (act === 'simple') submitQuestion(T.simplePrompt, null);
    else if (act === 'example') submitQuestion(T.examplePrompt, null);
    else if (act === 'quiz') submitQuestion(T.quizPrompt, null);
    else if (act === 'copy') {
      try { navigator.clipboard.writeText(plainAnswer(entry.text)); } catch (err) { /* ignore */ }
      btn.textContent = T.copied;
      setTimeout(() => { btn.textContent = T.copy; }, 1800);
    } else if (act === 'up' || act === 'down') {
      entry.fb = entry.fb === act ? undefined : act;
      syncThumbs();
      saveChat();
    }
  });

  ai.col.appendChild(bar);
}

function resetChatSession() {
  if (isStreamingResponse) return;
  chatMessages.innerHTML = '';
  chatLog = [];
  currentChatId = null;
  currentChatTitle = '';
  titleRequested = false;
  clearPendingImage();
  setContextLocked(false);
  document.body.classList.remove('chat-active');
  heroSection.style.display = 'flex';
  chatThread.style.display = 'none';
  userQuestionInput.value = '';
  autosizeInput();
  userQuestionInput.placeholder = tx().placeholder;
}

/* ========================================================
   QUESTION SUBMIT & SSE STREAMING (WITH AUTO RETRY ON 429)
   ======================================================== */
function handleQuestionSubmit() {
  const query = userQuestionInput.value.trim();
  if (!query && !pendingImage) return;
  submitQuestion(query, pendingImage);
}

function buildMessages() {
  const list = chatLog.filter((m) => !m.skip);
  let imagesLeft = 1; // Send only the latest picture to preserve token rate limit
  const out = [];
  for (let i = list.length - 1; i >= 0; i--) {
    const m = list[i];
    const o = { role: m.role, text: m.text || '' };
    if (m.image && m.image.data && imagesLeft > 0) {
      o.image = { mime: m.image.mime, data: m.image.data };
      imagesLeft--;
    } else if ((m.image || m.imgId || m.hadImage) && !o.text) {
      o.text = tx().oldImageNote;
    }
    out.unshift(o);
  }
  return out;
}

async function submitQuestion(rawText, imageObj) {
  const text = (rawText || '').trim();
  if (isStreamingResponse || preparingImage) return;
  if (!text && !imageObj) return;

  if (!currentUser) {
    resumeAfterAuth = true;
    openAuthModal();
    return;
  }

  const ctx = currentCtx();
  const userEntry = { role: 'user', text, image: imageObj || null, ts: Date.now(), ctx };
  const wasFirst = chatLog.filter((m) => !m.skip).length === 0;
  chatLog.push(userEntry);

  userQuestionInput.value = '';
  autosizeInput();
  clearPendingImage();
  enterChatView();
  userQuestionInput.placeholder = tx().follow;
  removeQuickActions();
  appendUserMessage(userEntry);
  const ai = appendAiMessage(true);

  setBusy(true);
  const started = Date.now();
  let answer = '';
  let mismatch = false;
  let streamError = '';
  let lastPaint = 0;

  try {
    const fetchPayload = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({
        lang: currentLanguage,
        subject: selectedSubject || '',
        cls: selectedClass !== '' ? Number(selectedClass) : null,
        messages: buildMessages()
      })
    };

    let res = await fetch('/api/chat', fetchPayload);

    // Auto-retry once on 429 Rate Limit after a short delay
    if (res.status === 429) {
      await new Promise(r => setTimeout(r, 2200));
      res = await fetch('/api/chat', fetchPayload);
    }

    const contentType = res.headers.get('Content-Type') || '';
    if (!res.ok || contentType.indexOf('text/event-stream') === -1) {
      let errData = null;
      try { errData = await res.json(); } catch (err) { /* not json */ }
      throw { api: true, code: (errData && errData.error) || (res.status === 401 ? 'unauthorized' : (res.status === 429 ? 'rate_limited' : 'generic')), detail: errData && errData.detail };
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      buffer += decoder.decode(chunk.value, { stream: true });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop();
      for (const evRaw of events) {
        const line = evRaw.trim();
        if (!line.startsWith('data:')) continue;
        let ev;
        try { ev = JSON.parse(line.slice(5).trim()); } catch (err) { continue; }
        if (ev.t) {
          answer += ev.t;
          const now = Date.now();
          if (now - lastPaint > 70) {
            lastPaint = now;
            ai.body.innerHTML = renderRich(answer, false);
            scrollToBottom(false);
          }
        }
        if (ev.e) streamError = ev.e;
        if (ev.done) {
          if (ev.mismatch) mismatch = true;
          if (typeof ev.used === 'number' && currentUser) {
            currentUser.used = ev.used;
            if (typeof ev.limit === 'number') currentUser.daily_limit = ev.limit;
            updateQuota();
          }
        }
      }
    }

    if (!answer) throw { api: true, code: streamError || 'empty_reply' };
  } catch (err) {
    chatLog = chatLog.filter((m) => m !== userEntry);
    const code = err && err.api ? err.code : 'network';
    let message = tx().errors[code] || tx().errors.generic;
    if (err && err.detail) message = err.detail;
    ai.body.innerHTML = '<span class="error-text">⚠️ ' + escapeHtml(message) + '</span>';
    ai.timeEl.textContent = '';
    userQuestionInput.value = text;
    autosizeInput();
    if (imageObj) setPendingImage(imageObj);
    if (code === 'unauthorized') {
      currentUser = null;
      renderUserNav(null);
      resumeAfterAuth = false;
      openAuthModal();
    }
    if (!chatLog.filter((m) => !m.skip).length) userQuestionInput.placeholder = tx().placeholder;
    setBusy(false);
    return;
  }

  const dur = Date.now() - started;
  ai.body.innerHTML = renderRich(answer, true);
  runMermaid(ai.body);
  ai.timeEl.textContent = timeLabel(Date.now(), dur);

  const aiEntry = { role: 'assistant', text: answer, ts: Date.now(), dur };
  if (mismatch) {
    userEntry.skip = true;
    aiEntry.skip = true;
  }
  chatLog.push(aiEntry);
  appendQuickActions(ai, aiEntry);

  if (!mismatch) {
    setContextLocked(true);
    await saveChat();
    if (wasFirst && !titleRequested) {
      titleRequested = true;
      generateTitle(text, answer);
    }
  } else if (!chatLog.some((m) => !m.skip)) {
    setContextLocked(false);
  }

  setBusy(false);
  scrollToBottom(true);
}

function setBusy(state) {
  isStreamingResponse = state;
  btnSubmitQuestion.disabled = state;
  userQuestionInput.disabled = state;
  if (!state) userQuestionInput.focus();
}

/* ========================================================
   SAVE CHAT & TOPIC TITLE (Cloudflare D1)
   ======================================================== */
async function uploadImage(chat, imgId, base64) {
  try {
    const res = await fetch('/api/chats?img=' + encodeURIComponent(imgId) + '&chat=' + encodeURIComponent(chat), {
      method: 'PUT',
      headers: { 'Content-Type': 'text/plain' },
      credentials: 'same-origin',
      body: base64
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

function saveChat() {
  saveQueue = saveQueue.then(doSaveChat).catch(() => {});
  return saveQueue;
}

async function doSaveChat() {
  if (!currentUser) return;
  const list = chatLog.filter((m) => !m.skip);
  if (!list.length) return;
  if (!currentChatId) currentChatId = newChatId();
  if (!currentChatTitle) {
    const first = list.find((m) => m.role === 'user');
    currentChatTitle = (first && first.text.slice(0, 45)) || tx().pictureQuestion;
  }

  for (const m of list) {
    if (m.image && m.image.url && !m.imgId) {
      const thumb = await makeThumb(m.image.url);
      if (thumb) {
        const id = newChatId();
        if (await uploadImage(currentChatId, id, thumb)) m.imgId = id;
      }
    }
  }

  const messages = list.slice(-40).map((m) => {
    const o = {
      role: m.role,
      text: m.text || '',
      img: !!(m.image || m.imgId || m.hadImage),
      imgId: m.imgId || undefined,
      ts: m.ts,
      dur: m.dur,
      fb: m.fb
    };
    if (m.role === 'user' && m.ctx) o.ctx = m.ctx;
    return o;
  });

  try {
    await fetch('/api/chats', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ id: currentChatId, title: currentChatTitle, messages })
    });
  } catch (e) { /* ignore */ }
}

async function generateTitle(question, answer) {
  try {
    const res = await fetch('/api/title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ lang: currentLanguage, question, answer })
    });
    const data = await res.json();
    if (res.ok && data && data.title) {
      currentChatTitle = data.title;
      await saveChat();
    }
  } catch (e) { /* ignore */ }
}

/* ========================================================
   HISTORY DRAWER
   ======================================================== */
async function openHistoryDrawer() {
  historyDrawer.classList.add('open');
  drawerBackdrop.classList.add('active');
  if (!currentUser) {
    historyItemsList.innerHTML = '<p class="history-empty">' + (currentLanguage === 'en' ? 'Log in to see your earlier chats.' : 'পূর্ববর্তী আলোচনা দেখতে লগইন করুন।') + '</p>';
    return;
  }
  historyItemsList.innerHTML = '<p class="history-empty">' + escapeHtml(tx().loadingChats) + '</p>';
  try {
    const res = await fetch('/api/chats', { credentials: 'same-origin' });
    const data = await res.json();
    if (res.ok && data && data.ok) {
      renderHistoryItems(data.chats || []);
    } else {
      historyItemsList.innerHTML = '<p class="history-empty">হিস্ট্রি লোড করা সম্ভব হয়নি।</p>';
    }
  } catch (e) {
    historyItemsList.innerHTML = '<p class="history-empty">হিস্ট্রি লোড করা সম্ভব হয়নি।</p>';
  }
}

function closeHistoryDrawer() {
  historyDrawer.classList.remove('open');
  drawerBackdrop.classList.remove('active');
}

function renderHistoryItems(items) {
  if (!items.length) {
    historyItemsList.innerHTML = '<p class="history-empty">' + escapeHtml(tx().noChats) + '</p>';
    return;
  }
  historyItemsList.innerHTML = '';
  items.forEach((chat) => {
    const row = document.createElement('div');
    row.className = 'history-item';
    row.innerHTML = '<span class="history-item-title">' + escapeHtml(chat.title || tx().untitled) + '</span>' +
      '<button type="button" class="btn-del-history" title="মুছুন">✕</button>';
    row.addEventListener('click', () => openChat(chat.id));
    row.querySelector('.btn-del-history').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteChat(chat.id);
    });
    historyItemsList.appendChild(row);
  });
}

async function openChat(id) {
  if (isStreamingResponse) return;
  try {
    const res = await fetch('/api/chats?id=' + encodeURIComponent(id), { credentials: 'same-origin' });
    const data = await res.json();
    if (!res.ok || !data || !data.ok || !data.chat) return;

    resetChatSession();
    currentChatId = data.chat.id;
    currentChatTitle = data.chat.title || '';
    titleRequested = true;
    enterChatView();

    const msgs = data.chat.messages || [];
    const firstCtx = (msgs.find((m) => m.role === 'user' && m.ctx) || {}).ctx;
    if (firstCtx) {
      selectedSubject = firstCtx.s || '';
      selectedClass = firstCtx.c !== undefined ? String(firstCtx.c) : '';
    }

    let lastAi = null;
    let lastEntry = null;
    msgs.forEach((m) => {
      if (m.role === 'user') {
        const entry = { role: 'user', text: m.text || '', imgId: m.imgId, hadImage: !!m.img, ts: m.ts, ctx: m.ctx };
        chatLog.push(entry);
        appendUserMessage(entry);
      } else {
        const entry = { role: 'assistant', text: m.text || '', ts: m.ts, dur: m.dur, fb: m.fb };
        chatLog.push(entry);
        const ai = appendAiMessage(false);
        ai.body.innerHTML = renderRich(entry.text, true);
        runMermaid(ai.body);
        ai.timeEl.textContent = timeLabel(entry.ts, entry.dur);
        lastAi = ai;
        lastEntry = entry;
      }
    });
    if (lastAi) appendQuickActions(lastAi, lastEntry);
    setContextLocked(chatLog.length > 0);
    userQuestionInput.placeholder = tx().follow;
    closeHistoryDrawer();
    scrollToBottom(false);
  } catch (e) {
    console.error('Failed to load past chat', e);
  }
}

async function deleteChat(id) {
  if (!window.confirm(tx().deleteAsk)) return;
  try {
    await fetch('/api/chats?id=' + encodeURIComponent(id), { method: 'DELETE', credentials: 'same-origin' });
    if (id === currentChatId) resetChatSession();
    openHistoryDrawer();
  } catch (e) {
    console.error(e);
  }
}

/* ========================================================
   AUTH MODAL & LOGIN/SIGNUP
   ======================================================== */
function authErrorText(code, fallback) {
  const map = {
    invalid_login: 'ইউজারনেম/ইমেইল বা পাসওয়ার্ড সঠিক নয়।',
    invalid_invite: 'গোপন কোডটি সঠিক নয়।',
    signup_closed: 'এখন নতুন সাইন-আপ বন্ধ আছে।',
    signup_full: 'সাইন-আপের জন্য নির্ধারিত আইডির সংখ্যা পূর্ণ হয়ে গেছে।',
    name_taken: 'এই ইউজারনেমটি আগেই নেওয়া হয়েছে। অন্য একটি দিন।',
    email_taken: 'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে।',
    bad_name: 'ইউজারনেম ৩-২০ অক্ষরের হতে হবে (শুধু a-z, 0-9, _ এবং -)।',
    bad_email: 'সঠিক ইমেইল ঠিকানা দিন।',
    weak_password: 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।',
    too_many_attempts: 'অনেকবার ভুল চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।',
    server_not_configured: 'সার্ভারের সেটিং অসম্পূর্ণ আছে।',
    history_not_configured: 'ডাটাবেস (D1) যুক্ত করা নেই।',
    history_failed: 'অ্যাকাউন্ট সেভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
  };
  return map[code] || fallback;
}

function openAuthModal() {
  authModal.style.display = 'flex';
}

function afterAuthSuccess() {
  authModal.style.display = 'none';
  checkAuth().then(() => {
    if (resumeAfterAuth) {
      resumeAfterAuth = false;
      handleQuestionSubmit();
    }
  });
}

function bindAuthModalEvents() {
  btnOpenLogin.addEventListener('click', () => {
    resumeAfterAuth = false;
    openAuthModal();
  });

  btnCloseAuth.addEventListener('click', () => {
    authModal.style.display = 'none';
    resumeAfterAuth = false;
  });

  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    formLogin.classList.add('active');
    formSignup.classList.remove('active');
  });

  tabSignup.addEventListener('click', () => {
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
    formSignup.classList.add('active');
    formLogin.classList.remove('active');
  });

  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifier = document.getElementById('loginIdentifier').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorBox = document.getElementById('loginErrorMsg');
    errorBox.textContent = '';

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        errorBox.textContent = authErrorText(data.error, 'লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
        return;
      }
      formLogin.reset();
      afterAuthSuccess();
    } catch (err) {
      errorBox.textContent = 'সার্ভার সংযোগে ত্রুটি হয়েছে।';
    }
  });

  formSignup.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const invite = document.getElementById('signupInvite').value.trim();
    const genderElem = document.querySelector('input[name="signupGender"]:checked');
    const gender = genderElem ? genderElem.value : 'male';
    const errorBox = document.getElementById('signupErrorMsg');
    errorBox.textContent = '';

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ username, email, password, gender, invite })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        errorBox.textContent = authErrorText(data.error, 'সাইন-আপ ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
        return;
      }
      formSignup.reset();
      afterAuthSuccess();
    } catch (err) {
      errorBox.textContent = 'সার্ভার সংযোগে ত্রুটি।';
    }
  });
}
