# 🚀 Tab Master - Organize suas abas com inteligência

Uma extensão poderosa para o Chrome que ajuda você a organizar suas abas, economizar memória e aumentar sua produtividade.

## ✨ Funcionalidades

### 🗂️ Workspaces
- Crie contextos diferentes (Trabalho, Estudos, Lazer)
- Troque entre workspaces com um clique ou atalho de teclado
- Salve e restaure conjuntos completos de abas

### 💾 Sessões
- Salve snapshots das suas abas abertas
- Restaure sessões antigas a qualquer momento
- Backup automático do seu trabalho

### 🛠️ Ferramentas Inteligentes
- **Agrupar por Domínio**: Organiza automaticamente abas do mesmo site
- **Fechar Duplicadas**: Remove abas duplicadas instantaneamente
- **Limpar Abas**: Fecha todas as abas não-fixadas
- **Hibernar Abas Antigas**: Economize memória fechando abas inativas

### ⚡ Atalhos de Teclado
- `Ctrl+Shift+S` - Salvar sessão rápida
- `Ctrl+Shift+1/2/3` - Alternar entre workspaces
- `Ctrl+Shift+D` - Limpar abas não-fixadas

### 📊 Estatísticas
- Veja quantas abas você tem abertas
- Monitore memória economizada
- Acompanhe seu uso de abas

## 🔧 Como Instalar

### Método 1: Carregar extensão desempacotada (Para testes)

1. **Baixe os arquivos**
   - Clone este repositório ou baixe os arquivos

2. **Abra o Chrome**
   - Digite `chrome://extensions` na barra de endereço
   - Pressione Enter

3. **Ative o Modo de Desenvolvedor**
   - No canto superior direito, ative a chave "Modo do desenvolvedor"

4. **Carregue a extensão**
   - Clique em "Carregar sem compactação"
   - Selecione a pasta `tab-master` que contém o arquivo `manifest.json`

5. **Pronto!**
   - O ícone do Tab Master aparecerá ao lado da barra de endereço
   - Clique nele para começar a usar

### Método 2: Publicar na Chrome Web Store (Para produção)

1. **Prepare os arquivos**
   - Crie um arquivo ZIP com todos os arquivos da extensão
   - Certifique-se de que o `manifest.json` está na raiz do ZIP

2. **Acesse o Chrome Developer Dashboard**
   - Vá para: https://chrome.google.com/webstore/devconsole
   - Faça login com sua conta Google

3. **Pague a taxa de registro** (única vez)
   - Taxa de US$ 5 para criar conta de desenvolvedor
   - Pagamento via cartão de crédito

4. **Faça upload da extensão**
   - Clique em "Novo item"
   - Faça upload do arquivo ZIP
   - Preencha as informações (descrição, capturas de tela, etc.)

5. **Publique**
   - Após revisão (1-3 dias), sua extensão estará disponível publicamente

## 📁 Estrutura do Projeto

```
tab-master/
├── manifest.json           # Configuração da extensão
├── popup.html             # Interface principal
├── popup.js               # Lógica da interface
├── background.js          # Service worker (background)
├── welcome.html           # Página de boas-vindas
├── README.md              # Este arquivo
└── icons/                 # Ícones da extensão
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## 🎯 Como Usar

### Criar um Workspace
1. Abra várias abas relacionadas (ex: todas as abas de trabalho)
2. Clique no ícone do Tab Master
3. Vá para a aba "Workspaces"
4. Clique em "Criar Workspace"
5. Dê um nome (ex: "Trabalho")

### Alternar entre Workspaces
- Método 1: Clique no workspace e depois no botão de ativar
- Método 2: Use `Ctrl+Shift+1` (ou 2, 3) para alternar rapidamente

### Salvar uma Sessão
1. Clique no ícone do Tab Master
2. Vá para a aba "Sessões"
3. Clique em "Salvar Sessão Atual"
4. Dê um nome descritivo

### Ferramentas Rápidas
- **Agrupar por Domínio**: Organiza abas por site automaticamente
- **Fechar Duplicadas**: Remove URLs duplicadas
- **Limpar Abas**: Fecha tudo exceto abas fixadas
- **Hibernar Antigas**: Fecha abas inativas, mas salva para restaurar depois

## 💡 Dicas de Produtividade

1. **Use abas fixadas** - Abas fixadas nunca são fechadas pela ferramenta de limpeza
2. **Crie workspaces temáticos** - Trabalho, Estudos, Pesquisa, Lazer
3. **Salve sessões antes de fechar o navegador** - Nunca perca seu trabalho
4. **Use atalhos de teclado** - Muito mais rápido que clicar
5. **Agrupe por domínio regularmente** - Mantém tudo organizado

## 🚀 Roadmap / Próximas Features

- [ ] Sincronização em nuvem (opcional)
- [ ] Temas personalizados
- [ ] Estatísticas avançadas de uso
- [ ] Auto-agrupamento inteligente
- [ ] Sugestões de organização baseadas em IA
- [ ] Integração com Notion/Todoist
- [ ] Exportar/importar workspaces
- [ ] Modo Pomodoro integrado

## 💰 Monetização (Plano Futuro)

### Versão Gratuita
- 3 workspaces
- 10 sessões salvas
- Ferramentas básicas

### Versão Pro (US$ 2.99/mês ou US$ 29 lifetime)
- Workspaces ilimitados
- Sessões ilimitadas
- Auto-agrupamento inteligente
- Sincronização em nuvem
- Estatísticas avançadas
- Suporte prioritário

## 🐛 Reportar Bugs / Sugestões

Se encontrar algum problema ou tiver sugestões:
1. Clique no ícone da extensão
2. Clique em configurações (ícone de engrenagem)
3. Use o link "Reportar Bug" ou "Sugerir Feature"

## 📄 Licença

Este projeto é de código aberto para fins de aprendizado e desenvolvimento.

## 🎉 Créditos

Desenvolvido com ❤️ para aumentar a produtividade de todos

---

**Versão**: 1.0.0  
**Última atualização**: 2024

## 🔥 Começe Agora!

1. Instale a extensão seguindo as instruções acima
2. Clique no ícone do Tab Master
3. Crie seu primeiro workspace
4. Aumente sua produtividade! 🚀
