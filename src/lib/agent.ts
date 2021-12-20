import ProxyAgent from 'proxy-agent';
const proxyAgent = new ProxyAgent();

export const agent = { http: proxyAgent, https: proxyAgent, http2: proxyAgent };
