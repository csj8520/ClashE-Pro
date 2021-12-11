import os from 'os';
import got from 'got';
import path from 'path';
import unzip from '7zip-min';
import { execSync } from 'child_process';

import fs from 'fs/promises';
import { createWriteStream } from 'fs';

import { agent, fileExists } from './utils';

const platform = os.platform();
const arch = os.arch() as OSArch;

export const tempDir = path.join(process.cwd(), 'temp');
export const clashDir = path.join(process.cwd(), 'clash');
export const clashPath = path.join(clashDir, `clash${platform === 'win32' ? '.exe' : ''}`);

type OSArch = 'arm' | 'arm64' | 'ia32' | 'mips' | 'mipsel' | 'ppc' | 'ppc64' | 's390' | 's390x' | 'x32' | 'x64';

export const versions: Array<{ name: string; os: NodeJS.Platform; arch: OSArch[] }> = [
  { name: 'clash-darwin-amd64-{version}.gz', os: 'darwin', arch: ['x64'] },
  { name: 'clash-darwin-arm64-{version}.gz', os: 'darwin', arch: ['arm64'] },
  // { name: 'clash-freebsd-386-{version}.gz', os: '', arch: [] },
  // { name: 'clash-freebsd-amd64-{version}.gz', os: '', arch: [] },
  // { name: 'clash-freebsd-arm64-{version}.gz', os: '', arch: [] },
  { name: 'clash-linux-386-{version}.gz', os: 'linux', arch: ['x32'] },
  { name: 'clash-linux-amd64-{version}.gz', os: 'linux', arch: ['x64'] },
  // { name: 'clash-linux-armv5-{version}.gz', os: '', arch: [] },
  // { name: 'clash-linux-armv6-{version}.gz', os: '', arch: [] },
  // { name: 'clash-linux-armv7-{version}.gz', os: '', arch: [] },
  // { name: 'clash-linux-armv8-{version}.gz', os: '', arch: [] },
  // { name: 'clash-linux-mips-hardfloat-{version}.gz', os: '', arch: [] },
  // { name: 'clash-linux-mips-softfloat-{version}.gz', os: '', arch: [] },
  // { name: 'clash-linux-mips64-{version}.gz', os: '', arch: [] },
  // { name: 'clash-linux-mips64le-{version}.gz', os: '', arch: [] },
  // { name: 'clash-linux-mipsle-hardfloat-{version}.gz', os: '', arch: [] },
  // { name: 'clash-linux-mipsle-softfloat-{version}.gz', os: '', arch: [] },
  { name: 'clash-windows-386-{version}.zip', os: 'win32', arch: ['x32', 'ia32'] },
  { name: 'clash-windows-amd64-{version}.zip', os: 'win32', arch: ['x64'] },
  { name: 'clash-windows-arm32v7-{version}.zip', os: 'win32', arch: ['arm'] },
  { name: 'clash-windows-arm64-{version}.zip', os: 'win32', arch: ['arm64'] }
];

const version = versions.find(it => it.os === platform && it.arch.includes(arch));

export const getLatestVersion = async () => {
  if (!version) throw new Error('unsupport this platform');
  const data: any = await got.get('https://api.github.com/repos/Dreamacro/clash/releases/tags/premium', { agent }).json();
  const latestVersion: string = data.name.replace('Premium ', '');
  console.log(`latest version is: ${latestVersion}`);
  const filesName = version.name.replace('{version}', latestVersion);
  const downloadUrl = `https://github.com/Dreamacro/clash/releases/download/premium/${filesName}`;
  return {
    version: latestVersion,
    filesName,
    downloadUrl
  };
};

export const download = async (latest: AsyncReturn<typeof getLatestVersion>) => {
  if (!(await fileExists(tempDir))) await fs.mkdir(tempDir);

  const downloadPath = path.join(tempDir, latest.filesName);
  const dpip = createWriteStream(downloadPath);

  await new Promise<void>(res =>
    got
      .get(latest.downloadUrl, { isStream: true, agent })
      .on('downloadProgress', ({ percent }) => console.log(`Downloading: ${(percent * 100).toFixed(2)}%`))
      .pipe(dpip)
      .on('close', res)
  );

  const unpackName = await new Promise<string>(res => unzip.list(downloadPath, (err, result) => res(result[0].name)));

  const hasClashDir = await fileExists(clashDir);
  if (!hasClashDir) await fs.mkdir(clashDir);
  await new Promise<void>(res => unzip.unpack(downloadPath, clashDir, err => res()));

  await fs.rename(path.join(clashDir, unpackName), clashPath);
  await fs.chmod(clashPath, 0b111101101);

  const currentVersion = await getCurrentVersion();
  console.log(`Download Success current version is: ${currentVersion}`);
};

export const getCurrentVersion = async () => {
  const hasClash = await fileExists(clashPath);
  if (!hasClash) return '0';
  const out = execSync(`${clashPath} -v`, { cwd: process.cwd() }).toString().trim();
  console.log(out);
  return out.replace(/^Clash (\d+\.\d+\.\d+) (.|\n)+$/, '$1');
};
export const checkUpdate = async () => {
  const currentVersion = await getCurrentVersion();
  const latest = await getLatestVersion();
  if (new Date(latest.version).getTime() > new Date(currentVersion).getTime()) {
    await download(latest);
  } else {
    console.log('now is latest version');
  }
};

checkUpdate();
