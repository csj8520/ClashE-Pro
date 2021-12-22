import { exec, ExecOptions } from 'child_process';

export const execAsync = (comand: string, options?: ExecOptions): Promise<string> => {
  return new Promise((reslove, reject) => {
    exec(comand, { windowsHide: true, ...options }, (err, stdout, stderr) => {
      if (err || stderr) {
        reject((err || stderr).toString().trim());
      } else {
        reslove(stdout.toString().trim());
      }
    });
  });
};
