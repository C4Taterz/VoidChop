const { contextBridge, ipcRenderer } = require('electron');
const { nativeTheme } = require('electron');
// Optionally import `app` if you expose it another way

contextBridge.exposeInMainWorld('api', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  selectFiles: () => ipcRenderer.invoke('select-files'),
  setDestinationFolder: () => ipcRenderer.invoke('set-destination-folder'),
  getSavedDestination: () => ipcRenderer.invoke('get-saved-destination'),
  runTrimmer: (filePaths, outputPath) => ipcRenderer.invoke('trim-audio', filePaths, outputPath),

  toggleTheme: (mode) => {
    if (['light', 'dark'].includes(mode)) {
      nativeTheme.themeSource = mode;
      window.dispatchEvent(new CustomEvent('theme-change', { detail: mode }));
    }
  }
});


ipcRenderer.on('ffmpeg-log', (event, msg) => {
  window.dispatchEvent(new CustomEvent('ffmpeg-log', { detail: msg }));
});

ipcRenderer.on('ffmpeg-error', (event, err) => {
  window.dispatchEvent(new CustomEvent('ffmpeg-error', { detail: err }));
});

