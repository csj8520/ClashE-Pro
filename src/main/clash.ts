import got from 'got';
import { spawn } from 'child_process';

import { getLocalClashVersion, path, delay } from './utils';

import { updateClash } from './update';
import { clashConfigDir, clashPath, resourcesPath } from './const';
import { getApiInfo } from './config';
import { fetchClash } from './fetch';

let clashProcess: AsyncReturn<typeof clashRun> | null = null;

export const clashRun = async (config: string) => {
  const localVersion = await getLocalClashVersion();
  if (localVersion == '0') await updateClash();

  const uiDir = path.join(resourcesPath, 'clash-dashboard/dist');
  const apiInfo = await getApiInfo();
  const clash = spawn(
    clashPath,
    ['-d', clashConfigDir, '-f', path.join(clashConfigDir, config), '-ext-ctl', `${apiInfo.host}:${apiInfo.port}`, '-ext-ui', uiDir],
    { windowsHide: true }
  );
  clashProcess = clash;
  clash.stdout.pipe(process.stdout);
  clash.stderr.pipe(process.stderr);

  while (true) {
    await delay(500);
    const res = await fetchClash();
    if (res?.hello === 'clash') return clash;
  }
};

export const killClash = () => {
  clashProcess?.kill('SIGKILL');
};
