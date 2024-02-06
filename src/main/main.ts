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
  installPythonPackages(event);
});

ipcMain.on('test2', async (event, arg) => {
  transcribe(event, arg);
});

ipcMain.on('test3', async (event, arg) => {
  translate(event, arg);
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

const envPath = app.isPackaged?path.join(process.resourcesPath, 'venv'):path.join(app.getAppPath(), 'venv');
const packagePath = app.isPackaged?path.join(process.resourcesPath, 'venv_installer','test.tar.gz'):path.join(app.getAppPath(), 'venv_installer','test.tar.gz');
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

const transcribe = async (event:Electron.IpcMainEvent, srcPath:string) => {
  console.log('transcribe srcPath: ', srcPath);
  console.log('transcribe srcPath: ', `${srcPath.substring(0,srcPath.lastIndexOf('.'))}.vtt`);
  const trgDir = `${srcPath.substring(0,srcPath.lastIndexOf('\\'))}`;
  const activateScript = path.join(envPath, 'Scripts', 'activate.bat');
  const model = 'base';

  const cmdCommand = `start cmd.exe /k "call "${activateScript}" && whisper "${srcPath}" --model ${model} --output_format vtt --output_dir "${trgDir}" && exit"`;
  const whisper = spawn('cmd.exe', ['/c', cmdCommand], { detached: true, shell: true });
  whisper.on('close', (code) => {
    if (code === 0) {
      // console.log('pytorch 패키지가 성공적으로 설치되었습니다.');
      event.reply('test', 'whisper 실행 완료');
      event.reply('test2', `${srcPath.substring(0,srcPath.lastIndexOf('.'))}.vtt`);
    }
  });
}

const translate = async (event:Electron.IpcMainEvent, arg:Array<string>) => {
  console.log('테슽트 : ', arg[0]);
  console.log('테슽트 : ', `${arg[0].substring(0,arg[0].lastIndexOf('.'))}_${arg[1]}.vtt`);
  const trgPath = `${arg[0].substring(0,arg[0].lastIndexOf('.'))}_${arg[1]}.vtt`;
  const activateScript = path.join(envPath, 'Scripts', 'activate.bat');
  const pythonScriptPath = app.isPackaged?path.join(process.resourcesPath, 'venv_installer','translate.py'):path.join(app.getAppPath(), 'venv_installer','translate.py');

  const cmdCommand = `start cmd.exe /k "call "${activateScript}" && python "${pythonScriptPath}" "${arg[0]}" "${trgPath}" ${arg[1]} && exit"`;
  const whisper = spawn('cmd.exe', ['/c', cmdCommand], { detached: true, shell: true });
  whisper.on('close', (code) => {
    if (code === 0) {
      // console.log('pytorch 패키지가 성공적으로 설치되었습니다.');
      event.reply('test', 'tranlate 실행 완료');
    }
  });
}


const installPythonPackages = async (event:Electron.IpcMainEvent) => {
  const activateScript = path.join(envPath, 'Scripts', 'activate.bat');
  console.log('activateScript : ', activateScript)
  // const installPackagesCmd = `${activateScript} && python -m pip install -v numpy`;
  // const installPackagesCmd = `${activateScript} && conda install -v -y pytorch==1.10.1 torchvision==0.11.2 torchaudio==0.10.1 cudatoolkit=11.3 -c pytorch -c conda-forge`;
  // const installPackages = spawn('cmd.exe', ['/c', installPackagesCmd]);

  const cmdCommand = `start cmd.exe /k "call "${activateScript}" && conda install -v -y pytorch==1.10.1 torchvision==0.11.2 torchaudio==0.10.1 cudatoolkit=11.3 ffmpeg -c pytorch -c conda-forge && python -m pip install googletrans==4.0.0rc1 && python -m pip install -U openai-whisper && exit"`;
  const installPackages = spawn('cmd.exe', ['/c', cmdCommand], { detached: true, shell: true });
  installPackages.on('close', (code) => {
    if (code === 0) {
      // console.log('pytorch 패키지가 성공적으로 설치되었습니다.');
      event.reply('test', 'python 패키지가 성공적으로 설치되었습니다.');
    } else {
      console.error(`패키지 설치 중 오류 발생 (코드: ${code})`);
    }
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
