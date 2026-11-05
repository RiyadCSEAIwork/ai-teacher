/**
 * AI Teacher - Client Side Application Logic
 * Full implementation: Auth (Universal Payload), D1 History Save, Title Maker,
 * Gender Avatar, Smart Notes, SSE Streaming, KaTeX, Mermaid & MCQ Parser.
 */

// Global State
let currentUser = null;
let currentLanguage = 'bn';
let attachedImageBase64 = null;
let isStreamingResponse = false;
let currentChatHistory = [];
let currentChatId = null;

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
   HELPER: AUTH HEADERS (COOKIE + BEARER TOKEN SUPPORT)
   ======================================================== */
function getAuthHeaders() {
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/* ========================================================
   INITIALIZATION
   ======================================================== */
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  bindNavbarEvents();
  bindInputEvents();
  bindSmartNotesEvents();
  bindAuthModalEvents();
  bindSubjectChips();
});

/* ========================================================
   AUTHENTICATION & USER STATE
   ======================================================== */
async function checkAuth() {
  try {
    const res = await fetch('/api/me', {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      const user = data.user || data;
      if (user && (user.username || user.email || user.id)) {
        currentUser = user;
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

function renderUserNav(user) {
  if (user) {
    btnOpenLogin.style.display = 'none';
    userProfilePill.style.display = 'flex';
    userQuotaBadge.style.display = 'inline-flex';

    userNameLabel.textContent = user.username || user.name || 'ইউজার';

    // Gender based Avatar Icon system
    const userGender = (user.gender || 'male').toLowerCase();
    if (userGender === 'female') {
      userAvatarWrap.innerHTML = FEMALE_AVATAR_SVG;
    } else {
      userAvatarWrap.innerHTML = MALE_AVATAR_SVG;
    }

    // Daily Quota Count
    const used = user.questions_today ?? user.today_questions ?? user.used ?? 0;
    const max = user.daily_limit ?? user.quota ?? 30;
    quotaText.textContent = `আজ ${used}/${max} প্রশ্ন`;
  } else {
    btnOpenLogin.style.display = 'inline-block';
    userProfilePill.style.display = 'none';
    userQuotaBadge.style.display = 'none';
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
      await fetch('/api/logout', { 
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
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

function setLanguage(lang) {
  currentLanguage = lang;
  document.body.className = `lang-${lang}`;
  if (lang === 'bn') {
    btnLangBn.classList.add('active');
    btnLangEn.classList.remove('active');
    userQuestionInput.placeholder = 'আপনার প্রশ্ন লিখুন বা ছবি যুক্ত করুন...';
    document.getElementById('txtSubmit').textContent = 'প্রশ্ন করুন';
  } else {
    btnLangEn.classList.add('active');
    btnLangBn.classList.remove('active');
    userQuestionInput.placeholder = 'Ask your question or upload an image...';
    document.getElementById('txtSubmit').textContent = 'Ask';
  }
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

    const generatedPrompt = `নিচের বিষয়টির একটি সম্পূর্ণ ও নির্ভুল 'Smart Notes' (সারসংক্ষেপ) তৈরি করে দাও। মূল বিষয়, প্রয়োজনীয় সূত্রাবলি, গুরুত্বপূর্ণ পয়েন্ট এবং পরীক্ষার জন্য প্রয়োজনীয় তথ্যগুলো বুলেট পয়েন্ট আকারে সুন্দরভাবে উপস্থাপন করো:\n\n${text}`;

    submitQuestion(generatedPrompt);
  });
}

/* ========================================================
   INPUT & IMAGE UPLOAD LOGIC
   ======================================================== */
function bindInputEvents() {
  userQuestionInput.addEventListener('input', () => {
    userQuestionInput.style.height = 'auto';
    userQuestionInput.style.height = Math.min(userQuestionInput.scrollHeight, 140) + 'px';
  });

  userQuestionInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuestionSubmit();
    }
  });

  btnSubmitQuestion.addEventListener('click', handleQuestionSubmit);

  fileImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        attachedImageBase64 = canvas.toDataURL('image/jpeg', 0.85);
        previewImg.src = attachedImageBase64;
        imagePreviewBar.style.display = 'flex';
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  btnRemovePreview.addEventListener('click', () => {
    attachedImageBase64 = null;
    fileImageInput.value = '';
    imagePreviewBar.style.display = 'none';
  });
}

function bindSubjectChips() {
  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const subject = btn.dataset.subject;
      userQuestionInput.value = `[${subject}] `;
      userQuestionInput.focus();
    });
  });
}

