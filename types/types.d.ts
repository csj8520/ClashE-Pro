interface Window {
  WebViewJavascriptBridge: import('../src/preload/js-bridge').JsBridgeAPI;
  WVJBCallbacks: Function[];
}

type AsyncReturn<T> = T extends (...args: any) => Promise<infer R> ? R : never;
type HostPort = `${number}.${number}.${number}.${number}:${number}`;
type Arch = 'arm' | 'arm64' | 'ia32' | 'mips' | 'mipsel' | 'ppc' | 'ppc64' | 's390' | 's390x' | 'x32' | 'x64';

interface Config {
  selected: string;
  updateInterval: number;
  autoSetProxy: boolean;
  list: Array<{
    name: string;
    sub?: string;
    updateTime: number;
  }>;
}
