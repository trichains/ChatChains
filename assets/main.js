// Função para obter elementos do DOM
const getDomElements = () => ({
  chatInput: document.getElementById('chat-input'),
  sendBtn: document.getElementById('send-btn'),
  chatContainer: document.querySelector('.chat-container'),
  themeBtn: document.getElementById('theme-btn'),
  githubIcon: document.querySelector('.github-link img'),
  deleteBtn: document.getElementById('delete-btn'),
  portfolioBtn: document.getElementById('portfolio-btn')
});

// Constantes
const apiUrl = 'https://chatchains.vercel.app/api/openai';
const initialHeight = getDomElements().chatInput.scrollHeight;
let userText = '';

const defaultText = `
  <div class='default-text'>
    <img src='./assets/imgs/chatchains.svg' alt='Foto do usuário'>
    <p> Comece uma conversa ❤️<br>O histórico do seu chat aparecerá aqui.<br>
    Visite <a href='https://github.com/trichains' target='_blank'>trichains</a> no GitHub 👋</p>
  </div>`;

// Função para carregar dados do localStorage ao iniciar
const loadLocalStorageData = () => {
  const { themeBtn, chatContainer } = getDomElements();
  const themeColor = localStorage.getItem('theme-color');
  const isLightMode = themeColor === 'light_mode';

  document.body.classList.toggle('light-mode', isLightMode);
  themeBtn.textContent = isLightMode ? 'dark_mode' : 'light_mode';

  const allChats = localStorage.getItem('all-chats') || defaultText;
  chatContainer.innerHTML = allChats;
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

// Chama a função para carregar dados do localStorage ao iniciar
loadLocalStorageData();

// Função para criar elemento HTML
const createElement = (html, className) => {
  const chatDiv = document.createElement('div');
  chatDiv.className = `chat ${className}`;
  chatDiv.innerHTML = html;
  return chatDiv;
};

// Função para obter mensagem de erro da API
const getErrorMessage = (response) => {
  if (!response || !response.choices || response.choices.length === 0) {
    return 'Resposta inválida da API';
  }

  const content = response.choices[0]?.message?.content;

  return content !== undefined && content !== null ? null : 'Resposta inválida da API';
};

// Função para manipular a resposta do chat
const handleChatResponse = (chatEntry, response) => {
  const errorMessage = getErrorMessage(response);

  if (errorMessage) {
    console.error(errorMessage, response);
    showError(errorMessage, chatEntry);
  } else {
    const content = response.choices[0]?.message?.content;

    if (content !== undefined && content !== null) {
      handleValidChatResponse(chatEntry, content);
    } else {
      const errorMessage = 'Resposta vazia da API';
      console.error(errorMessage, response);
      showError(errorMessage, chatEntry);
    }
  }
};

// Função para manipular resposta de chat válida
const handleValidChatResponse = (chatEntry, content) => {
  const typingAnimation = chatEntry.querySelector('.typing-animation');
  if (typingAnimation) {
    typingAnimation.remove();
  }

  const pElement = document.createElement('p');
  pElement.textContent = content.trim();

  const chatDetails = chatEntry.querySelector('.chat-details');
  chatDetails.innerHTML = '';
  const botImage = document.createElement('img');
  botImage.src = './assets/imgs/chatchains.svg';
  chatDetails.appendChild(botImage);
  chatDetails.appendChild(pElement);

  const { chatContainer } = getDomElements();
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  localStorage.setItem('all-chats', chatContainer.innerHTML);
};

// Função para copiar resposta para a área de transferência
const copyResponse = (copyBtn) => {
  const responseTextElement = copyBtn.parentElement.querySelector('p');
  navigator.clipboard.writeText(responseTextElement.textContent);
  copyBtn.textContent = 'done';

  setTimeout(() => {
    copyBtn.textContent = 'content_copy';
  }, 2000);
};

// Animação de Digitação
const showTypingAnimation = async () => {
  const createChatEntry = () => {
    const html = `
      <div class='chat-content'>
        <div class='chat-details'>
          <img src='./assets/imgs/chatchains.svg' alt='Foto do Chat Bot' />
          <div class='typing-animation'>
            <div class='typing-dot' style='--delay: 0.2s'></div>
            <div class='typing-dot' style='--delay: 0.3s'></div>
            <div class='typing-dot' style='--delay: 0.4s'></div>
          </div>
        </div>
        <button onclick="copyResponse(this)" class='material-symbols-rounded'>content_copy</button>
      </div>`;
    return createElement(html, 'entrada');
  };

  const chatEntry = createChatEntry();
  const { chatContainer } = getDomElements();
  chatContainer.appendChild(chatEntry);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);

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
    handleChatResponse(chatEntry, responseData);
  } catch (error) {
    console.error('Erro ao obter resposta da API OpenAI', error);

    const typingAnimation = chatEntry.querySelector('.typing-animation');
    if (typingAnimation) {
      typingAnimation.remove();
    }

    showError('Muitas requisições no momento, tente novamente mais tarde.', chatEntry);
  }
};

