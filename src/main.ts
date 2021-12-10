import { app, BrowserWindow, protocol } from 'electron';
import path from 'path';
import { serve } from './serve';

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !false,
      contextIsolation: false,
      allowRunningInsecureContent: !true,
      nodeIntegration: true
    }
  });
  // const userAgent = mainWindow.webContents.getUserAgent() + ' ClashX Runtime';
  // mainWindow.loadURL('http://127.0.0.1:9092/index.html?host=127.0.0.1&port=9091&secret=', { userAgent: 'ClashX Runtime' });
  mainWindow.loadURL('http://127.0.0.1:3000/index.html?host=127.0.0.1&port=9091&secret=', { userAgent: 'ClashX Runtime' });

  mainWindow.webContents.openDevTools({ mode: 'undocked' });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  // protocol.registerStringProtocol('https', (req, cb) => {
  //   console.log(132446);
  //   cb({ url: req.url, referrer: req.referrer });
  // });

  serve();
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
