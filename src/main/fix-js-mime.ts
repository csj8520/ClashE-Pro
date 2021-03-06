import { session } from 'electron';

// https://github.com/Dreamacro/clash/issues/1428
export const fixJsMime = () => {
  session.defaultSession.webRequest.onHeadersReceived({ urls: [`http://*/*.js`] }, (details, cb) => {
    cb({ responseHeaders: { ...details.responseHeaders, 'Content-Type': 'application/javascript', abc: '123' } });
  });
};

// 拦截不到，应该是请求时间太短
// https://__bridge_loaded__
// protocol.registerHttpProtocol('https', (req, cb) => {
//   console.log('--------------------------');
//   console.log(req.url);
//   cb({ url: req.url });
// });
