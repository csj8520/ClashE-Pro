import { ipcMain } from 'electron';
import { getApiInfo } from './config';
import { clearProxy, getProxyState } from '../lib/proxy';
import { autoSetProxy, systemProxyIsEnable } from './utils';

export const initMessage = () => {
  ipcMain.on('get-api-info', async event => {
    const apiInfo = await getApiInfo();
    event.reply('api-info', apiInfo);
  });

  ipcMain.on('get-proxy-state', async event => {
    event.reply('proxy-state', await systemProxyIsEnable());
  });

  ipcMain.on('set-system-proxy', async (event, enable: boolean) => {
    enable ? await autoSetProxy() : await clearProxy();
    event.reply('set-system-proxy-success');
  });
};
