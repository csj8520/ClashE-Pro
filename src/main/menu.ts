import { app, Menu, Tray } from 'electron';
import { autoSetProxy, path } from './utils';
import { resourcesPath } from './const';
import { platform } from './os';
import { showWindow } from './window';
import { fetchClashConfig, fetchSetClashConfig } from './fetch';
import { clearProxy, getProxyState } from './proxy';

// 防止gc回收
// https://blog.csdn.net/liu19721018/article/details/109046186
let tray!: Tray;

enum menuId {
  'mode' = 'mode',
  'modeGlobal' = 'mode-global',
  'modeRule' = 'mode-rule',
  'modeScript' = 'mode-script',
  'modeDirect' = 'mode-direct',
  'proxy' = 'proxy',
  'control' = 'control',
  'exit' = 'exit'
}
export const menu = Menu.buildFromTemplate([
  {
    id: menuId.mode,
    label: '出站规则',
    type: 'submenu',
    submenu: [
      {
        id: menuId.modeGlobal,
        label: '全局连接',
        type: 'radio',
        click() {
          fetchSetClashConfig({ mode: 'global' });
        }
      },
      {
        id: menuId.modeRule,
        label: '规则判断',
        type: 'radio',
        click() {
          fetchSetClashConfig({ mode: 'rule' });
        }
      },
      {
        id: menuId.modeScript,
        label: '脚本模式',
        type: 'radio',
        click() {
          fetchSetClashConfig({ mode: 'script' });
        }
      },
      {
        id: menuId.modeDirect,
        label: '直接连接',
        type: 'radio',
        click() {
          fetchSetClashConfig({ mode: 'direct' });
        }
      }
    ]
  },
  {
    id: menuId.proxy,
    label: '设置为系统代理',
    type: 'checkbox',
    click(it) {
      it.checked ? autoSetProxy() : clearProxy();
    }
  },
  {
    id: menuId.control,
    label: '控制台',
    type: 'normal',
    click() {
      showWindow();
    }
  },
  {
    id: menuId.exit,
    label: '退出',
    type: 'normal',
    click() {
      app.quit();
    }
  }
]);

// 适配mac托盘
// https://newsn.net/say/electron-tray-ico-name.html
// https://www.h5w3.com/118589.html

// https://www.electronjs.org/docs/latest/api/tray

export const setTray = () => {
  tray = new Tray(path.join(resourcesPath, 'assets/tray.png'));

  tray.setToolTip('Clash Pro');
  tray.on('click', async () => {
    console.log('click me');
    if (platform === 'win32') return showWindow();
    const config = await fetchClashConfig();
    // mac not support change label, win ?
    menu.getMenuItemById(menuId.mode)!.label = `出站规则(${config.mode})`;
    const modeSub = { global: menuId.modeGlobal, rule: menuId.modeRule, script: menuId.modeScript, direct: menuId.modeDirect };
    menu.getMenuItemById(modeSub[config.mode])!.checked = true;
    menu.getMenuItemById(menuId.proxy)!.checked = getProxyState().http.enable;
    // tray.setContextMenu(menu);
  });
  tray.on('right-click', () => {
    console.log('right-click');
  });
  tray.setContextMenu(menu);
};

export const setAppMenu = () => {
  if (platform === 'darwin') {
    const _menu = Menu.buildFromTemplate([{ label: app.getName() }]);
    Menu.setApplicationMenu(_menu);
  } else {
    Menu.setApplicationMenu(null);
  }
};
