import { BrowserWindow } from 'electron';
import { path } from '../utils';
import { cwd, extCtl } from '../utils/const';

export const createWindow = () => {
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 1200,
    icon: 'src/assets/logo.png',
    webPreferences: {
      preload: path.join(cwd, 'dist/preload/index.js'),
      contextIsolation: false,
      nodeIntegration: true
    }
  });
  mainWindow.loadURL(`http://${extCtl}/ui/index.html`, { userAgent: 'ClashX Runtime' });
  mainWindow.webContents.openDevTools();
};

export const showWindow = () => {
  const allWindow = BrowserWindow.getAllWindows();
  if (allWindow.length === 0) {
    createWindow();
  } else {
    allWindow.forEach(it => it.show());
  }
};
