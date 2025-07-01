const { app, BrowserWindow, Menu, nativeTheme } = require('electron');
const path = require('path');

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: '#121f1f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
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
