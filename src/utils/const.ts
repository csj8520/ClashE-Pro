import path from 'path';
import { platform } from './os';

export const resourcesPath = 1 ? path.join(__dirname, '../../') : path.join(__dirname, '../../../');

// export const cwd = process.cwd();

export const tempDir = path.join(resourcesPath, 'temp');
export const clashDir = path.join(resourcesPath, 'clash');
export const clashPath = path.join(clashDir, `clash${platform === 'win32' ? '.exe' : ''}`);
export const clashConfigDir = path.join(process.env.HOME || resourcesPath, '.config/clash-pro');
export const clashDefaultConfigPath = path.join(clashConfigDir, 'config.yaml');

export const configPath = path.join(clashConfigDir, '.config.yaml');

export const extCtl: HostPort = '127.0.0.1:9090';
