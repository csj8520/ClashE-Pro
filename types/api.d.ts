namespace API {
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
