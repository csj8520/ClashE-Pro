import { app, BrowserWindow, Menu, Tray } from 'electron';
import debounce from 'lodash.debounce';

import { autoSetProxy, path, restartClash } from './utils';
import { resourcesPath } from './const';
import { platform } from './os';
import { showWindow } from './window';
import { fetchClashConfig, fetchSetClashConfig, fetchClashGroups, fetchSetClashGroups } from './fetch';
import { clearProxy, getProxyState } from './proxy';
import { getConfig, setConfig } from './config';

// 防止gc回收
// https://blog.csdn.net/liu19721018/article/details/109046186
let tray!: Tray;

interface BuildMenu {
  sysProxy?: boolean;
  mode?: 'global' | 'rule' | 'direct' | 'script';
  groups?: API.Group[];
  config: Config;
}
export const buildMenu = (op?: BuildMenu) => {
  const { sysProxy = false, mode, groups = [], config } = op || {};
  return Menu.buildFromTemplate([
    {
      label: `出站规则(${mode})`,
      type: 'submenu',
      submenu: [
        {
          label: '全局连接',
          type: 'radio',
          checked: mode === 'global',
          click() {
            fetchSetClashConfig({ mode: 'global' });
          }
        },
        {
          label: '规则判断',
          type: 'radio',
          checked: mode === 'rule',
          click() {
            fetchSetClashConfig({ mode: 'rule' });
          }
        },
        {
          label: '脚本模式',
          type: 'radio',
          checked: mode === 'script',
          click() {
            fetchSetClashConfig({ mode: 'script' });
          }
        },
        {
          label: '直接连接',
          type: 'radio',
          checked: mode === 'direct',
          click() {
            fetchSetClashConfig({ mode: 'direct' });
          }
        }
      ]
    },
    {
      label: '策略组',
      type: 'submenu',
      submenu: groups.map(it => ({
        label: it.name,
        type: 'submenu',
        submenu: it.all.map(t => ({
          label: t,
          type: 'radio',
          checked: it.now === t,
          enabled: it.type === 'Selector',
          click() {
            fetchSetClashGroups({ group: it.name, value: t });
          }
        }))
      }))
    },
    {
      label: '配置',
      type: 'submenu',
      submenu: config?.list.map(it => ({
        label: it.name,
        type: 'radio',
        checked: it.name === config.selected,
        async click() {
          if (config.selected === it.name) return;
          await setConfig({ ...config, selected: it.name });
          await restartClash();
        }
      }))
    },
    {
      label: '设置为系统代理',
      type: 'checkbox',
      checked: sysProxy,
      click(it) {
        it.checked ? autoSetProxy() : clearProxy();
      }
    },
    {
      label: '控制台',
      type: 'normal',
      click: showWindow
    },
    {
      label: '打开DevTools',
      type: 'normal',
      click() {
        BrowserWindow.getAllWindows().forEach(it => it.webContents.openDevTools());
      }
    },
    {
      label: '退出',
      role: 'quit'
    }
  ]);
};

// 适配mac托盘
// https://newsn.net/say/electron-tray-ico-name.html
// https://www.h5w3.com/118589.html

// https://www.electronjs.org/docs/latest/api/tray

export const updateTray = async () => {
  if (!tray) return;
  console.log('updateTray');
  console.time('updateTray');
  const clashConfig = await fetchClashConfig();
  const groups = await fetchClashGroups({ mode: clashConfig.mode });
  const config = await getConfig();

  const menu = buildMenu({ sysProxy: getProxyState().http.enable, mode: clashConfig.mode, groups, config });
  tray.setContextMenu(menu);
  console.timeEnd('updateTray');
};

export const setTray = () => {
  tray = new Tray(path.join(resourcesPath, 'assets/tray.png'));

  tray.setToolTip('Clash Pro');
  tray.on('click', async () => {
    console.log('click me');
    if (platform === 'win32') return showWindow();
    // await updateTray();
  });

  // win11 not support
  // tray.on('right-click', () => {
  //   console.log('right-click');
  // });

  if (platform === 'win32') {
    // win useage
    tray.on('mouse-move', debounce(updateTray, 1000, { leading: true, trailing: false }));
  } else {
    // mac useage
    tray.on('mouse-enter', updateTray);
  }
  updateTray();
};

export const setAppMenu = () => {
  if (platform === 'darwin') {
    const _menu = Menu.buildFromTemplate([
      {
        label: app.getName(),
        submenu: [
          { label: '控制台', type: 'normal', click: showWindow },
          { label: '退出', role: 'quit' }
        ]
      }
    ]);
    Menu.setApplicationMenu(_menu);
  } else {
    Menu.setApplicationMenu(null);
  }
};
