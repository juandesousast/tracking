// Desktop Renderer Logic
const statusBadge = document.getElementById('statusBadge');
const statusText = document.getElementById('statusText');
const btnLogin = document.getElementById('btnLogin');
const btnLiquidate = document.getElementById('btnLiquidate');
const accountsList = document.getElementById('accountsList');
const consoleBox = document.getElementById('consoleBox');

function appendLog(time, message, type = 'info') {
  const div = document.createElement('div');
  div.className = 'console-entry';
  const timeSpan = `<span class="console-time">[${time}]</span> `;
  div.innerHTML = timeSpan + message;
  consoleBox.appendChild(div);
  consoleBox.scrollTop = consoleBox.scrollHeight;
}

if (window.electronAPI) {
  // Listen for WebSocket status
  window.electronAPI.onWsStatus((data) => {
    if (data.status === 'connected') {
      statusBadge.className = 'badge badge-green';
      statusText.textContent = `En Vivo (${data.latency || 15} ms) - IP Local`;
      appendLog(new Date().toLocaleTimeString(), 'Conexión WebSocket establecida con Tradovate');
    } else if (data.status === 'connecting') {
      statusBadge.className = 'badge badge-yellow';
      statusText.textContent = 'Conectando...';
    } else {
      statusBadge.className = 'badge badge-red';
      statusText.textContent = 'Desconectado';
    }
  });

  // Listen for accounts list
  window.electronAPI.onAccounts((accounts) => {
    if (!accounts || accounts.length === 0) {
      accountsList.innerHTML = '<div style="font-size: 12px; color: #64748b;">No se encontraron cuentas activas.</div>';
      return;
    }

    accountsList.innerHTML = accounts
      .map(
        (acc) => `
        <div class="account-item">
          <span class="account-name">${acc.name}</span>
          <span class="account-balance">$${Number(acc.balance || 0).toLocaleString()}</span>
        </div>
      `
      )
      .join('');

    appendLog(new Date().toLocaleTimeString(), `Detectadas ${accounts.length} cuenta(s) en Tradovate`);
  });

  // Listen for real-time orders
  window.electronAPI.onOrder((order) => {
    const time = new Date().toLocaleTimeString();
    const actionClass = order.action === 'Buy' ? 'console-buy' : 'console-sell';
    const actionHtml = `<span class="${actionClass}">${order.action.toUpperCase()}</span>`;
    appendLog(
      time,
      `Orden: ${actionHtml} ${order.orderQty} ${order.symbol || 'Contrato'} - Estado: <strong>${order.ordStatus}</strong>`
    );
  });

  // Handlers
  btnLogin.addEventListener('click', async () => {
    btnLogin.disabled = true;
    btnLogin.textContent = 'Cargando Tradovate...';
    appendLog(new Date().toLocaleTimeString(), 'Abriendo ventana de inicio de sesión de Tradovate...');
    try {
      await window.electronAPI.openTradovateLogin();
    } catch (e) {
      console.error(e);
    } finally {
      btnLogin.disabled = false;
      btnLogin.textContent = '🔑 Iniciar Sesión en Tradovate (0 €)';
    }
  });

  btnLiquidate.addEventListener('click', async () => {
    if (confirm('¿Aplanar y cerrar todas las posiciones abiertas ahora mismo?')) {
      appendLog(new Date().toLocaleTimeString(), 'Enviando orden de liquidación total (Flatten)...');
      await window.electronAPI.liquidateAll();
      appendLog(new Date().toLocaleTimeString(), 'Comando de liquidación enviado');
    }
  });
}
