import ProxyAgent from 'proxy-agent';
import { execSync } from 'child_process';
import { clashPath } from './const';
import fs from 'fs-extra';

export { default as fs } from 'fs-extra';
export { default as path } from 'path';
export { default as yaml } from 'js-yaml';

const proxyAgent = new ProxyAgent();

export const agent = { http: proxyAgent, https: proxyAgent, http2: proxyAgent };

export const delay = (t: number) => new Promise(res => setTimeout(res, t));

export const getLocalClashVersion = async () => {
  const hasClash = await fs.pathExists(clashPath);
  if (!hasClash) return '0';
  const out = execSync(`${clashPath} -v`, { cwd: process.cwd() }).toString().trim();
  console.log(out);
  return out.replace(/^Clash (\d+\.\d+\.\d+) (.|\n)+$/, '$1');
};

export * from './update';
export * from './serve';
export * from './os';
export * from './const';
export * from './clash';
export * from './config';
