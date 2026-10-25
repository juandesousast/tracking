const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');
const { openTradovateLoginWindow } = require('./tradovate-auth');
const { createClient } = require('@supabase/supabase-js');

let mainWindow = null;
let tray = null;
let activeWs = null;
let activeToken = null;
let activeAccounts = [];
let reqId = 1;

// Config file stored in user data directory
const configPath = path.join(app.getPath('userData'), 'copier-config.json');

function loadStoredConfig() {
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading config:', e);
  }
  return { token: null, environment: 'demo', mode: 'master', channelId: 'default' };
}

function saveConfig(data) {
  try {
    const current = loadStoredConfig();
    const updated = { ...current, ...data };
    fs.writeFileSync(configPath, JSON.stringify(updated, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving config:', e);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    title: 'EdgeFlow Copier Desktop',
    backgroundColor: '#090d16',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function connectTradovateWs(token, environment = 'demo') {
  if (activeWs) {
    try {
      activeWs.close();
    } catch (e) {}
    activeWs = null;
  }

  const wsUrl = environment === 'live'
    ? 'wss://live.tradovateapi.com/v1/websocket'
    : 'wss://demo.tradovateapi.com/v1/websocket';

  console.log(`[DesktopWS] Connecting to ${wsUrl} from local residential IP...`);
  sendToRenderer('ws:status', { status: 'connecting', latency: 0 });

  activeWs = new WebSocket(wsUrl);

  activeWs.on('open', () => {
    console.log('[DesktopWS] Open! Sending authorization...');
    const id = reqId++;
    activeWs.send(`authorize\n${id}\n\n${token}`);
  });

  activeWs.on('message', (data) => {
    const str = data.toString();
    if (str === 'o') return;
    if (str === 'h') {
      if (activeWs && activeWs.readyState === WebSocket.OPEN) {
        activeWs.send('[]');
      }
      return;
    }

    if (str.startsWith('a[')) {
      try {
        const raw = str.slice(2, -1);
        const parsed = JSON.parse(raw);
        const msgs = Array.isArray(parsed) ? parsed : [parsed];

        for (const msg of msgs) {
          if (msg.s === 200 && msg.i === 1) {
            console.log('[DesktopWS] Authorized successfully!');
            sendToRenderer('ws:status', { status: 'connected', latency: 15 });
            // Request user sync
            const syncId = reqId++;
            activeWs.send(`user/syncrequest\n${syncId}\n\n{}`);
          }

          if (msg.d && msg.d.accounts) {
            activeAccounts = msg.d.accounts.map((a) => {
              const cash = (msg.d.cashBalances || []).find((c) => c.accountId === a.id);
              return {
                id: a.id,
                name: a.name,
                balance: cash?.amount ?? 0,
              };
            });
            sendToRenderer('tradovate:accounts', activeAccounts);
          }

          // Order events
          if (msg.e === 'props' && msg.d?.entityType === 'order') {
            const order = msg.d.entity;
            sendToRenderer('tradovate:order', order);
          }
        }
      } catch (e) {
        console.error('Error parsing frame:', e);
      }
    }
  });

  activeWs.on('error', (err) => {
    console.error('[DesktopWS] Error:', err.message);
    sendToRenderer('ws:status', { status: 'error', error: err.message });
  });

  activeWs.on('close', () => {
    console.log('[DesktopWS] Closed');
    sendToRenderer('ws:status', { status: 'disconnected', latency: 0 });
  });
}

function sendToRenderer(channel, data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data);
  }
}

// IPC Handlers
ipcMain.handle('app:get-config', () => loadStoredConfig());

ipcMain.handle('tradovate:open-login', () => {
  return new Promise((resolve) => {
    openTradovateLoginWindow(mainWindow, (token) => {
      activeToken = token;
      saveConfig({ token });
      connectTradovateWs(token, 'demo');
      resolve({ success: true, token });
    });
  });
});

ipcMain.handle('tradovate:connect-token', (event, { token, environment }) => {
  activeToken = token;
  saveConfig({ token, environment });
  connectTradovateWs(token, environment || 'demo');
  return { success: true };
});

ipcMain.handle('tradovate:liquidate-all', () => {
  if (!activeWs || activeWs.readyState !== WebSocket.OPEN) return false;
  for (const acc of activeAccounts) {
    const id = reqId++;
    activeWs.send(`order/liquidateposition\n${id}\n\n${JSON.stringify({ accountId: acc.id, admin: true })}`);
  }
  return true;
});

app.whenReady().then(() => {
  createWindow();

  // Auto-connect with stored token if available
  const cfg = loadStoredConfig();
  if (cfg.token) {
    activeToken = cfg.token;
    connectTradovateWs(cfg.token, cfg.environment || 'demo');
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
