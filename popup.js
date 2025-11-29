// ===== UTILIDADES =====
const showToast = (message, duration = 3000) => {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  toastMessage.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), duration);
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return mb.toFixed(1) + ' MB';
};

// ===== NAVEGAÇÃO ENTRE ABAS =====
document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const targetTab = tab.dataset.tab;
    
    // Atualizar estado visual das tabs
    document.querySelectorAll('.nav-tab').forEach(t => {
      t.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
      t.classList.add('text-gray-500');
    });
    tab.classList.remove('text-gray-500');
    tab.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
    
    // Mostrar conteúdo correto
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.add('hidden');
    });
    document.getElementById(`${targetTab}-content`).classList.remove('hidden');
    
    // Recarregar dados se necessário
    if (targetTab === 'workspaces') loadWorkspaces();
    if (targetTab === 'sessions') loadSessions();
  });
});

// ===== ESTATÍSTICAS =====
const updateStats = async () => {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  document.getElementById('openTabsCount').textContent = tabs.length;
  
  // Calcular memória economizada (estimativa)
  const storage = await chrome.storage.local.get(['hibernatedTabs', 'closedTabsCount']);
  const hibernatedCount = storage.hibernatedTabs?.length || 0;
  const closedCount = storage.closedTabsCount || 0;
  const estimatedMemory = (hibernatedCount + closedCount) * 50; // 50MB por aba estimado
  document.getElementById('memorySaved').textContent = formatBytes(estimatedMemory * 1024 * 1024);
};

// ===== WORKSPACES =====
const loadWorkspaces = async () => {
  const storage = await chrome.storage.sync.get(['workspaces']);
  const workspaces = storage.workspaces || [];
  const container = document.getElementById('workspacesList');
  
  if (workspaces.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <svg class="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
        </svg>
        <p>Nenhum workspace criado ainda</p>
        <p class="text-sm mt-1">Clique em "Criar Workspace" para começar</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = workspaces.map((workspace, index) => `
    <div class="workspace-card bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="flex items-start justify-between mb-2">
        <div class="flex-1">
          <h3 class="font-semibold text-gray-900">${workspace.name}</h3>
          <p class="text-sm text-gray-500">${workspace.tabs.length} abas</p>
        </div>
        <div class="flex gap-2">
          <button class="activate-workspace p-2 hover:bg-blue-50 rounded transition" data-index="${index}">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </button>
          <button class="delete-workspace p-2 hover:bg-red-50 rounded transition" data-index="${index}">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="flex items-center gap-2 text-xs text-gray-500">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        ${new Date(workspace.created).toLocaleDateString('pt-BR')}
      </div>
    </div>
  `).join('');
  
  // Event listeners para workspaces
  document.querySelectorAll('.activate-workspace').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const index = parseInt(e.currentTarget.dataset.index);
      await activateWorkspace(index);
    });
  });
  
  document.querySelectorAll('.delete-workspace').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const index = parseInt(e.currentTarget.dataset.index);
      await deleteWorkspace(index);
    });
  });
};

const createWorkspace = async () => {
  const name = prompt('Nome do workspace:');
  if (!name) return;
  
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const tabsData = tabs.map(tab => ({
    url: tab.url,
    title: tab.title,
    pinned: tab.pinned,
    favIconUrl: tab.favIconUrl
  }));
  
  const storage = await chrome.storage.sync.get(['workspaces']);
  const workspaces = storage.workspaces || [];
  
  workspaces.push({
    name,
    tabs: tabsData,
    created: Date.now()
  });
  
  await chrome.storage.sync.set({ workspaces });
  showToast(`Workspace "${name}" criado com sucesso!`);
  loadWorkspaces();
};

