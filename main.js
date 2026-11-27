const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

let win;
const SIZES = { mini: [400, 92], full: [400, 640] };

// Uses yt-dlp.exe placed next to main.js, otherwise falls back to PATH.
const YTDLP = fs.existsSync(path.join(__dirname, 'yt-dlp.exe')) ? path.join(__dirname, 'yt-dlp.exe') : 'yt-dlp';

function run(args) {
  return new Promise((resolve, reject) => {
    const p = spawn(YTDLP, args, { windowsHide: true });
    let out = '', err = '';
    p.stdout.on('data', d => (out += d));
    p.stderr.on('data', d => (err += d));
    p.on('error', () => reject(new Error('yt-dlp not found. Put yt-dlp.exe in the app folder or add it to PATH.')));
    p.on('close', code => (code === 0 ? resolve(out) : reject(new Error(err.trim().split('\n').pop() || 'yt-dlp failed'))));
  });
}

function createWindow() {
  win = new BrowserWindow({
    width: SIZES.full[0], height: SIZES.full[1],
    frame: false, transparent: true, resizable: false, hasShadow: false,
    alwaysOnTop: true, backgroundColor: '#00000000',
    webPreferences: { preload: path.join(__dirname, 'preload.js') }
  });
  win.loadFile('index.html');
}

ipcMain.handle('pick-files', async () => {
  const r = await dialog.showOpenDialog(win, {
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Audio', extensions: ['mp3', 'flac', 'wav', 'm4a', 'ogg', 'aac', 'opus'] }]
  });
  return r.canceled ? [] : r.filePaths.map(p => ({
    type: 'local', title: path.parse(p).name, artist: 'Local file',
    src: pathToFileURL(p).href
  }));
});

ipcMain.handle('yt-search', async (_e, q) => {
  const out = await run(['ytsearch10:' + q, '--flat-playlist', '--dump-json', '--no-warnings']);
  return out.trim().split('\n').filter(Boolean).map(l => {
    const j = JSON.parse(l);
    const th = j.thumbnails && j.thumbnails.length ? j.thumbnails[j.thumbnails.length - 1].url : '';
    return { type: 'yt', id: j.id, title: j.title, artist: j.channel || j.uploader || 'YouTube', dur: j.duration || 0, thumb: th };
  });
});

ipcMain.handle('yt-stream', async (_e, id) => {
  const out = await run(['-f', 'bestaudio', '-g', '--no-playlist', '--no-warnings', 'https://www.youtube.com/watch?v=' + id]);
  return out.trim().split('\n')[0];
});

ipcMain.on('win', (_e, cmd) => {
  if (cmd === 'close') app.quit();
  else if (cmd === 'min') win.minimize();
  else if (cmd === 'pin') win.setAlwaysOnTop(!win.isAlwaysOnTop());
  else if (SIZES[cmd]) win.setSize(...SIZES[cmd]);
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
