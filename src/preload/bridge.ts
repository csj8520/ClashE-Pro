// import { autoSetProxy } from '../main';
// import { extCtl } from '../main/const';
import { JsBridgeAPI } from './js-bridge';
// import { clearProxy, getProxyState, setProxy } from '../main/proxy';

export const bridge = new JsBridgeAPI();

bridge.registerHandler('apiInfo', (data, cb) => {
  // const [host, port] = extCtl.split(':');
  // cb({ host, port, secret: '' });
  cb({ host: '127.0.0.1', port: '9090', secret: '' });
});
bridge.registerHandler('getStartAtLogin', (data, cb) => {
  // TODO
  cb(false);
});
bridge.registerHandler('isSystemProxySet', (data, cb) => {
  // cb(getProxyState().http.enable);
  cb(false);
});
bridge.registerHandler('setStartAtLogin', (data, cb) => {
  // TODO
  cb();
});
bridge.registerHandler('setSystemProxy', async (data, cb) => {
  // data ? await autoSetProxy() : clearProxy();
  cb();
});
