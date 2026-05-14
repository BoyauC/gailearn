# 03 — 程式架構說明

## 技術選擇

**為什麼選擇純 HTML + CSS + JavaScript？**
- 不需要伺服器，可直接用瀏覽器開啟
- 一個人開發容易維護
- 兒童使用學校電腦/平板，相容性高
- 可以打包成單一資料夾交給學校使用

**不使用框架**（如 React、Vue）的原因：
- 避免複雜的構建工具
- 降低學習門檻
- 體積更小、載入更快

---

## 檔案結構

```
game/
├── index.html              # 主入口
├── styles.css              # 全部樣式
├── script.js               # 主要邏輯
├── data.js                 # 遊戲資料（情境、文本）
├── assets/
│   ├── images/             # 圖片
│   │   ├── scenarios/      # 各情境圖
│   │   ├── characters/     # 角色立繪
│   │   ├── ui/             # 介面元素
│   │   └── backgrounds/    # 背景圖
│   ├── audio/              # 音效
│   │   ├── voices/         # 配音
│   │   ├── sfx/            # 音效
│   │   └── music/          # 背景音樂
│   └── certificates/       # 證書範本
└── lib/                    # 外部函式庫
    └── html2canvas.min.js  # 用於證書下載
```

---

## 程式碼結構（給 Claude/Cowork 實作）

### index.html（頁面架構）

需要的主要區塊：
```html
<body>
  <!-- 場景容器（所有畫面在這裡切換） -->
  <div id="game-container">
    <!-- 開始頁 -->
    <section id="start-screen" class="screen active">...</section>
    
    <!-- 前導動畫 -->
    <section id="intro-screen" class="screen">...</section>
    
    <!-- 情境選擇 -->
    <section id="scenario-select" class="screen">...</section>
    
    <!-- 第一關：停 -->
    <section id="level1-stop" class="screen">...</section>
    
    <!-- 第二關：查 -->
    <section id="level2-check" class="screen">...</section>
    
    <!-- 第三關：問 -->
    <section id="level3-ask" class="screen">...</section>
    
    <!-- 結算頁 -->
    <section id="result-screen" class="screen">...</section>
    
    <!-- 證書頁 -->
    <section id="certificate-screen" class="screen">...</section>
  </div>
  
  <!-- 通用元件 -->
  <div id="loading-overlay">吱吱正在準備...</div>
  <audio id="bgm" loop></audio>
  
  <script src="data.js"></script>
  <script src="script.js"></script>
</body>
```

### data.js（遊戲資料）

結構範例：
```javascript
const GAME_DATA = {
  scenarios: [
    {
      id: 2,
      name: "颱風停課事件",
      description: "網路上有人說明天停課，是真的嗎？",
      thumbnail: "assets/images/scenarios/scenario2_thumb.png",
      
      // 第一關訊息
      messages: [
        { id: 1, text: "明日低溫 15°C", image: "...", isFake: false },
        { id: 2, text: "東北季風來臨", image: "...", isFake: false },
        { id: 3, text: "超級颱風來襲！全臺停課！", image: "...", isFake: true },
        { id: 4, text: "學校決定明日停課（無印章）", image: "...", isFake: true },
        { id: 5, text: "豪雨特報", image: "...", isFake: false }
      ],
      
      // 第二關目標圖
      mainImage: "assets/images/scenarios/scenario2_main.png",
      
      // 破綻 hotspot
      breakpoints: [
        {
          id: "B2-01",
          x: 150, y: 80,           // 中心點座標
          width: 80, height: 80,    // 容錯範圍
          title: "沒有官方標誌",
          description: "真正的官方新聞會有徽章...",
          hint_image: "assets/images/scenarios/scenario2_hint1.png"
        },
        // ... 共 3 個
      ],
      
      // 第三關情境與選項
      level3: {
        context: "根據破綻，這個停課公告是真的嗎？應該問誰？",
        breakpointSummary: ["沒有官方標誌", "文字排版不規則", "時間戳記可疑"],
        characters: [
          {
            id: "teacher",
            name: "班導師",
            avatar: "assets/images/characters/teacher.png",
            isCorrect: true,
            response: "停課通知一定會透過學校正式系統...",
            voice: "assets/audio/voices/scenario2_teacher.mp3"
          },
          {
            id: "classmate",
            name: "LINE 群組同學",
            avatar: "assets/images/characters/classmate.png",
            isCorrect: false,
            response: "天啦，我也有看到這個消息！",
            voice: "assets/audio/voices/scenario2_classmate.mp3"
          },
          {
            id: "netizen",
            name: "網路評論者",
            avatar: "assets/images/characters/netizen.png",
            isCorrect: false,
            response: "感覺好像是真的...",
            voice: "assets/audio/voices/scenario2_netizen.mp3"
          }
        ]
      }
    },
    // 情境 4、5 結構相同
  ],
  
  // UI 文字
  ui: {
    startButton: "開始遊戲",
    nextButton: "下一步",
    hintButton: "需要提示",
    // ...
  },
  
  // 吱吱旁白
  narratorLines: {
    intro: ["各位同學請注意！...", "..."],
    encouragement: ["太棒了！", "再想想吧！"],
    // ...
  }
};
```

