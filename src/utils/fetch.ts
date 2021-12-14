import got from 'got';
import { extCtl } from './const';

export const fetchClashConfig = async () => {
  return (await got.get(`http://${extCtl}/configs`).json()) as {
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
  };
};
