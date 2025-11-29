// ===== SERVICE WORKER - BACKGROUND SCRIPT =====

// Listener para comandos de teclado
chrome.commands.onCommand.addListener(async (command) => {
  console.log('Command received:', command);
  
  switch (command) {
    case 'save-quick-session':
      await saveQuickSession();
      break;
      
    case 'switch-workspace-1':
      await switchToWorkspace(0);
      break;
      
    case 'switch-workspace-2':
      await switchToWorkspace(1);
      break;
      
    case 'clean-tabs':
      await cleanUnpinnedTabs();
      break;
  }
});

// Salvar sessão rápida
const saveQuickSession = async () => {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const tabsData = tabs.map(tab => ({
    url: tab.url,
    title: tab.title,
    pinned: tab.pinned
  }));
  
  const storage = await chrome.storage.sync.get(['sessions']);
  const sessions = storage.sessions || [];
  
  const now = new Date();
  const sessionName = `Sessão Rápida ${now.toLocaleString('pt-BR')}`;
  
  sessions.push({
    name: sessionName,
    tabs: tabsData,
    created: Date.now()
  });
  
  await chrome.storage.sync.set({ sessions });
  
  // Mostrar notificação
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'Tab Master',
    message: `Sessão "${sessionName}" salva com sucesso!`
  });
};

// Trocar para workspace específico
const switchToWorkspace = async (index) => {
  const storage = await chrome.storage.sync.get(['workspaces']);
  const workspaces = storage.workspaces || [];
  const workspace = workspaces[index];
  
  if (!workspace) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Tab Master',
      message: `Workspace ${index + 1} não encontrado!`
    });
    return;
  }
  
  // Fechar abas não fixadas
  const currentTabs = await chrome.tabs.query({ currentWindow: true, pinned: false });
  await Promise.all(currentTabs.map(tab => chrome.tabs.remove(tab.id)));
  
  // Abrir abas do workspace
  for (const tab of workspace.tabs) {
    await chrome.tabs.create({
      url: tab.url,
      pinned: tab.pinned,
      active: false
    });
  }
  
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'Tab Master',
    message: `Workspace "${workspace.name}" ativado!`
  });
};

// Limpar abas não fixadas
const cleanUnpinnedTabs = async () => {
  const tabs = await chrome.tabs.query({ currentWindow: true, pinned: false });
  const tabIds = tabs.map(tab => tab.id);
  
  if (tabIds.length > 0) {
    await chrome.tabs.remove(tabIds);
    
    // Atualizar contador
    const storage = await chrome.storage.local.get(['closedTabsCount']);
    const count = (storage.closedTabsCount || 0) + tabIds.length;
    await chrome.storage.local.set({ closedTabsCount: count });
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Tab Master',
      message: `${tabIds.length} abas fechadas!`
    });
  }
};

// Monitorar criação de novas abas para estatísticas
chrome.tabs.onCreated.addListener(async (tab) => {
  const storage = await chrome.storage.local.get(['tabsCreatedCount']);
  const count = (storage.tabsCreatedCount || 0) + 1;
  await chrome.storage.local.set({ tabsCreatedCount: count });
});

// Monitorar fechamento de abas
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  const storage = await chrome.storage.local.get(['tabsClosedCount']);
  const count = (storage.tabsClosedCount || 0) + 1;
  await chrome.storage.local.set({ tabsClosedCount: count });
});

// Auto-agrupamento inteligente (opcional - pode ser ativado pelo usuário)
const autoGroupByDomain = async () => {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const domainMap = {};
  
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
  
  const colors = ['blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'];
  let colorIndex = 0;
  
  for (const [domain, tabIds] of Object.entries(domainMap)) {
    if (tabIds.length > 2) { // Só agrupar se tiver 3+ abas do mesmo domínio
      const groupId = await chrome.tabs.group({ tabIds });
      await chrome.tabGroups.update(groupId, {
        title: domain,
        color: colors[colorIndex % colors.length],
        collapsed: false
      });
      colorIndex++;
    }
  }
};

// Listener para instalação da extensão
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Primeira instalação - inicializar dados
    await chrome.storage.sync.set({
      workspaces: [],
      sessions: [],
      settings: {
        autoGroup: false,
        autoHibernate: false,
        hibernateDays: 7
      }
    });
    
    await chrome.storage.local.set({
      hibernatedTabs: [],
      closedTabsCount: 0,
      tabsCreatedCount: 0,
      tabsClosedCount: 0
    });
    
    // Abrir página de boas-vindas
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html')
    });
  }
});

// Verificar abas para hibernação automática (rodar a cada hora)
const checkForHibernation = async () => {
  const storage = await chrome.storage.sync.get(['settings']);
  const settings = storage.settings || { autoHibernate: false, hibernateDays: 7 };
  
  if (!settings.autoHibernate) return;
  
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const now = Date.now();
  const hibernateAfter = settings.hibernateDays * 24 * 60 * 60 * 1000;
  
  // Abas candidatas para hibernação
  const toHibernate = tabs.filter(tab => 
    !tab.active && 
    !tab.pinned && 
    !tab.audible &&
    tab.groupId === -1 &&
    (now - tab.lastAccessed > hibernateAfter)
  );
  
  if (toHibernate.length > 0) {
    const hibernatedData = toHibernate.map(tab => ({
      url: tab.url,
      title: tab.title,
      hibernatedAt: now
    }));
    
    const storageData = await chrome.storage.local.get(['hibernatedTabs']);
    const hibernated = storageData.hibernatedTabs || [];
    hibernated.push(...hibernatedData);
    
    await chrome.storage.local.set({ hibernatedTabs: hibernated });
    await chrome.tabs.remove(toHibernate.map(tab => tab.id));
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Tab Master',
      message: `${toHibernate.length} abas hibernadas automaticamente`
    });
  }
};

// Verificar hibernação a cada hora
chrome.alarms.create('checkHibernation', { periodInMinutes: 60 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkHibernation') {
    checkForHibernation();
  }
});

console.log('Tab Master service worker initialized');
