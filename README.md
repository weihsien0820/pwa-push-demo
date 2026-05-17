# PWA 推播通知測試專案 (Web Push Notification Demo)

這是一個純前端的 PWA 專案，旨在測試 Web Push Notification 功能。透過此專案，您可以體驗 PWA 的「加入主畫面」安裝提示，以及在不同平台上接收本地推播通知的效果。

## 🌟 專案功能

- **PWA 安裝** (Add to Home Screen)
- **離線存取** (Service Worker 靜態快取)
- **申請推播通知權限**
- **發送即時測試推播**
- **發送排程測試推播** (5 秒後)

## 🚀 GitHub Pages 部署步驟

為了讓 PWA 與 Service Worker 正常運作，網頁必須在 `HTTPS` 環境下運行。GitHub Pages 免費且預設提供 HTTPS，非常適合此專案。

1. **建立 GitHub 儲存庫：**
   - 在 GitHub 創建一個新的 Repository，例如命名為 `pwa-push-demo`。

2. **上傳檔案：**
   - 將本專案的所有檔案推播 (Push) 到該儲存庫中。
   - 請確保 `images` 資料夾中包含 `icon-192x192.png` 和 `icon-512x512.png` 兩個圖示檔案。

3. **開啟 GitHub Pages：**
   - 進入您的儲存庫的 **Settings** -> 左側選單 **Pages**。
   - 在 **Build and deployment** 底下的 **Source** 下拉選單中選擇 `Deploy from a branch`。
   - Branch 選擇 `main` (或 `master`) 分支，然後點擊 **Save**。
   - 等待幾分鐘（可至 Actions 標籤查看進度），Settings -> Pages 頁面上方會顯示您的專案網址，通常為 `https://<您的帳號>.github.io/<專案名稱>/`。

4. **開始測試：**
   - 開啟上述網址即可開始測試。
   > **💡 提示：** 本專案的程式碼（包含 manifest.json 與 Service Worker 註冊）皆使用**相對路徑** (`./`)，所以即使 GitHub Pages 帶有子目錄路徑，專案也能正常載入，不會發生 404 錯誤。

## 📱 跨平台測試指南與注意事項

### 💻 桌面版瀏覽器 (Chrome / Edge / Safari)
1. 開啟您的 GitHub Pages 網址。
2. 點擊「申請通知權限」，瀏覽器左上方會跳出系統權限請求，請點選「允許」。
3. 點擊「發送本地測試通知」，您應該會看到作業系統原生的通知彈出。
4. 在網址列右側，若出現「安裝」圖示，可以點擊將其安裝為桌面獨立應用程式。

### 🤖 Android 裝置 (Chrome)
1. 使用 Android Chrome 開啟您的 GitHub Pages 網址。
2. 網頁中會顯示「安裝應用程式到主畫面」的按鈕，點擊即可將 PWA 安裝至手機主畫面。
3. 點擊「申請通知權限」並允許後，點擊發送通知，即可在手機通知列看到推播。
4. **建議**：將 APP 安裝到主畫面後，從主畫面啟動應用程式（獨立模式），體驗會最接近原生 APP。

### 🍎 iOS 裝置 (Safari) - ⚠️ 極為重要
Apple 對 iOS 的 Web Push 有嚴格的限制與規範：
1. **支援版本**：必須為 **iOS 16.4 或更新版本** 才支援 Web Push。
2. **必須加到主畫面**：您**無法**直接在 Safari 瀏覽器中接收通知。
   - **操作步驟**：開啟網頁後，必須先點擊 Safari 畫面正下方的「分享」按鈕，然後選擇「**加入主畫面**」。
3. **從主畫面開啟**：請回到 iOS 桌面，點擊剛加入的「PWA推播」圖示來開啟應用。
4. **申請權限**：在從主畫面開啟的 PWA 介面中，點擊「申請通知權限」，此時 iOS 才會真正彈出允許推播的系統提示。
5. 允許後，點擊發送按鈕即可正常接收通知。
   > 🔴 **再次提醒**：如果不是從主畫面開啟，點擊申請權限按鈕將不會有任何反應或報錯，這是 iOS 的系統限制。

## 🛠️ 潛在錯誤排解

- **Service Worker 註冊失敗**：請確認您是使用 GitHub Pages 瀏覽 (`https://`)，如果使用本地 `file://` 路徑直接開啟 HTML，Service Worker 將無法運作。本地測試請使用 `localhost` 伺服器 (如 VSCode 的 Live Server)。
- **通知未顯示但權限已授予**：某些作業系統（如 Windows 11 或 macOS）若開啟了「勿擾模式」或「專注模式」，會隱藏所有通知。請檢查您的系統通知設定。
- **iOS 收不到通知**：請確保您的 iOS 升級至 16.4 以上，且確實是從「主畫面」啟動應用程式。
