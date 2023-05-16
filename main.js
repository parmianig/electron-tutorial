const {app, BrowserWindow, ipcMain} = require("electron")
const path = require('path');

let mainWindow
const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    mainWindow.loadFile("index.html")
}

app.whenReady().then(() => {
    createWindow()
})

ipcMain.on('close-app', (e ,data) => {
    console.log(data)
    mainWindow.webContents.send('risposta', {nome: 'marco', cognome: 'bianchi'})
})