const activateWorkspace = async (index) => {
  const storage = await chrome.storage.sync.get(['workspaces']);
  const workspace = storage.workspaces[index];
  
  if (!workspace) return;
  
  // Perguntar se quer fechar abas atuais
  const closeCurrentTabs = confirm('Deseja fechar as abas atuais antes de carregar o workspace?');
  
  if (closeCurrentTabs) {
    const currentTabs = await chrome.tabs.query({ currentWindow: true });
    const tabsToClose = currentTabs.filter(tab => !tab.pinned);
    await Promise.all(tabsToClose.map(tab => chrome.tabs.remove(tab.id)));
  }
  
  // Abrir abas do workspace
  for (const tab of workspace.tabs) {
    await chrome.tabs.create({
      url: tab.url,
      pinned: tab.pinned,
      active: false
    });
  }
  
  showToast(`Workspace "${workspace.name}" ativado!`);
  updateStats();
};

const deleteWorkspace = async (index) => {
  const storage = await chrome.storage.sync.get(['workspaces']);
  const workspaces = storage.workspaces || [];
  const workspace = workspaces[index];
  
  if (!confirm(`Deseja realmente deletar o workspace "${workspace.name}"?`)) return;
  
  workspaces.splice(index, 1);
  await chrome.storage.sync.set({ workspaces });
  showToast('Workspace deletado!');
  loadWorkspaces();
};

// ===== SESSÕES =====
const loadSessions = async () => {
  const storage = await chrome.storage.sync.get(['sessions']);
  const sessions = storage.sessions || [];
  const container = document.getElementById('sessionsList');
  
  if (sessions.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <svg class="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <p>Nenhuma sessão salva ainda</p>
        <p class="text-sm mt-1">Clique em "Salvar Sessão Atual" para começar</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = sessions.map((session, index) => `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="flex items-start justify-between mb-2">
        <div class="flex-1">
          <h3 class="font-semibold text-gray-900">${session.name}</h3>
          <p class="text-sm text-gray-500">${session.tabs.length} abas</p>
        </div>
        <div class="flex gap-2">
          <button class="restore-session p-2 hover:bg-green-50 rounded transition" data-index="${index}">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
          </button>
          <button class="delete-session p-2 hover:bg-red-50 rounded transition" data-index="${index}">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="text-xs text-gray-500">
        ${new Date(session.created).toLocaleString('pt-BR')}
      </div>
    </div>
  `).join('');
  
  // Event listeners para sessões
  document.querySelectorAll('.restore-session').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const index = parseInt(e.currentTarget.dataset.index);
      await restoreSession(index);
    });
  });
  
  document.querySelectorAll('.delete-session').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const index = parseInt(e.currentTarget.dataset.index);
      await deleteSession(index);
    });
  });
};

const saveSession = async () => {
  const name = prompt('Nome da sessão:');
  if (!name) return;
  
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const tabsData = tabs.map(tab => ({
    url: tab.url,
    title: tab.title,
    pinned: tab.pinned
  }));
  
  const storage = await chrome.storage.sync.get(['sessions']);
  const sessions = storage.sessions || [];
  
  sessions.push({
    name,
    tabs: tabsData,
    created: Date.now()
  });
  
  await chrome.storage.sync.set({ sessions });
  showToast(`Sessão "${name}" salva com sucesso!`);
  loadSessions();
};

const restoreSession = async (index) => {
  const storage = await chrome.storage.sync.get(['sessions']);
  const session = storage.sessions[index];
  
  if (!session) return;
  
  for (const tab of session.tabs) {
    await chrome.tabs.create({
      url: tab.url,
      pinned: tab.pinned,
      active: false
    });
  }
  
  showToast(`Sessão "${session.name}" restaurada!`);
  updateStats();
};

const deleteSession = async (index) => {
  const storage = await chrome.storage.sync.get(['sessions']);
  const sessions = storage.sessions || [];
  const session = sessions[index];
  
  if (!confirm(`Deseja realmente deletar a sessão "${session.name}"?`)) return;
  
  sessions.splice(index, 1);
  await chrome.storage.sync.set({ sessions });
  showToast('Sessão deletada!');
  loadSessions();
};

