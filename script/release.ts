import path from 'path';
import fs from 'fs-extra';
import { build, Arch } from 'electron-builder';

import { downloadLatestClash, getClashArch } from '../src/lib/get-clash';

build({
  arm64: true,
  x64: true,
  universal: false,
  dir: process.argv.includes('--dir'),
  publish: process.argv.includes('--publish') ? 'always' : 'never',
  config: {
    async beforePack(ctx) {
      const platform = ctx.electronPlatformName as any;
      const arch = Arch[ctx.arch];
      console.log(`Start Building platform: ${platform}, arch: ${arch}`);
      const bin = getClashArch({ platform, arch }).bin;
      process.env.clashBin = bin;
      (await fs.pathExists(path.join(__dirname, '../clash', bin))) || (await downloadLatestClash({ platform, arch }));
    },
    appId: 'com.csj8520.clash.pro',
    removePackageScripts: true,
    compression: 'normal',
    asar: false,
    artifactName: 'ElectronClashPro-${platform}-${arch}-${version}.${ext}',
    files: ['dist/**/*', 'assets/**/*', 'clash-dashboard/dist/**/*', 'clash/${env.clashBin}'],
    directories: {
      output: 'builder'
    },
    publish: {
      provider: 'github',
      owner: 'csj8520',
      repo: 'electron-clash-pro',
      vPrefixedTagName: true,
      releaseType: 'draft'
    },
    win: {
      icon: 'assets/icon.png',
      target: ['nsis'],
      files: ['node_modules/7zip-bin/**/*', '!node_modules/7zip-bin/linux/**', '!node_modules/7zip-bin/mac/**']
    },
    mac: {
      icon: 'assets/icon.png',
      target: ['dmg'],
      files: ['node_modules/7zip-bin/**/*', '!node_modules/7zip-bin/linux/**', '!node_modules/7zip-bin/win/**']
    },
    linux: {
      icon: 'assets/icon.png',
      target: ['deb', 'AppImage'],
      files: ['node_modules/7zip-bin/**/*', '!node_modules/7zip-bin/mac/**', '!node_modules/7zip-bin/win/**']
    }
  }
});
