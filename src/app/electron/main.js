import { app, BrowserWindow } from 'electron';
import { exec } from 'child_process';
import path from 'path';

let mainWindow;
const NEXT_PORT = 3000;

app.on('ready', () => {
  console.log('Starting Next.js server...');

  // Start the Next.js server in production mode
  const nextServer = exec('npm run start');

  nextServer.stdout.on('data', (data) => console.log(`[Next.js]: ${data}`));
  nextServer.stderr.on('data', (data) => console.error(`[Error]: ${data}`));

  // Use the icon from the build folder
  const iconPath = path.join(app.getAppPath(), 'public', 'logo_ignomagine.png');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: iconPath,  // Use the build icon
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Wait for Next.js to start before loading the URL
  const serverCheckInterval = setInterval(() => {
    mainWindow
      .loadURL(`http://localhost:${NEXT_PORT}`)
      .then(() => {
        console.log(`App loaded at http://localhost:${NEXT_PORT}`);
        clearInterval(serverCheckInterval);
      })
      .catch(() => console.log('Waiting for server...'));
  }, 1000);

  mainWindow.on('closed', () => {
    mainWindow = null;
    nextServer.kill(); // Stop Next.js server when closing the app
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