### script.js（主邏輯）

主要函式架構：
```javascript
// === 全域狀態 ===
let gameState = {
  playerName: "",
  currentScenario: null,
  currentLevel: 0,
  trophies: 0,
  completedScenarios: [],
  foundBreakpoints: [],
  startTime: null
};

// === 場景切換 ===
function showScreen(screenId) { /* 隱藏其他畫面，顯示指定畫面 */ }

// === 開始頁 ===
function initStartScreen() { /* 綁定按鈕 */ }
function startGame() { /* 儲存名字，進入前導 */ }

// === 前導動畫 ===
function initIntro() { /* 逐句顯示對白 */ }

// === 情境選擇 ===
function loadScenarios() { /* 顯示 3 個情境卡 */ }
function selectScenario(scenarioId) { /* 載入情境，進入第一關 */ }

// === 第一關：停 ===
function initLevel1(scenario) { /* 開始播放訊息 */ }
function showMessage(message, index) { /* 顯示一則訊息 3 秒 */ }
function handleStopClick() { /* 玩家點擊「停」 */ }
function checkLevel1Pass() { /* 檢查是否找到 3 則假訊息 */ }

// === 第二關：查 ===
function initLevel2(scenario) { /* 顯示主圖 */ }
function handleImageClick(event, scenario) { /* 檢查點擊位置是否命中 hotspot */ }
function showBreakpointInfo(breakpoint) { /* 顯示破綻說明卡 */ }
function showHint() { /* 提示功能 */ }

// === 第三關：問 ===
function initLevel3(scenario) { /* 顯示角色選項 */ }
function selectCharacter(characterId) { /* 玩家選角色 */ }
function playCharacterResponse(character) { /* 播放回應 */ }

// === 結算與證書 ===
function showResult(scenarioId) { /* 顯示故事樹 */ }
function generateCertificate() { /* 生成證書 */ }
function downloadCertificate() { /* 用 html2canvas 下載 */ }

// === 工具函式 ===
function playSound(soundId) { /* 播放音效 */ }
function saveProgress() { /* 儲存到 localStorage */ }
function loadProgress() { /* 從 localStorage 讀取 */ }

// === 初始化 ===
window.addEventListener('DOMContentLoaded', () => {
  loadProgress();
  initStartScreen();
});
```

### styles.css（樣式重點）

**核心 CSS 變數**：
```css
:root {
  --primary-blue: #2E5C8A;
  --accent-orange: #FF8C42;
  --bg-light: #F5F7FA;
  --text-dark: #2C3E50;
  --success-green: #4CAF50;
  --warning-red: #E74C3C;
  
  --font-main: 'Microsoft JhengHei', 'PingFang TC', sans-serif;
  --font-size-base: 18px;     /* 兒童適合 */
  --font-size-large: 24px;
  
  --button-min-size: 44px;    /* 觸控標準 */
  --border-radius: 12px;
}
```

**響應式設計**：
```css
/* 平板 */
@media (min-width: 768px) {
  .container { max-width: 1024px; }
}

/* 桌機 */
@media (min-width: 1024px) {
  .container { max-width: 1280px; }
}
```

**動畫效果**：
- 過關慶祝：彩帶從上方落下（CSS animation）
- 按鈕點擊：scale(0.95) → scale(1)
- 場景切換：淡入淡出（opacity）

---

## 給 Cowork 的實作步驟

請依照以下順序逐步建構：

### 步驟 1：建立基礎結構
1. 建立 `index.html` 主架構
2. 建立 `styles.css` 基礎樣式
3. 建立 `data.js` 空架構
4. 建立 `script.js` 基本場景切換

**驗證**：能在瀏覽器開啟，看到開始頁

### 步驟 2：填入內容資料
1. 將 3 個情境的所有文字填入 `data.js`
2. 暫時用佔位圖（灰色方塊 + 文字）代替真實圖片

**驗證**：所有文字內容正確顯示

### 步驟 3：實作第一關
1. 訊息播放邏輯
2. 計時器
3. 點擊判定

**驗證**：能完整玩通第一關

### 步驟 4：實作第二關
1. 圖片顯示
2. hotspot 點擊判定
3. 破綻說明卡

**驗證**：能找到所有破綻

### 步驟 5：實作第三關
1. 角色選項顯示
2. 回應播放
3. 對錯判定

**驗證**：能完成完整情境

### 步驟 6：實作結算與證書
1. 結算頁（故事樹）
2. 證書生成
3. 下載功能

**驗證**：能下載含玩家姓名的證書

### 步驟 7：整合真實素材
1. 替換佔位圖為真實圖片
2. 整合配音與音效
3. 調整動畫效果

**驗證**：完整遊戲體驗

### 步驟 8：優化與測試
1. 瀏覽器相容性測試
2. 平板觸控測試
3. 修復發現的問題

**驗證**：可以交付的成品

---

## 注意事項

⚠️ **每完成一個步驟都要先讓開發者確認**，不要一次全寫完
⚠️ **檔案路徑使用相對路徑**，便於移植
⚠️ **不要引入過多外部函式庫**，越簡單越好
⚠️ **註解寫繁體中文**，便於後續維護
⚠️ **錯誤處理要友善**，不要彈出技術錯誤訊息
