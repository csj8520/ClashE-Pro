import got from 'got';
import { agent } from './agent';
import { getClashName } from './clash-name';

export const getClashLatest = async ({ platform, arch }: { platform: NodeJS.Platform; arch: Arch }) => {
  const data: any = await got.get('https://api.github.com/repos/Dreamacro/clash/releases/tags/premium', { agent }).json();
  const latestVersion: string = data.name.replace('Premium ', '');
  const clashName = getClashName({ platform, arch });
  if (!clashName) throw 'unsupport this platform or arch';
  const filesName = clashName.name.replace('{version}', latestVersion);
  // https://gh.2i.gs/
  // https://download.fastgit.org/Dreamacro/clash/releases/download/premium/clash-windows-arm32v7-2021.12.07.zip
  const downloadUrl = `https://ghproxy.com/https://github.com/Dreamacro/clash/releases/download/premium/${filesName}`;
  return {
    version: latestVersion,
    downloadUrl
  };
};
