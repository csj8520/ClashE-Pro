import { platform } from './os';
import { execAsync } from './utils';

// https://github.com/nojsja/shadowsocks-electron/blob/master/main/helpers/gsettings.ts
// https://github.com/nojsja/shadowsocks-electron/blob/master/main/helpers/networksetup.ts
// https://github.com/nojsja/shadowsocks-electron/blob/master/main/helpers/sysproxy.ts
// https://github.com/serkyron/proxy-setter/blob/master/proxy.py
// https://github.com/helloyou2012/system-proxy/blob/master/index.js

export class WinSystemProxy implements SystemProxy {
  private static regPath = '"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings"';

  static async setProxy(conf: ProxyConfig) {
    await execAsync(`reg add ${this.regPath} /v ProxyEnable /t REG_DWORD /d 1 /f`);
    if (conf.http || conf.https) {
      await execAsync(`reg add ${this.regPath} /v ProxyServer /t REG_SZ /d http://${conf.https || conf.http} /f`);
    } else {
      // windows 无法获取请求的域名 导致规则不生效
      await execAsync(`reg add ${this.regPath} /v ProxyServer /t REG_SZ /d socks=${conf.socks} /f`);
    }
  }

  static async clearProxy() {
    await execAsync(`reg add ${this.regPath} /v ProxyServer /t REG_SZ /d "" /f`);
    await execAsync(`reg add ${this.regPath} /v ProxyEnable /t REG_DWORD /d 0 /f`);
  }

  static async getProxyState(): Promise<ProxyState> {
    const state: ProxyState = { http: { enable: false }, https: { enable: false }, socks: { enable: false } };
    state.http.enable = state.https.enable = state.socks.enable = (await execAsync(`reg query ${this.regPath} /v ProxyEnable`)).includes('0x1');
    const out = await execAsync(`reg query ${this.regPath} /v ProxyServer`);
    const [_, protocol = 'http://', host] = out.match(/(?<=ProxyServer\s+REG_SZ\s+)(?!\s)((?:http\:\/\/)|(?:socks=))?(.+)/) || [];
    if (protocol === 'http://') {
      state.http.server = host as any;
      state.https.server = host as any;
    } else if (protocol === 'socks=') {
      state.socks.server = host as any;
    }
    return state;
  }
}

export class MacSystemProxy implements SystemProxy {
  private static async getMacNetworks(): Promise<string[]> {
    return (await execAsync('networksetup -listallnetworkservices')).split('\n').slice(1);
  }

  static async setProxy(conf: ProxyConfig): Promise<void> {
    const networks = await this.getMacNetworks();
    let command = '';
    for (const network of networks) {
      if (conf.http) {
        const [host, port] = conf.http.split(':');
        command += `networksetup -setwebproxy "${network}" "${host}" "${port}"\n`;
      }
      if (conf.https) {
        const [host, port] = conf.https.split(':');
        command += `networksetup -setsecurewebproxy "${network}" "${host}" "${port}"\n`;
      }
      if (conf.socks) {
        const [host, port] = conf.socks.split(':');
        command += `networksetup -setsocksfirewallproxy "${network}" "${host}" "${port}"\n`;
      }
    }
    await execAsync(command);
  }

  static async clearProxy(): Promise<void> {
    const networks = await this.getMacNetworks();
    let command = '';
    console.time('net');
    for (const network of networks) {
      command += `networksetup -setwebproxy "${network}" "" ""\n`;
      command += `networksetup -setwebproxystate "${network}" off\n`;
      command += `networksetup -setsecurewebproxy "${network}" "" ""\n`;
      command += `networksetup -setsecurewebproxystate "${network}" off\n`;
      command += `networksetup -setsocksfirewallproxy "${network}" "" ""\n`;
      command += `networksetup -setsocksfirewallproxystate "${network}" off\n`;
    }
    await execAsync(command);
    console.timeEnd('net');
  }

