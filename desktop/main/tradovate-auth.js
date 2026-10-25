const { BrowserWindow, session } = require('electron');

/**
 * Opens an in-app native browser window loading Tradovate.
 * Automatically intercepts the session token when the user logs in,
 * with ZERO manual token copying and ZERO API fee.
 */
function openTradovateLoginWindow(parentWindow, onTokenCaptured) {
  const authSession = session.fromPartition('persist:tradovate-login');

  const authWin = new BrowserWindow({
    width: 1040,
    height: 780,
    parent: parentWindow || null,
    modal: true,
    title: 'Iniciar Sesión en Tradovate',
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

        // Detect whether user logged in to Demo or Live from the request URL
        const isDemo = details.url.includes('demo.tradovateapi.com');
        const environment = isDemo ? 'demo' : 'live';

        console.log(`[TradovateAuth] Token captured! Detected environment: ${environment.toUpperCase()}`);

        // Cleanup listener immediately to prevent duplicate triggers
        try {
          authSession.webRequest.onBeforeSendHeaders(filter, null);
        } catch (e) {}

        if (onTokenCaptured) {
          onTokenCaptured({ token, environment });
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
