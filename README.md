# Pulse Widget (learning project)
Compact Windows music widget: local files + YouTube search/stream via yt-dlp.

## Run
1. Install Node.js 18+.
2. Download yt-dlp.exe (github.com/yt-dlp/yt-dlp/releases) and put it in this folder (or add to PATH).
3. `npm install` then `npm start`.

## Use
- Queue tab: "Add local files". Search tab: type a query, click a result to play.
- Space = play/pause, Left/Right = seek 5s. Waveform bar is clickable. Pin = always on top, ▾ = mini/full.

## Structure
- main.js: window, file dialog, yt-dlp calls (search = ytsearch10, stream = bestaudio -g)
- preload.js: safe bridge (window.api)
- index.html: UI + player logic (replace with your web-version design later)

## Notes
- yt-dlp stream URLs expire after a few hours; the app fetches a fresh one on each play.
- Next steps: save queue to JSON, music-metadata for tags/art, Windows media keys, sync layer with the main player.
