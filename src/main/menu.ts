import { app, BrowserWindow, Menu, MenuItemConstructorOptions, Tray, shell, clipboard } from 'electron';
import debounce from 'lodash.debounce';
import path from 'path';

import { autoSetProxy, reload, systemProxyIsEnable } from './utils';
import { platform } from '../lib/os';
import { showWindow } from './window';
import { fetchClashConfig, fetchSetClashConfig, fetchClashGroups, fetchSetClashGroups } from './fetch';
import { clearProxy } from '../lib/proxy';
import { clearConfigCache, getConfig, setConfig, updateAllRemoteConfig } from './config';
import { DIR, FILE } from '../lib/paths';

// 防止gc回收
// https://blog.csdn.net/liu19721018/article/details/109046186
let tray!: Tray;

interface BuildMenu {
  sysProxy?: boolean;
  mode?: 'global' | 'rule' | 'direct' | 'script';
  groups?: API.Group[];
  config?: Config;
}

const getPolicyMenu = (groups: API.Group[]): MenuItemConstructorOptions[] => {
  return groups.map(it => ({
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
  }));
};

const getConfigMenu = (config?: Config): MenuItemConstructorOptions[] => {
  const configMenu: MenuItemConstructorOptions[] =
    config?.list.map(it => ({
      label: it.name,
      type: 'radio',
      checked: it.name === config.selected,
      async click() {
        if (config.selected === it.name) return;
        await setConfig({ ...config, selected: it.name });
        await reload();
      }
    })) ?? [];
  configMenu.push({ type: 'separator' });
  configMenu.push({
    label: '更新远程配置',
    type: 'normal',
    async click() {
      await updateAllRemoteConfig();
      await reload();
    }
  });
  configMenu.push({
    label: '重载本地配置',
    type: 'normal',
    async click() {
      clearConfigCache();
      await reload();
    }
  });
  configMenu.push({
    label: '打开配置文件夹',
    type: 'normal',
    click() {
      shell.showItemInFolder(FILE.config());
    }
  });
  return configMenu;
};

const getCopyCommandLineProxyMenu = (): MenuItemConstructorOptions[] => {
  const handleCopy = async (prefix: string, quot: string, join: string) => {
    const config = await fetchClashConfig();
    const http = config['mixed-port'] || config.port;
    const socks = config['mixed-port'] || config['socks-port'];
    let commands: string[] = [];
    if (http) {
      commands.push(`${prefix}http_proxy=${quot}http://127.0.0.1:${http}${quot}`);
      commands.push(`${prefix}https_proxy=${quot}http://127.0.0.1:${http}${quot}`);
    } else if (socks) {
      commands.push(`${prefix}socks_proxy=${quot}socks://127.0.0.1:${socks}${quot}`);
    }
    clipboard.writeText(commands.join(join));
  };

  if (platform === 'win32') {
    return [
      {
        label: '复制powershell命令行代理',
        type: 'normal',
        async click() {
          await handleCopy('$env:', '"', ';');
        }
      },
      {
        label: '复制cmd命令行代理',
        type: 'normal',
        click() {
          handleCopy('set ', '', ' && ');
        }
      }
    ];
  } else {
    return [
      {
        label: '复制命令行代理',
        type: 'normal',
        click() {
          handleCopy('export ', '"', ';');
        }
      }
    ];
  }
};

export const buildMenu = (op?: BuildMenu) => {
  const { sysProxy = false, mode = 'unknow', groups = [], config } = op || {};
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
      submenu: getPolicyMenu(groups)
    },
    {
      label: '配置',
      type: 'submenu',
      submenu: getConfigMenu(config)
    },
    { type: 'separator' },
    ...getCopyCommandLineProxyMenu(),
    { type: 'separator' },
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
      label: '关于',
      type: 'normal',
      click() {
        shell.openExternal('https://github.com/csj8520/ClashE-Pro');
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

  const menu = buildMenu({ sysProxy: await systemProxyIsEnable(), mode: clashConfig.mode, groups, config });
  tray.setContextMenu(menu);
  console.timeEnd('updateTray');
};

export const setTray = () => {
  tray = new Tray(path.join(DIR.assets(), 'tray.png'));
  const _updateTray = debounce(updateTray, 1000, { leading: true, trailing: false });

  tray.setToolTip('Clash Pro');
  tray.on('click', async () => {
    console.log('click tray');
    if (platform === 'win32') return showWindow();
    if (platform === 'linux') {
      _updateTray();
      return showWindow();
    }
  });

  // win11 not support
  // tray.on('right-click', () => {
  //   console.log('right-click');
  // });

  if (platform === 'win32') {
    // win useage
    tray.on('mouse-move', _updateTray);
  } else {
    // mac useage
    tray.on('mouse-enter', _updateTray);
  }
  _updateTray();
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
