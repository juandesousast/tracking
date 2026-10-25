// Desktop Renderer Controller
const authView = document.getElementById('authView');
const authForm = document.getElementById('authForm');
const authError = document.getElementById('authError');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const btnLoginSubmit = document.getElementById('btnLoginSubmit');

const wsStatusBadge = document.getElementById('wsStatusBadge');
const wsStatusText = document.getElementById('wsStatusText');
const userEmailLabel = document.getElementById('userEmailLabel');
const btnLogout = document.getElementById('btnLogout');

// Navigation Tabs & Views
const navTabCopier = document.getElementById('navTabCopier');
const navTabAccounts = document.getElementById('navTabAccounts');
const navTabCalendar = document.getElementById('navTabCalendar');
const navTabLogs = document.getElementById('navTabLogs');

const viewCopier = document.getElementById('viewCopier');
const viewAccounts = document.getElementById('viewAccounts');
const viewCalendar = document.getElementById('viewCalendar');
const viewLogs = document.getElementById('viewLogs');

// Copier Controls
const statMasterName = document.getElementById('statMasterName');
const statSlavesCount = document.getElementById('statSlavesCount');
const statReplicatedToday = document.getElementById('statReplicatedToday');
const statLatency = document.getElementById('statLatency');

const envSelect = document.getElementById('envSelect');
const btnConnectTradovate = document.getElementById('btnConnectTradovate');
const btnDisconnectTradovate = document.getElementById('btnDisconnectTradovate');
const masterAccountsList = document.getElementById('masterAccountsList');
const slavesList = document.getElementById('slavesList');
const btnTogglePause = document.getElementById('btnTogglePause');
const btnPanicLiquidate = document.getElementById('btnPanicLiquidate');
const consoleBox = document.getElementById('consoleBox');

// Cloud Views Elements
const cloudAccountsGrid = document.getElementById('cloudAccountsGrid');
const btnRefreshAccounts = document.getElementById('btnRefreshAccounts');
const newsTableBody = document.getElementById('newsTableBody');
const btnRefreshNews = document.getElementById('btnRefreshNews');
const logsTableBody = document.getElementById('logsTableBody');
const btnRefreshLogs = document.getElementById('btnRefreshLogs');

let currentConfig = {
  masterAccountId: null,
  masterAccountName: '',
  slaves: [],
  isPaused: false,
  environment: 'demo',
};

let availableAccounts = [];

function appendLog(time, message) {
  const div = document.createElement('div');
  div.className = 'console-entry';
  const timeSpan = `<span class="console-time">[${time}]</span> `;
  div.innerHTML = timeSpan + message;
  consoleBox.appendChild(div);
  consoleBox.scrollTop = consoleBox.scrollHeight;
}

// --- Navigation Tabs Handling ---
function switchTab(tab) {
  const tabs = [
    { btn: navTabCopier, view: viewCopier, name: 'copier' },
    { btn: navTabAccounts, view: viewAccounts, name: 'accounts' },
    { btn: navTabCalendar, view: viewCalendar, name: 'calendar' },
    { btn: navTabLogs, view: viewLogs, name: 'logs' },
  ];

  tabs.forEach((t) => {
    if (t.name === tab) {
      t.btn.classList.add('active');
      t.view.classList.add('active');
    } else {
      t.btn.classList.remove('active');
      t.view.classList.remove('active');
    }
  });

  if (tab === 'accounts') loadCloudAccounts();
  if (tab === 'calendar') loadEconomicNews();
  if (tab === 'logs') loadCloudLogs();
}

if (navTabCopier) navTabCopier.addEventListener('click', () => switchTab('copier'));
if (navTabAccounts) navTabAccounts.addEventListener('click', () => switchTab('accounts'));
if (navTabCalendar) navTabCalendar.addEventListener('click', () => switchTab('calendar'));
if (navTabLogs) navTabLogs.addEventListener('click', () => switchTab('logs'));

if (btnRefreshAccounts) btnRefreshAccounts.addEventListener('click', loadCloudAccounts);
if (btnRefreshNews) btnRefreshNews.addEventListener('click', loadEconomicNews);
if (btnRefreshLogs) btnRefreshLogs.addEventListener('click', loadCloudLogs);

