const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');
const { trimAllAudio } = require(path.join(__dirname, 'trimmer.js'));
const { nativeTheme } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Open file picker via main process
  selectFiles: () => ipcRenderer.invoke('select-files'),

setDestinationFolder: () => ipcRenderer.invoke('set-destination-folder'),
getSavedDestination: () => ipcRenderer.invoke('get-saved-destination'),

  // Start trimming process with selected files
runTrimmer: (filePaths, outputPath) => {
  trimAllAudio(
    filePaths,
    outputPath,
    msg => window.dispatchEvent(new CustomEvent('ffmpeg-log', { detail: msg })),
    err => window.dispatchEvent(new CustomEvent('ffmpeg-error', { detail: err }))
  );
},

  // Theme toggle
  toggleTheme: (mode) => {
    if (['light', 'dark'].includes(mode)) {
      nativeTheme.themeSource = mode;
      window.dispatchEvent(new CustomEvent('theme-change', { detail: mode }));
    }
  }
});
