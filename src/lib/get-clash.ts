import got from 'got';
import path from 'path';
import fs from 'fs-extra';
import unzip from '7zip-min';
import { execSync } from 'child_process';
import { createWriteStream } from 'fs';
import { agent } from './agent';
import { arch, platform } from './os';
import { execAsync } from './utils';

export const osTypes: Array<{ name: string; os: NodeJS.Platform; arch: Arch[]; bin: string }> = [
  { name: 'clash-darwin-amd64-{version}.gz', bin: 'clash-darwin-amd64', os: 'darwin', arch: ['x64'] },
  { name: 'clash-darwin-arm64-{version}.gz', bin: 'clash-darwin-arm64', os: 'darwin', arch: ['arm64'] },
  // { name: 'clash-freebsd-386-{version}.gz',bin:'clash-freebsd-386', os: '', arch: [] },
  // { name: 'clash-freebsd-amd64-{version}.gz',bin:'clash-freebsd-amd64', os: '', arch: [] },
  // { name: 'clash-freebsd-arm64-{version}.gz',bin:'clash-freebsd-arm64', os: '', arch: [] },
  // { name: 'clash-linux-386-{version}.gz', bin: 'clash-linux-386', os: 'linux', arch: ['x32'] },
  { name: 'clash-linux-amd64-{version}.gz', bin: 'clash-linux-amd64', os: 'linux', arch: ['x64'] },
  // { name: 'clash-linux-armv5-{version}.gz',bin:'clash-linux-armv5', os: '', arch: [] },
  // { name: 'clash-linux-armv6-{version}.gz',bin:'clash-linux-armv6', os: '', arch: [] },
  // { name: 'clash-linux-armv7-{version}.gz',bin:'clash-linux-armv7', os: '', arch: [] },
  { name: 'clash-linux-armv8-{version}.gz', bin: 'clash-linux-armv8', os: 'linux', arch: ['arm', 'arm64'] },
  // { name: 'clash-linux-mips-hardfloat-{version}.gz',bin:'clash-linux-mips-hardfloat', os: '', arch: [] },
  // { name: 'clash-linux-mips-softfloat-{version}.gz',bin:'clash-linux-mips-softfloat', os: '', arch: [] },
  // { name: 'clash-linux-mips64-{version}.gz',bin:'clash-linux-mips64', os: '', arch: [] },
  // { name: 'clash-linux-mips64le-{version}.gz',bin:'clash-linux-mips64le', os: '', arch: [] },
  // { name: 'clash-linux-mipsle-hardfloat-{version}.gz',bin:'clash-linux-mipsle-hardfloat', os: '', arch: [] },
  // { name: 'clash-linux-mipsle-softfloat-{version}.gz',bin:'clash-linux-mipsle-softfloat', os: '', arch: [] },
  { name: 'clash-windows-386-{version}.zip', bin: 'clash-windows-386.exe', os: 'win32', arch: ['x32', 'ia32'] },
  { name: 'clash-windows-amd64-{version}.zip', bin: 'clash-windows-amd64.exe', os: 'win32', arch: ['x64'] },
  { name: 'clash-windows-arm32v7-{version}.zip', bin: 'clash-windows-arm32v7.exe', os: 'win32', arch: ['arm'] },
  { name: 'clash-windows-arm64-{version}.zip', bin: 'clash-windows-arm64.exe', os: 'win32', arch: ['arm64'] }
];

export const getClashArch = ({ platform, arch }: { platform: NodeJS.Platform; arch: Arch }) => {
  return osTypes.find(it => it.os === platform && it.arch.includes(arch));
};

export const getClashLatest = async () => {
  const data: any = await got.get('https://api.github.com/repos/Dreamacro/clash/releases/tags/premium', { agent }).json();
  return data.name.replace('Premium ', '') as string;
};

export const download = async ({ url, filename }: { filename: string; url: string }) => {
  const tempDir = path.join(process.env.TEMP || '/tmp', 'clash-pro');
  !(await fs.pathExists(tempDir)) && (await fs.mkdir(tempDir));
  const downloadPath = path.join(tempDir, filename);
  const dpip = createWriteStream(downloadPath);
  console.log(`Download Start: ${url}`);
  await new Promise<void>(res =>
    got
      .get(url, { isStream: true, agent })
      .on('downloadProgress', ({ percent }) => console.log(`Downloading: ${(percent * 100).toFixed(2)}%`))
      .pipe(dpip)
      .on('close', res)
  );
  console.log(`Download Success: ${url}`);
  return downloadPath;
};

export const unPack = async ({ from, to }: { from: string; to: string }) => {
  await new Promise<void>(res => unzip.unpack(from, to, err => res()));
};

export const downloadClash = async ({ platform, arch, version }: { platform: NodeJS.Platform; arch: Arch; version: string }) => {
  const clashDir = path.join(__dirname, '../../clash');
  const clashArch = getClashArch({ platform, arch });
  if (!clashArch) throw 'unsupport this platform or arch';
  const filename = clashArch.name.replace('{version}', version);
  const url = `https://ghproxy.com/https://github.com/Dreamacro/clash/releases/download/premium/${filename}`;
  const downloadPath = await download({ url, filename });
  await unPack({ from: downloadPath, to: clashDir });
  const binPath = path.join(clashDir, clashArch.bin);
  await fs.chmod(binPath, 0b111101101);
  return binPath;
};

export const downloadLatestClash = async ({ platform, arch }: { platform: NodeJS.Platform; arch: Arch }) => {
  const version = await getClashLatest();
  return downloadClash({ platform, arch, version });
};

export const getLocalClashVersion = async () => {
  const clashInfo = getClashArch({ platform, arch });
  if (!clashInfo) return '0';
  const bin = path.join(__dirname, '../../clash', clashInfo.bin);
  const hasClash = await fs.pathExists(bin);
  if (!hasClash) return '0';
  const out = await execAsync(`${bin} -v`);
  console.log(out);
  return out.replace(/^Clash (\d+\.\d+\.\d+) (.|\n)+$/, '$1');
};

export const upgradeClash = async () => {
  const localVersion = await getLocalClashVersion();
  const latestVersion = await getClashLatest();
  if (new Date(latestVersion).getTime() > new Date(localVersion).getTime()) {
    await downloadClash({ platform, arch, version: latestVersion });
    console.log('Local Calsh Is upgraded latest version');
  } else {
    console.log('Local Calsh Is latest version not upgrade');
  }
};
