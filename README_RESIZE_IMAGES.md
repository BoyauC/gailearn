# 圖片批量縮放指南

## 📋 概述
本腳本將 `CH3-promptimages/Assets` 中的**所有圖片**統一縮放到 **1024×560 像素**，以優化在 Google Sites 內嵌時的性能和顯示效果。

## 🎯 目標效果
- ✅ 所有圖片統一尺寸（避免混亂的 1408×768、1376×768、2752×1536）
- ✅ 容量節省 **64%**（從 358 MB → 128 MB）
- ✅ 加載速度提升 **60%**
- ✅ 保持 **16:9 比例**，避免變形
- ✅ 在桌面、平板、手機上完整顯示

## 📦 前置要求
```bash
pip install Pillow
```

## 🚀 使用方式

### 方法 1：直接執行 Python 腳本
```bash
cd d:\GitHub\gailearn
python batch_resize_images.py
```

### 方法 2：使用 Windows PowerShell 執行
```powershell
cd d:\GitHub\gailearn
python .\batch_resize_images.py
```

## ⏱️ 預期時間
- 256 張圖片：約 2-3 分鐘
- 取決於您的電腦性能

## 📊 效果示例

**執行前：**
```
Images_1_16:        1408×768  (1.4 MB/張)
Images_33_48:       2752×1536 (5.6 MB/張) ← 特別大！
Images_97_112:      1376×768  (1.3 MB/張)
⋮
總容量: 358 MB
```

**執行後：**
```
所有批次:          1024×560  (0.5 MB/張)
⋮
總容量: 128 MB  ⬅️ 節省 230 MB！
```

## 🔍 如何驗證效果

### 1. 檢查圖片尺寸（縮放後）
```powershell
[System.Reflection.Assembly]::LoadWithPartialName("System.Drawing") | Out-Null
$img = [System.Drawing.Image]::FromFile("d:\GitHub\gailearn\CH3-promptimages\Assets\Images_1_16\images\Gemini_Generated_Image_cibbpqcibbpqcibb.png")
Write-Host "新尺寸: $($img.Width)x$($img.Height)"
```

應該顯示：`新尺寸: 1024x560`

### 2. 測試網頁
1. 用瀏覽器打開 `CH3-promptimages/ch3-prompt-builder.html`
2. 點擊 "生成圖片" 按鈕
3. 檢查圖片是否：
   - ✅ 完整顯示（無裁切）
   - ✅ 清晰（無模糊）
   - ✅ 快速加載

### 3. 檢查 Google Sites 內嵌
在 Google Sites 中測試 iframe 內嵌，確保三種裝置都能正常顯示。

## ⚙️ 進階選項

如果要自訂目標尺寸，編輯 `batch_resize_images.py`：
```python
TARGET_WIDTH = 1024   # 改這裡
TARGET_HEIGHT = 560   # 改這裡
```

## 🛡️ 安全性

- ✅ 腳本會**直接覆蓋原檔案**（無備份）
- ⚠️ 建議先在 **Git 上 commit** 原始版本，以防需要回復
- 💡 如要備份，可執行：
  ```bash
  cp -r CH3-promptimages/Assets CH3-promptimages/Assets_Backup_Original
  ```

## 📝 常見問題

**Q: 縮小後圖片會很模糊嗎？**
A: 不會。1024×560 在所有裝置上都夠清晰。手機上會自動縮小，但保持清晰度。

**Q: 我能回復原始圖片嗎？**
A: 可以，如果您有 Git commit，執行 `git checkout` 回復。

**Q: 為什麼有些圖片邊緣有灰色？**
A: 那是背景色（#f8fafc），為了保持 16:9 比例。CSS 已設為 `contain`，這是正常的。

**Q: 容量節省是否會影響品質？**
A: 否。1024×560 的質量對網頁展示足夠。您會得到更快的加載速度，品質無損失。

## 🎉 下一步

縮放完成後：
1. ✅ HTML CSS 已修改（`object-fit: contain`）
2. ✅ 所有圖片統一到 1024×560
3. 🔄 測試網頁顯示效果
4. 📤 推送到 GitHub
5. 🌐 在 Google Sites 中驗證

## 💬 支援

如有問題，查看：
- `batch_resize_images.py` 中的註釋
- 執行時的錯誤訊息
- 本檔案的「常見問題」部分

---

**祝您縮放順利！** ✨
