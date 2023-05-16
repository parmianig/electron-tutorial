const { app, BrowserWindow, ipcMain } = require("electron")
const fs = require('fs')
const path = require('path');
const webp = require('webp-converter');
webp.grant_permission();

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

            if (stats.isDirectory()) {
                return;
            }

            const fileNameWithoutExtension = path.parse(absolutePath).name;
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
        });
    });


})