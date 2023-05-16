const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const log = require('electron-log');
const fs = require('fs-extra');
const https = require('https');
const { exec } = require("child_process");
const { dialog } = require('electron')
const { autoUpdater, AppUpdater } = require("electron-updater");
const {downloadFileService} = require("./serviceDownloader.js");
const {bootMarkEdge} = require("./edgeRunner");

let mainWindow;
let childWindow;
let updateWindow;

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

function handleSetTitle(event, title) {
  const webContents = event.sender
  const win = BrowserWindow.fromWebContents(webContents)
  win.setTitle(title)
}

async function createWindow() {
  // donwloadBinaries()
  // log.transports.file.getFile("/Users/sachinnagpal/Desktop/repos/git/electron/electron-node-14.20.1/logs/logger.log");
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  ipcMain.on('set-title', (event, title) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    win.setTitle(title)
  })
 

  mainWindow.webContents.openDevTools()
 
  // await mainWindow.loadFile('index.html')
  mainWindow.loadFile('index.html')
  bootMarkEdge(mainWindow, log)
 
}

async function downloadServices() {

  let servicesToInstall = [
    "uid-manager.exe"
    // "mongo"
  ]

  for (let service of servicesToInstall) {
    let downloadPath = "https://mark-assets.s3.ap-south-1.amazonaws.com/markV3/" + service
    
    let serviceName = service.split(".")[0]
    console.log(service)
    console.log(serviceName)
    mainWindow.webContents.on('did-finish-load', function () {
      mainWindow.webContents.send(`${serviceName}:status`, `Downloading ${serviceName}`);
  });
    // mainWindow.webContents.send(`${serviceName}:status', 'Downloading ${serviceName} asd`);
    try {
      if(serviceName === "mongo") {
        downloadPath = "https://mark-assets.s3.ap-south-1.amazonaws.com/mongodb-win32-x86_64-2012plus-4.2.8-signed.msi"
      }
      downloader(downloadPath, serviceName)
      await downloadFileService (downloadPath)
      mainWindow.webContents.send(`${serviceName}:status`, `Downloaded ${serviceName}`);
    } catch (err) {
      log.error("Download failed")
      log.error(err)
    }
  }

}

const downloader = async (downloadPath, serviceName) => {
  // await downloadFileReplica(downloadPath)
  mainWindow.webContents.send(`${serviceName}:status`, `Downloaded ${serviceName}`);
}

async function downloadFileReplica(url) {
  let localPath = "/Users/sachinnagpal/Desktop/repos/git/electron/electron-node-14.20.1/downloads/"
  let fileFullPath = localPath + url.split("/").pop()
  // let fileFullPath = "C:\\ProgramData\\O4S\\" + url.split("/").pop()
  log.info(`filePath : ${fileFullPath}`)
  if (fileFullPath.includes("uid-manager")) {
    // log.info("Deleting uid manager")
    // fs.unlinkSync(fileFullPath)
  }
  // let fileFullPath = localPath + url.split("/").pop()  
  log.info('downloading file from url: ' + url)

  return new Promise((resolve, reject) => {
    https.get(url, (resp) => {

      let fileName = url.split("/").pop()
      const filePath = fs.createWriteStream(fileFullPath);
      resp.pipe(filePath);
      filePath.on('finish', () => {
        filePath.close();
        log.info('Download Completed');
        resolve('File downloaded')
        // childWindow.webContents.send('file:downloaded', fileName);
      })
    }).on("error", (err) => {
      reject(new Error(err.message))
    });
  })
}
function createChildWindow() {
  childWindow = new BrowserWindow({
    // width: 1000,
    // height: 700,
    modal: true,
    show: false,
    parent: mainWindow, // Make sure to add parent window here

    // Make sure to add webPreferences with below configuration
    webPreferences: {
      nodeIntegration: true,
      // contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'childPreload.js')
    },
  });

  // childWindow.webContents.openDevTools()
  // Child window loads settings.html file
  childWindow.loadFile("install-page.html");

  childWindow.once("ready-to-show", () => {
    childWindow.show();
  });
}

function creteUpdateWindow() {
  updateWindow = new BrowserWindow({
    // width: 1000,
    // height: 700,
    modal: true,
    show: false,
    parent: mainWindow, // Make sure to add parent window here

    // Make sure to add webPreferences with below configuration
    webPreferences: {
      nodeIntegration: true,
      // contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'updatePagePreload.js')
    },
  });

  // updateWindow.webContents.openDevTools()
  // Child window loads settings.html file
  updateWindow.loadFile("update-page.html");

  updateWindow.once("ready-to-show", () => {
    updateWindow.show();
  });
}

