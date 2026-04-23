/* =========================================================
   AI 三色燈判斷遊戲 — 主程式
   - 狀態管理 / 題庫載入 / 計分 / 計時 / 回饋流程
   - Responsible AI 原則：
       * 不蒐集、不上傳任何個資（只在記憶體中運算）
       * 不使用 localStorage / cookie
       * 所有錯誤回饋為鼓勵式、非羞辱式
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 常數 ---------- */
  const CSV_PATH = 'data/scenario_bank260423.csv';
  const BASIC_COUNT = 5;
  const ADVANCED_COUNT = 3;
  const ADVANCED_TIME_LIMIT = 10; // 秒
  const PASS_THRESHOLD = 4;      // 基礎關答對 4 題以上才能進階
  const VALID_SIGNALS = ['red', 'yellow', 'green'];

  /* ---------- 遊戲狀態 ---------- */
  const state = {
    bank: { basic: [], advanced: [] },
    level: 'basic',             // 'basic' | 'advanced'
    queue: [],                  // 本關抽出的題目序列
    index: 0,                   // 目前題目 index
    attempts: 0,                // 當題已作答次數
    score: { basic: 0, advanced: 0 },         // 用於分數加總 (1 / 0.5)
    correct: { basic: 0, advanced: 0 },       // 答對題數 (1 或 2 次內答對)
    timer: null,                // 倒數 interval
    timerRemaining: 0,
    locked: false               // 防連點
  };

  /* ---------- DOM ---------- */
  const $ = (id) => document.getElementById(id);
  const el = {
    body: document.body,
    screenStart: $('screen-start'),
    screenGame: $('screen-game'),
    screenTransition: $('screen-transition'),
    screenResult: $('screen-result'),

    btnStart: $('btn-start'),
    btnGoAdvanced: $('btn-go-advanced'),
    btnFinishEarly: $('btn-finish-early'),
    btnRestart: $('btn-restart'),

    levelLabel: $('level-label'),
    progress: $('progress'),
    score: $('score'),
    scenarioText: $('scenario-text'),
    lights: document.querySelectorAll('.light'),

    timerWrap: $('timer-wrap'),
    timerText: $('timer-text'),
    timerRing: $('timer-ring-progress'),

    overlay: $('feedback-overlay'),
    correctRing: $('correct-ring'),
    feedbackTitle: $('feedback-title'),
    feedbackText: $('feedback-text'),
    feedbackCorrect: $('feedback-correct'),
    btnRetry: $('btn-retry'),
    btnNext: $('btn-next'),

    transitionTitle: $('transition-title'),
    transitionMsg: $('transition-msg'),

    cups: $('cups'),
    stars: $('stars'),
    cupsCaption: $('cups-caption'),
    starsCaption: $('stars-caption'),

    loadError: $('load-error'),
    loadErrorDetail: $('load-error-detail')
  };

  /* =========================================================
     ★ 題庫載入
     ========================================================= */
  async function loadBank() {
    try {
      const res = await fetch(CSV_PATH, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      const rows = window.CSVParser.parse(text);
      ingestRows(rows);
    } catch (err) {
      // 可能是 file:// 環境造成的失敗 — 顯示提示
      showLoadError(err && err.message);
      throw err;
    }
  }

  function ingestRows(rows) {
    const basic = [];
    const advanced = [];

    rows.forEach((r) => {
      const tier = (r.tier || '').trim().toLowerCase();
      const signal = (r.signal || '').trim().toLowerCase();
      const scenario = (r.scenario_text || '').trim();
      const feedback = (r.feedback_text || '').trim();

      if (!scenario || !VALID_SIGNALS.includes(signal)) return;

      const item = {
        id: r.item_id || '',
        signal: signal,
        scenario_text: scenario,
        feedback_text: feedback
      };

      if (tier === 'basic') basic.push(item);
      else if (tier === 'advanced') advanced.push(item);
    });

    state.bank.basic = basic;
    state.bank.advanced = advanced;

    if (basic.length === 0 || advanced.length === 0) {
      showLoadError('題庫為空或格式不符');
      throw new Error('empty bank');
    }
  }

  function showLoadError(detail) {
    el.loadError.classList.remove('hidden');
    if (detail) el.loadErrorDetail.textContent = '錯誤訊息：' + detail;
  }

  /* =========================================================
     ★ 題目抽取
     ========================================================= */

  // 基礎：5 題，三色皆出現至少 1 次、最多 2 次
  function pickBasic() {
    const bySignal = groupBySignal(state.bank.basic);

    // 可能的分配（5 題、每色 1~2）
    const distributions = [
      { red: 2, yellow: 2, green: 1 },
      { red: 2, yellow: 1, green: 2 },
      { red: 1, yellow: 2, green: 2 }
    ];
    // 過濾掉題庫數量不足的分配
    const viable = distributions.filter(d =>
      (bySignal.red || []).length >= d.red &&
      (bySignal.yellow || []).length >= d.yellow &&
      (bySignal.green || []).length >= d.green
    );
    const pickDist = viable.length ? viable[randInt(viable.length)] : distributions[0];

    const chosen = [];
    ['red', 'yellow', 'green'].forEach(sig => {
      const pool = shuffle((bySignal[sig] || []).slice());
      for (let i = 0; i < pickDist[sig] && i < pool.length; i++) chosen.push(pool[i]);
    });

    return shuffle(chosen);
  }

  // 進階：3 題，隨機，但盡量每色都有（若題庫允許）
  function pickAdvanced() {
    const bySignal = groupBySignal(state.bank.advanced);
    const chosen = [];
    const used = new Set();

    // 先嘗試每色 1 題
    ['red', 'yellow', 'green'].forEach(sig => {
      const pool = shuffle((bySignal[sig] || []).slice());
      if (pool.length && chosen.length < ADVANCED_COUNT) {
        chosen.push(pool[0]);
        used.add(pool[0].id);
      }
    });
    // 補滿至 ADVANCED_COUNT
    const rest = shuffle(state.bank.advanced.filter(q => !used.has(q.id)));
    while (chosen.length < ADVANCED_COUNT && rest.length) chosen.push(rest.shift());

    return shuffle(chosen);
  }

  function groupBySignal(list) {
    return list.reduce((acc, item) => {
      (acc[item.signal] = acc[item.signal] || []).push(item);
      return acc;
    }, {});
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function randInt(n) { return Math.floor(Math.random() * n); }

  /* =========================================================
     ★ 畫面切換
     ========================================================= */
  function showScreen(screenEl) {
    [el.screenStart, el.screenGame, el.screenTransition, el.screenResult]
      .forEach(s => s.classList.remove('screen--active'));
    screenEl.classList.add('screen--active');
  }

  /* =========================================================
     ★ 遊戲流程
     ========================================================= */
  function startBasic() {
    state.level = 'basic';
    el.body.dataset.level = 'basic';
    state.queue = pickBasic();
    state.index = 0;
    state.attempts = 0;
    state.score.basic = 0;
    state.correct.basic = 0;
    updateHUD();
    el.timerWrap.classList.add('hidden');
    showScreen(el.screenGame);
    renderQuestion();
  }

  function startAdvanced() {
    state.level = 'advanced';
    el.body.dataset.level = 'advanced';
    state.queue = pickAdvanced();
    state.index = 0;
    state.attempts = 0;
    state.score.advanced = 0;
    state.correct.advanced = 0;
    updateHUD();
    el.timerWrap.classList.remove('hidden');
    showScreen(el.screenGame);
    renderQuestion();
  }

  function updateHUD() {
    el.levelLabel.textContent = state.level === 'basic' ? '基礎關卡' : '進階關卡';
    const total = state.queue.length || (state.level === 'basic' ? BASIC_COUNT : ADVANCED_COUNT);
    el.progress.textContent = `第 ${state.index + 1} / ${total} 題`;
    const s = state.score[state.level];
    el.score.textContent = `分數 ${formatScore(s)}`;
  }

  function formatScore(n) {
    // 保留至多 1 位小數
    return Math.round(n * 10) / 10;
  }

  function renderQuestion() {
    const q = state.queue[state.index];
    if (!q) { onLevelEnd(); return; }

    state.attempts = 0;
    state.locked = false;

    el.scenarioText.textContent = q.scenario_text;
    resetLights();

    if (state.level === 'advanced') startTimer();
  }

  function resetLights() {
    el.lights.forEach(btn => {
      btn.disabled = false;
      btn.classList.remove('is-pulse');
    });
  }

  function onLightPick(signal) {
    if (state.locked) return;
    state.locked = true;

    const q = state.queue[state.index];
    const btn = Array.from(el.lights).find(b => b.dataset.signal === signal);
    if (btn) btn.classList.add('is-pulse');

    stopTimer();
    state.attempts++;

    const correct = signal === q.signal;
    if (correct) handleCorrect(); else handleWrong(false);
  }

  function handleCorrect() {
    const q = state.queue[state.index];
    const add = state.attempts === 1 ? 1 : 0.5;
    state.score[state.level] += add;
    state.correct[state.level] += 1;
    updateHUD();
    showCorrectRing();

    if (state.attempts === 1) {
      // 第一次就答對：只播圓圈特效，自動進下一題
      setTimeout(() => nextQuestion(), 700);
    } else {
      // 第二次才答對：顯示 feedback_text
      showFeedback({
        title: '答對了！',
        body: q.feedback_text || '',
        showRetry: false,
        showNext: true,
        isCorrect: true
      });
    }
  }

  function handleWrong(timedOut) {
    disableLights();
    const q = state.queue[state.index];
    const isFinal = state.attempts >= 2;

    if (isFinal) {
      // 第二次答錯：顯示 feedback_text + 正確燈號
      showFeedback({
        title: '再想一下下...',
        body: q.feedback_text || '',
        correctHint: `（這題的正確燈號是：${signalZh(q.signal)}）`,
        showRetry: false,
        showNext: true,
        isCorrect: false
      });
    } else {
      // 第一次答錯：只顯示「再想一下」，無 feedback_text
      showFeedback({
        title: '再想一下',
        body: timedOut ? '時間到了，再試一次！' : '',
        showRetry: true,
        showNext: false,
        isCorrect: false
      });
    }
  }

  function signalZh(sig) {
    return { red: '紅燈 🔴', yellow: '黃燈 🟡', green: '綠燈 🟢' }[sig] || sig;
  }

  function showCorrectRing() {
    el.correctRing.classList.remove('is-active');
    void el.correctRing.offsetWidth; // 強制 reflow 重啟動畫
    el.correctRing.classList.add('is-active');
  }

  function showFeedback({ title, body, correctHint, showRetry, showNext, isCorrect }) {
    el.feedbackTitle.textContent = title || 'AI 領航員的溫馨提醒';
    el.feedbackText.textContent = body || '';
    el.feedbackCorrect.textContent = correctHint || '';
    el.btnRetry.classList.toggle('hidden', !showRetry);
    el.btnNext.classList.toggle('hidden', !showNext);

    el.feedbackTitle.style.color = isCorrect ? '#d4af37' : '';

    el.overlay.classList.remove('hidden');
  }

  function closeFeedback() {
    el.overlay.classList.add('hidden');
  }

  function onRetry() {
    closeFeedback();
    resetLights();
    state.locked = false;
    if (state.level === 'advanced') startTimer();
  }

  function onNext() {
    closeFeedback();
    nextQuestion();
  }

  function nextQuestion() {
    state.index++;
    if (state.index >= state.queue.length) {
      onLevelEnd();
      return;
    }
    updateHUD();
    renderQuestion();
  }

  function disableLights() {
    el.lights.forEach(b => b.disabled = true);
  }

  /* =========================================================
     ★ 倒數計時（僅進階關）
     ========================================================= */
  function startTimer() {
    stopTimer();
    state.timerRemaining = ADVANCED_TIME_LIMIT;
    updateTimerUI(state.timerRemaining, ADVANCED_TIME_LIMIT);
    state.timer = setInterval(() => {
      state.timerRemaining--;
      if (state.timerRemaining <= 0) {
        updateTimerUI(0, ADVANCED_TIME_LIMIT);
        stopTimer();
        onTimeOut();
      } else {
        updateTimerUI(state.timerRemaining, ADVANCED_TIME_LIMIT);
      }
    }, 1000);
  }

  function stopTimer() {
    if (state.timer) { clearInterval(state.timer); state.timer = null; }
  }

  function updateTimerUI(remaining, total) {
    el.timerText.textContent = Math.max(0, remaining);
    // 圓環 stroke-dasharray 是 100, offset 0~100
    const pct = Math.max(0, remaining) / total;
    const offset = (1 - pct) * 100;
    el.timerRing.style.strokeDashoffset = String(offset);
    el.timerRing.classList.toggle('warn', remaining <= 2);
  }

  function onTimeOut() {
    if (state.locked) return;
    state.locked = true;
    state.attempts++;
    handleWrong(true);
  }

  /* =========================================================
     ★ 關卡結束
     ========================================================= */
  function onLevelEnd() {
    stopTimer();
    if (state.level === 'basic') {
      renderTransition();
      showScreen(el.screenTransition);
    } else {
      renderResult();
      showScreen(el.screenResult);
    }
  }

  function renderTransition() {
    const c = state.correct.basic;
    el.transitionTitle.textContent = '基礎關卡完成！';
    if (c >= PASS_THRESHOLD) {
      el.transitionMsg.innerHTML =
        `你答對了 <strong>${c}</strong> 題，很棒的思考！<br />準備好挑戰限時 5 秒的進階題了嗎？`;
      el.btnGoAdvanced.classList.remove('hidden');
      el.btnFinishEarly.textContent = '直接看學習回饋';
    } else {
      el.transitionMsg.innerHTML =
        `這次答對 <strong>${c}</strong> 題，差一點就可以挑戰進階關了。<br />先看看你的學習回饋吧，錯誤都是進步的養分 💪`;
      el.btnGoAdvanced.classList.add('hidden');
      el.btnFinishEarly.textContent = '看看學習回饋';
    }
  }

  function renderResult() {
    el.cups.innerHTML = buildIcons('cup', ADVANCED_COUNT, state.correct.advanced);
    el.stars.innerHTML = buildIcons('star', BASIC_COUNT, state.correct.basic);

    el.cupsCaption.textContent =
      state.level === 'advanced'
        ? `你在進階關答對 ${state.correct.advanced} / ${ADVANCED_COUNT} 題，累積 ${formatScore(state.score.advanced)} 分。`
        : '這次沒有挑戰進階關，下次再試！';

    el.starsCaption.textContent =
      `你在基礎關答對 ${state.correct.basic} / ${BASIC_COUNT} 題，累積 ${formatScore(state.score.basic)} 分。`;
  }

  function buildIcons(kind, total, earned) {
    let html = '';
    for (let i = 0; i < total; i++) {
      const filled = i < earned;
      html += `<span class="icon">${kind === 'cup' ? cupSVG(filled) : starSVG(filled)}</span>`;
    }
    return html;
  }

  function starSVG(filled) {
    const fill = filled ? 'var(--star-gold)' : 'none';
    const stroke = filled ? 'var(--star-gold)' : 'var(--star-gray)';
    return `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.3l2.9 6.6 7.1.7-5.4 4.8 1.7 7L12 17.8 5.7 21.4l1.7-7L2 9.6l7.1-.7L12 2.3z"
        fill="${fill}" stroke="${stroke}" stroke-width="1.4" stroke-linejoin="round"/>
    </svg>`;
  }

  function cupSVG(filled) {
    const fill = filled ? 'var(--cup-gold)' : 'none';
    const stroke = filled ? 'var(--cup-gold)' : 'var(--cup-gray)';
    return `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h12v3a5 5 0 0 1-4 4.9V15h3v2H7v-2h3v-4.1A5 5 0 0 1 6 6V3zm2 2v1a3 3 0 0 0 8 0V5H8z
               M5 18h14v2H5z"
        fill="${fill}" stroke="${stroke}" stroke-width="1.4" stroke-linejoin="round"/>
    </svg>`;
  }

  /* =========================================================
     ★ 事件綁定
     ========================================================= */
  function bindEvents() {
    // 用 pointerdown 讓平板更即時回饋
    el.btnStart.addEventListener('pointerdown', onStartClick);
    el.btnGoAdvanced.addEventListener('pointerdown', () => startAdvanced());
    el.btnFinishEarly.addEventListener('pointerdown', () => { renderResult(); showScreen(el.screenResult); });
    el.btnRestart.addEventListener('pointerdown', () => startBasic());

    el.btnRetry.addEventListener('pointerdown', onRetry);
    el.btnNext.addEventListener('pointerdown', onNext);

    // 三色燈：pointerdown
    el.lights.forEach(btn => {
      btn.addEventListener('pointerdown', (ev) => {
        ev.preventDefault();
        if (btn.disabled) return;
        onLightPick(btn.dataset.signal);
      });
    });

    // 阻止按鈕被長按選取
    document.addEventListener('contextmenu', (e) => {
      if (e.target.closest('.light')) e.preventDefault();
    });
  }

  function onStartClick() {
    startBasic();
  }

  /* =========================================================
     ★ 啟動
     ========================================================= */
  async function boot() {
    bindEvents();
    try {
      await loadBank();
      // 預設停在開始畫面
      showScreen(el.screenStart);
    } catch (e) {
      // 讀取失敗已在 showLoadError() 顯示提示
      console.error('[stoplight] CSV load failed:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
