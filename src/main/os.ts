import os from 'os';

export type arch = 'arm' | 'arm64' | 'ia32' | 'mips' | 'mipsel' | 'ppc' | 'ppc64' | 's390' | 's390x' | 'x32' | 'x64';
export const platform = os.platform();
export const arch = os.arch() as arch;

export const osTypes: Array<{ name: string; os: NodeJS.Platform; arch: arch[] }> = [
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

export const osType = osTypes.find(it => it.os === platform && it.arch.includes(arch));
