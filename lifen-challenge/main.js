const { app, BrowserWindow } = require("electron");

function createWindow() {
  // Cree la fenetre du navigateur.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.toggleDevTools();

  // and load the index.html of the app.
  win.loadFile("build/index.html");
}

app.on("ready", createWindow);
