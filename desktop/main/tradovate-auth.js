const { BrowserWindow, session } = require('electron');

/**
 * Opens an in-app native browser window loading Tradovate.
 * Clears old cookies so user can type their username/password (Apex, Topstep or Demo),
 * and intercepts the session token without any manual copy-paste.
 */
function openTradovateLoginWindow(parentWindow, chosenEnvironment = 'demo', onTokenCaptured) {
  const partitionName = 'persist:tradovate-auth-session';
  const authSession = session.fromPartition(partitionName);

  // Clear previous session cookies so user can log in with their desired Tradovate account
  authSession.clearStorageData();

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
          `[TradovateAuth] Token captured successfully for environment: ${chosenEnvironment.toUpperCase()}`
        );

        // Remove listener immediately to avoid duplicates
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

  authWin.loadURL('https://trader.tradovate.com');

  authWin.on('closed', () => {
    try {
      authSession.webRequest.onBeforeSendHeaders(filter, null);
    } catch (e) {}
    if (!captured) {
      console.log('[TradovateAuth] Window closed without capturing session.');
    }
  });

  return authWin;
}

module.exports = {
  openTradovateLoginWindow,
};
