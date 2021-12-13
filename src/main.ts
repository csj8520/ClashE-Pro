import { app, BrowserWindow, protocol, shell, session, net } from 'electron';
import { fs } from './utils';
import path from 'path';
import { clashRun } from './utils/clash';
import { platform } from './utils/os';
import { clashConfigDir, clashDir, tempDir } from './utils/const';
import { copyDefaultConfig, initConfig } from './utils/config';
import { clearProxy, setProxy } from './utils/proxy';
// import { serve } from './utils/serve';

let clashProcess: AsyncReturn<typeof clashRun> | null = null;

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 1200,
    webPreferences: {
      preload: path.join(process.cwd(), 'dist/preload/index.js'),
      contextIsolation: false,
      nodeIntegration: true
    }
  });
  // const userAgent = mainWindow.webContents.getUserAgent() + ' ClashX Runtime';
  mainWindow.loadURL('http://127.0.0.1:9090/ui/index.html', { userAgent: 'ClashX Runtime' });
  // mainWindow.loadURL('http://127.0.0.1:3000/index.html', { userAgent: 'ClashX Runtime' });

  mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  // fix it
  // https://github.com/Dreamacro/clash/issues/1428
  if (platform === 'win32') {
    session.defaultSession.webRequest.onHeadersReceived({ urls: ['http://*/*.js'] }, (details, cb) => {
      cb({ responseHeaders: { ...details.responseHeaders, 'Content-Type': 'application/javascript', abc: '123' } });
    });
  }
  !(await fs.pathExists(tempDir)) && (await fs.mkdir(tempDir));
  !(await fs.pathExists(clashDir)) && (await fs.mkdir(clashDir));
  !(await fs.pathExists(clashConfigDir)) && (await fs.mkdirs(clashConfigDir));

  await copyDefaultConfig();
  const config = await initConfig();
  clashProcess = await clashRun(config.selected);
  config.autoSetProxy && setProxy({ http: '127.0.0.1:7890', https: '127.0.0.1:7890', socks: '127.0.0.1:7891' });

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

app.on('will-quit', async () => {
  clearProxy();
  clashProcess?.kill('SIGKILL');
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
