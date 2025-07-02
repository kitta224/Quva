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
        upBtn.textContent = '↑';
        upBtn.className = 'queue-btn';
        upBtn.disabled = idx === 0;
        upBtn.onclick = () => moveQueue(idx, idx - 1);
        li.appendChild(upBtn);
        const downBtn = document.createElement('button');
        downBtn.textContent = '↓';
        downBtn.className = 'queue-btn';
        downBtn.disabled = idx === queue.length - 1;
        downBtn.onclick = () => moveQueue(idx, idx + 1);
        li.appendChild(downBtn);
        // 再生ボタン
        const playBtn = document.createElement('button');
        playBtn.textContent = '再生';
        playBtn.className = 'queue-btn';
        playBtn.onclick = () => playQueueIndex(idx);
        li.appendChild(playBtn);
        // 削除ボタン
        const delBtn = document.createElement('button');
        delBtn.textContent = '削除';
        delBtn.className = 'queue-btn';
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
            height: '200',
            width: '100%',
            videoId: videoId,
            playerVars: {
                'autoplay': 1,
                'controls': 1,
                'rel': 0
            }
        });
    }
}
// SoundCloudやSpotifyの埋め込みはAPIキーや認証が必要なため、まずはYouTubeのみ実装。
