# 一个多端运行的 Clash Pro

> 正在开发中...

### 已知问题
[Mac Book M1 中会显示已损坏](https://github.com/electron-userland/electron-builder/issues/5850)

[临时解决方案](https://github.com/electron-userland/electron-builder/issues/5850#issuecomment-888290746)
``` sh
sudo xattr -r -d com.apple.quarantine /Applications/electron-clash-pro.app/
```
