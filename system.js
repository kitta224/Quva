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
});
