# 分檔提示詞 CSV — 批次生成用

這個資料夾的 4 份 CSV 是 `image_prompts.csv` 的**分類版本**，依照「關卡 / 用途」拆分，方便你按批次餵給 AI 生成工具（Midjourney / DALL-E / Stable Diffusion）。

主檔 `data/image_prompts.csv` 仍是完整索引，這邊只是視覺切割。

---

## 檔案清單

| 檔案 | 內容 | 數量 | 建議優先順序 |
|---|---|---|---|
| `01_narrator_prompts.csv` | 吱吱主播 7 個姿勢 | 7（含 5 張已生成） | ① 最高 |
| `02_level1_message_prompts.csv` | 第一關訊息配圖 | 15 | ② |
| `03_level2_scenario_prompts.csv` | 第二關主圖 + 破綻放大圖 | 12 | ③ |
| `04_level3_character_prompts.csv` | 第三關角色立繪 | 9 | ④ |

---

## 進度概況

**✅ 已生成（5 張）**
- jiji_cheer.png
- jiji_thinking.png
- jiji_surprised.png
- jiji_proud.png
- jiji_check.png（暫時沿用 jiji_thinking.png，未來若要區別兩者再單獨生成）

**⏳ 待生成（38 張）**
- 吱吱還缺：`jiji_stop.png`、`jiji_ask.png`
- 第一關訊息圖：15 張（每情境 5 張）
- 第二關主圖：3 張（每情境 1 張）
- 第二關破綻放大圖：9 張（後製從主圖裁切，不需重生）
- 第三關角色：9 張（每情境 3 個角色）

---

## 使用建議

### 與 Midjourney 批次生成

把 `midjourney_prompt` 欄整列複製，依序丟給 Midjourney。記得：
- 用相同的 `--v 6 --ar` 參數保持一致風格
- 角色類提示詞建議用 `--cref <已生成圖的 URL>` 保持外型一致

### 與 DALL-E / Bing Image Creator

用 `dalle_prompt` 欄（中文），可一句一句餵或寫一個批次腳本。

### 命名規則

生成完的檔案請依照各 CSV 的 `final_path` 欄存檔，**檔名要完全一致**，遊戲才會找到。

---

## CSV 欄位說明

| 欄位 | 說明 |
|---|---|
| `asset_id` | 資產唯一識別（不要改） |
| `scenario_id` | 所屬情境（`_global` 表共用） |
| `target_size` | 建議輸出尺寸與格式 |
| `description` / `pose_description` / `role` | 中文敘述，便於人類閱讀 |
| `midjourney_prompt` | Midjourney 提示詞（英文） |
| `dalle_prompt` | DALL-E / Bing 提示詞（中文） |
| `status` | 進度狀態（待生成 / 已生成 / 後製） |
| `final_path` | 最終存放位置（程式會從這裡讀） |

---

## 破綻放大圖（後製方式）

`03_level2_scenario_prompts.csv` 裡 `status=後製` 的 9 張是「**從主圖裁切放大**」而來，不需要重新生成：

1. 用 Photoshop / Figma / Photopea 開啟主圖
2. 依照 `breakpoints.csv` 中的 `center_x_pct / center_y_pct`，找到對應位置
3. 裁切該區域（建議 400×400 px 正方形）
4. 適度放大 + 增強對比、加紅框或箭頭標示具體問題點
5. 存成 `final_path` 對應的檔名
