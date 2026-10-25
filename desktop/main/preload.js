const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getConfig: () => ipcRenderer.invoke('app:get-config'),
  updateConfig: (cfg) => ipcRenderer.invoke('copier:update-config', cfg),
  sendTestSignal: (signal) => ipcRenderer.invoke('copier:test-signal', signal),
  openTradovateLogin: () => ipcRenderer.invoke('tradovate:open-login'),
  connectToken: (token, environment) =>
    ipcRenderer.invoke('tradovate:connect-token', { token, environment }),
  liquidateAll: () => ipcRenderer.invoke('tradovate:liquidate-all'),

  onWsStatus: (callback) => {
    ipcRenderer.on('ws:status', (event, data) => callback(data));
  },
  onAccounts: (callback) => {
    ipcRenderer.on('tradovate:accounts', (event, data) => callback(data));
  },
  onOrder: (callback) => {
    ipcRenderer.on('tradovate:order', (event, data) => callback(data));
  },
  onLog: (callback) => {
    ipcRenderer.on('app:log', (event, data) => callback(data));
  },
  onStatus: (callback) => {
    ipcRenderer.on('app:status', (event, data) => callback(data));
  },
});
