import fs from 'fs-extra';
import ProxyAgent from 'proxy-agent';
import { execSync } from 'child_process';

import { setProxy } from './proxy';
import { clashPath } from './const';
import { fetchClashConfig } from './fetch';

export { default as fs } from 'fs-extra';
export { default as path } from 'path';
export { default as yaml } from 'js-yaml';

const proxyAgent = new ProxyAgent();

export const agent = { http: proxyAgent, https: proxyAgent, http2: proxyAgent };

export const delay = (t: number) => new Promise(res => setTimeout(res, t));

export const getLocalClashVersion = async () => {
  const hasClash = await fs.pathExists(clashPath);
  if (!hasClash) return '0';
  const out = execSync(`${clashPath} -v`).toString().trim();
  console.log(out);
  return out.replace(/^Clash (\d+\.\d+\.\d+) (.|\n)+$/, '$1');
};

export const autoSetProxy = async () => {
  const _config = await fetchClashConfig();
  if (_config['mixed-port']) {
    const host: HostPort = `127.0.0.1:${_config['mixed-port']}`;
    setProxy({ http: host, https: host, socks: host });
  } else {
    const http: HostPort | undefined = _config.port ? `127.0.0.1:${_config.port}` : void 0;
    const socks: HostPort | undefined = _config['socks-port'] ? `127.0.0.1:${_config['socks-port']}` : void 0;
    setProxy({ http, https: http, socks });
  }
};