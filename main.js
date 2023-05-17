const electron = require("electron");
const { app, BrowserWindow, ipcMain } = require("electron")
const path = require('path');

let mainWindow

const createWindow = () => {
    let displays = electron.screen.getAllDisplays()
    let externalDisplay = displays.find((display) => {
        return display.bounds.x !== 0 || display.bounds.y !== 0
    })

    if (externalDisplay) {
        mainWindow = new BrowserWindow({
            width: 1600,
            height: 900,
            x: externalDisplay.bounds.x + 1200,
            y: externalDisplay.bounds.y - 20,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                preload: path.join(__dirname, 'preload.js')
            }
        })
    }

    mainWindow.loadFile("index.html")
}

app.whenReady().then(() => {
    createWindow()
})