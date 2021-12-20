import { app, BrowserWindow } from 'electron';
import { path } from './utils';
import { resourcesPath } from './const';
import { getApiInfo } from './config';

let mainWindow: BrowserWindow | null = null;

export const createWindow = async () => {
  mainWindow = new BrowserWindow({
    height: 600,
    width: 1200,
    icon: path.join(resourcesPath, 'assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: false,
      nodeIntegration: true
    }
  });
  const { host, port } = await getApiInfo();
  mainWindow.loadURL(`http://${host}:${port}/ui/`, { userAgent: 'ClashX Runtime' });
  app.isPackaged || mainWindow.webContents.openDevTools();
  return mainWindow;
};

export const getMainWindow = () => (mainWindow?.isDestroyed() ? null : mainWindow);

export const showWindow = () => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow();
  } else {
    mainWindow.show();
  }
};
