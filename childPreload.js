const { contextBridge, ipcRenderer } = require('electron')

// contextBridge.exposeInMainWorld('electronAPI', {
//   setTitle: (title) => ipcRenderer.send('set-title', title)
// })

// contextBridge.exposeInMainWorld('windowSwitch', {
//   openChildWindow: () => ipcRenderer.send('openChildWindow')
// })

contextBridge.exposeInMainWorld('windowChange', {
  closeChildWindow: () => ipcRenderer.send('closeChildWindow')
})


contextBridge.exposeInMainWorld('download', {
  downloadFile: (url) => ipcRenderer.send('downloadFile', url)
})

contextBridge.exposeInMainWorld('start', {
  services: () => ipcRenderer.send('startServices', 'childWindow')
})


contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateCounter: (callback) => ipcRenderer.on('update-counter', callback)
})

contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) =>
    ipcRenderer.on(channel, (event, ...args) => func(...args)),
});