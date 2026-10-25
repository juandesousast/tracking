const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // EdgeFlow Auth
  login: (email, password) => ipcRenderer.invoke('auth:login', { email, password }),
  getSession: () => ipcRenderer.invoke('auth:get-session'),
  logout: () => ipcRenderer.invoke('auth:logout'),

  // Config & Engine
  getConfig: () => ipcRenderer.invoke('app:get-config'),
  updateConfig: (cfg) => ipcRenderer.invoke('copier:update-config', cfg),
  setPaused: (isPaused) => ipcRenderer.invoke('copier:set-paused', isPaused),

  // Tradovate
  openTradovateLogin: () => ipcRenderer.invoke('tradovate:open-login'),
  connectToken: (token, environment) =>
    ipcRenderer.invoke('tradovate:connect-token', { token, environment }),
  liquidateAll: () => ipcRenderer.invoke('tradovate:liquidate-all'),

  // Event Listeners
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
