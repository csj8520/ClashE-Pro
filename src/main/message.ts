import { ipcMain } from 'electron';
import { getApiInfo } from './config';
import { clearProxy, getProxyState } from './proxy';
import { autoSetProxy } from './utils';

export const initMessage = () => {
  ipcMain.on('get-api-info', async event => {
    const apiInfo = await getApiInfo();
    event.reply('api-info', apiInfo);
  });

  ipcMain.on('get-proxy-state', event => {
    event.reply('proxy-state', getProxyState().http.enable);
  });

  ipcMain.on('set-system-proxy', async (event, enable: boolean) => {
    enable ? await autoSetProxy() : clearProxy();
    event.reply('set-system-proxy-success');
  });
};