// Função para exibir mensagem de erro no chat
const showError = (errorMessage, chatEntry) => {
  const pElement = document.createElement('p');
  pElement.classList.add('error');
  pElement.textContent = errorMessage;

  const chatDetails = chatEntry.querySelector('.chat-details');
  chatDetails.appendChild(pElement);

  const { chatContainer } = getDomElements();
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  localStorage.setItem('all-chats', chatContainer.innerHTML);
};

// Manipulação da Saída do Chat
const handleChatOutput = () => {
  userText = getDomElements().chatInput.value.trim();
  if (!userText) return;

  const { chatInput, chatContainer } = getDomElements();
  chatInput.value = '';
  chatInput.style.height = `${initialHeight}px`;

  const html = `
    <div class="chat-content">
      <div class="chat-details">
        <img src="./assets/imgs/user.svg" alt="Foto do usuário" />
        <p></p>
      </div>
    </div>`;

  const outputChatEntry = createElement(html, 'saida');
  outputChatEntry.querySelector('.chat-details p').textContent = userText;
  document.querySelector('.default-text')?.remove();
  chatContainer.appendChild(outputChatEntry);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);

  showTypingAnimation();
};

// Função para trocar ícone do GitHub com base no tema atual
const toggleGithubIcon = () => {
  const { githubIcon, themeBtn } = getDomElements();
  const isLightMode = document.body.classList.contains('light-mode');
  const iconPath = isLightMode ? './assets/imgs/github-dark.svg' : './assets/imgs/github.svg';
  githubIcon.setAttribute('src', iconPath);
};

// Adiciona ouvintes de eventos relacionados ao chat input
const addEventListeners = () => {
  const { themeBtn, deleteBtn, chatInput, sendBtn, portfolioBtn } = getDomElements();

  themeBtn.parentElement.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme-color', themeBtn.textContent);
    themeBtn.textContent = document.body.classList.contains('light-mode') ? 'dark_mode' : 'light_mode';
    toggleGithubIcon();
  });

  deleteBtn.addEventListener('click', () => {
    if (confirm('Isso apaga todo o histórico da sua conversa e inicia uma nova. Tem certeza?')) {
      localStorage.removeItem('all-chats');
      chatContainer.innerHTML = '';
      loadLocalStorageData();
      closeSidebar();
    }
  });

  chatInput.addEventListener('input', () => {
    chatInput.style.height = `${initialHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
  });

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 768) {
      e.preventDefault();
      handleChatOutput();
    }
  });

  sendBtn.addEventListener('click', handleChatOutput);

  // Função para trocar ícone do botão "Meu Portfolio"
  const handlePortfolioBtnIconChange = () => {
    const portfolioBtnParent = portfolioBtn.parentElement;
    const originalIcon = portfolioBtn.innerHTML;

    portfolioBtnParent.addEventListener('mouseover', () => {
      portfolioBtn.innerHTML = 'folder_open';
    });

    portfolioBtnParent.addEventListener('mouseout', () => {
      portfolioBtn.innerHTML = originalIcon;
    });
  };

  handlePortfolioBtnIconChange();
};

// Chama a função para trocar o ícone do botão "Meu Portfolio"
toggleGithubIcon();

document.addEventListener('DOMContentLoaded', () => {
  const menuIcon = document.getElementById('menu-icon');
  const sideBar = document.querySelector('.sideBar');

  menuIcon.addEventListener('click', () => {
    sideBar.classList.toggle('sidebar-open');
  });

  const closeBtn = document.querySelector('.closeBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeSidebar);
  }

  document.addEventListener('click', (event) => {
    if (!sideBar.contains(event.target) && !menuIcon.contains(event.target)) {
      closeSidebar();
    }
  });

  addEventListeners();
});

const closeSidebar = () => {
  const sideBar = document.querySelector('.sideBar');
  sideBar.classList.remove('sidebar-open');
};
