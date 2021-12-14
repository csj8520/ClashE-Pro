import { bridge } from './bridge';

window.addEventListener('load', () => {
  // const timer = setInterval(() => {
  //   if (!window.WVJBCallbacks) return;
  //   clearInterval(timer);
  // window.WebViewJavascriptBridge = bridge;
  // fake ClashX API
  window.WVJBCallbacks?.forEach(it => it(bridge));
  window.WVJBCallbacks = [];
  // }, 100);
});
