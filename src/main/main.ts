/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { spawn, execSync, exec } from 'child_process';
import fs from 'fs';
import Store from 'electron-store';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

const store = new Store();
let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('electron-store-get', async (event, key) => {
  event.returnValue = store.get(key);
});
ipcMain.on('electron-store-set', async (event, key, val) => {
  store.set(key, val);
});
ipcMain.on('electron-store-delete', async (event, key) => {
  store.delete(key);
});

ipcMain.on('test', async (event, arg) => {
  event.reply('test', );
  installPythonPackages(event);
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}
// const installExtensions = async () => {
//   const installer = require('electron-devtools-installer');
//   const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
//   const extensions = ['REACT_DEVELOPER_TOOLS'];

//   return installer
//     .default(
//       extensions.map((name) => installer[name]),
//       forceDownload,
//     )
//     .catch(console.log);
// };

const createWindow = async () => {
  // if (isDebug) {
  //   await installExtensions();
  // }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

const envPath = app.isPackaged?path.join(process.resourcesPath, 'env'):path.join(app.getAppPath(), 'env');
const packagePath = app.isPackaged?path.join(process.resourcesPath, 'env_installer','python399.tar.gz'):path.join(app.getAppPath(), 'env_installer','python399.tar.gz');
const platform = process.platform;
const isWin = platform === 'win32';

const setupPythonEnvironment = () => {
  try {

    console.log('envPath : ', envPath);
    console.log('packagePath : ', packagePath);
    console.log('app.getAppPath() : ', app.getAppPath());
    console.log('app.getPath(userData) : ', app.getPath('userData'));
    console.log('app.getPath(home) : ', app.getPath('home'));

    if (!fs.existsSync(envPath)) {
      execSync(`mkdir "${envPath}"`);
      const unzipProcess = spawn('tar', ['-xzf', packagePath, '-C', envPath]);
      unzipProcess.stdout.on('data', (data) => {
        console.log(`압축 해제 중: ${data}`);
      });
      unzipProcess.stderr.on('data', (data) => {
        console.error(`오류 발생: ${data}`);
      });
      unzipProcess.on('close', (code) => {
        if (code === 0) {
          console.log('패키지가 성공적으로 압축 해제되었습니다.');
        } else {
          console.error(`패키지 압축 해제 중 오류 발생 (코드: ${code})`);
        }
      });
    }

  } catch (error) {
    console.error('Error setting up Python environment:', error);
  }
}

const installPythonPackages = async (event:Electron.IpcMainEvent) => {
  const activateScript = path.join(envPath, 'Scripts', 'activate.bat');
  console.log('activateScript : ', activateScript)
  exec(`${activateScript} && python -m pip install torch==1.10.1+cu111 torchvision==0.11.2+cu111 torchaudio==0.10.1 -f https://download.pytorch.org/whl/cu111/torch_stable.html`, (error, stdout, stderr) => {

    if (error) {
      event.reply('test', `패키지 설치 오류: ${error}`);
      return;
    }

    console.log('Python 패키지 설치 과정:');
    event.reply('test', stdout);
    console.log('pytorch 설치 완료.');
    event.reply('pytorch 설치 완료.');
    // Python 스크립트 실행
    // const pythonScript = `-c "print('Hello, World!')"`;

    // exec(`${activateScript} && python ${pythonScript}`, (error, stdout, stderr) => {
    //   if (error) {
    //     console.error(`Python 스크립트 실행 중 오류 발생: ${error}`);
    //     return;
    //   }

    //   console.log('Python 스크립트가 성공적으로 실행되었습니다.');
    //   console.log('Python 출력:');
    //   console.log(stdout);
    // });
  });
  exec(`${activateScript} && python -m pip install -U openai-whisper`, (error, stdout, stderr) => {

    if (error) {
      event.reply('test', `패키지 설치 오류: ${error}`);
      return;
    }

    console.log('Python 패키지 설치 과정:');
    event.reply('test', stdout);
    console.log('whisper 설치 완료.');
    event.reply('whisper 설치 완료.');
    // Python 스크립트 실행
    // const pythonScript = `-c "print('Hello, World!')"`;

    // exec(`${activateScript} && python ${pythonScript}`, (error, stdout, stderr) => {
    //   if (error) {
    //     console.error(`Python 스크립트 실행 중 오류 발whisper생: ${error}`);
    //     return;
    //   }

    //   console.log('Python 스크립트가 성공적으로 실행되었습니다.');
    //   console.log('Python 출력:');
    //   console.log(stdout);
    // });
  });
};


/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .then(setupPythonEnvironment)
  .catch(console.log);
