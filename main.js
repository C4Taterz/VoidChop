// TO UPDATE THE APP. type "npm run build -- --win --x64 --publish=always"  

const { app, BrowserWindow, Menu, nativeTheme } = require('electron');
const { ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

if (app.isPackaged) {
  const { updateElectronApp, UpdateSourceType } = require('update-electron-app');

  updateElectronApp({
    updateSource: {
      type: UpdateSourceType.StaticStorage,
baseUrl: 'https://github.com/C4Taterz/VoidChop/releases/latest/download'
    },
    logger: require('electron-log')
  });
} else {
  console.log('🚧 Skipping auto-update check in development');
}

const settingsPath = path.join(app.getPath('userData'), 'settings.json');

app.disableHardwareAcceleration();

// Helper functions
function loadSettings() {
  try {
    return JSON.parse(fs.readFileSync(settingsPath));
  } catch {
    return {};
  }
}

function saveSettings(data) {
  fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2));
}


function createWindow () {
  const win = new BrowserWindow({
    width: 600,
    height: 750,
    backgroundColor: '#121f1f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

ipcMain.handle('select-files', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'mp4'] }]
  });

  if (result.canceled) return [];

  // ✅ Just return selected file paths — don’t copy anything
  return result.filePaths;
});

const { trimAllAudio } = require('./trimmer');
const { shell } = require('electron');

ipcMain.handle('trim-audio', async (event, files, outputDir) => {
  console.log('🔁 Trimming triggered:', files, outputDir);

  const start = Date.now();

  trimAllAudio(
    files,
    outputDir,
    msg => {
      console.log('[ffmpeg-log]', msg);
      event.sender.send('ffmpeg-log', msg);
    },
    err => {
      console.error('[ffmpeg-error]', err);
      event.sender.send('ffmpeg-error', err);
    },
    () => {
      const duration = ((Date.now() - start) / 1000).toFixed(1);
      console.log('✅ Trimming complete.');
      event.sender.send('ffmpeg-log', `🎉 All files finished trimming.\n⏱️ Done in ${duration}s`);
      shell.openPath(outputDir);
    }
  );
});



ipcMain.handle('set-destination-folder', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (result.canceled || !result.filePaths.length) return null;

  const folder = result.filePaths[0];

  // 💾 Persist it!
  const current = loadSettings();
  current.lastOutputPath = folder;
  saveSettings(current);

  return folder;
});

ipcMain.handle('get-saved-destination', () => {
  const current = loadSettings();
  return current.lastOutputPath || null;
});


  const isMac = process.platform === 'darwin';

  const menuTemplate = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),

    {
      label: 'File',
      submenu: [ { role: 'quit' } ]
    },

    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' }
      ]
    },

    {
      label: 'View',
      submenu: [
        {
          label: 'Light Mode',
          click: () => nativeTheme.themeSource = 'light'
        },
        {
          label: 'Dark Mode',
          click: () => nativeTheme.themeSource = 'dark'
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'toggleDevTools' }
      ]
    },

    {
      label: 'Window',
      submenu: [ { role: 'minimize' }, { role: 'close' } ]
    },

    {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            const { shell } = require('electron');
            await shell.openExternal('https://electronjs.org');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);
