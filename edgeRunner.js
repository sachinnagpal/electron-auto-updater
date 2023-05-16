const https = require('https');
const fs = require('fs-extra');
const { exec } = require("child_process");

let mainWindow
let log
let serviceTriggered = false
let statusSent = false
// let downloadPath = "/Users/sachinnagpal/Desktop/repos/git/electron/electron-node-14.20.1/downloads/"
let downloadPath = "C:\\ProgramData\\O4S\\"
// & "$MSI_INSTALLER_EXECUTABLE" /l*v mdbinstall.log  /qb /i $installerPath SHOULD_INSTALL_COMPASS="0" ADDLOCAL="ServerService,ServerNoService,Client,ImportExportTools"  
let msiExecuter = "C:\\Windows\\System32\\msiexec.exe"
let servicesData = [
  {
    name: "uid-manager",
    extention: "exe",
    downloadUrl: "https://mark-assets.s3.ap-south-1.amazonaws.com/markV3/uid-manager.exe",
    filePath: downloadPath + "uid-manager.exe",
    commandToRun: 'nssm start uid-manager',
    downloading: false,
    downloadError: '',
    triggered: false,
    isRunning: false,
    triggerError: ''
  },
  {
    name: "mongo",
    extention: "",
    downloadUrl: "https://mark-assets.s3.ap-south-1.amazonaws.com/mongodb-win32-x86_64-2012plus-4.2.8-signed.msi",
    filePath: downloadPath + "mongodb-win32-x86_64-2012plus-4.2.8-signed.msi",
    commandToRun: `"${msiExecuter}" /l*v mdbinstall.log  /qb /i "${downloadPath}\\mongodb-win32-x86_64-2012plus-4.2.8-signed.msi" SHOULD_INSTALL_COMPASS="0" ADDLOCAL="ServerService,ServerNoService,Client,ImportExportTools"`,
    downloading: false,
    downloadError: '',
    triggered: false,
    isRunning: false,
    triggerError: ''
  }
  // "mongo"
]
const bootMarkEdge = function (window, logger) {
  mainWindow = window
  log = logger
  downloadServices()
  log.info("coming to boot mark edge")
}

const downloadServices = async function () {

  for (let service of servicesData) {
    mainWindow.webContents.on('did-finish-load', function () {
      mainWindow.webContents.send(`${service.name}:status`, `Downloading ${service.name}`);
    });
    // mainWindow.webContents.send(`${serviceName}:status', 'Downloading ${serviceName} asd`);
    try {
      service.downloading = true
      downloader(service)
      // await downloadFileService (downloadPath)
      // mainWindow.webContents.send(`${serviceName}:status`, `Downloaded ${serviceName}`);
    } catch (err) {
      log.error("Download failed")
      log.error(err)
    }
  }
  // log.info(service)
}



const downloader = async (service) => {
  try {
    if (fs.existsSync(service.filePath)) {
      log.info(`${service.name} already downloaded`)
      service.downloading = false
      mainWindow.webContents.on('did-finish-load', function () {
        mainWindow.webContents.send(`${service.name}:status`, `Downloaded ${service.name}`);
      });
      // return
    } else {
      try {
        await downloadFile(service.downloadUrl, service.filePath)
        service.downloading = false
        mainWindow.webContents.send(`${service.name}:status`, `Downloaded ${service.name}`);

      } catch (err) {
        service.downloading = false
        service.downloadError = err.message
      }
    }
    // console.log(servicesData.filter(service => (!service.downloading && !service.downloadError)).length )
    const allServiceDownloaded = servicesData.filter(service => (!service.downloading && !service.downloadError)).length == servicesData.length
    log.info(`allServiceDownloaded ${allServiceDownloaded}`)
    if (allServiceDownloaded && !serviceTriggered) {
      serviceTriggered = true
      runServices()
    }
  } catch (err) {
    log.error(err)
  }
}

const runServices = function () {
  console.log("called run Services")
  let errorMessage = ''
  for (let service of servicesData) {
    try {
      service.triggered = true
      exec(service.commandToRun, { timeout: 3 * 60 * 1000 }, (error, stdout, stderr) => {
        if (error) {
          service.triggerError = error.message
          log.info(`error code ${error.code}`)
          errorMessage = `Failed to start ${service.name} <br>`
          // service.error = error.message
          const ASCII_MATCH_REGEX = /[^a-zA-Z0-9 ]/g
          let readAbleError = error.message.replace(ASCII_MATCH_REGEX, '')
          if (readAbleError.includes('already running')) {
            service.isRunning = true
          }
          // log.info(`error: ${readAbleError}`);
          log.info(`error: ${error}`)
        }
        else if (stderr) {
          // service.error = stderr
          log.info(`stderr: ${stderr}`);
          service.triggerError = stderr
          errorMessage = `Failed to start ${service.name} <br>`
          // return;
        } else if (stdout) {
          service.isRunning = true
          // service.isRunning = true
          log.info('stdout')
          log.info(stdout)
        }

        collectServiceStatus()
        log.info("serice status")
      })
    } catch (err) {
      errorMessage = `Failed to start ${service.name} <br>`
      log.error(err)
      console.log("coming to error part")

    }
  }
}

function collectServiceStatus() {
  console.log("called this many times")
  let allServiceTriggered = servicesData.filter(service => service.triggered).length === servicesData.length
  console.log(`allServiceTriggered ${allServiceTriggered}`)
  if (allServiceTriggered && !statusSent) {
    statusSent = true
    mainWindow.webContents.on('did-finish-load', function () {
      mainWindow.webContents.send(`services-running:status`, servicesData);
    });
  }
}
async function downloadFile(url, path) {
  // let localPath = "/Users/sachinnagpal/Desktop/repos/git/electron/electron-node-14.20.1/downloads/"
  // let fileFullPath = localPath + url.split("/").pop()
  // let fileFullPath = "C:\\ProgramData\\O4S\\" + url.split("/").pop()
  log.info(`filePath : ${path}`)
  if (path.includes("uid-manager")) {
    // log.info("Deleting uid manager")
    // fs.unlinkSync(fileFullPath)
  }
  // let fileFullPath = localPath + url.split("/").pop()  
  log.info('downloading file from url: ' + url)

  return new Promise((resolve, reject) => {
    https.get(url, (resp) => {

      // let fileName = url.split("/").pop()
      const filePath = fs.createWriteStream(path);
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
module.exports = {
  bootMarkEdge
}