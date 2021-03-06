import { app } from 'electron';
import { autoUpdater } from 'electron-updater';

import { platform } from './lib/os';
import { clashRun, killClash } from './main/clash';
import { clearProxy } from './lib/proxy';
import { autoSetProxy } from './main/utils';
import { autoUpdateAllRemoteConfig, copyDefaultConfig, initConfig } from './main/config';
import { showWindow } from './main/window';
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

app.on('ready', async () => {
  console.log(`Current Version is ${app.getVersion()}`);
  process.env.TEMP = app.getPath('temp');
  process.env.HOME = app.getPath('home');

  initMessage();

  platform === 'win32' && fixJsMime();

  await copyDefaultConfig();
  const config = await initConfig();

  await autoUpdateAllRemoteConfig();

  await clashRun(config.selected);

  config.autoSetProxy && (await autoSetProxy());

  setAppMenu();
  await showWindow();
  setTray();

  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify({ title: '版本更新', body: '新版本ElectronClashPro（{version}）已下载，退出时将会自动安装。' });
  }, 1000 * 10);

  app.on('activate', function () {
    showWindow();
  });
});

// 必须监听此事件，否则会自动退出
app.on('window-all-closed', () => {});

app.on('will-quit', async () => {
  await clearProxy();
  killClash();
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
