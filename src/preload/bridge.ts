import { ipcRenderer } from 'electron';
import { JsBridgeAPI } from './js-bridge';

export const bridge = new JsBridgeAPI();

bridge.registerHandler('apiInfo', (data, cb) => {
  ipcRenderer.once('api-info', (event, info) => cb(info));
  ipcRenderer.send('get-api-info');
});
bridge.registerHandler('getStartAtLogin', (data, cb) => {
  // TODO
  cb(false);
});
bridge.registerHandler('isSystemProxySet', (data, cb) => {
  ipcRenderer.once('proxy-state', (event, state) => cb(state));
  ipcRenderer.send('get-proxy-state');
});
bridge.registerHandler('setStartAtLogin', (data, cb) => {
  // TODO
  cb();
});
bridge.registerHandler('setSystemProxy', async (data, cb) => {
  ipcRenderer.once('set-system-proxy-success', () => cb());
  ipcRenderer.send('set-system-proxy', data);
});
