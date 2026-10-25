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

const statMasterName = document.getElementById('statMasterName');
const statSlavesCount = document.getElementById('statSlavesCount');
const statReplicatedToday = document.getElementById('statReplicatedToday');
const statLatency = document.getElementById('statLatency');

const envSelect = document.getElementById('envSelect');
const btnConnectTradovate = document.getElementById('btnConnectTradovate');
const masterAccountsList = document.getElementById('masterAccountsList');
const slavesList = document.getElementById('slavesList');
const btnTogglePause = document.getElementById('btnTogglePause');
const btnPanicLiquidate = document.getElementById('btnPanicLiquidate');
const consoleBox = document.getElementById('consoleBox');

let currentConfig = {
  masterAccountId: null,
  masterAccountName: '',
  slaves: [],
  isPaused: false,
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
    currentConfig.masterAccountId = null;
    currentConfig.masterAccountName = '';
    currentConfig.slaves = [];
    statMasterName.textContent = 'Sin Seleccionar';
    statSlavesCount.textContent = '0';
    renderMasterSelector();
    renderSlavesList();
    authView.style.display = 'flex';
    loginPassword.value = '';
  }
});

// --- Tradovate Accounts Rendering ---
function renderMasterSelector() {
  if (!availableAccounts || availableAccounts.length === 0) {
    masterAccountsList.innerHTML = '<div style="font-size: 11px; color: var(--text-dim); padding: 8px;">No hay cuentas detectadas. Conecta Tradovate arriba.</div>';
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
        appendLog(new Date().toLocaleTimeString(), `Cuenta Master seleccionada: <strong>${acc.name}</strong>`);
      }
    });
  });

  const currentMaster = availableAccounts.find((a) => String(a.id) === String(currentConfig.masterAccountId));
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
      slavesList.innerHTML = '<div style="font-size: 12px; color: var(--text-dim); padding: 16px; text-align: center;">No hay cuentas esclavas disponibles para replicar. Conecta cuentas adicionales en Tradovate.</div>';
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

      if (toggle.checked) {
        card.classList.add('active');
        currentConfig.slaves.push({
          id: acc.id,
          name: acc.name,
          multiplier: Number(mul.value) || 1,
          convertMiniToMicro: m2m.checked,
          isActive: true,
        });
      } else {
        card.classList.remove('active');
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
  appendLog(new Date().toLocaleTimeString(), `Abriendo ventana de inicio de sesión de Tradovate (${envSelect.value.toUpperCase()})...`);

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
  if (confirm('🚨 ATENCIÓN: ¿Cerrar y aplanar inmediatamente todas las posiciones abiertas en todas las cuentas?')) {
    appendLog(new Date().toLocaleTimeString(), 'Enviando comando de liquidación de emergencia (Flatten All)...');
    if (window.electronAPI) {
      await window.electronAPI.liquidateAll();
    }
    appendLog(new Date().toLocaleTimeString(), 'Órdenes de liquidación enviadas a todas las cuentas.');
  }
});

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
      appendLog(new Date().toLocaleTimeString(), `Conexión WebSocket establecida con Tradovate${envLabel}`);
    } else if (data.status === 'connecting') {
      wsStatusBadge.className = 'pill-badge pill-yellow';
      wsStatusText.textContent = 'Tradovate: Conectando...';
    } else {
      wsStatusBadge.className = 'pill-badge pill-red';
      wsStatusText.textContent = 'Tradovate: Desconectado';
      btnConnectTradovate.innerHTML = '<span>🔑 Conectar Cuenta Tradovate (0 €)</span>';
      btnConnectTradovate.className = 'btn btn-primary';
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
    appendLog(new Date().toLocaleTimeString(), `Cargadas ${availableAccounts.length} cuenta(s) en Tradovate.`);
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
        appendLog(new Date().toLocaleTimeString(), `Cargadas ${availableAccounts.length} cuenta(s) en Tradovate.`);
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
      `Orden: ${actionHtml} ${order.orderQty} ${order.symbol || 'Contrato'} en [${order.accountSpec || order.accountId}] - Estado: <strong>${order.ordStatus}</strong>`
    );
  });

  // Live Console Logs from engine
  window.electronAPI.onLog((data) => {
    appendLog(data.time, data.msg);
  });
}
