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

export const fetchClashGroups = async () => {
  const { proxies } = await got.get(`http://${extCtl}/proxies`).json<API.Proxies>();
  const GLOBAL = proxies.GLOBAL as API.Group;
  const policyGroup = new Set(['Selector', 'URLTest', 'Fallback', 'LoadBalance']);
  const unUsedProxy = new Set(['DIRECT', 'REJECT', 'GLOBAL']);
  const groups = GLOBAL.all
    .filter(key => !unUsedProxy.has(key))
    .map(key => ({ ...proxies[key], name: key }))
    .filter(it => policyGroup.has(it.type)) as API.Group[];
  return groups;
};

export const fetchSetClashGroups = async (op: { group: string; value: string }) => {
  return await got.put(`http://${extCtl}/proxies/${encodeURIComponent(op.group)}`, { json: { name: op.value } });
};
