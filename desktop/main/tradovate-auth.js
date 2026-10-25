const { BrowserWindow, session } = require('electron');

/**
 * Opens an in-app native browser window loading Tradovate.
 * Each EdgeFlow user has their own isolated session partition:
 * `persist:tradovate-user-${userId}`.
 * User A and User B never share Tradovate cookies, sessions, or credentials.
 */
function openTradovateLoginWindow(
  parentWindow,
  chosenEnvironment = 'demo',
  userId = 'default',
  onTokenCaptured
) {
  const safeId = userId ? userId.replace(/[^a-zA-Z0-9_\-]/g, '_') : 'default';
  const partitionName = `persist:tradovate-user-${safeId}`;
  const authSession = session.fromPartition(partitionName);

  const authWin = new BrowserWindow({
    width: 1040,
    height: 780,
    parent: parentWindow || null,
    modal: true,
    title: `Iniciar Sesión en Tradovate (${chosenEnvironment.toUpperCase()})`,
    backgroundColor: '#090d16',
    webPreferences: {
      session: authSession,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  let captured = false;

  const filter = {
    urls: ['*://*.tradovateapi.com/*'],
  };

  const headerListener = (details, callback) => {
    if (!captured && details.requestHeaders) {
      const authHeader =
        details.requestHeaders['Authorization'] || details.requestHeaders['authorization'];

      if (authHeader && authHeader.startsWith('Bearer eyJ')) {
        const token = authHeader.replace(/^Bearer\s+/i, '');
        captured = true;

        console.log(
          `[TradovateAuth] Token captured for user [${safeId}] in env: ${chosenEnvironment.toUpperCase()}`
        );

        // Remove listener immediately
        try {
          authSession.webRequest.onBeforeSendHeaders(filter, null);
        } catch (e) {}

        if (onTokenCaptured) {
          onTokenCaptured({ token, environment: chosenEnvironment });
        }

        setTimeout(() => {
          if (!authWin.isDestroyed()) {
            authWin.close();
          }
        }, 600);
      }
    }
    callback({ requestHeaders: details.requestHeaders });
  };

  authSession.webRequest.onBeforeSendHeaders(filter, headerListener);

  // Clear existing storage to force clean credentials prompt and prevent cross-account leakage
  authSession.clearStorageData().catch(() => {}).finally(() => {
    if (!authWin.isDestroyed()) {
      authWin.loadURL('https://trader.tradovate.com');
    }
  });

  authWin.on('closed', () => {
    try {
      authSession.webRequest.onBeforeSendHeaders(filter, null);
    } catch (e) {}
    if (!captured) {
      console.log(`[TradovateAuth] Window closed for user [${safeId}] without capturing session.`);
    }
  });

  return authWin;
}

module.exports = {
  openTradovateLoginWindow,
};
