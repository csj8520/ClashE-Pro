import { app, Menu, Tray } from 'electron';
import { platform } from '../utils/os';
import { showWindow } from './window';
// 防止gc回收
// https://blog.csdn.net/liu19721018/article/details/109046186
let tray!: Tray;
export const setTray = () => {
  tray = new Tray('src/assets/logo.png');
  const contentMenu = Menu.buildFromTemplate([
    {
      label: '控制台',
      type: 'normal',
      click() {
        showWindow();
      }
    },
    {
      label: '退出',
      type: 'normal',
      click() {
        app.quit();
      }
    }
  ]);
  tray.setToolTip('Clash Pro');
  tray.on('click', () => {
    console.log('click me');
    if (platform === 'win32') {
      showWindow();
    }
  });
  tray.setContextMenu(contentMenu);
};