// --- Auth Handling ---
async function checkAuthSession() {
  if (!window.electronAPI) return;
  const res = await window.electronAPI.getSession();
  if (res && res.authenticated && res.user) {
    userEmailLabel.textContent = res.user.email;
    authView.style.display = 'none';
    appendLog(new Date().toLocaleTimeString(), `Bienvenido de nuevo, ${res.user.email}`);
  } else {
    authView.style.display = 'flex';
  }
}

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.style.display = 'none';
  btnLoginSubmit.disabled = true;
  btnLoginSubmit.innerHTML = '<span>Verificando Licencia...</span>';

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  try {
    const res = await window.electronAPI.login(email, password);
    if (res.success && res.user) {
      userEmailLabel.textContent = res.user.email;
      authView.style.display = 'none';
      appendLog(new Date().toLocaleTimeString(), `Sesión iniciada con éxito (${res.user.email})`);

      // Reset in-memory state cleanly for this specific user
      currentConfig = {
        masterAccountId: null,
        masterAccountName: '',
        slaves: [],
        isPaused: false,
        environment: 'demo',
      };
      availableAccounts = [];

      // Reload config & accounts for this specific user
      const userCfg = await window.electronAPI.getConfig();
      if (userCfg) {
        currentConfig = { ...currentConfig, ...userCfg };
        if (currentConfig.environment) {
          envSelect.value = currentConfig.environment;
        }
      }

      const accs = await window.electronAPI.getAccounts();
      availableAccounts = accs || [];
      if (!currentConfig.masterAccountId && availableAccounts.length > 0) {
        currentConfig.masterAccountId = availableAccounts[0].id;
        currentConfig.masterAccountName = availableAccounts[0].name;
      }
      renderMasterSelector();
      renderSlavesList();
      switchTab('copier');
    } else {
      authError.textContent = res.error || 'Credenciales inválidas de EdgeFlow.';
      authError.style.display = 'block';
    }
  } catch (err) {
    authError.textContent = err.message || 'Error de conexión con el servidor de autenticación.';
    authError.style.display = 'block';
  } finally {
    btnLoginSubmit.disabled = false;
    btnLoginSubmit.innerHTML = '<span>Desbloquear Terminal</span><span>➔</span>';
  }
});

btnLogout.addEventListener('click', async () => {
  if (confirm('¿Cerrar sesión en EdgeFlow?')) {
    await window.electronAPI.logout();
    availableAccounts = [];
    currentConfig = {
      masterAccountId: null,
      masterAccountName: '',
      slaves: [],
      isPaused: false,
      environment: 'demo',
    };
    statMasterName.textContent = 'Sin Seleccionar';
    statSlavesCount.textContent = '0';
    statReplicatedToday.textContent = '0';
    statLatency.textContent = '< 3 ms';
    renderMasterSelector();
    renderSlavesList();
    if (cloudAccountsGrid) {
      cloudAccountsGrid.innerHTML = `
        <div style="font-size: 12px; color: var(--text-dim); padding: 24px; text-align: center; grid-column: 1 / -1;">
          Inicia sesión para ver tus cuentas de fondeo registradas.
        </div>
      `;
    }
    if (btnDisconnectTradovate) btnDisconnectTradovate.style.display = 'none';
    btnConnectTradovate.innerHTML = '<span>🔑 Conectar Cuenta Tradovate (0 €)</span>';
    btnConnectTradovate.className = 'btn btn-primary';
    switchTab('copier');
    authView.style.display = 'flex';
    loginPassword.value = '';
  }
});

