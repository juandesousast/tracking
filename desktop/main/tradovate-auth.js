const { BrowserWindow, session } = require('electron');

/**
 * Opens an in-app native browser window loading Tradovate.
 * Automatically intercepts the session token when the user logs in,
 * with ZERO manual token copying and ZERO API fee.
 */
function openTradovateLoginWindow(parentWindow, onTokenCaptured) {
  const authWin = new BrowserWindow({
    width: 1024,
    height: 768,
    parent: parentWindow || null,
    modal: true,
    title: 'Iniciar Sesión en Tradovate',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  let captured = false;

  // Intercept web requests to capture the authorization token
  const filter = {
    urls: ['*://*.tradovateapi.com/*'],
  };

  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    if (!captured && details.requestHeaders) {
      const authHeader = details.requestHeaders['Authorization'] || details.requestHeaders['authorization'];
      if (authHeader && authHeader.startsWith('Bearer eyJ')) {
        const token = authHeader.replace(/^Bearer\s+/i, '');
        captured = true;
        console.log('[TradovateAuth] Active session token captured successfully!');
        if (onTokenCaptured) {
          onTokenCaptured(token);
        }
        setTimeout(() => {
          if (!authWin.isDestroyed()) {
            authWin.close();
          }
        }, 500);
      }
    }
    callback({ requestHeaders: details.requestHeaders });
  });

  authWin.loadURL('https://trader.tradovate.com');

  authWin.on('closed', () => {
    if (!captured) {
      console.log('[TradovateAuth] Window closed without capturing session.');
    }
  });

  return authWin;
}

module.exports = {
  openTradovateLoginWindow,
};
