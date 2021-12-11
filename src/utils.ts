import ProxyAgent from 'proxy-agent';
import fs from 'fs/promises';
const proxyAgent = new ProxyAgent();

export const agent = { http: proxyAgent, https: proxyAgent, http2: proxyAgent };

export const fileExists = (file: string) =>
  fs
    .access(file)
    .then(() => true)
    .catch(() => false);
