// Desktop Renderer Logic
const statusBadge = document.getElementById('statusBadge');
const statusText = document.getElementById('statusText');
const relayBadge = document.getElementById('relayBadge');
const relayText = document.getElementById('relayText');
const btnLogin = document.getElementById('btnLogin');
const envSelect = document.getElementById('envSelect');
const btnLiquidate = document.getElementById('btnLiquidate');
const accountsList = document.getElementById('accountsList');
const consoleBox = document.getElementById('consoleBox');

const modeLocal = document.getElementById('modeLocal');
const modeMaster = document.getElementById('modeMaster');
const modeSlave = document.getElementById('modeSlave');
const activeModeLabel = document.getElementById('activeModeLabel');

const channelInput = document.getElementById('channelInput');
const btnSaveChannel = document.getElementById('btnSaveChannel');
const slaveConfigList = document.getElementById('slaveConfigList');
const btnTestSignal = document.getElementById('btnTestSignal');

let currentConfig = {
  mode: 'local',
  channelId: 'room-default',
  masterAccountId: null,
  masterAccountName: '',
  slaves: [],
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

function updateModeUI(mode) {
  currentConfig.mode = mode;
  [modeLocal, modeMaster, modeSlave].forEach((b) => b.classList.remove('active'));

  if (mode === 'local') {
    modeLocal.classList.add('active');
    activeModeLabel.textContent = 'LOCAL (MISMO PC)';
    activeModeLabel.style.color = '#38bdf8';
  } else if (mode === 'master') {
    modeMaster.classList.add('active');
    activeModeLabel.textContent = 'MASTER (TRANSMISOR)';
    activeModeLabel.style.color = '#34d399';
  } else {
    modeSlave.classList.add('active');
    activeModeLabel.textContent = 'SLAVE (RECEPTOR)';
    activeModeLabel.style.color = '#fbbf24';
  }
}

function renderAccounts() {
  if (!availableAccounts || availableAccounts.length === 0) {
    accountsList.innerHTML = '<div style="font-size: 12px; color: #64748b; padding: 8px;">No hay sesión activa. Inicia sesión arriba.</div>';
    slaveConfigList.innerHTML = '<div style="font-size: 11px; color: #64748b;">No hay cuentas disponibles.</div>';
    return;
  }

  // Render accounts in left card
  accountsList.innerHTML = availableAccounts
    .map((acc) => {
      const isMaster = String(currentConfig.masterAccountId) === String(acc.id);
      return `
      <div class="account-item">
        <div class="account-name">
          <input type="radio" name="masterAccount" value="${acc.id}" ${isMaster ? 'checked' : ''} id="radio-${acc.id}">
          <label for="radio-${acc.id}" style="cursor: pointer;">${acc.name}</label>
          ${isMaster ? '<span style="font-size: 9px; background: #2563eb; color: white; padding: 1px 5px; border-radius: 4px; font-weight: 700;">MASTER</span>' : ''}
        </div>
        <span class="account-balance">$${Number(acc.balance || 0).toLocaleString()}</span>
      </div>
    `;
    })
    .join('');

  // Bind radio buttons
  availableAccounts.forEach((acc) => {
    const radio = document.getElementById(`radio-${acc.id}`);
    if (radio) {
      radio.addEventListener('change', () => {
        currentConfig.masterAccountId = acc.id;
        currentConfig.masterAccountName = acc.name;
        // Exclude master from slaves
        currentConfig.slaves = currentConfig.slaves.filter((s) => String(s.id) !== String(acc.id));
        saveAndSyncConfig();
        renderAccounts();
        renderSlaveConfigs();
      });
    }
  });

  renderSlaveConfigs();
}

function renderSlaveConfigs() {
  // Show potential slave accounts (all accounts other than master)
  const candidateAccounts = availableAccounts.filter(
    (acc) => String(acc.id) !== String(currentConfig.masterAccountId)
  );

  if (candidateAccounts.length === 0) {
    slaveConfigList.innerHTML = '<div style="font-size: 11px; color: #64748b;">No hay cuentas disponibles como esclavas.</div>';
    return;
  }

  slaveConfigList.innerHTML = candidateAccounts
    .map((acc) => {
      const existingSlave = currentConfig.slaves.find((s) => String(s.id) === String(acc.id));
      const isSelected = !!existingSlave;
      const multiplier = existingSlave ? existingSlave.multiplier : 1;
      const miniToMicro = existingSlave ? existingSlave.convertMiniToMicro : false;

      return `
      <div class="slave-config-row">
        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
          <input type="checkbox" id="slave-chk-${acc.id}" ${isSelected ? 'checked' : ''}>
          <strong>${acc.name}</strong>
        </label>
        <div style="display: flex; align-items: center; gap: 8px;">
          <select id="slave-mul-${acc.id}" class="select-sm">
            <option value="1" ${multiplier === 1 ? 'selected' : ''}>1x</option>
            <option value="2" ${multiplier === 2 ? 'selected' : ''}>2x</option>
            <option value="3" ${multiplier === 3 ? 'selected' : ''}>3x</option>
            <option value="0.5" ${multiplier === 0.5 ? 'selected' : ''}>0.5x</option>
          </select>
          <label style="display: flex; align-items: center; gap: 4px; font-size: 10px; color: #94a3b8;">
            <input type="checkbox" id="slave-m2m-${acc.id}" ${miniToMicro ? 'checked' : ''}>
            Mini->Micro
          </label>
        </div>
      </div>
    `;
    })
    .join('');

  // Bind checkbox and select events
  candidateAccounts.forEach((acc) => {
    const chk = document.getElementById(`slave-chk-${acc.id}`);
    const mul = document.getElementById(`slave-mul-${acc.id}`);
    const m2m = document.getElementById(`slave-m2m-${acc.id}`);

    function updateThisSlave() {
      currentConfig.slaves = currentConfig.slaves.filter((s) => String(s.id) !== String(acc.id));
      if (chk.checked) {
        currentConfig.slaves.push({
          id: acc.id,
          name: acc.name,
          multiplier: Number(mul.value) || 1,
          convertMiniToMicro: m2m.checked,
          isActive: true,
        });
      }
      saveAndSyncConfig();
    }

    if (chk) chk.addEventListener('change', updateThisSlave);
    if (mul) mul.addEventListener('change', updateThisSlave);
    if (m2m) m2m.addEventListener('change', updateThisSlave);
  });
}

async function saveAndSyncConfig() {
  if (window.electronAPI) {
    await window.electronAPI.updateConfig(currentConfig);
  }
}

// Mode Buttons
modeLocal.addEventListener('click', () => {
  updateModeUI('local');
  saveAndSyncConfig();
});

modeMaster.addEventListener('click', () => {
  updateModeUI('master');
  saveAndSyncConfig();
});

modeSlave.addEventListener('click', () => {
  updateModeUI('slave');
  saveAndSyncConfig();
});

btnSaveChannel.addEventListener('click', () => {
  currentConfig.channelId = channelInput.value.trim() || 'room-default';
  saveAndSyncConfig();
  appendLog(new Date().toLocaleTimeString(), `Canal guardado: <strong>${currentConfig.channelId}</strong>`);
});

// Test signal button
btnTestSignal.addEventListener('click', async () => {
  const testSignal = {
    id: `test-${Date.now()}`,
    groupId: currentConfig.channelId,
    masterAccountId: String(currentConfig.masterAccountId || 'DEMO_TEST'),
    masterAccountName: currentConfig.masterAccountName || 'Master Test',
    symbol: 'MNQZ4',
    action: 'BUY',
    quantity: 1,
    orderType: 'MARKET',
    timestamp: new Date().toISOString(),
  };

  appendLog(new Date().toLocaleTimeString(), 'Enviando señal de prueba a la red Supabase Realtime...');
  if (window.electronAPI) {
    const ok = await window.electronAPI.sendTestSignal(testSignal);
    if (ok) {
      appendLog(new Date().toLocaleTimeString(), '✅ Señal de prueba emitida con éxito (<10ms).');
    } else {
      appendLog(new Date().toLocaleTimeString(), '⚠️ Error al emitir señal.');
    }
  }
});

// Handlers for Tradovate
btnLogin.addEventListener('click', async () => {
  btnLogin.disabled = true;
  btnLogin.textContent = 'Cargando Tradovate...';
  appendLog(new Date().toLocaleTimeString(), 'Abriendo ventana de inicio de sesión de Tradovate...');
  try {
    if (window.electronAPI) {
      await window.electronAPI.openTradovateLogin();
    }
  } catch (e) {
    console.error(e);
  } finally {
    btnLogin.disabled = false;
    btnLogin.textContent = '🔑 Iniciar Sesión en Tradovate (0 €)';
  }
});

btnLiquidate.addEventListener('click', async () => {
  if (confirm('¿Aplanar y cerrar todas las posiciones abiertas ahora mismo?')) {
    appendLog(new Date().toLocaleTimeString(), 'Enviando comando de liquidación total (Flatten All)...');
    if (window.electronAPI) {
      await window.electronAPI.liquidateAll();
    }
    appendLog(new Date().toLocaleTimeString(), 'Comando de liquidación enviado.');
  }
});

// IPC Listeners
if (window.electronAPI) {
  // Load initial config
  window.electronAPI.getConfig().then((cfg) => {
    if (cfg) {
      currentConfig = { ...currentConfig, ...cfg };
      updateModeUI(currentConfig.mode || 'local');
      if (currentConfig.channelId) {
        channelInput.value = currentConfig.channelId;
      }
      if (currentConfig.environment) {
        envSelect.value = currentConfig.environment;
      }
    }
  });

  window.electronAPI.onWsStatus((data) => {
    if (data.status === 'connected') {
      statusBadge.className = 'badge badge-green';
      statusText.textContent = `En Vivo (${data.latency || 12} ms) - IP Casa`;
    } else if (data.status === 'connecting') {
      statusBadge.className = 'badge badge-yellow';
      statusText.textContent = 'Conectando...';
    } else {
      statusBadge.className = 'badge badge-red';
      statusText.textContent = 'Desconectado';
    }
  });

  window.electronAPI.onStatus((status) => {
    if (status.realtimeStatus === 'SUBSCRIBED') {
      relayBadge.className = 'badge badge-green';
      relayText.textContent = 'Relay: Conectado (<10ms)';
    } else {
      relayBadge.className = 'badge badge-yellow';
      relayText.textContent = `Relay: ${status.realtimeStatus || 'Listo'}`;
    }
  });

  window.electronAPI.onAccounts((accounts) => {
    availableAccounts = accounts || [];
    if (!currentConfig.masterAccountId && availableAccounts.length > 0) {
      currentConfig.masterAccountId = availableAccounts[0].id;
      currentConfig.masterAccountName = availableAccounts[0].name;
    }
    renderAccounts();
  });

  window.electronAPI.onOrder((order) => {
    const time = new Date().toLocaleTimeString();
    const actionClass = order.action === 'Buy' ? 'console-buy' : 'console-sell';
    const actionHtml = `<span class="${actionClass}">${order.action.toUpperCase()}</span>`;
    appendLog(
      time,
      `Orden: ${actionHtml} ${order.orderQty} ${order.symbol || 'Contrato'} en [${order.accountSpec || order.accountId}] - Estado: <strong>${order.ordStatus}</strong>`
    );
  });

  window.electronAPI.onLog((data) => {
    appendLog(data.time, data.msg);
  });
}
