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
let activeEnvironment = 'demo';
let activeAccounts = [];
let reqId = 1;

function getConfigPath() {
  try {
    if (app && typeof app.getPath === 'function') {
      return path.join(app.getPath('userData'), 'copier-config.json');
    }
  } catch (e) {}
  return path.join(__dirname, '../copier-config.json');
}

function loadStoredConfig() {
  try {
    const configPath = getConfigPath();
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading config:', e);
  }
  return {
    authSession: null,
    tradovateToken: null,
    environment: 'demo',
    masterAccountId: null,
    masterAccountName: '',
    slaves: [],
    isPaused: false,
  };
}

function saveConfig(data) {
  try {
    const configPath = getConfigPath();
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

async function fetchTradovateAccountsRest(token, environment = 'demo') {
  async function tryFetch(env) {
    const baseUrl =
      env === 'live'
        ? 'https://live.tradovateapi.com/v1'
        : 'https://demo.tradovateapi.com/v1';

    try {
      console.log(`[TradovateREST] Checking accounts on ${baseUrl}...`);
      const [accRes, cashRes] = await Promise.all([
        fetch(`${baseUrl}/account/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }),
        fetch(`${baseUrl}/cashBalance/getcashbalances`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }),
      ]);

      if (accRes.ok) {
        const accounts = await accRes.json();
        let cashBalances = [];
        if (cashRes.ok) {
          try {
            cashBalances = await cashRes.json();
          } catch (e) {}
        }

        if (Array.isArray(accounts) && accounts.length > 0) {
          console.log(`[TradovateREST] Found ${accounts.length} accounts on ${env.toUpperCase()}!`);
          return {
            env,
            accounts: accounts.map((a) => {
              const cash = (cashBalances || []).find((c) => c.accountId === a.id);
              return {
                id: a.id,
                name: a.name,
                accountType: a.accountType || 'Customer',
                balance: cash?.amount ?? 0,
              };
            }),
          };
        }
      }
    } catch (err) {
      console.error(`[TradovateREST] Error on ${env}:`, err.message);
    }
    return null;
  }

  // 1. Try requested environment first
  const primary = await tryFetch(environment);
  if (primary && primary.accounts.length > 0) return primary;

  // 2. Fallback to alternative environment
  const altEnv = environment === 'live' ? 'demo' : 'live';
  console.log(`[TradovateREST] 0 accounts on ${environment}, checking fallback ${altEnv}...`);
  const fallback = await tryFetch(altEnv);
  if (fallback && fallback.accounts.length > 0) return fallback;

  return { env: environment, accounts: [] };
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
    width: 1100,
    height: 800,
    minWidth: 920,
    minHeight: 660,
    title: 'PropFirm Tracker Copier Pro',
    backgroundColor: '#090d16',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.webContents.on('did-finish-load', () => {
    if (activeAccounts && activeAccounts.length > 0) {
      sendToRenderer('tradovate:accounts', activeAccounts);
    }
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function connectTradovateWs(token, environment = 'demo') {
  activeToken = token;
  activeEnvironment = environment;

  if (activeWs) {
    try {
      activeWs.removeAllListeners();
      activeWs.close();
    } catch (e) {}
    activeWs = null;
  }

  const wsUrl =
    environment === 'live'
      ? 'wss://live.tradovateapi.com/v1/websocket'
      : 'wss://demo.tradovateapi.com/v1/websocket';

  console.log(`[DesktopWS] Connecting to ${wsUrl} from local residential IP...`);
  sendToRenderer('ws:status', { status: 'connecting', latency: 0, environment });

  activeWs = new WebSocket(wsUrl);

  let isAuthorized = false;
  const authWatchdog = setTimeout(() => {
    if (!isAuthorized && activeWs) {
      console.warn(`[DesktopWS] Authorization timed out on ${wsUrl}`);
      sendToRenderer('ws:status', {
        status: 'error',
        error: `Tiempo de espera agotado en servidor ${environment.toUpperCase()}.`,
        environment,
      });
      sendToRenderer('app:log', {
        time: new Date().toLocaleTimeString(),
        msg: `<span style="color: #fb7185;">⚠️ Tiempo de espera de autorización agotado en servidor Tradovate (${environment.toUpperCase()}). Verifica si tu cuenta es Demo o Live.</span>`,
      });
    }
  }, 7000);

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
            isAuthorized = true;
            clearTimeout(authWatchdog);

            console.log('[DesktopWS] Authorized successfully!');
            sendToRenderer('ws:status', { status: 'connected', latency: 12, environment });

            // Request user sync and accounts list
            const syncId = reqId++;
            activeWs.send(`user/syncrequest\n${syncId}\n\n{}`);

            const accListId = reqId++;
            activeWs.send(`account/list\n${accListId}\n\n{}`);
          }

          if (msg.d && (msg.d.accounts || Array.isArray(msg.d))) {
            const rawAccounts = msg.d.accounts || (Array.isArray(msg.d) ? msg.d : []);
            if (rawAccounts.length > 0) {
              const balances = msg.d.cashBalances || [];
              activeAccounts = rawAccounts.map((a) => {
                const cash = balances.find((c) => c.accountId === a.id);
                return {
                  id: a.id,
                  name: a.name,
                  balance: cash?.amount ?? 0,
                };
              });
              sendToRenderer('tradovate:accounts', activeAccounts);
            }
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
    clearTimeout(authWatchdog);
    console.error('[DesktopWS] Error:', err.message);
    sendToRenderer('ws:status', { status: 'error', error: err.message, environment });
  });

  activeWs.on('close', () => {
    clearTimeout(authWatchdog);
    console.log('[DesktopWS] Closed');
    sendToRenderer('ws:status', { status: 'disconnected', latency: 0, environment });
  });
}

// IPC Handlers - Authentication
ipcMain.handle('auth:login', async (event, { email, password }) => {
  const res = await copierEngine.login(email, password);
  if (res.success) {
    saveConfig({ authSession: res.session });
  }
  return res;
});

ipcMain.handle('auth:get-session', async () => {
  const cfg = loadStoredConfig();
  if (cfg.authSession) {
    const ok = await copierEngine.restoreSession(cfg.authSession);
    if (ok) {
      return { authenticated: true, user: copierEngine.currentUser };
    }
  }
  return { authenticated: false };
});

ipcMain.handle('auth:logout', async () => {
  await copierEngine.logout();
  saveConfig({ authSession: null, tradovateToken: null });
  activeToken = null;
  activeAccounts = [];
  if (activeWs) {
    try {
      activeWs.close();
    } catch (e) {}
    activeWs = null;
  }
  return { success: true };
});

// IPC Handlers - Config & Engine
ipcMain.handle('app:get-config', () => loadStoredConfig());

ipcMain.handle('copier:update-config', (event, cfg) => {
  const updated = saveConfig(cfg);
  copierEngine.updateConfig(cfg);
  return { success: true, config: updated };
});

ipcMain.handle('copier:set-paused', (event, isPaused) => {
  saveConfig({ isPaused });
  copierEngine.updateConfig({ isPaused });
  return { success: true, isPaused };
});

// IPC Handlers - Tradovate
ipcMain.handle('tradovate:get-accounts', async () => {
  if (activeAccounts.length > 0) return activeAccounts;
  const cfg = loadStoredConfig();
  if (cfg.tradovateToken) {
    const result = await fetchTradovateAccountsRest(cfg.tradovateToken, cfg.environment || 'demo');
    if (result && result.accounts.length > 0) {
      activeAccounts = result.accounts;
      return activeAccounts;
    }
  }
  return [];
});

ipcMain.handle('tradovate:open-login', (event, options = {}) => {
  return new Promise((resolve) => {
    const cfg = loadStoredConfig();
    const chosenEnv = options.environment || cfg.environment || 'demo';

    openTradovateLoginWindow(mainWindow, chosenEnv, async ({ token, environment }) => {
      activeToken = token;

      // 1. Fetch accounts with intelligent auto-environment fallback
      const result = await fetchTradovateAccountsRest(token, environment);
      const effectiveEnv = result.env || environment;
      activeEnvironment = effectiveEnv;

      saveConfig({ tradovateToken: token, environment: effectiveEnv });

      if (result.accounts && result.accounts.length > 0) {
        activeAccounts = result.accounts;
        sendToRenderer('tradovate:accounts', activeAccounts);
        sendToRenderer('app:log', {
          time: new Date().toLocaleTimeString(),
          msg: `✅ Detectadas <strong>${result.accounts.length} cuenta(s)</strong> en Tradovate (${effectiveEnv.toUpperCase()}).`,
        });
      } else {
        sendToRenderer('app:log', {
          time: new Date().toLocaleTimeString(),
          msg: `<span style="color: #fbbf24;">⚠️ Sesión conectada, pero este usuario de Tradovate no tiene cuentas de trading registradas. Inicia sesión con tus credenciales de fondeo/demo en Tradovate.</span>`,
        });
      }

      // 2. Connect WebSocket to effective environment
      connectTradovateWs(token, effectiveEnv);
      resolve({ success: true, token, environment: effectiveEnv });
    });
  });
});

ipcMain.handle('tradovate:connect-token', async (event, { token, environment }) => {
  activeToken = token;
  const env = environment || 'demo';
  saveConfig({ tradovateToken: token, environment: env });

  const result = await fetchTradovateAccountsRest(token, env);
  if (result.accounts && result.accounts.length > 0) {
    activeAccounts = result.accounts;
    sendToRenderer('tradovate:accounts', activeAccounts);
  }

  connectTradovateWs(token, result.env || env);
  return { success: true };
});

ipcMain.handle('tradovate:liquidate-all', () => {
  if (!activeWs || activeWs.readyState !== WebSocket.OPEN) return false;
  for (const acc of activeAccounts) {
    const id = reqId++;
    activeWs.send(
      `order/liquidateposition\n${id}\n\n${JSON.stringify({ accountId: acc.id, admin: true })}`
    );
  }
  return true;
});

app.whenReady().then(async () => {
  createWindow();

  const cfg = loadStoredConfig();

  // Restore EdgeFlow Auth session if available
  if (cfg.authSession) {
    await copierEngine.restoreSession(cfg.authSession);
  }

  // Restore Copier Config
  copierEngine.updateConfig(cfg);

  // Auto-connect Tradovate if token was saved
  if (cfg.tradovateToken) {
    activeToken = cfg.tradovateToken;
    activeEnvironment = cfg.environment || 'demo';

    // Fetch accounts via REST first with auto-fallback
    fetchTradovateAccountsRest(cfg.tradovateToken, activeEnvironment).then((result) => {
      if (result && result.accounts.length > 0) {
        activeAccounts = result.accounts;
        activeEnvironment = result.env;
        sendToRenderer('tradovate:accounts', activeAccounts);
      }
      connectTradovateWs(cfg.tradovateToken, activeEnvironment);
    });
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
