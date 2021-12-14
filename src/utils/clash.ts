import got from 'got';
import { spawn } from 'child_process';

import { getLocalClashVersion, path, delay } from '.';

import { updatClash } from './update';
import { clashConfigDir, clashPath, extCtl } from './const';

export const clashRun = async (config: string) => {
  const localVersion = await getLocalClashVersion();
  if (localVersion == '0') await updatClash();

  const uiDir = path.join(process.cwd(), 'clash-dashboard/dist');
  // const command = `${clashPath} -d ${clashConfigDir} -f ${path.join(clashConfigDir, config)} -ext-ctl 127.0.0.1:9090 -ext-ui ${uiDir}`;
  const clash = spawn(clashPath, ['-d', clashConfigDir, '-f', path.join(clashConfigDir, config), '-ext-ctl', extCtl, '-ext-ui', uiDir]);
  clash.stdout.pipe(process.stdout);
  clash.stderr.pipe(process.stderr);

  while (true) {
    await delay(500);
    const res: any = await got
      .get('http://127.0.0.1:9090')
      .json()
      .catch(() => null);
    if (res?.hello === 'clash') return clash;
  }
};
