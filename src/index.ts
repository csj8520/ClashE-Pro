import { app, BrowserWindow } from 'electron';

import { platform } from './main/os';
import { clashRun, killClash } from './main/clash';
import { clearProxy } from './main/proxy';
import { autoSetProxy, fs } from './main/utils';
import { autoUpdateAllRemoteConfig, copyDefaultConfig, initConfig } from './main/config';
import { createWindow, showWindow } from './main/window';
import { setTray, setAppMenu } from './main/menu';
import { fixJsMime } from './main/fix-js-mime';
import { initMessage } from './main/message';

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    showWindow();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  // ipcMain.on('get-debug-log', event => {
  //   const write = process.stdout.write;
  //   process.stdout.write = (...args: any) => {
  //     event.reply('debug-log', args[0].toString());
  //     return write.apply(process.stdout, args);
  //   };
  // });

  console.log('getAppPath', app.getPath('temp'));

  setTray();
  setAppMenu();
  initMessage();

  platform === 'win32' && fixJsMime();

  await copyDefaultConfig();
  const config = await initConfig();

  await autoUpdateAllRemoteConfig();

  await clashRun(config.selected);

  config.autoSetProxy && (await autoSetProxy());

  await createWindow();

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
  // if (process.platform !== 'darwin') {
  //   app.quit();
  // }
});

app.on('will-quit', async () => {
  clearProxy();
  killClash();
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
