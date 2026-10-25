const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');
if (typeof global.WebSocket === 'undefined') {
  global.WebSocket = WebSocket;
}

process.on('uncaughtException', (err) => {
  if (err && err.message && err.message.includes('WebSocket was closed before')) {
    // Harmless socket teardown race condition during reconnect
    return;
  }
  console.error('[Main] Uncaught exception:', err);
});

const { openTradovateLoginWindow } = require('./tradovate-auth');
const { DesktopCopierEngine } = require('./copier-engine');

let mainWindow = null;
let activeWs = null;
let activeToken = null;
let activeEnvironment = 'demo';
let activeAccounts = [];
let currentUserId = null;
let reqId = 1;

// --- Per-User Storage Helpers ---
function getBaseDataDir() {
  try {
    if (app && typeof app.getPath === 'function') {
      return app.getPath('userData');
    }
  } catch (e) {}
  return path.join(__dirname, '..');
}

function getGlobalAuthSessionPath() {
  return path.join(getBaseDataDir(), 'edgeflow-session.json');
}

function loadGlobalAuthSession() {
  try {
    const p = getGlobalAuthSessionPath();
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading global auth session:', e);
  }
  return null;
}

function saveGlobalAuthSession(session) {
  try {
    const p = getGlobalAuthSessionPath();
    if (!session) {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    } else {
      fs.writeFileSync(p, JSON.stringify(session, null, 2), 'utf8');
    }
  } catch (e) {
    console.error('Error saving global auth session:', e);
  }
}

function getUserConfigPath(userId) {
  const safeId = userId ? String(userId).replace(/[^a-zA-Z0-9_\-]/g, '_') : 'guest';
  return path.join(getBaseDataDir(), `copier-user-${safeId}.json`);
}

function loadStoredUserConfig(userId) {
  if (!userId) {
    return {
      tradovateToken: null,
      environment: 'demo',
      masterAccountId: null,
      masterAccountName: '',
      slaves: [],
      isPaused: false,
    };
  }
  try {
    const p = getUserConfigPath(userId);
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    }
  } catch (e) {
    console.error(`Error loading user config for ${userId}:`, e);
  }
  return {
    tradovateToken: null,
    environment: 'demo',
    masterAccountId: null,
    masterAccountName: '',
    slaves: [],
    isPaused: false,
  };
}

