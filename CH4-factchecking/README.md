# AI Truth Detective — Cowork Development Package

## Project Overview

A 15-minute interactive educational game for elementary students (grades 3-6) 
teaching them to identify AI-generated misinformation using the 
"Stop, Check, Ask" (停、查、問) method.

## File Structure

```
ai_truth_detective/
├── README.md                          (This file)
├── 00_QUICK_START_GUIDE.md            (Developer onboarding)
├── 01_GAME_SPECIFICATION.md           (Functional specs)
├── 02_CONTENT_PRODUCTION_LIST.md      (Content checklist)
├── 03_TECHNICAL_ARCHITECTURE.md       (Code structure)
├── 04_TESTING_CHECKLIST.md            (QA items)
├── 05_DELIVERY_CHECKLIST.md           (Final packaging)
├── ALL_CONTENT_MERGED.md              (All scenarios in one file)
└── content/
    ├── scenario2_typhoon/             (Scenario 2: Typhoon school closure)
    │   ├── 01_messages.md
    │   ├── 02_breakpoints.md
    │   ├── 03_characters.md
    │   └── 04_image_prompts.md
    ├── scenario4_donation/            (Scenario 4: Heartwarming donation scam)
    │   ├── 01_messages.md
    │   ├── 02_breakpoints.md
    │   ├── 03_characters.md
    │   └── 04_image_prompts.md
    └── scenario5_freegift/            (Scenario 5: Free gift scam)
        ├── 01_messages.md
        ├── 02_breakpoints.md
        ├── 03_characters.md
        └── 04_image_prompts.md
```

**Note**: All filenames are in English for cross-platform compatibility.
File contents are in Traditional Chinese (Taiwan).

---

## 給 Claude（Cowork）的指示

你正在協助一位獨立開發者製作教育互動遊戲。

### 專案概述
- **遊戲名稱**：AI 真相大搜查 — 校園主播危機
- **目標對象**：國小三至六年級學生
- **核心教學**：訓練學生用「停、查、問」識別 AI 假消息
- **總時長**：15 分鐘
- **平台**：Web（HTML + CSS + JavaScript）
- **情境數量**：3 套（颱風停課、溫馨捐款騙局、免費禮物騙局）

### 你的工作流程

請依照以下順序協助開發：

1. **閱讀規格** → 先閱讀 `01_GAME_SPECIFICATION.md` 了解完整需求
2. **了解內容** → 閱讀 `ALL_CONTENT_MERGED.md`（一份檔案包含全部 3 個情境）
   - 或分開閱讀 `content/scenario2_typhoon/`、`content/scenario4_donation/`、
     `content/scenario5_freegift/` 各資料夾的 4 個檔案
3. **生產內容** → 依照 `02_CONTENT_PRODUCTION_LIST.md` 逐項產出
4. **建構程式** → 依照 `03_TECHNICAL_ARCHITECTURE.md` 建立 HTML/CSS/JS 檔案
5. **測試與優化** → 依照 `04_TESTING_CHECKLIST.md` 進行品質檢查
6. **打包交付** → 依照 `05_DELIVERY_CHECKLIST.md` 整理最終檔案

### 重要原則

- ✅ 每完成一個步驟就確認進度，等待開發者確認後再進行下一步
- ✅ 所有文字內容使用繁體中文（台灣用語）
- ✅ 程式碼要有清楚的註解（中文）
- ✅ 視覺設計使用兒童友善的色彩與字體
- ⚠️ AI 圖片生成需要開發者親自操作（Midjourney/DALL-E），你只需準備提示詞
- ⚠️ 配音需要開發者親自錄製或外包，你只需準備配音稿

### 開始指令

當開發者準備好時，請說：
「請開始閱讀 `01_GAME_SPECIFICATION.md` 與 `ALL_CONTENT_MERGED.md`，
讀完後告訴我你的理解和建議的開發順序。」

---

## 給開發者的提示

### 如果 .md 檔案打不開或顯示亂碼

`.md` 是 Markdown 純文字格式，可以用以下方式開啟：

**Windows**：
- 記事本（Notepad）
- VS Code（推薦，免費）
- Typora（付費）

**Mac**：
- TextEdit
- VS Code（推薦，免費）

**iPad**：
- Files App 預覽
- 1Writer App
- iA Writer

**線上預覽**：
- 上傳到 https://dillinger.io
- GitHub 也能直接顯示

### 兩種閱讀方式

1. **完整閱讀**：直接打開 `ALL_CONTENT_MERGED.md`（一份檔案 34KB，包含全部 3 個情境）
2. **分情境閱讀**：到 `content/` 資料夾，選擇你想看的情境