function shutChildWindow() {
  // childWindow.
  childWindow.close()
}
app.whenReady().then(() => {
  log.transports.file.resolvePath = () => "C:\\ProgramData\\O4S\\installer-poc-electron\\logger.log"
  log.info("calling for updates")
  autoUpdater.setFeedURL('https://mark-assets.s3.ap-south-1.amazonaws.com/markV3/qaBuilds/installer-electron-poc/')
  autoUpdater.checkForUpdates()

  autoUpdater.on("error", (info) => {
    log.info("coming to error autoupdater when app ready")
    log.info(info)

  })
  autoUpdater.on("update-available", (info) => {
    log.info("update-available")
    mainWindow.webContents.send('update_available');
    console.log("update-available")
  })
  autoUpdater.on("update-not-available", (info) => {
    log.info("update--not-available")
    mainWindow.webContents.send('update_not_available');
    console.log("update--not-available")
  })
  ipcMain.on('set-title', handleSetTitle)
  ipcMain.on("openChildWindow", (event) => {
    createChildWindow();
  });
  ipcMain.on("openUpdateWindow", (event) => {
    creteUpdateWindow()
  })
  ipcMain.on("closeChildWindow", (event) => {
    shutChildWindow();
  });
  ipcMain.on("downloadFile", (event, url) => {
    downloadFile(url);
  });

  ipcMain.on("updateMark", (event) => {
    updateMark();
  });
  ipcMain.on('counter-value', (_event, value) => {
    log.info(value) // will print value to Node console
  })

  ipcMain.on('startServices', (_event, value) => {
    startServices(value)
  })

  createWindow()
  // setInterval(alertOnUpdate, 60000);
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

async function alertOnUpdate() {
  let updateRequired = await checkForAutoUpdate()
  if (updateRequired) {
    dialog.showMessageBox(mainWindow, {
      title: 'O4S update Available',
      buttons: ['OK'],
      message: 'O4S update Available..',
    });
  }
}

async function checkForAutoUpdate() {

  let manifestUrl = "https://mark-assets.s3.ap-south-1.amazonaws.com/markV3/qaBuilds/installer-electron-poc/manifest-replica.json"
  fs.writeFileSync('C:\\ProgramData\\O4S\\manifest-replica.json', '', function () { console.log('cleared') })
  // fs.writeFileSync('/Users/sachinnagpal/Desktop/repos/git/electron/electron-node-14.20.1/downloads/manifest-replica.json', '', function () { console.log('cleared') })
  try {
    await downloadFileReplica(manifestUrl)
    let manifestJson = fs.readJSONSync("C:\\ProgramData\\O4S\\manifest-replica.json", "utf8")
    // let manifestJson = fs.readJSONSync("/Users/sachinnagpal/Desktop/repos/git/electron/electron-node-14.20.1/downloads/manifest-replica.json", "utf8")
    // /Users/sachinnagpal/Desktop/repos/git/electron/electron-node-14.20.1
    let appJson = fs.readJSONSync("C:\\ProgramData\\O4S\\app-replica.json", "utf8")
    // let appJson = fs.readJSONSync("/Users/sachinnagpal/Desktop/repos/git/electron/electron-node-14.20.1/downloads/app-replica.json", "utf8")
    // let json = JSON.stringify(manifestJson)
    let uidVersionFromManifest = manifestJson.apps.uidManager[0].version
    let uidVersionFromAppJson = appJson[0].version
    uidVersionFromManifest = uidVersionFromManifest.replaceAll(".", '')
    uidVersionFromAppJson = uidVersionFromAppJson.replaceAll(".", '')
    if (uidVersionFromAppJson < uidVersionFromManifest) {
      return true;
      // let uidManagerUrl = "https://mark-assets.s3.ap-south-1.amazonaws.com/markV3/qaBuilds/installer-electron-poc/uid-manager.exe"
      // await downloadFileNew(uidManagerUrl)
      // updateWindow.webContents.send('service:updateStatus', 'o4s updated')
      // console.log("Need to update")
    } else {
      return false;
    }
  } catch (e) {
    log.error(e)
    return false
  }
}
function startServices(context) {
  let servicesStatus = [
    {
      name: "uid-manager",
      triggered: false,
      isRunning: false,
      error: ''
    }
  ]

  for (let service of servicesStatus) {
    log.info(`Starting service ${service.name}`)
    service.triggered = true
    exec(`nssm start ${service.name}`, (error, stdout, stderr) => {
      if (error) {
        service.error = error.message
        const ASCII_MATCH_REGEX = /[^a-zA-Z0-9]/g
        let readAbleError = error.message.replace(ASCII_MATCH_REGEX, '')
        if (readAbleError.includes('alreadyrunning')) {
          service.isRunning = true
        }
        log.info(`error: ${readAbleError}`);
      }
      else if (stderr) {
        service.error = stderr
        log.info(`stderr: ${stderr}`);
        // return;
      } else if (stdout) {
        service.isRunning = true
        log.info(stdout)
      }
      log.info("serice status")
      log.info(context)
      if (context === "childWindow") {
        childWindow.webContents.send('service:status', servicesStatus);
      } else if (context === "updateWindow") {
        updateWindow.webContents.send('service:status', servicesStatus)
      }
    })
  }
}


async function stopUidManager() {
  exec(`nssm stop uid-manager`, (error, stdout, stderr) => {
    if (error) {
      log.info("coundn't stop uid-manager")
    }
    else if (stderr) {
      log.info("coundn't stop uid-manager")
      log.info(`stderr: ${stderr}`);
    } else if (stdout) {
      log.info(stdout)
      log.info("uid stopped")
    }
  })
}
async function updateMark() {
  await stopUidManager()
  let updateAvailable = await checkForAutoUpdate()
  log.info(updateAvailable)
  if (updateAvailable) {
    let uidManagerUrl = "https://mark-assets.s3.ap-south-1.amazonaws.com/markV3/qaBuilds/installer-electron-poc/uid-manager.exe"
    await downloadFileReplica(uidManagerUrl)
    log.info("alerting for download update")
    updateWindow.webContents.send('service:updateStatus', 'updated')
  }
}
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})


autoUpdater.on("error", (info) => {
  log.info(info)
  log.info("coming to error autoupdater")
})
autoUpdater.on("update-available", (info) => {
  log.info("update-available")
  mainWindow.webContents.send('update_available');
  console.log("update-available")
})
autoUpdater.on("update-not-available", (info) => {
  log.info("update--not-available")
  mainWindow.webContents.send('update_not_available');
  console.log("update--not-available")
})









//download  binaries 
// 
// complete
// backgorun 30 min checking updates 
  // uid-manager update
  // auto-update. 
// 
// 1.0.0 
// 1.0.1


// 1.0.0
// auto-updater 
// 1.2.0 

// 


// version -next -> updated 

// 