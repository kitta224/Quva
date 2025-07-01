// シンプルWebブラウザ（タブ機能付き）

const tabBar = document.getElementById('tabBar');
const webviewContainer = document.getElementById('webviewContainer');
const urlInput = document.getElementById('urlInput');
const goBtn = document.getElementById('goBtn');
const newTabBtn = document.getElementById('newTabBtn');
const backBtn = document.getElementById('backBtn');
const forwardBtn = document.getElementById('forwardBtn');

let tabs = [];
let activeTabId = null;
let tabIdCounter = 0;

function createTab(url = 'https://www.bing.com') {
    const id = ++tabIdCounter;
    const tab = {
        id,
        url,
        history: [url],
        historyIndex: 0
    };
    tabs.push(tab);
    renderTabs();
    setActiveTab(id);
}

function closeTab(id) {
    const idx = tabs.findIndex(t => t.id === id);
    if (idx !== -1) {
        tabs.splice(idx, 1);
        if (tabs.length === 0) {
            createTab();
        } else {
            setActiveTab(tabs[Math.max(0, idx - 1)].id);
        }
    }
    renderTabs();
}

function setActiveTab(id) {
    activeTabId = id;
    renderTabs();
    renderWebviews();
}

function renderTabs() {
    tabBar.innerHTML = '';
    tabs.forEach(tab => {
        const tabElem = document.createElement('div');
        tabElem.className = 'tab' + (tab.id === activeTabId ? ' active' : '');
        tabElem.textContent = tab.url.replace(/^https?:\/\//, '').slice(0, 20) || '新しいタブ';
        tabElem.title = tab.url;
        tabElem.onclick = () => setActiveTab(tab.id);
        const closeBtn = document.createElement('span');
        closeBtn.className = 'close';
        closeBtn.textContent = '×';
        closeBtn.onclick = e => {
            e.stopPropagation();
            closeTab(tab.id);
        };
        tabElem.appendChild(closeBtn);
        tabBar.appendChild(tabElem);
    });
}

function renderWebviews() {
    webviewContainer.innerHTML = '';
    tabs.forEach(tab => {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.top = 0;
        wrapper.style.left = 0;
        wrapper.style.right = 0;
        wrapper.style.bottom = 0;
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.style.display = tab.id === activeTabId ? 'block' : 'none';

        const iframe = document.createElement('iframe');
        iframe.className = 'webview';
        iframe.src = tab.url;
        iframe.setAttribute('sandbox', 'allow-scripts allow-forms allow-same-origin');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        let errorShown = false;
        iframe.onload = () => {
            if (tab.id === activeTabId) {
                urlInput.value = tab.url;
            }
        };
        iframe.onerror = () => {
            if (!errorShown) {
                showIframeError(wrapper, tab.url);
                errorShown = true;
            }
        };
        // タイムアウトでエラー表示（X-Frame-Optionsはonerror発火しないため）
        setTimeout(() => {
            if (!iframe.contentWindow || !iframe.contentDocument || iframe.contentDocument.body.innerHTML === '') {
                showIframeError(wrapper, tab.url);
            }
        }, 1500);
        wrapper.appendChild(iframe);
        webviewContainer.appendChild(wrapper);
    });
    updateToolbar();
}

function showIframeError(wrapper, url) {
    wrapper.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#c00;font-size:1.2em;background:#fff;">
        このサイト（${url}）はセキュリティ上の理由で表示できません。<br>接続が拒否されました。
    </div>`;
}

function updateToolbar() {
    const tab = tabs.find(t => t.id === activeTabId);
    if (!tab) return;
    urlInput.value = tab.url;
    backBtn.disabled = tab.historyIndex === 0;
    forwardBtn.disabled = tab.historyIndex === tab.history.length - 1;
}

goBtn.onclick = () => {
    const url = normalizeUrl(urlInput.value);
    navigateTo(url);
};

urlInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        goBtn.click();
    }
});

newTabBtn.onclick = () => createTab();

backBtn.onclick = () => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab && tab.historyIndex > 0) {
        tab.historyIndex--;
        tab.url = tab.history[tab.historyIndex];
        renderWebviews();
    }
};

forwardBtn.onclick = () => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab && tab.historyIndex < tab.history.length - 1) {
        tab.historyIndex++;
        tab.url = tab.history[tab.historyIndex];
        renderWebviews();
    }
};

function navigateTo(url) {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab) {
        if (tab.url !== url) {
            tab.url = url;
            tab.history = tab.history.slice(0, tab.historyIndex + 1);
            tab.history.push(url);
            tab.historyIndex++;
        }
        renderWebviews();
    }
}

function normalizeUrl(input) {
    if (/^https?:\/\//.test(input)) return input;
    if (/^\w+\.\w+/.test(input)) return 'https://' + input;
    return 'https://www.bing.com/search?q=' + encodeURIComponent(input);
}

// 初期タブを作成
createTab();