// ===== FERRAMENTAS =====
const groupByDomain = async () => {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const domainMap = {};
  
  // Agrupar por domínio
  tabs.forEach(tab => {
    try {
      const url = new URL(tab.url);
      const domain = url.hostname;
      if (!domainMap[domain]) {
        domainMap[domain] = [];
      }
      domainMap[domain].push(tab.id);
    } catch (e) {
      // Ignorar URLs inválidas
    }
  });
  
  // Criar grupos
  const colors = ['blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'];
  let colorIndex = 0;
  
  for (const [domain, tabIds] of Object.entries(domainMap)) {
    if (tabIds.length > 1) {
      const groupId = await chrome.tabs.group({ tabIds });
      await chrome.tabGroups.update(groupId, {
        title: domain,
        color: colors[colorIndex % colors.length]
      });
      colorIndex++;
    }
  }
  
  showToast('Abas agrupadas por domínio!');
};

const closeDuplicates = async () => {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const urlMap = new Map();
  const duplicates = [];
  
  tabs.forEach(tab => {
    if (urlMap.has(tab.url)) {
      duplicates.push(tab.id);
    } else {
      urlMap.set(tab.url, tab.id);
    }
  });
  
  if (duplicates.length > 0) {
    await chrome.tabs.remove(duplicates);
    showToast(`${duplicates.length} abas duplicadas fechadas!`);
    updateStats();
  } else {
    showToast('Nenhuma aba duplicada encontrada!');
  }
};

const cleanUnpinned = async () => {
  if (!confirm('Deseja fechar todas as abas não-fixadas?')) return;
  
  const tabs = await chrome.tabs.query({ currentWindow: true, pinned: false });
  const tabIds = tabs.map(tab => tab.id);
  
  if (tabIds.length > 0) {
    await chrome.tabs.remove(tabIds);
    
    // Atualizar contador de abas fechadas
    const storage = await chrome.storage.local.get(['closedTabsCount']);
    const count = (storage.closedTabsCount || 0) + tabIds.length;
    await chrome.storage.local.set({ closedTabsCount: count });
    
    showToast(`${tabIds.length} abas fechadas!`);
    updateStats();
  } else {
    showToast('Nenhuma aba não-fixada para fechar!');
  }
};

const hibernateOldTabs = async () => {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const now = Date.now();
  const threeDaysAgo = now - (3 * 24 * 60 * 60 * 1000);
  
  // Obter informações de último acesso (Chrome não fornece isso diretamente)
  // Então vamos usar uma heurística: abas que não estão ativas e não estão em um grupo
  const toHibernate = tabs.filter(tab => 
    !tab.active && 
    !tab.pinned && 
    !tab.audible &&
    tab.groupId === -1
  );
  
  if (toHibernate.length === 0) {
    showToast('Nenhuma aba para hibernar!');
    return;
  }
  
  // Salvar informações das abas antes de fechar
  const hibernatedData = toHibernate.map(tab => ({
    url: tab.url,
    title: tab.title,
    hibernatedAt: Date.now()
  }));
  
  const storage = await chrome.storage.local.get(['hibernatedTabs']);
  const hibernated = storage.hibernatedTabs || [];
  hibernated.push(...hibernatedData);
  
  await chrome.storage.local.set({ hibernatedTabs: hibernated });
  await chrome.tabs.remove(toHibernate.map(tab => tab.id));
  
  showToast(`${toHibernate.length} abas hibernadas!`);
  updateStats();
};

// ===== EVENT LISTENERS =====
document.getElementById('createWorkspaceBtn').addEventListener('click', createWorkspace);
document.getElementById('saveSessionBtn').addEventListener('click', saveSession);
document.getElementById('groupByDomainBtn').addEventListener('click', groupByDomain);
document.getElementById('closeDuplicatesBtn').addEventListener('click', closeDuplicates);
document.getElementById('cleanUnpinnedBtn').addEventListener('click', cleanUnpinned);
document.getElementById('hibernateOldBtn').addEventListener('click', hibernateOldTabs);

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
  updateStats();
  loadWorkspaces();
  
  // Atualizar stats a cada 5 segundos
  setInterval(updateStats, 5000);
});