// --- Tradovate Accounts Rendering ---
function renderMasterSelector() {
  if (!availableAccounts || availableAccounts.length === 0) {
    masterAccountsList.innerHTML =
      '<div style="font-size: 11px; color: var(--text-dim); padding: 8px;">No hay cuentas detectadas. Conecta Tradovate arriba.</div>';
    statMasterName.textContent = 'Sin Seleccionar';
    return;
  }

  // If no master is set, default to first account
  if (!currentConfig.masterAccountId && availableAccounts.length > 0) {
    currentConfig.masterAccountId = availableAccounts[0].id;
    currentConfig.masterAccountName = availableAccounts[0].name;
    saveAndSyncConfig();
  }

  masterAccountsList.innerHTML = availableAccounts
    .map((acc) => {
      const isSelected = String(currentConfig.masterAccountId) === String(acc.id);
      return `
      <div class="account-row ${isSelected ? 'selected-master' : ''}" data-id="${acc.id}">
        <div style="display: flex; align-items: center; gap: 8px;">
          <input type="radio" name="masterAccountRadio" value="${acc.id}" ${isSelected ? 'checked' : ''} style="cursor: pointer;">
          <div>
            <div style="font-weight: 700; font-size: 12px; color: white;">${acc.name}</div>
            <div style="font-size: 10px; color: #64748b; font-family: 'JetBrains Mono', monospace;">ID: ${acc.id}</div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 700; font-size: 12px; color: #34d399; font-family: 'JetBrains Mono', monospace;">
            $${Number(acc.balance || 0).toLocaleString()}
          </div>
          ${isSelected ? '<span class="badge-master-chip">MASTER</span>' : ''}
        </div>
      </div>
    `;
    })
    .join('');

  // Bind click
  masterAccountsList.querySelectorAll('.account-row').forEach((row) => {
    row.addEventListener('click', () => {
      const accId = row.getAttribute('data-id');
      const acc = availableAccounts.find((a) => String(a.id) === String(accId));
      if (acc) {
        currentConfig.masterAccountId = acc.id;
        currentConfig.masterAccountName = acc.name;
        statMasterName.textContent = acc.name;
        // Remove master from slaves list if it was there
        currentConfig.slaves = (currentConfig.slaves || []).filter(
          (s) => String(s.id) !== String(acc.id)
        );
        saveAndSyncConfig();
        renderMasterSelector();
        renderSlavesList();
        appendLog(
          new Date().toLocaleTimeString(),
          `Cuenta Master seleccionada: <strong>${acc.name}</strong>`
        );
      }
    });
  });

  const currentMaster = availableAccounts.find(
    (a) => String(a.id) === String(currentConfig.masterAccountId)
  );
  statMasterName.textContent = currentMaster ? currentMaster.name : 'Sin Seleccionar';
}

