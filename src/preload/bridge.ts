import { autoSetProxy } from '../utils';
import { extCtl } from '../utils/const';
import { JsBridgeAPI } from './js-bridge';
import { clearProxy, getProxyState, setProxy } from '../utils/proxy';

export const bridge = new JsBridgeAPI();

bridge.registerHandler('apiInfo', (data, cb) => {
  const [host, port] = extCtl.split(':');
  cb({ host, port, secret: '' });
});
bridge.registerHandler('getStartAtLogin', (data, cb) => {
  // TODO
  cb(false);
});
bridge.registerHandler('isSystemProxySet', (data, cb) => {
  cb(getProxyState().http.enable);
});
bridge.registerHandler('setStartAtLogin', (data, cb) => {
  // TODO
  cb();
});
bridge.registerHandler('setSystemProxy', async (data, cb) => {
  data ? await autoSetProxy() : clearProxy();
  cb();
});
