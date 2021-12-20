const { build, Arch } = require('electron-builder')

const { downloadClsh } = require('../dist/main/update')

build({
  arm64: true,
  x64: true,
  publish: 'never',
  config: {
    afterPack(ctx) {
      console.log(Arch[ctx.arch]);
      console.log('-----------------------------------');
    },
    appId: "com.csj8520.clash.pro",
    removePackageScripts: true,
    compression: "normal",
    asar: false,
    artifactName: "ElectronClashPro-${platform}-${arch}-${version}.${ext}",
    files: ["dist/**/*"],
    directories: {
      output: "builder"
    },
    publish: {
      provider: "github",
      vPrefixedTagName: true
    },
    extraResources: [
      {
        from: "clash",
        to: "clash"
      },
      {
        from: "clash-dashboard/dist",
        to: "clash-dashboard/dist"
      },
      {
        from: "assets",
        to: "assets"
      }
    ],
    win: {
      icon: "assets/icon.png",
      target: ["nsis"],
      files: [
        "node_modules/7zip-bin/**/*",
        "!node_modules/7zip-bin/linux/**",
        "!node_modules/7zip-bin/mac/**"
      ]
    },
    mac: {
      icon: "assets/icon.png",
      target: ["dmg"],
      files: [
        "node_modules/7zip-bin/**/*",
        "!node_modules/7zip-bin/linux/**",
        "!node_modules/7zip-bin/win/**"
      ],
    },
    linux: {
      icon: "assets/icon.png",
      target: ["deb", "AppImage"],
      files: [
        "node_modules/7zip-bin/**/*",
        "!node_modules/7zip-bin/mac/**",
        "!node_modules/7zip-bin/win/**"
      ]
    }
  }
})
