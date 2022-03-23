// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const mqtt = require('mqtt')
const { info } = require('console')

var connection_flag = false
const host = 'test.mosquitto.org'
const port = '1883'
const clientId = `nextronic-service`
    // mqtt connect 
const connectUrl = `mqtt://${host}:${port}`
var client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
})
client.on('connect', () => {
    connection_flag = true

})
client.on('close', function() {
    connection_flag = false
})

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1024,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: true
        }
    });
    ipcMain.on('notifyBox', (event, message) => {
        console.log("show Box")
        dialog.showMessageBox(mainWindow, {
            type: "info",
            message: "Thank you for your Concern , your feedback has been sent",
            title: message,
        })
    });
    ipcMain.on('sendEvaluation', (event, message) => {
            console.log("[i] data has been pulish MQTT")
            if (!connection_flag) {
                client = mqtt.connect(connectUrl, {
                    clientId,
                    clean: true,
                    connectTimeout: 4000,
                    reconnectPeriod: 1000,
                })
            }
            client.publish('nextronic/serivce/events', JSON.stringify({
                'serial': 'device1',
                'opinion': message
            }));
        })
        // and load the index.html of the app.
    mainWindow.loadFile('index.html')
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow()
    app.on('activate', function() {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit()
})