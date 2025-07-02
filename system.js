let player;
let queue = [];
let nowPlayingIndex = 0;

function extractVideoId(url) {
    const regExp = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
}

function onYouTubeIframeAPIReady() {
    // 初期化時は何もしない
}

document.getElementById('play-btn').addEventListener('click', function() {
    const url = document.getElementById('youtube-url').value.trim();
    const videoId = extractVideoId(url);
    if (!videoId) {
        alert('有効なYouTube動画URLを入力してください');
        return;
    }
    addToQueue({
        title: url,
        videoId: videoId
    });
    if (queue.length === 1) {
        playQueueIndex(0);
    }
});

document.getElementById('search-btn').addEventListener('click', async function() {
    const query = document.getElementById('music-query').value.trim();
    const YT_API_KEY = document.getElementById('api-key').value.trim();
    if (!query) {
        alert('曲名やアーティスト名を入力してください');
        return;
    }
    if (!YT_API_KEY) {
        alert('YouTube APIキーを入力してください');
        return;
    }
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(query)}&key=${YT_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const resultsDiv = document.getElementById('search-results');
    resultsDiv.innerHTML = '';
    if (data.items && data.items.length > 0) {
        data.items.forEach(item => {
            const btn = document.createElement('button');
            btn.textContent = '▶ 再生';
            btn.className = 'queue-btn';
            btn.onclick = () => {
                addToQueue({
                    title: item.snippet.title,
                    videoId: item.id.videoId
                });
                if (queue.length === 1) {
                    playQueueIndex(0);
                }
            };
            const addBtn = document.createElement('button');
            addBtn.textContent = '＋キュー';
            addBtn.className = 'add-queue-btn';
            addBtn.onclick = () => {
                addToQueue({
                    title: item.snippet.title,
                    videoId: item.id.videoId
                });
            };
            const titleSpan = document.createElement('span');
            titleSpan.textContent = item.snippet.title;
            resultsDiv.appendChild(titleSpan);
            resultsDiv.appendChild(btn);
            resultsDiv.appendChild(addBtn);
            resultsDiv.appendChild(document.createElement('br'));
        });
    } else {
        resultsDiv.textContent = '見つかりませんでした。';
    }
});

function addToQueue(item) {
    queue.push(item);
    renderQueue();
}

function renderQueue() {
    const list = document.getElementById('queue-list');
    list.innerHTML = '';
    queue.forEach((item, idx) => {
        const li = document.createElement('li');
        const title = document.createElement('span');
        title.className = 'queue-title';
        title.textContent = (idx === nowPlayingIndex ? '▶ ' : '') + item.title;
        li.appendChild(title);
        // 上下ボタン
        const upBtn = document.createElement('button');
        upBtn.className = 'queue-btn';
        upBtn.disabled = idx === 0;
        upBtn.title = '上へ';
        upBtn.innerHTML = '<img src="img/dark/queue_play_next.svg" alt="up" width="18">';
        upBtn.onclick = () => moveQueue(idx, idx - 1);
        li.appendChild(upBtn);
        const downBtn = document.createElement('button');
        downBtn.className = 'queue-btn';
        downBtn.disabled = idx === queue.length - 1;
        downBtn.title = '下へ';
        downBtn.innerHTML = '<img src="img/dark/skip_next_24dp.svg" alt="down" width="18">';
        downBtn.onclick = () => moveQueue(idx, idx + 1);
        li.appendChild(downBtn);
        // 再生ボタン
        const playBtn = document.createElement('button');
        playBtn.className = 'queue-btn';
        playBtn.title = '再生';
        playBtn.innerHTML = '<img src="img/dark/queue_music.svg" alt="play" width="18">';
        playBtn.onclick = () => playQueueIndex(idx);
        li.appendChild(playBtn);
        // 削除ボタン
        const delBtn = document.createElement('button');
        delBtn.className = 'queue-btn';
        delBtn.title = '削除';
        delBtn.innerHTML = '<img src="img/dark/remove_from_queue.svg" alt="del" width="18">';
        delBtn.onclick = () => removeFromQueue(idx);
        li.appendChild(delBtn);
        list.appendChild(li);
    });
}

function moveQueue(from, to) {
    if (to < 0 || to >= queue.length) return;
    const [item] = queue.splice(from, 1);
    queue.splice(to, 0, item);
    if (nowPlayingIndex === from) nowPlayingIndex = to;
    else if (nowPlayingIndex === to) nowPlayingIndex = from;
    renderQueue();
}

function removeFromQueue(idx) {
    queue.splice(idx, 1);
    if (nowPlayingIndex >= queue.length) nowPlayingIndex = queue.length - 1;
    renderQueue();
}

function playQueueIndex(idx) {
    if (idx < 0 || idx >= queue.length) return;
    nowPlayingIndex = idx;
    playYouTubeVideo(queue[idx].videoId);
    renderQueue();
}

function playYouTubeVideo(videoId) {
    if (player) {
        player.loadVideoById(videoId);
    } else {
        player = new YT.Player('player', {
            height: '240',
            width: '100%',
            videoId: videoId,
            playerVars: {
                'autoplay': 1,
                'controls': 1,
                'rel': 0
            },
            events: {
                'onStateChange': onPlayerStateChange
            }
        });
    }
}

function onPlayerStateChange(event) {
    // 再生終了時
    if (event.data === YT.PlayerState.ENDED) {
        if (queue.length > 0) {
            queue.splice(nowPlayingIndex, 1);
            if (nowPlayingIndex >= queue.length) nowPlayingIndex = queue.length - 1;
            renderQueue();
            if (queue.length > 0 && nowPlayingIndex >= 0) {
                playQueueIndex(nowPlayingIndex);
            }
        }
    }
}
// SoundCloudやSpotifyの埋め込みはAPIキーや認証が必要なため、まずはYouTubeのみ実装。

// スプリットバーによるリサイズ機能
function makeResizableBar(barId, leftPanel, rightPanel, isLeftBar) {
    const bar = document.getElementById(barId);
    let isDragging = false;
    bar.addEventListener('mousedown', function(e) {
        isDragging = true;
        document.body.style.cursor = 'col-resize';
    });
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        const container = document.querySelector('.split-container');
        const rect = container.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let min = 180, max = 600;
        if (isLeftBar) {
            if (x < min) x = min;
            if (x > max) x = max;
            leftPanel.style.width = x + 'px';
        } else {
            let total = rect.width;
            let rightWidth = total - x;
            if (rightWidth < min) rightWidth = min;
            if (rightWidth > max) rightWidth = max;
            rightPanel.style.width = rightWidth + 'px';
        }
    });
    document.addEventListener('mouseup', function() {
        isDragging = false;
        document.body.style.cursor = '';
    });
}
window.addEventListener('DOMContentLoaded', function() {
    makeResizableBar('bar-left', document.querySelector('.left-panel'), null, true);
    makeResizableBar('bar-right', null, document.querySelector('.right-panel'), false);
});
