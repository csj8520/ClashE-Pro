namespace API {
  export type Mode = 'global' | 'rule' | 'direct' | 'script';
  export interface Config {
    'allow-lan': boolean;
    authentication: [];
    'bind-address': string;
    ipv6: boolean;
    'log-level': 'silent' | 'info' | 'warning' | 'error' | 'debug';
    'mixed-port': number;
    mode: Mode;
    port: number;
    'redir-port': number;
    'socks-port': number;
    'tproxy-port': number;
  }

  export interface Proxies {
    proxies: Record<string, Proxy | Group>;
  }
  export interface History {
    time: string;
    delay: number;
  }

  export interface Proxy {
    name: string;
    type: 'Direct' | 'Reject' | 'Shadowsocks' | 'Vmess' | 'Socks' | 'Http' | 'Snell';
    history: History[];
  }

  export interface Group {
    name: string;
    type: 'Selector' | 'URLTest' | 'Fallback';
    now: string;
    all: string[];
    history: History[];
  }
}
