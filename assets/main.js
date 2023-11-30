// Seleção de Elementos do DOM
const domElements = {
  chatInput: document.getElementById('chat-input'),
  sendBtn: document.getElementById('send-btn'),
  chatContainer: document.querySelector('.chat-container'),
  themeBtn: document.getElementById('theme-btn'),
  githubIcon: document.querySelector('.github-link img'),
  deleteBtn: document.getElementById('delete-btn'),
  menuIcon: document.getElementById('menu-icon'),
  mobileMenu: document.querySelector('.sideBar.mobile-menu'),
  portfolioBtn: document.getElementById('portfolio-btn'),
};

// Constantes
const apiUrl = 'https://chatchains.vercel.app/api/openai';
const initialHeight = domElements.chatInput.scrollHeight;

// Carrega dados do localStorage ao iniciar
const loadLocalStorageData = () => {
  const themeColor = localStorage.getItem('theme-color');
  const isLightMode = themeColor === 'light_mode';

  document.body.classList.toggle('light-mode', isLightMode);
  domElements.themeBtn.textContent = isLightMode ? 'dark_mode' : 'light_mode';

  const defaultText = `<div class='default-text'>
                          <img src='./assets/imgs/chatchains.svg' alt='Foto do usuário'>
                          <p> Comece uma conversa ❤️<br>O histórico do seu chat aparecerá aqui.<br>
                          Visite <a href='https://github.com/trichains' target='_blank'>trichains</a> no GitHub 👋</p>
                        </div>`;

  domElements.chatContainer.innerHTML =
    localStorage.getItem('all-chats') || defaultText;
  domElements.chatContainer.scrollTo(0, domElements.chatContainer.scrollHeight);
};

// Chama a função para carregar dados do localStorage ao iniciar
loadLocalStorageData();

// Função de Criação de Elemento HTML
const createElement = (html, className) => {
  const chatDiv = document.createElement('div');
  chatDiv.classList.add('chat', className);
  chatDiv.innerHTML = html;
  return chatDiv;
};

// Função para Obter Resposta do Chat
const handleChatResponse = (chatEntry, response) => {
  const pElement = document.createElement('p');

  const handleInvalidResponse = () => {
    const errorMessage = 'Resposta inválida da API';
    console.error(errorMessage, response);
    pElement.classList.add('error');
    pElement.textContent = errorMessage;
    showError(errorMessage);
  };

  if (!response || !response.choices || response.choices.length === 0) {
    handleInvalidResponse();
    return;
  }

  const content = response.choices[0]?.message?.content;

  if (content !== undefined && content !== null) {
    pElement.textContent = content.trim();
  } else {
    handleInvalidResponse();
  }

  chatEntry.querySelector('.typing-animation').remove();
  chatEntry.querySelector('.chat-details').appendChild(pElement);
  domElements.chatContainer.scrollTo(0, domElements.chatContainer.scrollHeight);
  localStorage.setItem('all-chats', domElements.chatContainer.innerHTML);
};

// Função para copiar resposta para a área de transferência
const copyResponse = (copyBtn) => {
  const responseTextElement = copyBtn.parentElement.querySelector('p');
  navigator.clipboard.writeText(responseTextElement.textContent);
  // Restaura o texto do botão após a cópia
  setTimeout(() => {
    copyBtn.textContent = 'content_copy';
  }, 2000);
};

// Animação de Digitação
const showTypingAnimation = async () => {
  const html = `<div class='chat-content'>
                  <div class='chat-details'>
                    <img src='./assets/imgs/chatchains.svg' alt='Foto do Chat Bot' />
                    <div class='typing-animation'>
                      <div class='typing-dot' style='--delay: 0.2s'></div>
                      <div class='typing-dot' style='--delay: 0.3s'></div>
                      <div class='typing-dot' style='--delay: 0.4s'></div>
                    </div>
                  </div>
                  <button onclick='copyResponse(this)' class='material-symbols-rounded'>content_copy</button>
                </div>`;
  const chatEntry = createElement(html, 'entrada');
  domElements.chatContainer.appendChild(chatEntry);
  domElements.chatContainer.scrollTo(0, domElements.chatContainer.scrollHeight);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userText })
    });

    if (!response.ok) {
      throw new Error('Erro ao chamar a API OpenAI');
    }

    const responseData = await response.json();
    // Chama a função para manipular a resposta
    handleChatResponse(chatEntry, responseData);
  } catch (error) {
    console.error('Erro ao obter resposta da API OpenAI', error);
    // Exibe mensagem de erro no chat
    showError('Erro ao obter resposta, tente novamente.');
  }
};