function renderSlavesList() {
  const candidateAccounts = availableAccounts.filter(
    (acc) => String(acc.id) !== String(currentConfig.masterAccountId)
  );

  if (candidateAccounts.length === 0) {
    if (availableAccounts.length === 1) {
      slavesList.innerHTML = `
        <div style="font-size: 12px; color: var(--text-dim); padding: 20px; text-align: center; line-height: 1.5; background: rgba(59, 130, 246, 0.05); border: 1px dashed rgba(59, 130, 246, 0.2); border-radius: 12px;">
          <div style="font-size: 16px; margin-bottom: 6px;">🎯</div>
          <strong style="color: #93c5fd; display: block; margin-bottom: 4px;">Cuenta Master Configurada: ${currentConfig.masterAccountName}</strong>
          Para replicar trades en cuentas secundarias, añade o vincula tus cuentas de evaluación/fondeo (Apex, Topstep, etc.) en tu usuario de Tradovate. Aparecerán aquí automáticamente para configurar su multiplicador.
        </div>
      `;
    } else {
      slavesList.innerHTML =
        '<div style="font-size: 12px; color: var(--text-dim); padding: 16px; text-align: center;">No hay cuentas esclavas disponibles para replicar. Conecta cuentas adicionales en Tradovate.</div>';
    }
    statSlavesCount.textContent = '0';
    return;
  }

  slavesList.innerHTML = candidateAccounts
    .map((acc) => {
      const existingSlave = (currentConfig.slaves || []).find((s) => String(s.id) === String(acc.id));
      const isActive = existingSlave ? existingSlave.isActive !== false : false;
      const multiplier = existingSlave ? existingSlave.multiplier : 1;
      const convertMiniToMicro = existingSlave ? existingSlave.convertMiniToMicro : false;

      return `
      <div class="slave-card ${isActive ? 'active' : ''}" id="slave-card-${acc.id}">
        <div class="slave-header">
          <div class="slave-name">
            <span>🛡️ ${acc.name}</span>
            <span style="font-size: 10px; color: #64748b; font-family: 'JetBrains Mono', monospace;">ID: ${acc.id}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 12px; font-weight: 700; color: #34d399; font-family: 'JetBrains Mono', monospace;">
              $${Number(acc.balance || 0).toLocaleString()}
            </span>
            <label class="switch" title="Activar / Desactivar réplica en esta cuenta">
              <input type="checkbox" id="slave-toggle-${acc.id}" ${isActive ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="slave-controls">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="control-label">Multiplicador:</span>
            <select id="slave-mul-${acc.id}" class="multiplier-select">
              <option value="0.5" ${multiplier === 0.5 ? 'selected' : ''}>0.5x</option>
              <option value="1" ${multiplier === 1 ? 'selected' : ''}>1.0x (Igual)</option>
              <option value="2" ${multiplier === 2 ? 'selected' : ''}>2.0x</option>
              <option value="3" ${multiplier === 3 ? 'selected' : ''}>3.0x</option>
              <option value="4" ${multiplier === 4 ? 'selected' : ''}>4.0x</option>
              <option value="5" ${multiplier === 5 ? 'selected' : ''}>5.0x</option>
            </select>
          </div>

          <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
            <input type="checkbox" id="slave-m2m-${acc.id}" ${convertMiniToMicro ? 'checked' : ''} style="cursor: pointer;">
            <span class="control-label" style="color: #60a5fa;">Convertir Mini a Micro (NQ ➔ MNQ)</span>
          </label>
        </div>
      </div>
    `;
    })
    .join('');

  // Update active count
  const activeCount = (currentConfig.slaves || []).filter((s) => s.isActive !== false).length;
  statSlavesCount.textContent = activeCount;

  // Bind change events
  candidateAccounts.forEach((acc) => {
    const toggle = document.getElementById(`slave-toggle-${acc.id}`);
    const mul = document.getElementById(`slave-mul-${acc.id}`);
    const m2m = document.getElementById(`slave-m2m-${acc.id}`);
    const card = document.getElementById(`slave-card-${acc.id}`);

    function updateSlaveState() {
      currentConfig.slaves = (currentConfig.slaves || []).filter(
        (s) => String(s.id) !== String(acc.id)
      );

      if (toggle && toggle.checked) {
        if (card) card.classList.add('active');
        currentConfig.slaves.push({
          id: acc.id,
          name: acc.name,
          multiplier: Number(mul.value) || 1,
          convertMiniToMicro: m2m.checked,
          isActive: true,
        });
      } else {
        if (card) card.classList.remove('active');
      }

      statSlavesCount.textContent = (currentConfig.slaves || []).filter(
        (s) => s.isActive !== false
      ).length;

      saveAndSyncConfig();
    }

    if (toggle) toggle.addEventListener('change', updateSlaveState);
    if (mul) mul.addEventListener('change', updateSlaveState);
    if (m2m) m2m.addEventListener('change', updateSlaveState);
  });
}

async function saveAndSyncConfig() {
  if (window.electronAPI) {
    await window.electronAPI.updateConfig(currentConfig);
  }
}

// --- Tradovate Connection Action ---
btnConnectTradovate.addEventListener('click', async () => {
  btnConnectTradovate.disabled = true;
  btnConnectTradovate.textContent = 'Cargando Tradovate...';
  appendLog(
    new Date().toLocaleTimeString(),
    `Abriendo ventana de inicio de sesión de Tradovate (${envSelect.value.toUpperCase()})...`
  );

  try {
    if (window.electronAPI) {
      await window.electronAPI.openTradovateLogin({ environment: envSelect.value });
    }
  } catch (e) {
    console.error(e);
  } finally {
    btnConnectTradovate.disabled = false;
    btnConnectTradovate.textContent = '🔑 Conectar Cuenta Tradovate (0 €)';
  }
});

