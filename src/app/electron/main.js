import { app, BrowserWindow } from "electron";
import path from "path";
import { exec } from "child_process";

const isDev = !app.isPackaged;
let mainWindow;
let serverProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    if (isDev) {
        mainWindow.loadURL("http://localhost:3000");
    } else {
        // Correct path for packaged app
        const serverPath = path.join(process.resourcesPath, "app", "server.js");

        serverProcess = exec(`node "${serverPath}"`, (error, stdout, stderr) => {
            if (error) console.error("Error starting Next.js server:", error);
            if (stderr) console.error("Next.js server stderr:", stderr);
            if (stdout) console.log("Next.js server stdout:", stdout);
        });

        // Wait for the server to start
        setTimeout(() => {
            mainWindow.loadURL("http://localhost:3000");
        }, 3000);
    }
}

app.whenReady().then(() => {
    createWindow();
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (serverProcess) serverProcess.kill(); // Stop Next.js server when app closes
    if (process.platform !== "darwin") app.quit();
});
