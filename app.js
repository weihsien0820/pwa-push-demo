// 取得 DOM 元素
const btnRequestPermission = document.getElementById('btn-request-permission');
const btnSendNotification = document.getElementById('btn-send-notification');
const btnScheduleNotification = document.getElementById('btn-schedule-notification');
const btnInstall = document.getElementById('btn-install');
const permissionStatus = document.getElementById('permission-status');
const installStatus = document.getElementById('install-status');
const logContainer = document.getElementById('log-container');

/**
 * 記錄系統日誌到畫面上
 * @param {string} message - 要顯示的訊息
 */
function log(message) {
    const time = new Date().toLocaleTimeString();
    const div = document.createElement('div');
    div.innerHTML = `<span class="log-time">[${time}]</span> ${message}`;
    // 將最新訊息加在最上方
    logContainer.prepend(div);
}

/**
 * 根據權限狀態更新按鈕與標籤的 UI
 * @param {string} permission - 'granted', 'denied', 或 'default'
 */
function updateUIFromPermission(permission) {
    permissionStatus.textContent = permission;
    permissionStatus.className = `badge ${permission}`;

    // 如果允許推播，啟用發送按鈕
    if (permission === 'granted') {
        btnRequestPermission.disabled = true;
        btnSendNotification.disabled = false;
        btnScheduleNotification.disabled = false;
        btnRequestPermission.textContent = '已獲得權限';
    } else if (permission === 'denied') {
        btnRequestPermission.disabled = true;
        btnSendNotification.disabled = true;
        btnScheduleNotification.disabled = true;
        btnRequestPermission.textContent = '權限已被拒絕';
    } else {
        btnRequestPermission.disabled = false;
        btnSendNotification.disabled = true;
        btnScheduleNotification.disabled = true;
    }
}

/**
 * 1. 註冊 Service Worker
 * 這是 PWA 最重要的核心，必須註冊才能離線運行及接收推播
 */
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            // 使用相對路徑註冊，這樣在 GitHub Pages 子路徑上也能正確運作
            // scope 預設會是 service-worker.js 所在的目錄
            const registration = await navigator.serviceWorker.register('./service-worker.js');
            log(`Service Worker 註冊成功！Scope: ${registration.scope}`);
        } catch (error) {
            log(`Service Worker 註冊失敗: ${error}`);
            console.error('Service Worker 註冊失敗:', error);
        }
    } else {
        log('⚠️ 此瀏覽器不支援 Service Worker');
    }
}

/**
 * 2. 申請通知權限
 */
async function requestNotificationPermission() {
    // 檢查瀏覽器是否支援通知 API
    if (!('Notification' in window)) {
        log('⚠️ 此瀏覽器不支援通知 API');
        alert('此瀏覽器不支援通知 API');
        return;
    }

    try {
        log('正在請求通知權限...');
        // 請求權限
        const permission = await Notification.requestPermission();
        log(`通知權限狀態: ${permission}`);
        updateUIFromPermission(permission);
        
        if (permission !== 'granted') {
            alert('您尚未允許通知權限，將無法收到推播測試。');
        } else {
            log('太棒了！您現在可以接收通知了。');
        }
    } catch (error) {
        log(`申請權限發生錯誤: ${error}`);
    }
}

/**
 * 3. 發送本地測試通知
 * 透過 Service Worker 的 registration.showNotification 來發送
 */
async function sendLocalNotification(title, options) {
    if (Notification.permission === 'granted') {
        // 確保 Service Worker 準備就緒
        const registration = await navigator.serviceWorker.ready;
        try {
            await registration.showNotification(title, options);
            log(`已發送通知: ${title}`);
        } catch (error) {
            log(`發送通知失敗: ${error}`);
        }
    } else {
        log('沒有通知權限，無法發送');
    }
}

// === 綁定按鈕點擊事件 ===

btnRequestPermission.addEventListener('click', requestNotificationPermission);

