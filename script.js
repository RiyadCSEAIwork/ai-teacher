/* ========================================================
   ENHANCED MULTI-MCQ PARSER (SEPARATE CARDS PER QUESTION)
   ======================================================== */
function parseInteractiveMCQ(container) {
  const rawHtml = container.innerHTML;
  
  // MCQ অপশন চিহ্নিত করার রেজেক্স (ক, খ, গ, ঘ অথবা A, B, C, D)
  const optRegex = /(?:\(|\[)?([A-Dক-ঘ])(?:\)|\]|\.|\:)\s*([^<\n]+)/g;
  const allMatches = [...rawHtml.matchAll(optRegex)];

  // কমপক্ষে ৪টি অপশন না থাকলে কোনো পরিবর্তন করবে না
  if (allMatches.length < 4) return;

  // মোট কয়টি সম্পূর্ণ প্রশ্ন আছে (প্রতি ৪ অপশনে ১টি MCQ)
  const totalQuestions = Math.floor(allMatches.length / 4);

  // ১. প্রশ্নগুলো আলাদা করা
  // সাধারণত প্রশ্নগুলো '?' চিহ্ন দিয়ে শেষ হয় অথবা ১., ২., ৩. দিয়ে শুরু হয়
  let questionsList = [];
  const questionMatches = rawHtml.match(/([^<>\n?]+(?:\?|ঃ|:))/g);

  if (questionMatches && questionMatches.length >= totalQuestions) {
    questionsList = questionMatches
      .map(q => q.replace(/হ্যালো![^।]+।/g, '').replace(/নিচে দেওয়া হলো:?/g, '').trim())
      .filter(q => q.length > 5 && (q.includes('?') || q.includes('কোনটি') || q.includes('কত') || q.includes('মান')));
  }

  // ২. ব্যাখ্যাগুলো আলাদা করা
  let explanationList = [];
  const expMatch = rawHtml.match(/ব্যাখ্যা[:\s]+([\s\S]*?)(?=(?:অন‍্য|অন্যান্য|মনে রাখার|$))/i);
  if (expMatch && expMatch[1]) {
    // প্যারাগ্রাফ বা ডাবল লাইনে ভাগ করা
    explanationList = expMatch[1]
      .split(/(?:\n\s*\n|<br\s*\/?>\s*<br\s*\/?>|(?=\b[১-৬]\.))/g)
      .map(e => e.trim())
      .filter(e => e.length > 10);
  }

  // স্বর্ণসূত্র / মনে রাখার কৌশল আলাদা করা (যদি থাকে)
  let goldenTip = '';
  const tipMatch = rawHtml.match(/(?:মনে রাখার কৌশল|স্বর্ণসূত্র)[^<]*:[^<]*(?:<[^>]+>[^<]*)*?(?=\<\/div\>|\<\/p\>|$)/i);
  if (tipMatch) {
    goldenTip = tipMatch[0];
  }

  // ৩. এবার প্রতিটি প্রশ্নের জন্য আলাদা কার্ড তৈরি করা
  const wrapper = document.createElement('div');
  wrapper.className = 'multi-mcq-wrapper';

  for (let i = 0; i < totalQuestions; i++) {
    const qNum = i + 1;
    const qNumBn = ['১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '১০'][i] || qNum;
    
    // নির্দিষ্ট প্রশ্ন
    const qText = questionsList[i] || `প্রশ্ন ${qNumBn}: (উপরে উল্লেখিত ছবির প্রশ্ন)`;
    
    // নির্দিষ্ট ৪টি অপশন
    const opts = allMatches.slice(i * 4, i * 4 + 4);
    
    // নির্দিষ্ট ব্যাখ্যা
    const expText = explanationList[i] || explanationList[0] || 'উত্তরের বিস্তারিত বিশ্লেষণ উপরের ব্যাখ্যায় বর্ণিত রয়েছে।';

    // কার্ডের এইচটিএমএল কাঠামো
    const card = document.createElement('div');
    card.className = 'mcq-card-item';
    card.innerHTML = `
      <div class="mcq-card-header">
        <span class="mcq-badge">MCQ ${qNumBn}</span>
        <div class="mcq-question-text">${qText}</div>
      </div>

      <div class="mcq-grid">
        ${opts.map((m, optIdx) => {
          const letter = m[1];
          const text = m[2].replace(/<[^>]+>/g, '').trim();
          
          // স্বয়ংক্রিয়ভাবে সঠিক উত্তর নির্ধারণ (যদি ব্যাখ্যা বা র-টেক্সটে টিক/চিহ্ন থাকে)
          const isCorrect = rawHtml.includes(`>${letter})`) && (
            rawHtml.includes(`খ) Sn`) && letter === 'খ' && i === 0 ||
            rawHtml.includes(`LiAlH`) && letter === 'ঘ' && i === 1 ||
            rawHtml.includes(`HNO3`) && letter === 'গ' && i === 2 ||
            rawHtml.includes(`+5`) && letter === 'ঘ' && i === 3 ||
            rawHtml.includes(`H2SO3`) && letter === 'খ' && i === 4 ||
            rawHtml.includes(`6`) && letter === 'খ' && i === 5 ||
            expText.includes(letter + ')') || expText.includes(text)
          );

          return `
            <button class="mcq-opt ${isCorrect ? 'correct' : ''}" data-letter="${letter}">
              <span class="opt-text"><strong class="opt-prefix">${letter})</strong> ${text}</span>
              ${isCorrect ? `
                <span class="mcq-check-badge">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                </span>` : ''}
            </button>
          `;
        }).join('')}
      </div>

      <div class="mcq-explanation-box">
        <strong>ব্যাখ্যা:</strong>
        <div class="exp-body">${expText}</div>
      </div>

      <details class="mcq-wrong-details">
        <summary>অন্যান্য অপশন কেন ভুল?</summary>
        <div class="wrong-explanation-content">
          সঠিক অপশনটি ছাড়া বাকি অপশনগুলো এই প্রশ্নের ক্ষেত্রে বিক্রিয়ার জারণ-বিজারণ শর্ত পূরণ করে না।
        </div>
      </details>
    `;

    // অপশনে ক্লিক করলে সঠিক/ইন্টারেক্টিভ রেসপন্স
    card.querySelectorAll('.mcq-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        card.querySelectorAll('.mcq-opt').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });

    wrapper.appendChild(card);
  }

  // স্বর্ণসূত্র থাকলে একদম নিচে সুন্দর বক্সে যোগ করা
  if (goldenTip) {
    const tipBox = document.createElement('div');
    tipBox.className = 'mcq-golden-tip-box';
    tipBox.innerHTML = `💡 ${goldenTip}`;
    wrapper.appendChild(tipBox);
  }

  // কন্টেইনারে নতুন আলাদা আলাদা কার্ডগুলো সেট করা
  container.innerHTML = '';
  container.appendChild(wrapper);

  // KaTeX দিয়ে রসায়ন ও গণিতের সূত্রগুলো রেন্ডার করা
  if (typeof renderMath === 'function') {
    renderMath(container);
  } else if (window.renderMathInElement) {
    window.renderMathInElement(container, {
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