// Função para exibir uma mensagem de erro no chat
const showError = (errorMessage) => {
  const html = `<div class="chat-content">
                  <div class="chat-details">
                    <img src="./assets/imgs/chatchains.svg" alt="Foto do Chat Bot" />
                    <p class="error">${errorMessage}</p>
                 </div>
                </div>`;
  const errorChatEntry = createElement(html, 'saida');
  domElements.chatContainer.appendChild(errorChatEntry);
  domElements.chatContainer.scrollTo(0, domElements.chatContainer.scrollHeight);
  localStorage.setItem('all-chats', domElements.chatContainer.innerHTML);
};

// Manipulação da Saída do Chat
const handleChatOutput = () => {
  userText = domElements.chatInput.value.trim();
  if (!userText) return;

  domElements.chatInput.value = '';
  domElements.chatInput.style.height = `${initialHeight}px`;
  const html = `<div class="chat-content">
                  <div class="chat-details">
                    <img src="./assets/imgs/user.svg" alt="Foto do usuário" />
                    <p></p>
                 </div>
                </div>`;
  // Cria um div de chat de saída com a mensagem do usuário e anexa ao contêiner de chat
  const outputChatEntry = createElement(html, 'saida');
  outputChatEntry.querySelector('.chat-details p').textContent = userText;
  document.querySelector('.default-text')?.remove();
  domElements.chatContainer.appendChild(outputChatEntry);
  domElements.chatContainer.scrollTo(0, domElements.chatContainer.scrollHeight);

  // Após criar a entrada do usuário, você pode chamar a função para obter a resposta (showTypingAnimation)
  showTypingAnimation();
};

// Função para trocar o ícone do GitHub com base no tema atual
const toggleGithubIcon = () => {
  const isLightMode = document.body.classList.contains('light-mode');
  const iconPath = isLightMode
    ? './assets/imgs/github-dark.svg' // Caminho para o ícone escuro
    : './assets/imgs/github.svg'; // Caminho para o ícone claro
  domElements.githubIcon.setAttribute('src', iconPath);
};

// Adiciona um ouvinte de evento para o clique no contêiner pai do botão de tema
domElements.themeBtn.parentElement.addEventListener('click', () => {
  // Muda o tema do site
  document.body.classList.toggle('light-mode');
  localStorage.setItem('theme-color', domElements.themeBtn.textContent);
  domElements.themeBtn.textContent = document.body.classList.contains('light-mode')
    ? 'dark_mode'
    : 'light_mode';

  // Chama a função para trocar o ícone do GitHub
  toggleGithubIcon();
});

// ... (seu código existente)


// Adiciona um ouvinte de evento para o clique no botão de apagar
domElements.deleteBtn.addEventListener('click', () => {
  // Remove todas as conversas do localStorage e chama a função loadLocalStorageData para atualizar o conteúdo do chat
  if (confirm('Isso apaga todo o historico da sua conversa e inicia uma nova.Tem certeza?')) {
    localStorage.removeItem('all-chats');
    domElements.chatContainer.innerHTML = '';
    loadLocalStorageData();
  }
});

// Adiciona um ouvinte de evento para o evento de entrada no campo de texto
domElements.chatInput.addEventListener('input', () => {
  // Ajusta a altura do input de acordo com o conteúdo
  domElements.chatInput.style.height = `${initialHeight}px`;
  domElements.chatInput.style.height = `${domElements.chatInput.scrollHeight}px`;
});

// Adiciona um ouvinte de evento para o pressionamento de tecla no campo de texto
domElements.chatInput.addEventListener('keydown', (e) => {
  // Se o botão Enter for pressionado com shift pressionado e a largura da janela for maior que 768, aciona a manipulação da saída do chat
  if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 768) {
    e.preventDefault();
    handleChatOutput();
  }
});

// Adiciona um ouvinte de evento para o clique no botão de menu
domElements.menuIcon.addEventListener('click', () => {
  // Adiciona ou remove a classe 'show-menu' no mobileMenu
  domElements.mobileMenu.classList.toggle('show-menu');
});

// Adiciona um ouvinte de evento para o clique no botão de envio, que aciona a manipulação da saída do chat
domElements.sendBtn.addEventListener('click', handleChatOutput);

// Função para trocar o ícone do botão "Meu Portfolio"
const handlePortfolioBtnIconChange = () => {
  const portfolioBtnParent = domElements.portfolioBtn.parentElement;
  const originalIcon = domElements.portfolioBtn.innerHTML;

  // Adiciona o evento de mouseover para trocar o ícone
  portfolioBtnParent.addEventListener('mouseover', () => {
    domElements.portfolioBtn.innerHTML = 'folder_open';
  });

  // Adiciona o evento de mouseout para restaurar o ícone original
  portfolioBtnParent.addEventListener('mouseout', () => {
    domElements.portfolioBtn.innerHTML = originalIcon;
  });
};

// Chama a função para trocar o ícone do botão "Meu Portfolio"
handlePortfolioBtnIconChange();

// Chama a função para trocar o ícone do GitHub com base no tema atual
toggleGithubIcon();