// DiuLa! 協尋通知內容
const DIULA_URL = 'https://diula-py.github.io/diula-outter/';
const DIULA_TITLE = '【DiuLa!】找到 5 件可能是你的皮夾/錢包';
const DIULA_OPTIONS = {
    body: [
        '🔔 DiuLa! 協尋通知',
        '找到 5 件可能是你要找的「皮夾/錢包」：',
        '・皮夾（台北市 2026-09-18｜相符度 87%）',
        '・錢包（新北市 2026-09-18｜相符度 74%）',
        '・皮夾（台中市 2026-09-19｜相符度 68%）',
        '・錢包（桃園市 2026-09-19｜相符度 65%）',
        '・皮夾（高雄市 2026-09-20｜相符度 61%）',
        '',
        `👉 看全部並認領：${DIULA_URL}`,
        '（若已找到，可在協尋頁按「我找到了」停止通知）'
    ].join('\n'),
    icon: './images/diula-logo-192.png',
    badge: './images/diula-logo-192.png', // Android 狀態列圖示
    vibrate: [200, 100, 200, 100, 200], // 手機震動模式
    data: {
        url: DIULA_URL // 點擊通知時導向的網址
    }
};

btnSendNotification.addEventListener('click', () => {
    sendLocalNotification(DIULA_TITLE, DIULA_OPTIONS);
});

btnScheduleNotification.addEventListener('click', () => {
    log('計時器啟動，5秒後將發出通知...');
    btnScheduleNotification.disabled = true;
    
    setTimeout(() => {
        sendLocalNotification(DIULA_TITLE, DIULA_OPTIONS);
        btnScheduleNotification.disabled = false;
    }, 5000);
});


// === 4. 處理 PWA 安裝提示 (beforeinstallprompt) ===
let deferredPrompt;

// 檢查是否已在獨立模式 (已安裝) 下運行
function checkInstallStatus() {
    // 判斷是否從主畫面啟動 (PWA Standalone)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
        installStatus.textContent = '已安裝 (Standalone)';
        installStatus.className = 'badge installed';
        btnInstall.classList.add('hidden');
        log('目前以獨立應用程式模式運行');
    } else {
        installStatus.textContent = '未安裝 (瀏覽器模式)';
    }
}

// 監聽可安裝事件 (通常在 Chrome/Edge 觸發)
window.addEventListener('beforeinstallprompt', (e) => {
    // 防止舊版 Chrome 自動顯示提示
    e.preventDefault();
    // 儲存事件，以便我們稍後透過按鈕觸發
    deferredPrompt = e;
    
    // 顯示「安裝到主畫面」的按鈕
    btnInstall.classList.remove('hidden');
    log('觸發可安裝事件 (beforeinstallprompt)，可顯示安裝按鈕');
});

// 使用者點擊我們的安裝按鈕
btnInstall.addEventListener('click', async () => {
    if (deferredPrompt) {
        // 顯示系統安裝提示
        deferredPrompt.prompt();
        // 等待使用者點選「安裝」或「取消」
        const { outcome } = await deferredPrompt.userChoice;
        log(`使用者對安裝提示的回應: ${outcome}`);
        
        // deferredPrompt 只能使用一次，用完即丟棄
        deferredPrompt = null;
        // 隱藏安裝按鈕
        btnInstall.classList.add('hidden');
    }
});

// 監聽成功安裝完成的事件
window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    log('🎉 PWA 已成功安裝到您的裝置上！');
    checkInstallStatus();
});

// === 初始化 ===
window.addEventListener('load', () => {
    // 啟動時記錄一次狀態
    log('系統初始化中...');
    
    // 檢查現有的權限狀態
    if ('Notification' in window) {
        updateUIFromPermission(Notification.permission);
    } else {
        updateUIFromPermission('不支援');
    }
    
    // 檢查安裝狀態
    checkInstallStatus();
    
    // 註冊 Service Worker
    registerServiceWorker();
});
