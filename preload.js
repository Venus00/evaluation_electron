const { dialog, contextBridge, ipcRenderer } = require('electron')


const test = {
    notify: (message) => ipcRenderer.send('notifyBox', message),
    publishMQTT: (message) => ipcRenderer.send('sendEvaluation', message)
}

contextBridge.exposeInMainWorld("api", test);