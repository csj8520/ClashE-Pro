import http from 'http';
import fs from 'fs/promises';
import path from 'path';
/**
 * https://github.com/Dreamacro/clash/issues/1428
 */
const mime: Record<string, string> = {
  js: 'application/javascript',
  html: 'text/html',
  css: 'text/css',
  webmanifest: 'application/manifest+json',
  png: 'image/png',
  jpg: 'image/jpeg'
};

export const serve = () => {
  http
    .createServer(async (req, res) => {
      const { url = '/' } = req;
      const _path = url === '/' ? 'index.html' : url;

      const file = path.join(process.cwd(), 'clash-dashboard/dist', _path.split('?')[0]);
      console.log('file: ', file);
      const info = await fs.stat(file).catch(() => null);

      if (info?.isFile()) {
        res.writeHead(200, { 'Content-Type': mime[file.split('.').slice(-1)[0]] });
        res.end(await fs.readFile(file));
      } else {
        res.writeHead(404);
        res.end('');
      }
    })
    .listen(9092);
};
