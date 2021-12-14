import { app } from 'electron';
import path from 'path';
import { platform } from './os';

export const resourcesPath = path.join(app.getAppPath(), '../');

export const tempDir = path.join(app.getPath('temp'), 'clash-pro');
export const clashDir = path.join(resourcesPath, 'clash');
export const clashPath = path.join(clashDir, `clash${platform === 'win32' ? '.exe' : ''}`);
export const clashConfigDir = path.join(app.getPath('home'), '.config/clash-pro');
export const clashDefaultConfigPath = path.join(clashConfigDir, 'config.yaml');

export const configPath = path.join(clashConfigDir, '.config.yaml');

export const extCtl: HostPort = '127.0.0.1:9090';
