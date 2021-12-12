import path from 'path';
import { platform } from '.';

export const cwd = process.cwd();

export const tempDir = path.join(cwd, 'temp');
export const clashDir = path.join(cwd, 'clash');
export const clashPath = path.join(clashDir, `clash${platform === 'win32' ? '.exe' : ''}`);
export const clashConfigDir = path.join(process.env.HOME || cwd, '.config/clash');
export const clashDefaultConfigPath = path.join(clashConfigDir, 'config.yaml');

export const configPath = path.join(clashDir, '.config.yaml');
