/**
 *  https://github.com/marcuswestin/WebViewJavascriptBridge
 */

import { ipcRenderer, webFrame } from 'electron';
import fs from 'fs';
import { getProxyState, clearProxy, setProxy } from '../utils/proxy';

class _JsBridgeAPI implements JsBridgeAPI {
  private _handles = new Map<string, Function[]>();
  public registerHandler(eventName: string, callback: (data: any, responseCallback: (param: any) => void) => void) {
    const fns = this._handles.get(eventName) || [];
    fns.push(callback);
    this._handles.set(eventName, fns);
  }
  public callHandler(handleName: string, data?: any, responseCallback?: (responseData: any) => void) {
    console.log(handleName, data, responseCallback);
    const fns = this._handles.get(handleName) || [];
    fns.forEach(it => it(data, responseCallback));
  }
  public disableJavscriptAlertBoxSafetyTimeout() {}
}

window.addEventListener('load', () => {
  // const timer = setInterval(() => {
  //   if (!window.WVJBCallbacks) return;
  //   clearInterval(timer);
  window.WebViewJavascriptBridge = new _JsBridgeAPI();
  window.WebViewJavascriptBridge.registerHandler('apiInfo', (data, cb) => {
    cb({ host: '127.0.0.1', port: '9090', secret: '' });
  });
  window.WebViewJavascriptBridge.registerHandler('getStartAtLogin', (data, cb) => {
    cb(!true);
  });
  window.WebViewJavascriptBridge.registerHandler('isSystemProxySet', (data, cb) => {
    cb(getProxyState().http.enable);
  });
  window.WebViewJavascriptBridge.registerHandler('setStartAtLogin', (data, cb) => {
    cb(!true);
  });
  window.WebViewJavascriptBridge.registerHandler('setSystemProxy', (data, cb) => {
    !data ? clearProxy() : setProxy({ http: '127.0.0.1:7890', https: '127.0.0.1:7890', socks: '127.0.0.1:7891' });
    cb(void 0);
  });
  window.WVJBCallbacks.forEach(it => it(window.WebViewJavascriptBridge));
  // }, 100);
});
