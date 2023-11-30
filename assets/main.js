// Armazena referências para elementos DOM frequentemente usados
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatContainer = document.querySelector('.chat-container');
const themeBtn = document.getElementById('theme-btn');
const githubIcon = document.querySelector('.github-link img');
const deleteBtn = document.getElementById('delete-btn');
const portfolioBtn = document.getElementById('portfolio-btn');

  const domElements = {
    chatInput,
    sendBtn,
    chatContainer,
    themeBtn,
    githubIcon,
    deleteBtn,
    portfolioBtn
  };

// Constantes
const apiUrl = 'https://chatchains.vercel.app/api/openai';
const initialHeight = domElements.chatInput.scrollHeight;

const defaultText = `
<div class='default-text'>
  <img src='./assets/imgs/chatchains.svg' alt='Foto do usuário'>
  <p> Comece uma conversa ❤️<br>O histórico do seu chat aparecerá aqui.<br>
  Visite <a href='https://github.com/trichains' target='_blank'>trichains</a> no GitHub 👋</p>
</div>`;

// Carrega dados do localStorage ao iniciar
const loadLocalStorageData = () => {
  const themeColor = localStorage.getItem('theme-color');
  const isLightMode = themeColor === 'light_mode';

  document.body.classList.toggle('light-mode', isLightMode);
  domElements.themeBtn.textContent = isLightMode ? 'dark_mode' : 'light_mode';

  const allChats = localStorage.getItem('all-chats') || defaultText;
  domElements.chatContainer.innerHTML = allChats;
  domElements.chatContainer.scrollTo(0, domElements.chatContainer.scrollHeight);
};

// Chama a função para carregar dados do localStorage ao iniciar
loadLocalStorageData();

// Função de Criação de Elemento HTML
const createElement = (html, className) => {
  const chatDiv = document.createElement('div');
  chatDiv.className = `chat ${className}`;
  chatDiv.innerHTML = html;
  return chatDiv;
};

const getErrorMessage = (response) => {
  if (!response || !response.choices || response.choices.length === 0) {
    return 'Resposta inválida da API';
  }

  const content = response.choices[0]?.message?.content;

  if (content !== undefined && content !== null) {
    return null;
  } else {
    return 'Resposta inválida da API';
  }
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
      // Remove a animação de digitação
      const typingAnimation = chatEntry.querySelector('.typing-animation');
      if (typingAnimation) {
        typingAnimation.remove();
      }

      // Cria um novo parágrafo e adiciona o conteúdo da resposta
      const pElement = document.createElement('p');
      pElement.textContent = content.trim();

      // Adiciona a imagem e o parágrafo ao chat-details
      const chatDetails = chatEntry.querySelector('.chat-details');
      chatDetails.innerHTML = ''; // Limpa o conteúdo atual
      const botImage = document.createElement('img');
      botImage.src = './assets/imgs/chatchains.svg'; // Substitua pelo caminho real da imagem
      chatDetails.appendChild(botImage);
      chatDetails.appendChild(pElement);

      // Adiciona o botão de cópia dentro do chat-details
      const copyButton = document.createElement('button');
      copyButton.className = 'material-symbols-rounded';
      copyButton.textContent = 'content_copy';
      chatDetails.appendChild(copyButton);

      domElements.chatContainer.scrollTo(0, domElements.chatContainer.scrollHeight);
      localStorage.setItem('all-chats', domElements.chatContainer.innerHTML);
    } else {
      const errorMessage = 'Resposta vazia da API';
      console.error(errorMessage, response);
      showError(errorMessage, chatEntry);
    }
  }
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
      </div>`;
    return createElement(html, 'entrada');
  };

  const chatEntry = createChatEntry();
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
    // Remove a animação de digitação
    const typingAnimation = chatEntry.querySelector('.typing-animation');
    if (typingAnimation) {
      typingAnimation.remove();
    }

    // Chama a função para exibir a mensagem de erro no chat de entrada atual
    showError('Erro ao obter resposta, tente novamente.', chatEntry);
  }
};



// Função para exibir uma mensagem de erro no chat
const showError = (errorMessage, chatEntry) => {
  const pElement = document.createElement('p');
  pElement.classList.add('error');
  pElement.textContent = errorMessage;

  // Adiciona a mensagem de erro na estrutura do chat-details atual
  const chatDetails = chatEntry.querySelector('.chat-details');
  chatDetails.appendChild(pElement);

  domElements.chatContainer.scrollTo(0, domElements.chatContainer.scrollHeight);
  localStorage.setItem('all-chats', domElements.chatContainer.innerHTML);
};



// Manipulação da Saída do Chat
const handleChatOutput = () => {
  userText = domElements.chatInput.value.trim();
  if (!userText) return;

  domElements.chatInput.value = '';
  domElements.chatInput.style.height = `${initialHeight}px`;
  const html = `
    <div class="chat-content">
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
  if (confirm('Isso apaga todo o histórico da sua conversa e inicia uma nova.Tem certeza?')) {
    localStorage.removeItem('all-chats');
    domElements.chatContainer.innerHTML = '';
    loadLocalStorageData();
    closeSidebar();
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

document.addEventListener('DOMContentLoaded', function () {
  const menuIcon = document.getElementById('menu-icon');
  const sideBar = document.querySelector('.sideBar');

  // Adiciona um evento de clique ao ícone do menu
  menuIcon.addEventListener('click', function () {
      // Toggle a classe 'sidebar-open' na barra lateral para mostrar/ocultar
      sideBar.classList.toggle('sidebar-open');
  });

   // Adiciona um ouvinte de evento ao botão de fechar na barra lateral
   const closeBtn = document.querySelector('.closeBtn');
   if (closeBtn) {
     closeBtn.addEventListener('click', closeSidebar);
  }
  
     // Adiciona um ouvinte de evento ao clicar fora da barra lateral para fechá-la
     document.addEventListener('click', function (event) {
      if (!sideBar.contains(event.target) && !menuIcon.contains(event.target)) {
        closeSidebar();
      }
    });
});

const closeSidebar = () => {
  const sideBar = document.querySelector('.sideBar');
  sideBar.classList.remove('sidebar-open');
};
