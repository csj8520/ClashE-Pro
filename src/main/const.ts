import { app } from 'electron';
import path from 'path';
import { platform } from './os';

export const resourcesPath = path.join(app?.getAppPath() ?? path.join(__dirname, '../'), '../');
// import module from 'module';
// @ts-ignore
// module.globalPaths.push(path.join(resourcesPath, 'app.asar.unpacked/node_modules'));

export const tempDir = path.join(app?.getPath('temp') ?? process.env.TEMP ?? '/tmp', 'clash-pro');
export const clashDir = path.join(resourcesPath, 'clash');
export const clashPath = path.join(clashDir, `clash${platform === 'win32' ? '.exe' : ''}`);
export const clashConfigDir = path.join(app?.getPath('home') ?? process.env.HOME, '.config/clash-pro');
export const clashDefaultConfigPath = path.join(clashConfigDir, 'config.yaml');

export const configPath = path.join(clashConfigDir, '.config.yaml');