if (btnDisconnectTradovate) {
  btnDisconnectTradovate.addEventListener('click', async () => {
    if (
      confirm('¿Desconectar sesión de Tradovate y eliminar credenciales guardadas en este equipo?')
    ) {
      if (window.electronAPI) {
        await window.electronAPI.disconnectTradovate();
      }
      availableAccounts = [];
      currentConfig.masterAccountId = null;
      currentConfig.masterAccountName = '';
      currentConfig.slaves = [];
      statMasterName.textContent = 'Sin Seleccionar';
      statSlavesCount.textContent = '0';
      renderMasterSelector();
      renderSlavesList();
      btnConnectTradovate.innerHTML = '<span>🔑 Conectar Cuenta Tradovate (0 €)</span>';
      btnConnectTradovate.className = 'btn btn-primary';
      btnDisconnectTradovate.style.display = 'none';
      appendLog(
        new Date().toLocaleTimeString(),
        'Sesión de Tradovate desconectada y credenciales limpiadas con éxito.'
      );
    }
  });
}

// --- Pause & Panic Liquidate ---
btnTogglePause.addEventListener('click', async () => {
  currentConfig.isPaused = !currentConfig.isPaused;
  if (currentConfig.isPaused) {
    btnTogglePause.textContent = '▶️ Reanudar Replicación';
    btnTogglePause.style.borderColor = '#fbbf24';
    btnTogglePause.style.color = '#fbbf24';
    appendLog(new Date().toLocaleTimeString(), 'Replicación pausada globalmente.');
  } else {
    btnTogglePause.textContent = '⏸️ Pausar Replicación Global';
    btnTogglePause.style.borderColor = 'var(--border-color)';
    btnTogglePause.style.color = 'var(--text-muted)';
    appendLog(new Date().toLocaleTimeString(), 'Replicación reanudada.');
  }
  if (window.electronAPI) {
    await window.electronAPI.setPaused(currentConfig.isPaused);
  }
});

btnPanicLiquidate.addEventListener('click', async () => {
  if (
    confirm(
      '🚨 ATENCIÓN: ¿Cerrar y aplanar inmediatamente todas las posiciones abiertas en todas las cuentas?'
    )
  ) {
    appendLog(new Date().toLocaleTimeString(), 'Enviando comando de liquidación de emergencia (Flatten All)...');
    if (window.electronAPI) {
      await window.electronAPI.liquidateAll();
    }
    appendLog(new Date().toLocaleTimeString(), 'Órdenes de liquidación enviadas a todas las cuentas.');
  }
});

// --- Cloud Accounts Loader ---
async function loadCloudAccounts() {
  if (!window.electronAPI) return;
  cloudAccountsGrid.innerHTML = `
    <div style="font-size: 12px; color: var(--text-dim); padding: 24px; text-align: center; grid-column: 1 / -1;">
      Sincronizando cuentas con tu perfil en la nube...
    </div>
  `;
  try {
    const accounts = await window.electronAPI.getCloudAccounts();
    renderCloudAccounts(accounts);
  } catch (err) {
    cloudAccountsGrid.innerHTML = `
      <div style="font-size: 12px; color: #fb7185; padding: 24px; text-align: center; grid-column: 1 / -1;">
        Error al cargar cuentas de fondeo: ${err.message}
      </div>
    `;
  }
}

