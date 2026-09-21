const CACHE_NAME = 'pwa-push-demo-v6';

// 要快取的檔案清單 (使用相對路徑，以配合 GitHub Pages)
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './images/diula-logo-192.png',
    './images/diula-logo-512.png'
];

// === 1. 安裝事件 ===
// 當瀏覽器初次載入這個檔案，或檔案有更新時觸發
self.addEventListener('install', (event) => {
    console.log('[Service Worker] 安裝中 (Install)');
    
    // skipWaiting() 會強制讓新的 Service Worker 立即接管，不用等待舊的 SW 關閉
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] 正在快取靜態資源');
            // 將所有檔案加入快取
            // cache: 'reload' 會略過瀏覽器的 HTTP 快取，確保存進去的是伺服器上的最新版本
            // 使用 Promise.all 和 catch 確保如果其中一個檔案 (例如圖片) 找不到，不會導致整個快取失敗
            return Promise.all(
                ASSETS_TO_CACHE.map(url => {
                    return cache.add(new Request(url, { cache: 'reload' })).catch(err => {
                        console.warn(`[Service Worker] 無法快取資源: ${url}`, err);
                    });
                })
            );
        })
    );
});

// === 2. 啟用事件 ===
// 在 install 後觸發，適合用來清理舊版的快取
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] 啟用中 (Activate)');
    
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                // 如果快取名稱不等於目前的 CACHE_NAME，代表是舊的，就刪除它
                if (key !== CACHE_NAME) {
                    console.log('[Service Worker] 刪除舊快取:', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    // claim() 會確保即使是第一次載入，畫面上的 fetch 請求也會立刻被這個 SW 攔截
    return self.clients.claim();
});

// === 3. 攔截請求事件 ===
// 提供離線存取能力。採用 Cache First (快取優先) 策略。
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // 如果在快取中找到對應的資源，就直接回傳快取；否則透過網路抓取
            return response || fetch(event.request);
        })
    );
});

// === 4. 監聽 Push 推播事件 ===
// 若有後端伺服器發送 push 訊息過來，會觸發這個事件
// (本測試專案主要由前端透過 showNotification 觸發，但為了功能完整性仍保留此監聽)
self.addEventListener('push', (event) => {
    console.log('[Service Worker] 收到 Push 推播事件');
    
    // 預設的通知內容
    let payload = {
        title: '收到遠端推播！',
        body: '這是一則預設的推播內容。',
        icon: './images/diula-logo-192.png',
        url: './'
    };

    // 如果推播中帶有資料，嘗試解析
    if (event.data) {
        try {
            // 如果後端傳的是 JSON
            const data = event.data.json();
            payload.title = data.title || payload.title;
            payload.body = data.body || payload.body;
            payload.icon = data.icon || payload.icon;
            payload.url = data.url || payload.url;
        } catch (e) {
            // 如果後端只傳純文字
            payload.body = event.data.text();
        }
    }

    const options = {
        body: payload.body,
        icon: payload.icon,
        badge: './images/diula-logo-192.png',
        vibrate: [200, 100, 200],
        data: {
            url: payload.url
        }
    };

    // waitUntil 確保在推播顯示完成前，Service Worker 不會進入休眠
    event.waitUntil(
        self.registration.showNotification(payload.title, options)
    );
});

// === 5. 監聽通知點擊事件 ===
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] 使用者點擊了通知');
    
    // 點擊後關閉通知卡片
    event.notification.close();

    // 取得通知挾帶的目標網址
    const urlToOpen = event.notification.data?.url || './';

    // 檢查目前是否已經有開啟該 PWA 的視窗
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // 迴圈檢查已開啟的視窗
            for (let client of windowClients) {
                // 如果已經有一個視窗符合這個網址 (或者是主機名)，且支援 focus
                if (client.url.includes(new URL(urlToOpen, self.location.origin).href) && 'focus' in client) {
                    // 將畫面切換過去
                    return client.focus();
                }
            }
            // 如果都沒開啟，就開啟一個新視窗/分頁
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
