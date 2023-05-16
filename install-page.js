// const { ipcRenderer } = require("electron");

// const remote = windowwindowChange.require("electron").remote;
let uidManagerStatus = document.getElementById("uid-manager-status")
let configJsonStatus = document.getElementById("config-json-status")
let startServiceButton = document.getElementById("trigger-service")
let servicesInstallationStatus = {
  "config.json" : false,
  "uid-manager.exe": false
}
window.onload = donwloadBinaries;

function donwloadBinaries() {
  downloadUidManager()
  downloadConfigJson()
}

function downloadUidManager() {
  uidManagerStatus.innerHTML = "Downloading uid-manager..."
  window.download.downloadFile("https://mark-assets.s3.ap-south-1.amazonaws.com/markV3/uid-manager.exe")
  // fetchFile("https://mark-assets.s3.ap-south-1.amazonaws.com/markV3/config.json")
}

function downloadConfigJson() {
  configJsonStatus.innerHTML = "Downloading config.json..."
  window.download.downloadFile("https://mark-assets.s3.ap-south-1.amazonaws.com/markV3/config.json")
  // fetchFile("https://mark-assets.s3.ap-south-1.amazonaws.com/markV3/config.json")
}

function goToFirstWindow() {
  //code for some other action to be performed
  if(window) {
    console.log("window exist")
  }
  if(window && window.windowChange) {
    console.log("window change exist")
  }
  window.windowChange.closeChildWindow()
  //Code to close the window after doing other actions
  // remote.getCurrentWindow().close();
}

function runServices() {
  startServiceButton.innerHTML = "Starting services..."
  window.start.services()
}

ipcRenderer.on('file:downloaded', (fileName) => {
  alert(`Downloaded ${fileName}`)
  servicesInstallationStatus[fileName] = true
  let allServicesInstalled = true;
  for(let key in servicesInstallationStatus) {
    if(servicesInstallationStatus[key] == false) {
      allServicesInstalled = false;
    }
  }
  if(allServicesInstalled) {
    startServiceButton.removeAttribute("hidden")
  }
  if(fileName === "uid-manager.exe") {
    uidManagerStatus.innerHTML = "uid-manager downloaded"
  } else if(fileName === "config.json") {
    configJsonStatus.innerHTML = "config.json downloaded"
  }
}
);


ipcRenderer.on('service:status', (serviceStatus) => {
  console.log("comgin here")
  console.log(serviceStatus)
  for(let service of serviceStatus) {
    if(!service.isRunning) {
      startServiceButton.innerHTML = "Service Startup Failed"
      alert(`${service.name} is not running`)
    } else {
      startServiceButton.innerHTML = "Service Started"
    }
  }
})