function renderCloudAccounts(accounts) {
  if (!accounts || accounts.length === 0) {
    cloudAccountsGrid.innerHTML = `
      <div style="font-size: 12px; color: var(--text-dim); padding: 36px 20px; text-align: center; grid-column: 1 / -1; background: var(--card-bg); border: 1px dashed var(--border-color); border-radius: 14px;">
        <div style="font-size: 24px; margin-bottom: 8px;">🛡️</div>
        <strong style="color: white; font-size: 13px; display: block; margin-bottom: 6px;">No tienes cuentas de fondeo registradas aún</strong>
        Registra tus cuentas (Apex, Topstep, etc.) en tu panel web de PropFirm Tracker para ver métricas de drawdown, objetivo y reglas aquí.
      </div>
    `;
    return;
  }

  cloudAccountsGrid.innerHTML = accounts
    .map((acc) => {
      const firmName = acc.prop_firms?.name || 'Prop Firm Desconocida';
      const st = (acc.status || 'ACTIVE').toUpperCase();
      const statusColor =
        st === 'ACTIVE' || st === 'PASSED'
          ? '#34d399'
          : st === 'BREACHED'
          ? '#fb7185'
          : '#94a3b8';
      const statusBg =
        st === 'ACTIVE' || st === 'PASSED'
          ? 'rgba(52, 211, 153, 0.1)'
          : st === 'BREACHED'
          ? 'rgba(251, 113, 133, 0.1)'
          : 'rgba(148, 163, 184, 0.1)';
      const sizeFormatted = Number(acc.account_size || 0).toLocaleString();

      return `
      <div class="prop-account-card">
        <div style="display: flex; align-items: flex-start; justify-content: space-between;">
          <div>
            <div style="font-size: 10px; font-weight: 800; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.5px;">
              ${firmName}
            </div>
            <div style="font-size: 14px; font-weight: 800; color: white; margin-top: 2px;">
              ${acc.alias || acc.account_number || 'Cuenta de Fondeo'}
            </div>
          </div>
          <span style="font-size: 10px; font-weight: 800; color: ${statusColor}; background: ${statusBg}; border: 1px solid ${statusColor}33; padding: 2px 7px; border-radius: 6px;">
            ${st}
          </span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: baseline; background: #070a12; padding: 10px 12px; border-radius: 8px; border: 1px solid #1e293b;">
          <div>
            <div style="font-size: 9px; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Tamaño de Cuenta</div>
            <div style="font-size: 15px; font-weight: 900; color: #38bdf8; font-family: 'JetBrains Mono', monospace;">$${sizeFormatted}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 9px; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Tipo</div>
            <div style="font-size: 11px; font-weight: 700; color: #94a3b8;">${acc.account_type || 'Evaluación'}</div>
          </div>
        </div>

        <div style="font-size: 11px; color: var(--text-dim); display: flex; align-items: center; justify-content: space-between; padding-top: 4px; border-top: 1px solid #151d2f;">
          <span>Nº: <strong style="color: #cbd5e1; font-family: 'JetBrains Mono', monospace;">${acc.account_number || '---'}</strong></span>
          <span style="color: #34d399; font-size: 10px;">● Sincronizado</span>
        </div>
      </div>
    `;
    })
    .join('');
}