/* ========================================================
   QUESTION SUBMIT & SSE STREAMING
   ======================================================== */
function handleQuestionSubmit() {
  const query = userQuestionInput.value.trim();
  if (!query && !attachedImageBase64) return;
  submitQuestion(query, attachedImageBase64);
}

async function submitQuestion(text, imageBase64 = null) {
  if (isStreamingResponse) return;

  const userImg = imageBase64;
  userQuestionInput.value = '';
  userQuestionInput.style.height = 'auto';
  attachedImageBase64 = null;
  imagePreviewBar.style.display = 'none';
  fileImageInput.value = '';

  document.body.classList.add('chat-active');
  heroSection.style.display = 'none';
  chatThread.style.display = 'block';

  appendUserMessage(text, userImg);
  const aiBubble = appendAiMessage();

  isStreamingResponse = true;

  try {
    const payload = {
      message: text,
      image: userImg,
      history: currentChatHistory.slice(-8),
      language: currentLanguage
    };

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      if (response.status === 429) {
        aiBubble.innerHTML = `<span style="color:#ef4444; font-weight:600;">⚠️ আপনার দৈনিক প্রশ্ন করার কোটা শেষ হয়েছে। আগামীকাল আবার চেষ্টা করুন।</span>`;
        return;
      }
      throw new Error('API server error');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const content = line.replace('data: ', '');
          if (content === '[DONE]') break;
          accumulatedText += content;
          aiBubble.innerHTML = formatMarkdown(accumulatedText);
          renderMath(aiBubble);
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
      }
    }

    // Save to memory
    currentChatHistory.push({ role: 'user', content: text, image: userImg });
    currentChatHistory.push({ role: 'assistant', content: accumulatedText });

    // Interactive MCQ Parsing
    parseInteractiveMCQ(aiBubble);

    // Quick Action Buttons (including 👍 / 👎 Review)
    appendQuickActions(aiBubble, text, accumulatedText);

    // Render Mermaid diagrams if present
    if (window.mermaid && accumulatedText.includes('```mermaid')) {
      window.mermaid.init(undefined, aiBubble.querySelectorAll('.mermaid'));
    }

    // Update Quota Count Locally
    if (currentUser) {
      currentUser.used = (currentUser.used || currentUser.questions_today || 0) + 1;
      const max = currentUser.daily_limit || currentUser.quota || 30;
      quotaText.textContent = `আজ ${currentUser.used}/${max} প্রশ্ন`;
    }

    // Save to Cloudflare D1 Chat History
    saveChatToD1(text, accumulatedText, userImg);

  } catch (error) {
    console.error(error);
    aiBubble.innerHTML = `<span style="color:#ef4444;">❌ দুঃখিত, সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।</span>`;
  } finally {
    isStreamingResponse = false;
  }
}

/* ========================================================
   SAVE CHAT & GENERATE TITLE IN D1
   ======================================================== */
