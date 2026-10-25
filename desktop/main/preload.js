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
  getRiskConfig: () => ipcRenderer.invoke('risk:get-config'),
  saveRiskConfig: (cfg) => ipcRenderer.invoke('risk:save-config', cfg),

  // Tradovate
  getAccounts: () => ipcRenderer.invoke('tradovate:get-accounts'),
  openTradovateLogin: (options) => ipcRenderer.invoke('tradovate:open-login', options),
  connectToken: (token, environment) =>
    ipcRenderer.invoke('tradovate:connect-token', { token, environment }),
  liquidateAll: () => ipcRenderer.invoke('tradovate:liquidate-all'),
  disconnectTradovate: () => ipcRenderer.invoke('tradovate:disconnect'),

  // Cloud Services (Strictly User-Scoped)
  getCloudAccounts: () => ipcRenderer.invoke('cloud:get-accounts'),
  getCloudLogs: () => ipcRenderer.invoke('cloud:get-logs'),
  getEconomicNews: () => ipcRenderer.invoke('cloud:get-news'),

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
