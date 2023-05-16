const fileInput = document.querySelector("input"),
// downloadBtn = document.querySelector("button");
// updateBtn = document.getElementById("update-button")
uidManagerStatus = document.getElementById("uid-manager-status")
uidManagerDownloader = document.getElementById("uid-manager-spinner")
mongoStatus = document.getElementById("mongo-status")
mongoSpinner = document.getElementById("mongo-spinner")
serviceSpinner = document.getElementById("service-spinner")
serviceStatus = document.getElementById("service-status")

// window.electronAPI.setTitle(title)
// const ipc = window.require('electron').ipcRenderer;
// installBtn = document.querySelector("install-button")
// downloadBtn.addEventListener("click", e => {
//     e.preventDefault();
//     downloadBtn.innerText = "Downloading file...";
//     fetchFile(fileInput.value);
// });

// installBtn = document.getElementById("install");
// // installBtn.addEventListener("click", e => {
//   // windowSwitch
//   // ipc.send('openChildWindow');  
//   // window.windowSwitch.openChildWindow()
//   // e.preventDefault();
//   // installBtn.innerText = "Downloading o4s services...";
//   // fetchFile("https://mark-assets.s3.ap-south-1.amazonaws.com/uid-manager.exe")
// // })
// updateBtn.addEventListener("click", e => {
//   // windowSwitch
//   // ipc.send('openChildWindow');  
//   window.updateWindow.open()
//   // e.preventDefault();
//   // installBtn.innerText = "Downloading o4s services...";
//   // fetchFile("https://mark-assets.s3.ap-south-1.amazonaws.com/uid-manager.exe")
// })
function fetchFile(url) {
    fetch(url).then(res => res.blob()).then(file => {
        let tempUrl = URL.createObjectURL(file);
        const aTag = document.createElement("a");
        aTag.href = tempUrl;
        aTag.download = url.replace(/^.*[\\\/]/, '');
        document.body.appendChild(aTag);
        aTag.click();
        installBtn.innerText = "Download File";
        URL.revokeObjectURL(tempUrl);
        aTag.remove();
    }).catch(() => {
        alert("Failed to download file!");
        installBtn.innerText = "Download File";
    });
}

// ipcRenderer.on('service:status', (serviceStatus) => {
//   for(let service of serviceStatus) {
//     if(service.downloaded) {
//       let element = document.getElementById(service.name + "")
//     }
//   }
//   console.log(status)
//   // alert(`Downloaded ${fileName}`)
//   if(status === "Downloading uid-manager") {
//     console.log("asd")
//     // fa fa-solid fa-spinner fa-spin
//     // uidManagerDownloader.classList.ad
//     uidManagerDownloader.classList.add("fa","fa-solid", "fa-spinner", "fa-spin" )
//     // uidManagerDownloader.classList.add("fa-solid")
//     // uidManagerDownloader.classList.add("fa-spinner")
//     // uidManagerDownloader.classList.add("fa-spin")

//   }
//   uidManagerStatus.innerHTML = status
//   if(status === "Downloaded uid-manager") {
//     uidManagerDownloader.classList.remove("fa","fa-solid", "fa-spinner", "fa-spin" )
//     uidManagerDownloader.classList.add("fa" ,"fa-check-square-o" )
//     // alert(`Downloaded uid-manager`)
//     serviceStatus.innerText = "Service running at localhost:8080"
//   } 
// });

ipcRenderer.on('uid-manager:status', (status) => {
  console.log(status)
  // alert(`Downloaded ${fileName}`)
  if(status === "Downloading uid-manager") {
    console.log("asd")
    // fa fa-solid fa-spinner fa-spin
    // uidManagerDownloader.classList.ad
    uidManagerDownloader.classList.add("fa","fa-solid", "fa-spinner", "fa-spin" )
    // uidManagerDownloader.classList.add("fa-solid")
    // uidManagerDownloader.classList.add("fa-spinner")
    // uidManagerDownloader.classList.add("fa-spin")

  }
  uidManagerStatus.innerHTML = status
  if(status === "Downloaded uid-manager") {
    uidManagerDownloader.classList.remove("fa","fa-solid", "fa-spinner", "fa-spin" )
    uidManagerDownloader.classList.add("fa" ,"fa-check-square-o" )
    // alert(`Downloaded uid-manager`)
    // serviceStatus.innerText = "Service running at localhost:8080"
  } 
});

ipcRenderer.on('mongo:status', (status) => {
  console.log("comint to mongo status")
  console.log(status)
  if(status === "Downloading mongo") {
    // fa fa-solid fa-spinner fa-spin
    // uidManagerDownloader.classList.ad
    mongoSpinner.classList.add("fa","fa-solid", "fa-spinner", "fa-spin" )
    // uidManagerDownloader.classList.add("fa-solid")
    // uidManagerDownloader.classList.add("fa-spinner")
    // uidManagerDownloader.classList.add("fa-spin")

  }
  mongoStatus.innerHTML = status
  if(status === "Downloaded mongo") {
    console.log("coming here")
    mongoSpinner.classList.remove("fa","fa-solid", "fa-spinner", "fa-spin" )
    mongoSpinner.classList.add("fa" ,"fa-check-square-o" )
    // alert(`Downloaded mongo`)
    serviceStatus.innerText = "Service running at localhost:8080"
  } 
});

ipcRenderer.on('services-running:status', (status) => {
  console.log("comint to service status")
  let errorMessage = ''
  for(let service of status) {
    if(!service.isRunning) {
      errorMessage = errorMessage + `Service ${service.name} startup failed <br>`
    }
  }
  if(errorMessage) {
    serviceStatus.innerHTML = errorMessage
  } else {
    serviceStatus.innerHTML = "Mark is up and running at localhost:8080"
  }
  console.log(status)
  console.log(errorMessage)
  // if(status === "Running Services") {
  //   // fa fa-solid fa-spinner fa-spin
  //   // uidManagerDownloader.classList.ad
  //   serviceSpinner.classList.add("fa","fa-solid", "fa-spinner", "fa-spin" )
  //   // uidManagerDownloader.classList.add("fa-solid")
  //   // uidManagerDownloader.classList.add("fa-spinner")
  //   // uidManagerDownloader.classList.add("fa-spin")

  // }
  // serviceStatus.innerHTML = status
  // if(status === "Started Services") {
  //   // console.log("coming here")
  //   serviceSpinner.classList.remove("fa","fa-solid", "fa-spinner", "fa-spin" )
  //   serviceSpinner.classList.add("fa" ,"fa-check-square-o" )
  //   // alert(`Downloaded mongo`)
  //   serviceStatus.innerText = "Service running at localhost:8080"
  // } 
});