async function saveChatToD1(userText, aiText, userImg) {
  try {
    if (!currentChatId) {
      currentChatId = 'chat_' + Date.now();
      // Generate 2-5 words title via /api/title
      let chatTitle = userText.slice(0, 30);
      try {
        const titleRes = await fetch('/api/title', {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({ message: userText })
        });
        if (titleRes.ok) {
          const titleData = await titleRes.json();
          if (titleData.title) chatTitle = titleData.title;
        }
      } catch (tErr) {
        console.warn('Auto-title fallback used', tErr);
      }

      await fetch('/api/chats', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          id: currentChatId,
          title: chatTitle,
          thumbnail: userImg || null,
          messages: currentChatHistory
        })
      });
    } else {
      await fetch('/api/chats', {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          id: currentChatId,
          messages: currentChatHistory
        })
      });
    }
  } catch (err) {
    console.warn('Failed to save chat to D1', err);
  }
}

/* ========================================================
   MESSAGE DOM HELPERS
   ======================================================== */
function appendUserMessage(text, imageBase64) {
  const card = document.createElement('div');
  card.className = 'message-card user-msg';

  let imgHtml = imageBase64 ? `<img src="${imageBase64}" alt="Uploaded question">` : '';

  card.innerHTML = `
    <div class="msg-avatar">
      ${currentUser && currentUser.gender === 'female' ? FEMALE_AVATAR_SVG : MALE_AVATAR_SVG}
    </div>
    <div class="msg-bubble">
      ${imgHtml}
      <p>${escapeHtml(text)}</p>
    </div>
  `;
  chatMessages.appendChild(card);
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function appendAiMessage() {
  const card = document.createElement('div');
  card.className = 'message-card ai-msg';

  card.innerHTML = `
    <div class="msg-avatar">
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18C5 19.94 8.13 22 12 22C15.87 22 19 19.94 19 17.18V13.18L12 17L5 13.18Z"/></svg>
    </div>
    <div class="msg-bubble">
      <div class="typing-indicator">AI উত্তর তৈরি করছে...</div>
    </div>
  `;
  chatMessages.appendChild(card);
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  return card.querySelector('.msg-bubble');
}

function appendQuickActions(container, originalQuestion, fullAnswer) {
  const bar = document.createElement('div');
  bar.className = 'quick-actions-bar';

  bar.innerHTML = `
    <button class="quick-btn" data-act="simple">💡 আরও সহজ করে বলো</button>
    <button class="quick-btn" data-act="example">📖 একটি উদাহরণ দাও</button>
    <button class="quick-btn" data-act="quiz">❓ আমাকে একটি প্রশ্ন করো</button>
    <button class="quick-btn" data-act="copy">📋 কপি</button>
    <div class="review-group">
      <button class="quick-btn btn-thumb" data-act="thumbs-up" title="ভালো লেগেছে">👍</button>
      <button class="quick-btn btn-thumb" data-act="thumbs-down" title="উত্তরে ভুল আছে">👎</button>
    </div>
  `;

  bar.addEventListener('click', (e) => {
    const act = e.target.dataset.act;
    if (!act) return;

    if (act === 'simple') submitQuestion(`এটি আরও সহজ ও সাবলীল ভাষায় বুঝিয়ে বলো।`);
    if (act === 'example') submitQuestion(`এর সাথে প্রাসঙ্গিক একটি বাস্তব উদাহরণ দাও।`);
    if (act === 'quiz') submitQuestion(`এই টপিকের ওপর আমাকে একটি গুরুত্বপূর্ণ MCQ বা সংক্ষিপ্ত প্রশ্ন জিজ্ঞাসা করো।`);
    if (act === 'copy') {
      navigator.clipboard.writeText(container.innerText);
      e.target.textContent = '✅ কপি হয়েছে!';
      setTimeout(() => e.target.textContent = '📋 কপি', 2000);
    }
    if (act === 'thumbs-up') {
      e.target.style.backgroundColor = '#dcfce7';
      e.target.style.borderColor = '#22c55e';
      alert('আপনার ইতিবাচক ফিডব্যাকের জন্য ধন্যবাদ!');
    }
    if (act === 'thumbs-down') {
      e.target.style.backgroundColor = '#fee2e2';
      e.target.style.borderColor = '#ef4444';
      submitQuestion(`আগের উত্তরটিতে কোনো অসঙ্গতি বা অস্পষ্টতা ছিল, অনুগ্রহ করে নির্ভুলভাবে পুনর্মূল্যায়ন করে বুঝিয়ে দাও।`);
    }
  });

  container.parentNode.appendChild(bar);
}

function resetChatSession() {
  chatMessages.innerHTML = '';
  currentChatHistory = [];
  currentChatId = null;
  document.body.classList.remove('chat-active');
  heroSection.style.display = 'flex';
  chatThread.style.display = 'none';
  userQuestionInput.value = '';
}

/* ========================================================
   MCQ PARSER WITH INTERACTIVE CARDS & WHY-WRONG ACCORDION
   ======================================================== */
function parseInteractiveMCQ(container) {
  const text = container.innerHTML;
  if (!text.includes('ক)') && !text.includes('A)') && !text.includes('(A)') && !text.includes('(ক)')) return;

  const optRegex = /(?:\(|\[)?([A-Dক-ঘ])(?:\)|\]|\.|\:)\s*([^<\n]+)/g;
  let matches = [...text.matchAll(optRegex)];

  if (matches.length >= 4) {
    const mcqBox = document.createElement('div');
    mcqBox.className = 'mcq-container';
    mcqBox.innerHTML = `
      <div class="mcq-question">ইন্টারেক্টিভ MCQ প্র্যাকটিস: নিচের সঠিক অপশন নির্বাচন করুন</div>
      <div class="mcq-grid">
        ${matches.slice(0, 4).map(m => `<button class="mcq-opt" data-opt="${m[1]}">${m[1]}) ${m[2].trim()}</button>`).join('')}
      </div>
      <div class="mcq-feedback" style="display:none;"></div>
      <details class="mcq-wrong-details" style="display:none;">
        <summary>অন্যান্য অপশনগুলো কেন ভুল? (বিশ্লেষণ)</summary>
        <div class="wrong-explanation-content">
          উপরে উল্লেখিত উত্তরের সাথে তুলনামূলক পর্যালোচনা করে ভুল অপশনগুলো স্বয়ংক্রিয়ভাবে ফিল্টার করা হয়েছে।
        </div>
      </details>
    `;

    mcqBox.querySelectorAll('.mcq-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        mcqBox.querySelectorAll('.mcq-opt').forEach(b => b.classList.remove('correct'));
        btn.classList.add('correct');
        const feedback = mcqBox.querySelector('.mcq-feedback');
        feedback.style.display = 'block';
        feedback.innerHTML = `✅ <strong>আপনার উত্তর রেকর্ড করা হয়েছে (${btn.dataset.opt}):</strong> বিস্তারিত ব্যাখ্যা উপরের উত্তরে উল্লেখ রয়েছে।`;
        mcqBox.querySelector('.mcq-wrong-details').style.display = 'block';
      });
    });

    container.appendChild(mcqBox);
  }
}

