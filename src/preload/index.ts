import { bridge } from './bridge';
console.log('this is preload');
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