  static async getProxyState(): Promise<ProxyState> {
    const state: ProxyState = { http: { enable: false }, https: { enable: false }, socks: { enable: false } };
    const out = await execAsync('scutil --proxy');
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
    return state;
  }
}
export class LinuxSystemProxy implements SystemProxy {
  static async setProxy(conf: ProxyConfig): Promise<void> {
    let command = '';
    command += 'gsettings set org.gnome.system.proxy mode manual\n';
    if (conf.http) {
      const [host, port] = conf.http.split(':');
      command += `gsettings set org.gnome.system.proxy.http host ${host}\n`;
      command += `gsettings set org.gnome.system.proxy.http port ${port}\n`;
    }
    if (conf.https) {
      const [host, port] = conf.https.split(':');
      command += `gsettings set org.gnome.system.proxy.https host ${host}\n`;
      command += `gsettings set org.gnome.system.proxy.https port ${port}\n`;
    }
    if (conf.socks) {
      const [host, port] = conf.socks.split(':');
      command += `gsettings set org.gnome.system.proxy.socks host ${host}\n`;
      command += `gsettings set org.gnome.system.proxy.socks port ${port}\n`;
    }
    await execAsync(command);
  }
  static async clearProxy(): Promise<void> {
    let command = '';
    command += 'gsettings set org.gnome.system.proxy mode none\n';
    command += `gsettings set org.gnome.system.proxy.http host ''\n`;
    command += `gsettings set org.gnome.system.proxy.http port 0\n`;
    command += `gsettings set org.gnome.system.proxy.https host ''\n`;
    command += `gsettings set org.gnome.system.proxy.https port 0\n`;
    command += `gsettings set org.gnome.system.proxy.socks host ''\n`;
    command += `gsettings set org.gnome.system.proxy.socks port 0\n`;
    await execAsync(command);
  }
  static async getProxyState(): Promise<ProxyState> {
    const state: ProxyState = { http: { enable: false }, https: { enable: false }, socks: { enable: false } };
    const enable = (await execAsync('gsettings get org.gnome.system.proxy mode')) === "'manual'";
    let command = '';
    command += 'gsettings get org.gnome.system.proxy.http host\n';
    command += 'gsettings get org.gnome.system.proxy.http port\n';
    command += 'gsettings get org.gnome.system.proxy.https host\n';
    command += 'gsettings get org.gnome.system.proxy.https port\n';
    command += 'gsettings get org.gnome.system.proxy.socks host\n';
    command += 'gsettings get org.gnome.system.proxy.socks port\n';
    const [httpHost, httpPort, httpsHost, httpsPort, socksHost, socksPort] = (await execAsync(command)).split('\n');
    const none = ["''", '', '0'];
    const [http, https, socks] = [
      [httpHost, httpPort],
      [httpsHost, httpsPort],
      [socksHost, socksPort]
    ].map(([host, port]) => {
      const server = none.includes(host) || none.includes(port) ? void 0 : (`${host.replace(/'/g, '')}:${port}` as HostPort);
      return server ? { enable, server } : { enable: false };
    });
    state.http = http;
    state.https = https;
    state.socks = socks;
    return state;
  }
}

export const setProxy = async (conf: ProxyConfig) => {
  if (!(conf.http || conf.https || conf.socks)) throw new Error('http, https, socks There has to be one');
  if (platform === 'win32') {
    await WinSystemProxy.setProxy(conf);
  } else if (platform === 'darwin') {
    await MacSystemProxy.setProxy(conf);
  } else {
    await LinuxSystemProxy.setProxy(conf);
  }
};

export const clearProxy = async () => {
  if (platform === 'win32') {
    await WinSystemProxy.clearProxy();
  } else if (platform === 'darwin') {
    await MacSystemProxy.clearProxy();
  } else {
    await LinuxSystemProxy.clearProxy();
  }
};

export const getProxyState = async (): Promise<ProxyState> => {
  if (platform == 'win32') {
    return await WinSystemProxy.getProxyState();
  } else if (platform === 'darwin') {
    return await MacSystemProxy.getProxyState();
  } else {
    return await LinuxSystemProxy.getProxyState();
  }
};
// console.log(getProxyState());
// unSetProxy();
// console.log(setProxy({ http: '127.0.0.1:7890', https: '127.0.0.1:7890', socks: '127.0.0.1:7891' }));
// console.log(disableProxy());