/* ========================================================
   KATEX & MARKDOWN FORMATTER
   ======================================================== */
function renderMath(element) {
  if (window.renderMathInElement) {
    window.renderMathInElement(element, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true }
      ],
      throwOnError: false
    });
  }
}

function formatMarkdown(text) {
  let html = text
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/\n/gim, '<br>');
  return html;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ========================================================
   HISTORY DRAWER IMPLEMENTATION
   ======================================================== */
async function openHistoryDrawer() {
  historyDrawer.classList.add('open');
  drawerBackdrop.classList.add('active');
  try {
    const res = await fetch('/api/chats', {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      renderHistoryItems(data.chats || data || []);
    }
  } catch (e) {
    historyItemsList.innerHTML = `<p class="history-empty">হিস্ট্রি লোড করা সম্ভব হয়নি।</p>`;
  }
}

function closeHistoryDrawer() {
  historyDrawer.classList.remove('open');
  drawerBackdrop.classList.remove('active');
}

function renderHistoryItems(items) {
  if (!items || items.length === 0) {
    historyItemsList.innerHTML = `<p class="history-empty">কোনো পূর্ববর্তী আলোচনা পাওয়া যায়নি।</p>`;
    return;
  }

  historyItemsList.innerHTML = items.map(chat => `
    <div class="history-item" data-id="${chat.id}">
      <span class="history-item-title">${escapeHtml(chat.title || 'পূর্ববর্তী প্রশ্ন')}</span>
      <button class="btn-del-history" onclick="deleteHistoryChat('${chat.id}', event)">✕</button>
    </div>
  `).join('');

  historyItemsList.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', () => loadHistoricalChat(el.dataset.id));
  });
}

