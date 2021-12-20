import got from 'got';
import { fs, path, yaml } from './utils';
import { clashConfigDir, clashDefaultConfigPath, configPath } from './const';

const cache = new Map();

export const clashDefaultConfig = `#---------------------------------------------------#
## 配置文件需要放置在 $HOME/.config/clash/*.yaml

## 这份文件是clashX的基础配置文件，请尽量新建配置文件进行修改。
## ！！！只有这份文件的端口设置会随ClashX启动生效

## 如果您不知道如何操作，请参阅 官方Github文档 https://github.com/Dreamacro/clash/blob/dev/README.md
#---------------------------------------------------#

# (HTTP and SOCKS5 in one port)
mixed-port: 7890
# RESTful API for clash
external-controller: 127.0.0.1:9090
allow-lan: false
mode: rule
log-level: warning

proxies:

proxy-groups:

rules:
  - DOMAIN-SUFFIX,google.com,DIRECT
  - DOMAIN-KEYWORD,google,DIRECT
  - DOMAIN,google.com,DIRECT
  - DOMAIN-SUFFIX,ad.com,REJECT
  - GEOIP,CN,DIRECT
  - MATCH,DIRECT
`;

export const copyDefaultConfig = async () => {
  if (await fs.pathExists(clashDefaultConfigPath)) return;
  await fs.writeFile(clashDefaultConfigPath, clashDefaultConfig);
};

export const initConfig = async () => {
  const files = (await fs.readdir(clashConfigDir)).filter(it => /^[^.].+\.ya?ml$/.test(it));
  const config = await getConfig();
  // config.list = config.list.filter(it => files.includes(it.name));
  const list: typeof config['list'] = [];
  for (const it of config.list) {
    if (files.includes(it.name)) {
      list.push(it);
    } else if (it.sub) {
      try {
        await updateRemoteConfig(it.name, it.sub);
        list.push(it);
      } catch (error) {
        console.log('error: ', error);
      }
    }
  }
  config.list = list;

  const names = config.list.map(it => it.name);
  const added = files.filter(it => !names.includes(it)).map(it => ({ name: it, updateTime: 0 }));
  config.list.push(...added);
  config.list.some(it => it.name === config.selected) || (config.selected = config.list[0].name);
  return setConfig(config);
};

export const getConfig = async (): Promise<Config> => {
  if (cache.has('config')) return cache.get('config');
  let config: Config = { selected: '', updateInterval: 86400, autoSetProxy: true, list: [] };

  if (await fs.pathExists(configPath)) {
    const _config = yaml.load((await fs.readFile(configPath)).toString()) as Config;
    Object.assign(config, _config);
  }
  cache.set('config', config);
  return config;
};
export const setConfig = async (config: Config) => {
  console.log('setConfig');
  console.time('setConfig');
  await fs.writeFile(configPath, yaml.dump(config));
  cache.set('config', config);
  console.timeEnd('setConfig');
  return config;
};

export const getClashConfig = async (name: string): Promise<{ [key: string]: any }> => {
  const key = `clash-config-${name}`;
  if (cache.has(key)) return cache.get(key);
  const config = yaml.load((await fs.readFile(path.join(clashConfigDir, name))).toString());
  cache.set(key, config);
  return config as any;
};

export const getApiInfo = async (): Promise<Record<'host' | 'port' | 'secret', string>> => {
  console.log('getApiInfo');
  console.time('getApiInfo');
  const { selected } = await getConfig();
  const clashConfig = (await getClashConfig(selected)) as any;
  const _extCtl = clashConfig?.['external-controller'] || '127.0.0.1:9090';
  const secret = clashConfig?.secret || '';
  const [host, port] = _extCtl.split(':');
  console.timeEnd('getApiInfo');
  return { host: host === '0.0.0.0' ? '127.0.0.1' : host, port, secret };
};

export const updateRemoteConfig = async (name: string, sub: string) => {
  console.log(`Start Update Sub: ${name}`);
  const key = `clash-config-${name}`;
  const text = await got.get(sub).text();
  await fs.writeFile(path.join(clashConfigDir, name), text);
  cache.set(key, yaml.load(text));
  const config = await getConfig();
  const idx = config.list.findIndex(it => it.name === name);
  config.list.splice(idx, 1, { ...config.list[idx], updateTime: Date.now() });
  await setConfig(config);
  console.log(`Update Sub: ${name} Success`);
};

export const updateAllRemoteConfig = async () => {
  const config = await getConfig();
  for (const it of config.list) {
    if (!it.sub) continue;
    await updateRemoteConfig(it.name, it.sub);
  }
};

export const autoUpdateAllRemoteConfig = async () => {
  const config = await getConfig();
  for (const it of config.list) {
    if (!it.sub) continue;
    setTimeout(() => {
      setInterval(() => {
        updateRemoteConfig(it.name, it.sub!);
      }, config.updateInterval * 1000);
    }, config.updateInterval * 1000 - (Date.now() - it.updateTime));
  }
};

export const clearConfigCache = () => cache.clear();