function saveUserConfig(userId, data) {
  if (!userId) return null;
  try {
    const p = getUserConfigPath(userId);
    const current = loadStoredUserConfig(userId);
    const updated = { ...current, ...data };
    fs.writeFileSync(p, JSON.stringify(updated, null, 2), 'utf8');
    return updated;
  } catch (e) {
    console.error(`Error saving user config for ${userId}:`, e);
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
        fetch(`${baseUrl}/cashBalance/list`, {
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

function safeCloseWebSocket(ws) {
  if (!ws) return;
  try {
    ws.on('error', () => {}); // swallow close errors on pending sockets
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
    setTimeout(() => {
      try {
        ws.removeAllListeners();
      } catch (e) {}
    }, 50);
  } catch (e) {}
}

let isRestoringSession = false;

async function restoreUserTradovateSession(userCfg) {
  if (!userCfg || !userCfg.tradovateToken) return;
  if (isRestoringSession) return;
  if (activeWs && (activeWs.readyState === WebSocket.OPEN || activeWs.readyState === WebSocket.CONNECTING)) {
    return;
  }
  isRestoringSession = true;
  activeToken = userCfg.tradovateToken;
  activeEnvironment = userCfg.environment || 'demo';

  try {
    const result = await fetchTradovateAccountsRest(activeToken, activeEnvironment);
    if (result && result.accounts && result.accounts.length > 0) {
      activeAccounts = result.accounts;
      activeEnvironment = result.env;
      sendToRenderer('tradovate:accounts', activeAccounts);
    }
    connectTradovateWs(activeToken, activeEnvironment);
  } catch (err) {
    console.error('[TradovateREST] Error restoring user session:', err);
  } finally {
    isRestoringSession = false;
  }
}

function connectTradovateWs(token, environment = 'demo') {
  activeToken = token;
  activeEnvironment = environment;

  if (activeWs) {
    safeCloseWebSocket(activeWs);
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
  let authReqId = null;

  const authWatchdog = setTimeout(() => {
    if (!isAuthorized && activeWs) {
      console.warn(`[DesktopWS] Authorization timed out on ${wsUrl}`);
      try {
        activeWs.close();
      } catch (e) {}
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
    authReqId = reqId++;
    activeWs.send(`authorize\n${authReqId}\n\n${token}`);
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
          // Success: HTTP 200 response to authorize or incoming user payload
          if (msg.s === 200 && (!isAuthorized || msg.i === authReqId)) {
            isAuthorized = true;
            clearTimeout(authWatchdog);

            console.log('[DesktopWS] Authorized successfully!');
            sendToRenderer('ws:status', { status: 'connected', latency: 12, environment });

            // Request user sync, accounts list, and cash balances
            const syncId = reqId++;
            activeWs.send(`user/syncrequest\n${syncId}\n\n{}`);

            const accListId = reqId++;
            activeWs.send(`account/list\n${accListId}\n\n{}`);

            const cashListId = reqId++;
            activeWs.send(`cashBalance/list\n${cashListId}\n\n{}`);
          } else if (msg.s && msg.s !== 200 && (msg.i === authReqId || !isAuthorized)) {
            clearTimeout(authWatchdog);
            console.error(`[DesktopWS] Authorization rejected by Tradovate (${msg.s}):`, msg.d);
            sendToRenderer('ws:status', {
              status: 'error',
              error: `Tradovate rechazo la autorizacion: ${msg.d?.errorText || msg.s}`,
              environment,
            });
            sendToRenderer('app:log', {
              time: new Date().toLocaleTimeString(),
              msg: `<span style="color: #fb7185;">❌ Error de autorización en Tradovate (${environment.toUpperCase()}): ${msg.d?.errorText || 'Token inválido'}.</span>`,
            });
          }

          // 1. Check for incoming cash balances from cashBalance/list, user/syncrequest, or props
          const incomingBalances =
            msg.d?.cashBalances ||
            (Array.isArray(msg.d) &&
            msg.d.length > 0 &&
            typeof msg.d[0].amount !== 'undefined' &&
            typeof msg.d[0].accountId !== 'undefined'
              ? msg.d
              : null);

          if (incomingBalances && incomingBalances.length > 0) {
            let updated = false;
            for (const cb of incomingBalances) {
              const acc = activeAccounts.find((a) => a.id === cb.accountId);
              if (acc) {
                acc.balance = cb.amount;
                updated = true;
              }
            }
            if (updated) {
              sendToRenderer('tradovate:accounts', activeAccounts);
            }
          }

          if (msg.e === 'props' && msg.d?.entityType === 'cashBalance') {
            const cb = msg.d.entity;
            if (cb && typeof cb.accountId !== 'undefined' && typeof cb.amount !== 'undefined') {
              const acc = activeAccounts.find((a) => a.id === cb.accountId);
              if (acc) {
                acc.balance = cb.amount;
                sendToRenderer('tradovate:accounts', activeAccounts);
              }
            }
          }

          // 2. Check for incoming accounts list
          const isAccountArray =
            Array.isArray(msg.d) &&
            msg.d.length > 0 &&
            msg.d[0] &&
            typeof msg.d[0].name === 'string' &&
            typeof msg.d[0].amount === 'undefined';

          if (msg.d && (msg.d.accounts || isAccountArray)) {
            const rawAccounts = msg.d.accounts || msg.d;
            if (rawAccounts.length > 0) {
              const balances = msg.d.cashBalances || [];
              activeAccounts = rawAccounts.map((a) => {
                const existing = activeAccounts.find((curr) => curr.id === a.id);
                const cash = balances.find((c) => c.accountId === a.id);
                const balance =
                  cash?.amount ??
                  (existing && typeof existing.balance === 'number' && existing.balance > 0
                    ? existing.balance
                    : a.balance ?? 0);

                return {
                  id: a.id,
                  name: a.name,
                  balance,
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

// --- IPC Handlers ---

// Auth Handlers
ipcMain.handle('auth:login', async (event, { email, password }) => {
  const res = await copierEngine.login(email, password);
  if (res.success && res.user) {
    currentUserId = res.user.id;
    saveGlobalAuthSession(res.session);

    // Load this specific user's config
    const userCfg = loadStoredUserConfig(currentUserId);
    copierEngine.updateConfig(userCfg);
    if (userCfg.riskConfig) copierEngine.updateRiskConfig(userCfg.riskConfig);

    // If this user already has a Tradovate connection, restore it cleanly
    if (userCfg.tradovateToken) {
      restoreUserTradovateSession(userCfg);
    } else {
      activeToken = null;
      activeAccounts = [];
      safeCloseWebSocket(activeWs);
      activeWs = null;
      sendToRenderer('tradovate:accounts', []);
      sendToRenderer('ws:status', { status: 'disconnected', latency: 0 });
    }
  }
  return res;
});

ipcMain.handle('auth:get-session', async () => {
  const savedSession = loadGlobalAuthSession();
  if (savedSession) {
    const ok = await copierEngine.restoreSession(savedSession);
    if (ok && copierEngine.currentUser) {
      currentUserId = copierEngine.currentUser.id;
      const userCfg = loadStoredUserConfig(currentUserId);
      copierEngine.updateConfig(userCfg);
      if (userCfg.riskConfig) copierEngine.updateRiskConfig(userCfg.riskConfig);

      if (userCfg.tradovateToken) {
        restoreUserTradovateSession(userCfg);
      }

      return { authenticated: true, user: copierEngine.currentUser };
    }
  }
  currentUserId = null;
  return { authenticated: false };
});

ipcMain.handle('auth:logout', async () => {
  await copierEngine.logout();
  saveGlobalAuthSession(null);
  currentUserId = null;
  activeToken = null;
  activeAccounts = [];
  safeCloseWebSocket(activeWs);
  activeWs = null;
  sendToRenderer('tradovate:accounts', []);
  sendToRenderer('ws:status', { status: 'disconnected', latency: 0 });
  return { success: true };
});

// User-Scoped Copier Configuration
ipcMain.handle('app:get-config', () => {
  return loadStoredUserConfig(currentUserId);
});

ipcMain.handle('copier:update-config', (event, cfg) => {
  const updated = saveUserConfig(currentUserId, cfg);
  copierEngine.updateConfig(cfg);
  return { success: true, config: updated };
});

ipcMain.handle('copier:set-paused', (event, isPaused) => {
  saveUserConfig(currentUserId, { isPaused });
  copierEngine.updateConfig({ isPaused });
  return { success: true, isPaused };
});

// Risk Guardian Handlers (Strictly Scoped by Authenticated User)
ipcMain.handle('risk:get-config', () => {
  const userCfg = loadStoredUserConfig(currentUserId);
  return userCfg.riskConfig || copierEngine.riskConfig;
});

ipcMain.handle('risk:save-config', async (event, riskCfg) => {
  saveUserConfig(currentUserId, { riskConfig: riskCfg });
  copierEngine.updateRiskConfig(riskCfg);

  // Sync to Supabase account_risk_configs if user is authenticated
  if (copierEngine.currentUser) {
    try {
      await copierEngine.supabase.from('account_risk_configs').upsert(
        {
          user_id: copierEngine.currentUser.id,
          account_id: copierEngine.masterAccountId
            ? String(copierEngine.masterAccountId)
            : 'default-master',
          template_id: riskCfg.templateId || null,
          daily_loss_limit_amount: riskCfg.dailyLossLimit || 1000,
          daily_loss_limit_action: riskCfg.dailyLossAction || 'liquidate',
          daily_profit_target_amount: riskCfg.dailyProfitLock || null,
          max_contracts_limit: riskCfg.maxContracts || 5,
          auto_eod_close_time: riskCfg.eodCloseTime || null,
          is_active: riskCfg.isActive !== false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'account_id' }
      );
    } catch (e) {
      console.warn('[CopierEngine] Non-critical error syncing risk config to cloud:', e.message);
    }
  }

  return { success: true, riskConfig: riskCfg };
});

// Tradovate Handlers (Scoped per user)
ipcMain.handle('tradovate:get-accounts', async () => {
  if (activeAccounts.length > 0) return activeAccounts;
  if (!currentUserId) return [];
  const userCfg = loadStoredUserConfig(currentUserId);
  if (userCfg.tradovateToken) {
    const result = await fetchTradovateAccountsRest(userCfg.tradovateToken, userCfg.environment || 'demo');
    if (result && result.accounts.length > 0) {
      activeAccounts = result.accounts;
      return activeAccounts;
    }
  }
  return [];
});

ipcMain.handle('tradovate:open-login', (event, options = {}) => {
  return new Promise((resolve) => {
    const userCfg = loadStoredUserConfig(currentUserId);
    const chosenEnv = options.environment || userCfg.environment || 'demo';

    // Partition is strictly isolated per currentUserId
    openTradovateLoginWindow(mainWindow, chosenEnv, currentUserId, async ({ token, environment }) => {
      activeToken = token;

      // 1. Fetch accounts
      const result = await fetchTradovateAccountsRest(token, environment);
      const effectiveEnv = result.env || environment;
      activeEnvironment = effectiveEnv;

      saveUserConfig(currentUserId, {
        tradovateToken: token,
        environment: effectiveEnv,
      });

      if (result.accounts && result.accounts.length > 0) {
        activeAccounts = result.accounts;
        sendToRenderer('tradovate:accounts', activeAccounts);
        sendToRenderer('app:log', {
          time: new Date().toLocaleTimeString(),
          msg: `✅ Detectadas <strong>${result.accounts.length} cuenta(s)</strong> en Tradovate (${effectiveEnv.toUpperCase()}).`,
        });
      } else {
        activeAccounts = [];
        sendToRenderer('tradovate:accounts', []);
        sendToRenderer('app:log', {
          time: new Date().toLocaleTimeString(),
          msg: `<span style="color: #fbbf24;">⚠️ Sesión conectada, pero este usuario de Tradovate no tiene cuentas de trading registradas. Inicia sesión con tus credenciales de fondeo/demo en Tradovate.</span>`,
        });
      }

      // 2. Connect WebSocket
      connectTradovateWs(token, effectiveEnv);
      resolve({ success: true, token, environment: effectiveEnv });
    });
  });
});

ipcMain.handle('tradovate:connect-token', async (event, { token, environment }) => {
  activeToken = token;
  const env = environment || 'demo';
  saveUserConfig(currentUserId, { tradovateToken: token, environment: env });

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

ipcMain.handle('tradovate:disconnect', async () => {
  activeToken = null;
  activeAccounts = [];
  safeCloseWebSocket(activeWs);
  activeWs = null;
  if (currentUserId) {
    saveUserConfig(currentUserId, { tradovateToken: null });
    try {
      const safeId = currentUserId.replace(/[^a-zA-Z0-9_\-]/g, '_');
      const authSession = session.fromPartition(`persist:tradovate-user-${safeId}`);
      await authSession.clearStorageData();
    } catch (e) {}
  }
  sendToRenderer('tradovate:accounts', []);
  sendToRenderer('ws:status', { status: 'disconnected', latency: 0 });
  return { success: true };
});

// Cloud & Auxiliary Handlers (Strictly Scoped by Authenticated User)
ipcMain.handle('cloud:get-accounts', async () => {
  return await copierEngine.getCloudAccounts();
});

ipcMain.handle('cloud:get-logs', async () => {
  return await copierEngine.getCloudCopierLogs();
});

ipcMain.handle('cloud:get-news', async () => {
  return await copierEngine.getEconomicNews();
});

app.whenReady().then(async () => {
  createWindow();

  // Clean up any legacy flat config file
  try {
    const legacyPath = path.join(getBaseDataDir(), 'copier-config.json');
    if (fs.existsSync(legacyPath)) {
      fs.unlinkSync(legacyPath);
    }
  } catch (e) {}

  // Restore EdgeFlow Auth session if available
  const savedSession = loadGlobalAuthSession();
  if (savedSession) {
    const ok = await copierEngine.restoreSession(savedSession);
    if (ok && copierEngine.currentUser) {
      currentUserId = copierEngine.currentUser.id;
      const userCfg = loadStoredUserConfig(currentUserId);
      copierEngine.updateConfig(userCfg);
      if (userCfg.riskConfig) copierEngine.updateRiskConfig(userCfg.riskConfig);

      if (userCfg.tradovateToken) {
        restoreUserTradovateSession(userCfg);
      }
    }
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
