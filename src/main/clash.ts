import { spawn } from 'child_process';
import path from 'path';

import { delay } from './utils';
import { getClashArch } from '../lib/get-clash';
import { DIR } from '../lib/paths';

import { getApiInfo } from './config';
import { fetchClash } from './fetch';
import { downloadLatestClash, getLocalClashVersion } from '../lib/get-clash';
import { arch, platform } from '../lib/os';

let clashProcess: AsyncReturn<typeof clashRun> | null = null;

export const clashRun = async (config: string) => {
  const localVersion = await getLocalClashVersion();
  if (localVersion == '0') await downloadLatestClash({ platform, arch });
  const apiInfo = await getApiInfo();
  const clashInfo = getClashArch({ platform, arch })!;
  const clash = spawn(
    path.join(DIR.clash(), clashInfo.bin),
    ['-d', DIR.config(), '-f', path.join(DIR.config(), config), '-ext-ctl', `${apiInfo.host}:${apiInfo.port}`, '-ext-ui', DIR.ui()],
    { windowsHide: true }
  );
  clashProcess = clash;
  clash.stdout.pipe(process.stdout);
  clash.stderr.pipe(process.stderr);

  while (true) {
    console.log('waiting Clash start...');
    await delay(500);
    const res = await fetchClash();
    if (res?.hello === 'clash') return clash;
  }
};

export const killClash = () => {
  clashProcess?.kill('SIGKILL');
};
