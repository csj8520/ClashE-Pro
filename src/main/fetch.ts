import got from 'got';
import { getApiInfo } from './config';

const getFetchOption = async (path: `/${string}`) => {
  const { host, port, secret } = await getApiInfo();
  return {
    url: `http://${host}:${port}${path}`,
    option: {
      headers: secret ? { Authorization: `Bearer ${secret}` } : {}
    }
  };
};

export const fetchClash = async (): Promise<null | { hello: 'clash' }> => {
  const option = await getFetchOption('/');
  return (await got
    .get(option.url, option.option)
    .json()
    .catch(() => null)) as any;
};

export const fetchClashConfig = async () => {
  const option = await getFetchOption('/configs');
  return (await got.get(option.url, option.option).json()) as API.Config;
};

export const fetchSetClashConfig = async (config: Partial<API.Config>) => {
  const option = await getFetchOption('/configs');
  return await got.patch(option.url, { ...option.option, json: config });
};

export const fetchClashGroups = async (op?: { mode?: API.Mode }) => {
  const option = await getFetchOption('/proxies');
  const { mode } = op || {};
  const { proxies } = await got.get(option.url, option.option).json<API.Proxies>();
  const GLOBAL = proxies.GLOBAL as API.Group;
  const policyGroup = new Set(['Selector', 'URLTest', 'Fallback', 'LoadBalance']);
  const unUsedProxy = new Set(['DIRECT', 'REJECT', 'GLOBAL']);
  const groups = GLOBAL.all
    .filter(key => !unUsedProxy.has(key))
    .map(key => ({ ...proxies[key], name: key }))
    .filter(it => policyGroup.has(it.type)) as API.Group[];
  if (mode === 'global') groups.unshift(GLOBAL);
  return groups;
};

export const fetchSetClashGroups = async (op: { group: string; value: string }) => {
  const option = await getFetchOption(`/proxies/${encodeURIComponent(op.group)}`);
  return await got.put(option.url, { ...option.option, json: { name: op.value } });
};
