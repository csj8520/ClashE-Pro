import path from 'path';

export namespace DIR {
  export const base = () => path.join(__dirname, '../../');
  export const assets = () => path.join(base(), 'assets');
  export const clash = () => path.join(base(), 'clash');
  export const ui = () => path.join(base(), 'clash-dashboard/dist');
  export const config = () => path.join(process.env.HOME!, '.config/clash-pro');
  export const temp = () => path.join(process.env.TEMP || '/tmp', 'clash-pro');
}

export namespace FILE {
  export const config = () => path.join(DIR.config(), '.config.yaml');
  export const defClashConf = () => path.join(DIR.config(), 'config.yaml');
}
