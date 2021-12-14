import { ipcMain } from 'electron';
import { extCtl } from './const';
import { clearProxy, getProxyState } from './proxy';
import { autoSetProxy } from './utils';

export const initMessage = () => {
  ipcMain.on('get-api-info', event => {
    const [host, port] = extCtl.split(':');
    event.reply('api-info', { host, port, secret: '' });
  });

  ipcMain.on('get-proxy-state', event => {
    event.reply('proxy-state', getProxyState().http.enable);
  });

  ipcMain.on('set-system-proxy', async (event, enable: boolean) => {
    enable ? await autoSetProxy() : clearProxy();
    event.reply('set-system-proxy-success');
  });
};
