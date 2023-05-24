const electron = require("electron");
const { app, BrowserWindow, ipcMain, Menu, MenuItem } = require("electron")
const path = require('path');

const setMainMenu = () => {
    const isMac = process.platform === 'darwin'
    const template = [
        // { role: 'appMenu' }
        ...(isMac ? [{
            label: app.name,
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        }] : []),
        // { role: 'fileMenu' }
        {
            label: 'File',
            submenu: [
                isMac ? { role: 'close' } : { role: 'quit' },
                { label: 'triggerMenuEvent', click: triggerMenuEvent, accelerator: 'Ctrl+Cmd+I' },
                { label: 'triggerDisableMenu', click: triggerDisableMenu, accelerator: 'Ctrl+Cmd+D', id: 'disable' }
            ]
        },
        // { role: 'editMenu' }
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                ...(isMac ? [
                    { role: 'pasteAndMatchStyle' },
                    { role: 'delete' },
                    { role: 'selectAll' },
                    { type: 'separator' },
                    {
                        label: 'Speech',
                        submenu: [
                            { role: 'startSpeaking' },
                            { role: 'stopSpeaking' }
                        ]
                    }
                ] : [
                    { role: 'delete' },
                    { type: 'separator' },
                    { role: 'selectAll' }
                ])
            ]
        },
        // { role: 'viewMenu' }
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        // { role: 'windowMenu' }
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                ...(isMac ? [
                    { type: 'separator' },
                    { role: 'front' },
                    { type: 'separator' },
                    { role: 'window' }
                ] : [
                    { role: 'close' }
                ])
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click: async () => {
                        const { shell } = require('electron')
                        await shell.openExternal('https://electronjs.org')
                    }
                }
            ]
        }
    ]

    return Menu.buildFromTemplate(template)
}

let mainWindow
const createWindow = () => {
    let displays = electron.screen.getAllDisplays()
    let externalDisplay = displays.find((display) => {
        return display.bounds.x !== 0 || display.bounds.y !== 0
    })

    if (externalDisplay) {
        mainWindow = new BrowserWindow({
            width: 1000,
            height: 900,
            x: externalDisplay.bounds.x + 1300,
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
    Menu.setApplicationMenu(setMainMenu())
})

function triggerMenuEvent() {
    mainWindow.webContents.send('menuEvent')
    Menu.getApplicationMenu().insert(0, new MenuItem({
        label: 'add',
        submenu: [
            { label: 'add now' },
            { label: 'add after' }
        ]
    }))
}

function triggerDisableMenu() {
    mainWindow.webContents.send('disableEvent')
    Menu.getApplicationMenu()
        .getMenuItemById("disable").visible = false
}