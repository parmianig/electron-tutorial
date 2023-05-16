const electron = require("electron");
const { app, BrowserWindow, ipcMain } = require("electron")
const path = require('path');
const fs = require('fs')
const webp = require('webp-converter');
const { abort } = require("process");
webp.grant_permission();

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
            frame: false,
            x: externalDisplay.bounds.x + 50,
            y: externalDisplay.bounds.y + 50,
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

const resourcesPath = path.resolve('resources');
ipcMain.on('image:convert', () => {
    const nonWebPFiles = fs
        .readdirSync(resourcesPath)
        .filter(file => !file.endsWith('.webp'));

    nonWebPFiles.forEach(file => {
        const absolutePath = path.resolve(resourcesPath, file);
        fs.stat(absolutePath, (err, stats) => {
            if (err) {
                throw err;
            }

            if (stats.isDirectory() || stats.isSymbolicLink()) {
                return;
            }

            const fileNameWithoutExtension = path.parse(absolutePath).name;
            try {
                const result = webp.cwebp(
                    absolutePath,
                    `${path.join(resourcesPath, fileNameWithoutExtension)}.webp`,
                    "-q 80",
                    logging = "-v"
                );
                result.then((response) => {
                    console.log(response);
                    mainWindow.webContents.send('image:convert');
                });
            } catch (error) {
                console.log(`Warning! ${absolutePath} is not a valid file to be processed with webp`)
            }

        });
    });
})

ipcMain.on('window:minimize', () => {
    mainWindow.minimize();
})
ipcMain.on('window:maximize', () => {
    mainWindow.isMaximized()? mainWindow.unmaximize() : mainWindow.maximize();
})
ipcMain.on('window:close', () => {
    mainWindow.close();
})