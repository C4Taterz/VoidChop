const { contextBridge, nativeTheme } = require('electron');
const path = require('path');
const { trimAllAudio } = require(path.join(__dirname, 'trimmer.js'));

contextBridge.exposeInMainWorld('api', {
  runTrimmer: () => {
    trimAllAudio(
      msg => window.dispatchEvent(new CustomEvent('ffmpeg-log', { detail: msg })),
      err => window.dispatchEvent(new CustomEvent('ffmpeg-error', { detail: err }))
    );
  },
  toggleTheme: (mode) => {
    if (['light', 'dark'].includes(mode)) {
      nativeTheme.themeSource = mode;
      window.dispatchEvent(new CustomEvent('theme-change', { detail: mode }));
    }
  }
});
