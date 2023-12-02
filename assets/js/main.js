// Cache para elementos do DOM
const domElements = getDomElements();

// Função para obter elementos do DOM
function getDomElements() {
  return {
    chatInput: document.getElementById('chat-input'),
    sendBtn: document.getElementById('send-btn'),
    chatContainer: document.querySelector('.chat-container'),
    themeBtn: document.getElementById('theme-btn'),
    githubIcon: document.querySelector('.github-link img'),
    deleteBtn: document.getElementById('delete-btn'),
    portfolioBtn: document.getElementById('portfolio-btn'),
    menuIcon: document.getElementById('menu-icon'),
    sideBar: document.getElementById('sideBar'),
    closeBtn: document.querySelector('.closeBtn'),
  };
}

// Constantes
const apiUrl = 'https://chatchains.vercel.app/api/openai';
const initialHeight = domElements.chatInput.scrollHeight;
let userText = '';

// Mensagem padrão quando não há histórico
const defaultText = `
  <div class='default-text'>
    <img src='./assets/imgs/chatchains.svg' alt='Foto do usuário'>
    <p> Comece uma conversa ❤️<br>O histórico do seu chat aparecerá aqui.<br>
    Visite <a href='https://github.com/trichains' target='_blank'>trichains</a> no GitHub 👋</p>
  </div>`;

// Função para carregar dados do localStorage ao iniciar
const loadLocalStorageData = () => {
  const { themeBtn, chatContainer } = domElements;
  const themeColor = localStorage.getItem('theme-color');
  const isDarkMode = themeColor === 'dark_mode';	

  // Aplica o tema salvo no localStorage
  document.body.classList.toggle('dark-mode', isDarkMode);
  themeBtn.textContent = isDarkMode ? 'light_mode' : 'dark_mode';

  // Carrega histórico do localStorage ou exibe mensagem padrão
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
  pElement.classList.add('assistant');
 
  const chatDetails = chatEntry.querySelector('.chat-details');
  chatDetails.innerHTML = '';
 
  const botImage = document.createElement('img');
  botImage.src = './assets/imgs/chatchains.svg';
  chatDetails.appendChild(botImage);
  chatDetails.appendChild(pElement);
 
  const { chatContainer } = domElements;
  let index = 0;
 
  function typeWriter() {
    if (index < content.length) {
      pElement.innerHTML += content.charAt(index);
      index++;
      pElement.scrollTop = pElement.scrollHeight;
  
      requestAnimationFrame(typeWriter);
    } else {
      pElement.innerHTML = content;
      localStorage.setItem('all-chats', chatContainer.innerHTML);
      domElements.chatInput.disabled = false; // Reativa a entrada de texto
    }
  }
 
  requestAnimationFrame(typeWriter);
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
    domElements.chatInput.disabled = true;
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
  const { chatContainer } = domElements;
  chatContainer.appendChild(chatEntry);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userText }),
    });

    if (!response.ok) {
      throw new Error('Erro ao chamar a API OpenAI');
    }

    const responseData = await response.json();
    console.log('Resposta da API OpenAI:', responseData);
    handleChatResponse(chatEntry, responseData);
  } catch (error) {
    console.error('Erro ao obter resposta da API OpenAI', error);
    domElements.chatInput.disabled = false;

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

  const { chatContainer } = domElements;
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  localStorage.setItem('all-chats', chatContainer.innerHTML);
};

// Manipulação da Saída do Chat
const handleChatOutput = () => {
  userText = domElements.chatInput.value.trim();
  if (!userText) return;

  const { chatInput, chatContainer } = domElements;
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
  const { githubIcon, themeBtn } = domElements;
  const isDarkMode = document.body.classList.contains('dark-mode');
  const iconPath = isDarkMode ? './assets/imgs/github.svg' : './assets/imgs/github-dark.svg';
  githubIcon.setAttribute('src', iconPath);
};

// Adiciona ouvintes de eventos relacionados ao chat input
const addEventListeners = () => {
  const { themeBtn, deleteBtn, chatInput, sendBtn, portfolioBtn } = domElements;

  // Ouvinte de evento para alternar entre modos claro e escuro
  const handleThemeToggle = () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme-color', themeBtn.textContent);
    themeBtn.textContent = document.body.classList.contains('dark-mode') ? 'light_mode' : 'dark_mode';
    toggleGithubIcon();
  };
  themeBtn.parentElement.addEventListener('click', handleThemeToggle);

  // Ouvinte de evento para apagar o histórico do chat
  deleteBtn.addEventListener('click', () => {
    if (confirm('Isso apaga todo o histórico da sua conversa e inicia uma nova. Tem certeza?')) {
      localStorage.removeItem('all-chats');
      loadLocalStorageData();
      closeSidebar();
    }
  });

  // Ouvinte de evento para ajustar a altura do campo de entrada de chat
  chatInput.addEventListener('input', () => {
    chatInput.style.height = `${initialHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
  });

  // Ouvinte de evento para enviar mensagens ao pressionar Enter
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 768) {
      e.preventDefault();
      handleChatOutput();
    }
  });

  // Ouvinte de evento para clicar no botão de envio de mensagem
  sendBtn.addEventListener('click', handleChatOutput);

  // Função para trocar ícone do botão "Meu Portfolio"
  const handlePortfolioBtnIconChange = () => {
    const portfolioBtnParent = portfolioBtn.parentElement;
    const originalIcon = portfolioBtn.innerHTML;

    // Ouvinte de evento para alterar o ícone ao passar o mouse sobre o botão
    portfolioBtnParent.addEventListener('mouseover', () => {
      portfolioBtn.innerHTML = 'folder_open';
    });

    // Ouvinte de evento para restaurar o ícone ao remover o mouse do botão
    portfolioBtnParent.addEventListener('mouseout', () => {
      portfolioBtn.innerHTML = originalIcon;
    });
  };

  handlePortfolioBtnIconChange();
};

// Chama a função para trocar o ícone do botão "Meu Portfolio"
toggleGithubIcon();

// Ouvinte de evento ao carregar o conteúdo da página
document.addEventListener('DOMContentLoaded', () => {
  const { menuIcon, closeBtn, sideBar } = domElements;

  // Ouvinte de evento para mostrar/ocultar a barra lateral
  menuIcon.addEventListener('click', () => {
    sideBar.classList.toggle('sidebar-open');
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeSidebar);
  }

  // Ouvinte de evento para fechar a barra lateral ao clicar fora dela
  document.addEventListener('click', (event) => {
    if (sideBar && !sideBar.contains(event.target) && !menuIcon.contains(event.target)) {
      closeSidebar();
    }
  });

  // Adiciona outros ouvintes de eventos
  addEventListeners();
});

// Função para fechar a barra lateral
const closeSidebar = () => {
  const { sideBar } = domElements;
  sideBar.classList.remove('sidebar-open');
};
