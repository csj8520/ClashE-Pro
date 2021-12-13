import { execSync } from 'child_process';
import { platform } from './os';

// https://github.com/nojsja/shadowsocks-electron/blob/master/main/helpers/networksetup.ts
// https://github.com/nojsja/shadowsocks-electron/blob/master/main/helpers/sysproxy.ts
// https://github.com/serkyron/proxy-setter/blob/master/proxy.py
// https://github.com/helloyou2012/system-proxy/blob/master/index.js

// networksetup -listallhardwareports
// 'sudo networksetup -setwebproxy "Wi-Fi" 127.0.0.1 7890,
// networksetup -setwebproxystate "WI-FI" off
// networksetup -setsocksfirewallproxystate "Wi-Fi" off

// const mac = {
//   http: ['networksetup -setwebproxy "{network}" "{host}" "{http-port}"', 'networksetup -setwebproxystate "{network}" on'],
//   https: ['networksetup -setsecurewebproxy "{network}" "{host}" "{https-port}"', 'networksetup -setsecurewebproxystate "{network}" on'],
//   socks: ['networksetup -setsocksfirewallproxy "{network}" "{host}" "{socks-port}"', 'networksetup -setsocksfirewallproxystate "{network}" on']
// };

// reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyEnable
// reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyServer

// reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyEnable /t REG_DWORD /d 1 /f
// reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyServer /t REG_SZ /d 127.0.0.1:7890 /f
// 127.0.0.1:7890
// http://127.0.0.1:7890
// socks=127.0.0.1:7891
// windows 同时仅支持配置一个代理地址

type HostPort = `${number}.${number}.${number}.${number}:${number}`;

interface ProxyConfig {
  http?: HostPort;
  https?: HostPort;
  socks?: HostPort;
}

interface ProxyState {
  http: {
    enable: boolean;
    server?: HostPort;
  };
  https: {
    enable: boolean;
    server?: HostPort;
  };
  socks: {
    enable: boolean;
    server?: HostPort;
  };
}

const regPath = '"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings"';

export const getLinuxNetworks = (): string[] => {
  return execSync('networksetup -listallnetworkservices').toString().trim().split('\n').slice(1);
};

export const setProxy = (conf: ProxyConfig) => {
  if (!(conf.http || conf.https || conf.socks)) throw new Error('http, https, socks There has to be one');
  try {
    if (platform === 'win32') {
      execSync(`reg add ${regPath} /v ProxyEnable /t REG_DWORD /d 1 /f`);
      execSync(`reg add ${regPath} /v ProxyServer /t REG_SZ /d ${conf.http || conf.https || conf.socks} /f`);
    } else {
      const networks = getLinuxNetworks();
      for (const network of networks) {
        if (conf.http) {
          const [host, port] = conf.http.split(':');
          execSync(`networksetup -setwebproxy "${network}" "${host}" "${port}"`);
          execSync(`networksetup -setwebproxystate "${network}" on`);
        }
        if (conf.https) {
          const [host, port] = conf.https.split(':');
          execSync(`networksetup -setsecurewebproxy "${network}" "${host}" "${port}"`);
          execSync(`networksetup -setsecurewebproxystate "${network}" on`);
        }
        if (conf.socks) {
          const [host, port] = conf.socks.split(':');
          execSync(`networksetup -setsocksfirewallproxy "${network}" "${host}" "${port}"`);
          execSync(`networksetup -setsocksfirewallproxystate "${network}" on`);
        }
      }
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const clearProxy = () => {
  try {
    if (platform === 'win32') {
      execSync(`reg add ${regPath} /v ProxyServer /t REG_SZ /d "" /f`);
      execSync(`reg add ${regPath} /v ProxyEnable /t REG_DWORD /d 0 /f`);
    } else {
      const networks = getLinuxNetworks();
      for (const network of networks) {
        execSync(`networksetup -setwebproxy "${network}" "" ""`);
        execSync(`networksetup -setwebproxystate "${network}" off`);
        execSync(`networksetup -setsecurewebproxy "${network}" "" ""`);
        execSync(`networksetup -setsecurewebproxystate "${network}" off`);
        execSync(`networksetup -setsocksfirewallproxy "${network}" "" ""`);
        execSync(`networksetup -setsocksfirewallproxystate "${network}" off`);
      }
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const getProxyState = (): ProxyState => {
  const state: ProxyState = { http: { enable: false }, https: { enable: false }, socks: { enable: false } };
  try {
    if (platform == 'win32') {
      state.http.enable = state.https.enable = state.socks.enable = execSync(`reg query ${regPath} /v ProxyEnable`).toString().includes('0x1');
      const out = execSync(`reg query ${regPath} /v ProxyServer`).toString();
      const [_, protocol = 'http://', host] = out.match(/(?<=ProxyServer\s+REG_SZ\s+)(?!\s)((?:http\:\/\/)|(?:socks=))?(.+)/) || [];
      if (protocol === 'http://') {
        state.http.server = host as any;
        state.https.server = host as any;
      } else if (protocol === 'socks=') {
        state.socks.server = host as any;
      }
    } else {
      const out = execSync('scutil --proxy').toString().trim();
      const [http, https, socks] = ['HTTP', 'HTTPS', 'SOCKS'].map(it => {
        const enable = out.match(new RegExp(`(?<=${it}Enable\\s*:\\s*)([^\\s]+)`))?.[0] === '1';
        const host = out.match(new RegExp(`(?<=${it}Proxy\\s*:\\s*)([^\\s]+)`))?.[0];
        const port = out.match(new RegExp(`(?<=${it}Port\\s*:\\s*)([^\\s]+)`))?.[0];
        const server = host && port ? (`${host}:${port}` as HostPort) : void 0;
        return { enable, server };
      });
      state.http = http;
      state.https = https;
      state.socks = socks;
    }
  } catch (error) {
    console.error(error);
  }
  return state;
};
// console.log(getProxyState());
// unSetProxy();
// console.log(setProxy({ http: '127.0.0.1:7890', https: '127.0.0.1:7890', socks: '127.0.0.1:7891' }));
// console.log(disableProxy());
