const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');
if (typeof global.WebSocket === 'undefined') {
  global.WebSocket = WebSocket;
}
const { openTradovateLoginWindow } = require('./tradovate-auth');
const { DesktopCopierEngine } = require('./copier-engine');

let mainWindow = null;
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
  return {
    token: null,
    environment: 'demo',
    mode: 'local',
    channelId: 'room-default',
    masterAccountId: null,
    masterAccountName: '',
    slaves: [],
  };
}

function saveConfig(data) {
  try {
    const current = loadStoredConfig();
    const updated = { ...current, ...data };
    fs.writeFileSync(configPath, JSON.stringify(updated, null, 2), 'utf8');
    return updated;
  } catch (e) {
    console.error('Error saving config:', e);
    return null;
  }
}

function sendToRenderer(channel, data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data);
  }
}

function sendTradovateWsMessage(endpoint, body) {
  if (!activeWs || activeWs.readyState !== WebSocket.OPEN) {
    console.warn('[DesktopWS] Cannot send message, WebSocket is not open');
    return false;
  }
  const id = reqId++;
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  const frame = `${endpoint}\n${id}\n\n${payload}`;
  activeWs.send(frame);
  return true;
}

// Instantiate Copier Engine
const copierEngine = new DesktopCopierEngine({
  sendWsMessage: sendTradovateWsMessage,
  onLog: (time, msg) => sendToRenderer('app:log', { time, msg }),
  onStatusChange: (status) => sendToRenderer('app:status', status),
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 980,
    height: 740,
    minWidth: 840,
    minHeight: 620,
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

  const wsUrl =
    environment === 'live'
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
            sendToRenderer('ws:status', { status: 'connected', latency: 12 });
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
            copierEngine.handleTradovateOrder(order);
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

// IPC Handlers
ipcMain.handle('app:get-config', () => loadStoredConfig());

ipcMain.handle('copier:update-config', (event, cfg) => {
  const updated = saveConfig(cfg);
  copierEngine.updateConfig(cfg);
  return { success: true, config: updated };
});

ipcMain.handle('copier:test-signal', async (event, signal) => {
  return await copierEngine.broadcastSignal(signal);
});

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

  // Load stored config and initialize copier
  const cfg = loadStoredConfig();
  copierEngine.updateConfig(cfg);

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
  copierEngine.cleanup();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
