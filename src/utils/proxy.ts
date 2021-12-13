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

// reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyEnable
// reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyServer

// reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyEnable /t REG_DWORD /d 1 /f
// reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyServer /t REG_SZ /d 127.0.0.1:7890 /f
// 127.0.0.1:7890
// http://127.0.0.1:7890
// socks=127.0.0.1:7891
type HostPort = `${number}.${number}.${number}.${number}:${number}`;

interface ProxyConfig {
  http?: HostPort;
  https?: HostPort;
  socks?: HostPort;
}

interface ProxyState {
  enable: boolean;
  server: ProxyConfig;
}

const regPath = '"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings"';

export const setProxy = (conf: ProxyConfig) => {
  if (!(conf.http || conf.https || conf.socks)) throw new Error('http, https, socks There has to be one');
  try {
    if (platform == 'win32') {
      execSync(`reg add ${regPath} /v ProxyEnable /t REG_DWORD /d 1 /f`);
      execSync(`reg add ${regPath} /v ProxyServer /t REG_SZ /d ${conf.http || conf.https || conf.socks} /f`);
    } else {
      // TODO
      const out = execSync('networksetup -listallhardwareports').toString().trim();
      const networks = out.match(/(?<=Hardware Port: )(.+)(?=\n)/gm);
      console.log('out: ');
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const disableProxy = () => {
  try {
    if (platform == 'win32') {
      execSync(`reg add ${regPath} /v ProxyEnable /t REG_DWORD /d 0 /f`);
    } else {
      // TODO
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const getProxy = (): ProxyState => {
  const state: ProxyState = { enable: false, server: {} };
  try {
    if (platform == 'win32') {
      state.enable = execSync(`reg query ${regPath} /v ProxyEnable`).toString().includes('0x1');
      const out = execSync(`reg query ${regPath} /v ProxyServer`).toString();
      const [_, protocol = 'http://', host] = out.match(/(?<=ProxyServer\s+REG_SZ\s+)(?!\s)((?:http\:\/\/)|(?:socks=))?(.+)/) || [];
      if (protocol === 'http://') {
        state.server.http = host as any;
        state.server.https = host as any;
      } else if (protocol === 'socks=') {
        state.server.socks = host as any;
      }
    } else {
      // TODO
    }
  } catch (error) {
    console.error(error);
  }
  return state;
};
console.log(getProxy());
console.log(setProxy({ http: '127.0.0.1:7890' }));
console.log(getProxy());
// console.log(disableProxy());
