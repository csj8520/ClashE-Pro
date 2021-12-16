import got from 'got';
import { extCtl } from './const';

interface ClashConfig {
  'allow-lan': boolean;
  authentication: [];
  'bind-address': string;
  ipv6: boolean;
  'log-level': 'silent' | 'info' | 'warning' | 'error' | 'debug';
  'mixed-port': number;
  mode: 'global' | 'rule' | 'direct' | 'script';
  port: number;
  'redir-port': number;
  'socks-port': number;
  'tproxy-port': number;
}

export const fetchClashConfig = async () => {
  return (await got.get(`http://${extCtl}/configs`).json()) as ClashConfig;
};

export const fetchSetClashConfig = async (config: Partial<ClashConfig>) => {
  return await got.patch(`http://${extCtl}/configs`, { json: config });
};
