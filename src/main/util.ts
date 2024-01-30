/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import fs from 'fs';
import log from 'electron-log';
import { app } from 'electron';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export function getBundledPythonInstallDir(): string {
  // this directory path cannot have any spaces since
  // conda environments cannot be installed to such paths
  const installDir =
    process.platform === 'darwin'
      ? path.normalize(path.join(app.getPath('home'), 'Library', app.getName()))
      : app.getPath('userData');

  if (!fs.existsSync(installDir)) {
    try {
      fs.mkdirSync(installDir, { recursive: true });
    } catch (error) {
      log.error(error);
    }
  }

  return installDir;
}
