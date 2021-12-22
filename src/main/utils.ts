import { getProxyState, setProxy } from '../lib/proxy';
import { fetchClashConfig } from './fetch';
import { clashRun, killClash } from './clash';
import { getConfig, getApiInfo } from './config';
import { getMainWindow } from './window';

export const delay = (t: number) => new Promise(res => setTimeout(res, t));

export const autoSetProxy = async () => {
  const _config = await fetchClashConfig();
  if (_config['mixed-port']) {
    const host: HostPort = `127.0.0.1:${_config['mixed-port']}`;
    await setProxy({ http: host, https: host, socks: host });
  } else {
    const http: HostPort | undefined = _config.port ? `127.0.0.1:${_config.port}` : void 0;
    const socks: HostPort | undefined = _config['socks-port'] ? `127.0.0.1:${_config['socks-port']}` : void 0;
    await setProxy({ http, https: http, socks });
  }
};

export const systemProxyIsEnable = async () => {
  const _config = await fetchClashConfig();
  let httpServer: HostPort | void;
  let httpsServer: HostPort | void;
  let socksServer: HostPort | void;
  if (_config['mixed-port']) {
    httpServer = httpsServer = socksServer = `127.0.0.1:${_config['mixed-port']}`;
  } else {
    httpServer = httpsServer = _config.port ? `127.0.0.1:${_config.port}` : void 0;
    socksServer = _config['socks-port'] ? `127.0.0.1:${_config['socks-port']}` : void 0;
  }
  const { http, https, socks } = await getProxyState();
  if (http.enable && http.server === httpServer) return true;
  if (socks.enable && socks.server === socksServer) return true;
  if (https.enable && https.server === httpsServer) return true;
  return false;
};

export const reload = async () => {
  const config = await getConfig();
  killClash();
  await clashRun(config.selected);
  config.autoSetProxy && (await autoSetProxy());
  const mainWindow = getMainWindow();
  if (!mainWindow) return;
  const { host, port } = await getApiInfo();
  mainWindow.loadURL(`http://${host}:${port}/ui/`);
};
