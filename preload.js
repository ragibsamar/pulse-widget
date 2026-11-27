const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  pickFiles: () => ipcRenderer.invoke('pick-files'),
  ytSearch: q => ipcRenderer.invoke('yt-search', q),
  ytStream: id => ipcRenderer.invoke('yt-stream', id),
  win: cmd => ipcRenderer.send('win', cmd)
});
