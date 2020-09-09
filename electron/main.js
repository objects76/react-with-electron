const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const url = require("url");
const { channels } = require("../src/shared/constants");

const { autoUpdater } = require("electron-updater");

let mainWindow;
function createWindow() {
  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, "../index.html"),
      protocol: "file:",
      slashes: true,
    });
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });
  mainWindow.loadURL(startUrl);
  mainWindow.on("closed", function () {
    mainWindow = null;
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    const log = require("electron-log");
    log.transports.file.level = "debug";
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});

// updater
autoUpdater.on("update-available", () => {
  mainWindow.webContents.send("update_available");
});
autoUpdater.on("update-downloaded", () => {
  mainWindow.webContents.send("update_downloaded");
});

ipcMain.on("restart_app", () => {
  autoUpdater.quitAndInstall();
});

// channels

ipcMain.on(channels.APP_INFO, (event) => {
  event.sender.send(channels.APP_INFO, {
    appName: app.getName(),
    appVersion: app.getVersion(),
  });
});

ipcMain.on(channels.APP_VERSION, (event) => {
  event.sender.send(channels.APP_VERSION, { version: app.getVersion() });
});