async function loadHistoricalChat(chatId) {
  try {
    const res = await fetch(`/api/chats?id=${chatId}`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      const messages = data.messages || (Array.isArray(data) ? data : []);
      if (messages.length > 0) {
        currentChatId = chatId;
        currentChatHistory = messages;
        chatMessages.innerHTML = '';
        document.body.classList.add('chat-active');
        heroSection.style.display = 'none';
        chatThread.style.display = 'block';

        messages.forEach(m => {
          if (m.role === 'user') appendUserMessage(m.content, m.image);
          if (m.role === 'assistant') {
            const ai = appendAiMessage();
            ai.innerHTML = formatMarkdown(m.content);
            renderMath(ai);
          }
        });
        closeHistoryDrawer();
      }
    }
  } catch (e) {
    console.error('Failed to load past chat', e);
  }
}

window.deleteHistoryChat = async function(chatId, event) {
  event.stopPropagation();
  try {
    await fetch(`/api/chats?id=${chatId}`, { 
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    openHistoryDrawer();
  } catch (e) {
    console.error(e);
  }
};

/* ========================================================
   AUTH MODAL & LOGIN/SIGNUP FIX
   ======================================================== */
function bindAuthModalEvents() {
  btnOpenLogin.addEventListener('click', () => {
    authModal.style.display = 'flex';
  });

  btnCloseAuth.addEventListener('click', () => {
    authModal.style.display = 'none';
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

  // Login Form Submission - UNIVERSAL KEY MATCH
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifier = document.getElementById('loginIdentifier').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorBox = document.getElementById('loginErrorMsg');
    errorBox.textContent = '';

    // Pass all possible keys: username, email, identifier, login
    const payload = {
      username: identifier,
      email: identifier,
      identifier: identifier,
      login: identifier,
      password: password
    };

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data.error === 'invalid_login' || data.error === 'invalid_credentials') {
          errorBox.textContent = 'ইউজারনেম বা পাসওয়ার্ড সঠিক নয়।';
        } else {
          errorBox.textContent = data.error || 'লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
        }
        return;
      }

      // Save token if JWT based
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('auth_token', data.token);
      }

      authModal.style.display = 'none';
      await checkAuth();

    } catch (err) {
      errorBox.textContent = 'সার্ভার সংযোগে ত্রুটি হয়েছে।';
    }
  });

  // Signup Form Submission
  formSignup.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const genderElem = document.querySelector('input[name="signupGender"]:checked');
    const gender = genderElem ? genderElem.value : 'male';
    const errorBox = document.getElementById('signupErrorMsg');
    errorBox.textContent = '';

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password, gender })
      });
      const data = await res.json();
      if (!res.ok) {
        errorBox.textContent = data.error || 'সাইন-আপ ব্যর্থ হয়েছে। অন্য কোনো ইউজারনেম ব্যবহার করুন।';
        return;
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('auth_token', data.token);
      }

      authModal.style.display = 'none';
      await checkAuth();

    } catch (err) {
      errorBox.textContent = 'সার্ভার সংযোগে ত্রুটি।';
    }
  });
}
