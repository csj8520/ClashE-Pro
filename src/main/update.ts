import got from 'got';
import unzip from '7zip-min';
import { createWriteStream } from 'fs';

import { osType } from './os';
import { agent, getLocalClashVersion, fs, path } from './utils';
import { clashDir, clashPath, tempDir } from './const';

// https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt
export const getClashLatestVersion = async () => {
  if (!osType) throw new Error('unsupport this platform');
  const data: any = await got.get('https://api.github.com/repos/Dreamacro/clash/releases/tags/premium', { agent }).json();
  const latestVersion: string = data.name.replace('Premium ', '');
  console.log(`latest version is: ${latestVersion}`);
  const filesName = osType.name.replace('{version}', latestVersion);
  // https://gh.2i.gs/
  // https://download.fastgit.org/Dreamacro/clash/releases/download/premium/clash-windows-arm32v7-2021.12.07.zip
  const downloadUrl = `https://ghproxy.com/https://github.com/Dreamacro/clash/releases/download/premium/${filesName}`;
  return {
    version: latestVersion,
    filesName,
    downloadUrl
  };
};

export const downloadClsh = async (latest: AsyncReturn<typeof getClashLatestVersion>) => {
  !(await fs.pathExists(tempDir)) && (await fs.mkdir(tempDir));
  !(await fs.pathExists(clashDir)) && (await fs.mkdir(clashDir));
  const downloadPath = path.join(tempDir, latest.filesName);
  const dpip = createWriteStream(downloadPath);

  await new Promise<void>(res =>
    got
      .get(latest.downloadUrl, { isStream: true, agent })
      .on('downloadProgress', ({ percent }) => console.log(`Downloading: ${(percent * 100).toFixed(2)}%`))
      .pipe(dpip)
      .on('close', res)
  );

  const unpackName = await new Promise<string>(res =>
    unzip.list(downloadPath, (err, result) => {
      console.log('err: ', err);
      console.log('result: ', result);
      res(result[0].name);
    })
  );

  await new Promise<void>(res => unzip.unpack(downloadPath, clashDir, err => res()));

  await fs.rename(path.join(clashDir, unpackName), clashPath);
  await fs.chmod(clashPath, 0b111101101);

  const currentVersion = await getLocalClashVersion();
  console.log(`Download Success current version is: ${currentVersion}`);
};

export const updateClash = async () => {
  const currentVersion = await getLocalClashVersion();
  const latest = await getClashLatestVersion();
  if (new Date(latest.version).getTime() > new Date(currentVersion).getTime()) {
    await downloadClsh(latest);
  } else {
    console.log('now is latest version');
  }
};
