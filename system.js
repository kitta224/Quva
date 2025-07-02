let player;

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
    playYouTubeVideo(videoId);
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
            btn.textContent = item.snippet.title;
            btn.onclick = () => playYouTubeVideo(item.id.videoId);
            resultsDiv.appendChild(btn);
        });
    } else {
        resultsDiv.textContent = '見つかりませんでした。';
    }
});

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