// --- Economic Calendar Loader ---
async function loadEconomicNews() {
  if (!window.electronAPI) return;
  newsTableBody.innerHTML = `
    <tr>
      <td colspan="7" style="text-align: center; padding: 24px; color: var(--text-dim);">
        Consultando calendario económico en tiempo real...
      </td>
    </tr>
  `;
  try {
    const events = await window.electronAPI.getEconomicNews();
    renderEconomicNews(events);
  } catch (err) {
    newsTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 24px; color: #fb7185;">
          Error al obtener eventos macroeconómicos: ${err.message}
        </td>
      </tr>
    `;
  }
}

function renderEconomicNews(events) {
  if (!events || events.length === 0) {
    newsTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 24px; color: var(--text-dim);">
          No hay eventos económicos de alto impacto programados para las próximas 48 horas.
        </td>
      </tr>
    `;
    return;
  }

  newsTableBody.innerHTML = events
    .map((ev) => {
      let impactHtml = '';
      if (ev.importance >= 3) {
        impactHtml = `<span style="display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 800; color: #fb7185; background: rgba(251, 113, 133, 0.12); border: 1px solid rgba(251, 113, 133, 0.3); padding: 2px 6px; border-radius: 4px;">🔴 ALTO</span>`;
      } else if (ev.importance === 2) {
        impactHtml = `<span style="display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 800; color: #fbbf24; background: rgba(251, 191, 36, 0.12); border: 1px solid rgba(251, 191, 36, 0.3); padding: 2px 6px; border-radius: 4px;">🟠 MEDIO</span>`;
      } else {
        impactHtml = `<span style="display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 800; color: #94a3b8; background: rgba(148, 163, 184, 0.1); border: 1px solid rgba(148, 163, 184, 0.2); padding: 2px 6px; border-radius: 4px;">🟢 BAJO</span>`;
      }

      const d = new Date(ev.date);
      const dateFormatted = `${d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'numeric',
        day: 'numeric',
      })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      return `
      <tr>
        <td>${impactHtml}</td>
        <td style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #cbd5e1;">${dateFormatted}</td>
        <td><strong style="color: ${ev.currency === 'USD' ? '#38bdf8' : '#a78bfa'};">${ev.currency}</strong></td>
        <td><strong style="color: white;">${ev.title}</strong></td>
        <td style="font-family: 'JetBrains Mono', monospace; color: var(--text-dim);">${ev.previous !== null ? ev.previous + (ev.unit || '') : '---'}</td>
        <td style="font-family: 'JetBrains Mono', monospace; color: #94a3b8;">${ev.forecast !== null ? ev.forecast + (ev.unit || '') : '---'}</td>
        <td style="font-family: 'JetBrains Mono', monospace; color: #34d399; font-weight: 700;">${ev.actual !== null ? ev.actual + (ev.unit || '') : '---'}</td>
      </tr>
    `;
    })
    .join('');
}

// --- Cloud Replicated Logs Loader ---
async function loadCloudLogs() {
  if (!window.electronAPI) return;
  logsTableBody.innerHTML = `
    <tr>
      <td colspan="7" style="text-align: center; padding: 24px; color: var(--text-dim);">
        Consultando historial de réplica en la nube...
      </td>
    </tr>
  `;
  try {
    const logs = await window.electronAPI.getCloudLogs();
    renderCloudLogs(logs);
  } catch (err) {
    logsTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 24px; color: #fb7185;">
          Error al obtener historial: ${err.message}
        </td>
      </tr>
    `;
  }
}

function renderCloudLogs(logs) {
  if (!logs || logs.length === 0) {
    logsTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 32px; color: var(--text-dim);">
          No hay órdenes replicadas registradas en tu historial en la nube aún.
        </td>
      </tr>
    `;
    return;
  }

  logsTableBody.innerHTML = logs
    .map((l) => {
      const d = new Date(l.created_at || Date.now());
      const dateFormatted = `${d.toLocaleDateString(undefined, {
        month: 'numeric',
        day: 'numeric',
      })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
      const actionColor = l.action === 'BUY' ? '#34d399' : '#fb7185';
      const actionBg =
        l.action === 'BUY' ? 'rgba(52, 211, 153, 0.12)' : 'rgba(251, 113, 133, 0.12)';

      return `
      <tr>
        <td style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #cbd5e1;">${dateFormatted}</td>
        <td><strong style="color: #60a5fa; font-family: 'JetBrains Mono', monospace;">${l.symbol}</strong></td>
        <td>
          <span style="font-size: 10px; font-weight: 800; color: ${actionColor}; background: ${actionBg}; border: 1px solid ${actionColor}33; padding: 2px 6px; border-radius: 4px;">
            ${l.action}
          </span>
        </td>
        <td style="font-family: 'JetBrains Mono', monospace; font-weight: 700;">${l.quantity} ctr</td>
        <td style="color: #94a3b8; font-size: 11px;">🛡️ ${l.slaves_count || 1} cuenta(s)</td>
        <td style="font-family: 'JetBrains Mono', monospace; color: #38bdf8; font-size: 11px;">${l.latency_ms || 2} ms</td>
        <td>
          <span style="font-size: 10px; font-weight: 800; color: #34d399; background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.2); padding: 2px 6px; border-radius: 4px;">
            ${l.status || 'EXITOSO'}
          </span>
        </td>
      </tr>
    `;
    })
    .join('');
}

// --- WebSocket & IPC Event Listeners ---
if (window.electronAPI) {
  // Check session on start
  checkAuthSession();

  // Load config
  window.electronAPI.getConfig().then((cfg) => {
    if (cfg) {
      currentConfig = { ...currentConfig, ...cfg };
      if (currentConfig.environment) {
        envSelect.value = currentConfig.environment;
      }
      if (currentConfig.isPaused) {
        btnTogglePause.textContent = '▶️ Reanudar Replicación';
        btnTogglePause.style.borderColor = '#fbbf24';
        btnTogglePause.style.color = '#fbbf24';
      }
    }
  });

  // Tradovate WebSocket status
  window.electronAPI.onWsStatus((data) => {
    if (data.status === 'connected') {
      wsStatusBadge.className = 'pill-badge pill-green';
      const envLabel = data.environment ? ` [${data.environment.toUpperCase()}]` : '';
      wsStatusText.textContent = `Tradovate: En Vivo${envLabel} (${data.latency || 12} ms)`;
      btnConnectTradovate.innerHTML = '<span>🟢 Tradovate Conectado</span>';
      btnConnectTradovate.className = 'btn btn-outline';
      if (btnDisconnectTradovate) btnDisconnectTradovate.style.display = 'inline-flex';
      appendLog(
        new Date().toLocaleTimeString(),
        `Conexión WebSocket establecida con Tradovate${envLabel}`
      );
    } else if (data.status === 'connecting') {
      wsStatusBadge.className = 'pill-badge pill-yellow';
      wsStatusText.textContent = 'Tradovate: Conectando...';
      if (btnDisconnectTradovate) btnDisconnectTradovate.style.display = 'none';
    } else {
      wsStatusBadge.className = 'pill-badge pill-red';
      wsStatusText.textContent = 'Tradovate: Desconectado';
      btnConnectTradovate.innerHTML = '<span>🔑 Conectar Cuenta Tradovate (0 €)</span>';
      btnConnectTradovate.className = 'btn btn-primary';
      if (btnDisconnectTradovate) btnDisconnectTradovate.style.display = 'none';
    }
  });

  envSelect.addEventListener('change', () => {
    currentConfig.environment = envSelect.value;
    saveAndSyncConfig();
    appendLog(new Date().toLocaleTimeString(), `Entorno seleccionado: ${envSelect.value.toUpperCase()}`);
  });

  // Accounts list
  window.electronAPI.onAccounts((accounts) => {
    availableAccounts = accounts || [];
    if (!currentConfig.masterAccountId && availableAccounts.length > 0) {
      currentConfig.masterAccountId = availableAccounts[0].id;
      currentConfig.masterAccountName = availableAccounts[0].name;
    }
    renderMasterSelector();
    renderSlavesList();
    appendLog(
      new Date().toLocaleTimeString(),
      `Cargadas ${availableAccounts.length} cuenta(s) en Tradovate.`
    );
  });

  // Request existing accounts if already loaded in main process
  if (typeof window.electronAPI.getAccounts === 'function') {
    window.electronAPI.getAccounts().then((accounts) => {
      if (accounts && accounts.length > 0) {
        availableAccounts = accounts;
        if (!currentConfig.masterAccountId && availableAccounts.length > 0) {
          currentConfig.masterAccountId = accounts[0].id;
          currentConfig.masterAccountName = accounts[0].name;
        }
        renderMasterSelector();
        renderSlavesList();
        appendLog(
          new Date().toLocaleTimeString(),
          `Cargadas ${availableAccounts.length} cuenta(s) en Tradovate.`
        );
      }
    });
  }

  // Engine Status & Stats updates
  window.electronAPI.onStatus((status) => {
    if (status.stats) {
      statReplicatedToday.textContent = status.stats.replicatedToday;
      if (status.stats.avgLatencyMs) {
        statLatency.textContent = `${status.stats.avgLatencyMs} ms`;
      }
    }
  });

  // Native Order events
  window.electronAPI.onOrder((order) => {
    const time = new Date().toLocaleTimeString();
    const actionClass = order.action === 'Buy' ? 'console-buy' : 'console-sell';
    const actionHtml = `<span class="${actionClass}">${order.action.toUpperCase()}</span>`;
    appendLog(
      time,
      `Orden: ${actionHtml} ${order.orderQty} ${order.symbol || 'Contrato'} en [${
        order.accountSpec || order.accountId
      }] - Estado: <strong>${order.ordStatus}</strong>`
    );
  });

  // Live Console Logs from engine
  window.electronAPI.onLog((data) => {
    appendLog(data.time, data.msg);
  });
}
