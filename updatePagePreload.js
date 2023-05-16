const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('mark', {
  update: () => ipcRenderer.send('updateMark')
})

contextBridge.exposeInMainWorld('start', {
  services: () => ipcRenderer.send('startServices', 'updateWindow')
})

contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) =>
    ipcRenderer.on(channel, (event, ...args) => func(...args)),
});