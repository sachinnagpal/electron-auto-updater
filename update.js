let updateBtn = document.getElementById("update")
let startBtn = document.getElementById("run-services")

updateBtn.addEventListener("click", e => {
  updateBtn.innerHTML = "Updating O4S..."
  window.mark.update()
})

startBtn.addEventListener("click", e => {
  startBtn.innerHTML = "Runing O4S..."
  window.start.services()
})

ipcRenderer.on('service:updateStatus', (serviceStatus) => {
  console.log(serviceStatus)
  if(serviceStatus === "updated") {
    updateBtn.innerHTML = "Updated O4S"
  } else if(serviceStatus === "update not required") {
    updateBtn.innerHTML = "No update available"
  }
  // for(let service of serviceStatus) {
  //   if(!service.isRunning) {
  //     startServiceButton.innerHTML = "Service Startup Failed"
  //     alert(`${service.name} is not running`)
  //   } else {
  //     startServiceButton.innerHTML = "Service Started"
  //   }
  // }
})

ipcRenderer.on('service:status', (serviceStatus) => {
  console.log("comgin here")
  console.log(serviceStatus)
  for(let service of serviceStatus) {
    if(!service.isRunning) {
      startBtn.innerHTML = "Service Startup Failed"
      alert(`${service.name} is not running`)
    } else {
      startBtn.innerHTML = "Service Started"
    }
  }
})