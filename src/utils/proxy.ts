import { execSync } from 'child_process';
import { platform } from '.';
// https://github.com/nojsja/shadowsocks-electron/blob/master/main/helpers/networksetup.ts
// https://github.com/nojsja/shadowsocks-electron/blob/master/main/helpers/sysproxy.ts
// https://github.com/serkyron/proxy-setter/blob/master/proxy.py
// https://github.com/helloyou2012/system-proxy/blob/master/index.js

// networksetup -listallhardwareports
// 'sudo networksetup -setwebproxy "Wi-Fi" 127.0.0.1 7890,
// networksetup -setwebproxystate "WI-FI" off
// networksetup -setsocksfirewallproxystate "Wi-Fi" off

[
  'networksetup -setwebproxy "{netword}" "{host}" "{http-port}"',
  'networksetup -setsecurewebproxy "{netword}" "{host}" "{https-port}"',
  'networksetup -setsocksfirewallproxy "{netword}" "{host}" "{socks-port}"',
  'networksetup -setwebproxystate "{netword}" on',
  'networksetup -setsecurewebproxystate "{netword}" on',
  'networksetup -setsocksfirewallproxystate "{netword}" on'
];

export const setProxy = () => {
  if (platform == 'win32') {
    // TODO
  } else {
    const out = execSync('networksetup -listallhardwareports').toString().trim();
    const networks = out.match(/(?<=Hardware Port: )(.+)(?=\n)/gm);
    console.log('out: ');
  }
};

setProxy();
