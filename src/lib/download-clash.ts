import got from 'got';

export const downloadClsh = async ({ platform, arch }: { platform: NodeJS.Platform; arch: Arch }) => {
  // !(await fs.pathExists(tempDir)) && (await fs.mkdir(tempDir));
  // !(await fs.pathExists(clashDir)) && (await fs.mkdir(clashDir));
  // const downloadPath = path.join(tempDir, latest.filesName);
  // const dpip = createWriteStream(downloadPath);

  // await new Promise<void>(res =>
  //   got
  //     .get(latest.downloadUrl, { isStream: true, agent })
  //     .on('downloadProgress', ({ percent }) => console.log(`Downloading: ${(percent * 100).toFixed(2)}%`))
  //     .pipe(dpip)
  //     .on('close', res)
  // );

  // const unpackName = await new Promise<string>(res =>
  //   unzip.list(downloadPath, (err, result) => {
  //     console.log('err: ', err);
  //     console.log('result: ', result);
  //     res(result[0].name);
  //   })
  // );

  // await new Promise<void>(res => unzip.unpack(downloadPath, clashDir, err => res()));

  // await fs.rename(path.join(clashDir, unpackName), clashPath);
  // await fs.chmod(clashPath, 0b111101101);

  // const currentVersion = await getLocalClashVersion();
  // console.log(`Download Success current version is: ${currentVersion}`);
};
