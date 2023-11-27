// Seleção de Elementos do DOM
const elements = {
  chatInput: document.getElementById('chat-input'), // Input de texto do usuário
  sendBtn: document.getElementById('send-btn'), // Botão de envio de mensagem
  chatContainer: document.querySelector('.chat-container'), // Contêiner para exibição das mensagens do chat
  themeBtn: document.getElementById('theme-btn'), // Botão para mudar o tema
  githubIcon: document.querySelector('.rede-social img'), // Seleção do elemento do ícone do GitHub
  deleteBtn: document.getElementById('delete-btn') // Botão para apagar o chat
};

// Variáveis Globais
let userText = null; // Armazena o texto digitado pelo usuário
const apiUrl = 'https://botchains.vercel.app/api/openai'; // URL da API OpenAI
const initialHeight = elements.chatInput.scrollHeight; // Altura inicial do input

// Carrega dados do localStorage ao iniciar
const loadDataFromLocalStorage = () => {
  const themeColor = localStorage.getItem('theme-color');
  // Adiciona ou remove a classe 'light-mode' com base na preferência do tema
  document.body.classList.toggle('light-mode', themeColor === 'light_mode');
  // Atualiza o texto do botão de tema com base no tema atual
  elements.themeBtn.textContent = document.body.classList.contains('light-mode')
    ? 'dark_mode'
    : 'light_mode';

  const defaultText = `<div class='default-text'>
                          <h1>⛓️ BotChains ⛓️</h1>
                          <p> Comece a conversar e explore o poder da AI.<br> O histórico do seu chat aparecerá aqui.<br>
                          Desenvolvido por <a href='https://github.com/trichains' target='_blank'>trichains</a></p>
                        </div>`;
  // Carrega o histórico do chat do localStorage ou exibe um texto padrão
  elements.chatContainer.innerHTML =
    localStorage.getItem('all-chats') || defaultText;
  elements.chatContainer.scrollTo(0, elements.chatContainer.scrollHeight);
};

// Chama a função para carregar dados do localStorage ao iniciar
loadDataFromLocalStorage();

// Função de Criação de Elemento HTML
const createElement = (html, className) => {
  const chatDiv = document.createElement('div');
  chatDiv.classList.add('chat', className);
  chatDiv.innerHTML = html;
  return chatDiv; // Retorna o elemento criado
};

// Função para Obter Resposta do Chat
const getChatResponse = (entradaChatDiv, response) => {
  const pElement = document.createElement('p');

  if (response && response.choices && response.choices.length > 0) {
    const content = response.choices[0]?.message?.content;

    if (content !== undefined && content !== null) {
      pElement.textContent = content.trim();
    } else {
      console.error('Resposta da API OpenAI inválida:', response);
      pElement.classList.add('error');
      pElement.textContent = 'Resposta inválida da API';
    }
  } else {
    console.error('Resposta da API OpenAI inválida:', response);
    pElement.classList.add('error');
    pElement.textContent = 'Resposta inválida da API';
  }

  // Remove a animação de digitação, adiciona o elemento p e salva o conteúdo do chat no localStorage
  entradaChatDiv.querySelector('.typing-animation').remove();
  entradaChatDiv.querySelector('.chat-details').appendChild(pElement);
  elements.chatContainer.scrollTo(0, elements.chatContainer.scrollHeight);
  localStorage.setItem('all-chats', elements.chatContainer.innerHTML);
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
                    <img src='./assets/imgs/botchains.svg' alt='Foto do Chat Bot' />
                    <div class='typing-animation'>
                      <div class='typing-dot' style='--delay: 0.2s'></div>
                      <div class='typing-dot' style='--delay: 0.3s'></div>
                      <div class='typing-dot' style='--delay: 0.4s'></div>
                    </div>
                  </div>
                  <span onclick='copyResponse(this)' class='material-symbols-rounded'>content_copy</span>
                </div>`;
  const entradaChatDiv = createElement(html, 'entrada');
  elements.chatContainer.appendChild(entradaChatDiv);
  elements.chatContainer.scrollTo(0, elements.chatContainer.scrollHeight);

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
    getChatResponse(entradaChatDiv, responseData);
  } catch (error) {
    console.error('Erro ao obter resposta da API OpenAI', error);
    // Caso ocorra um erro, você pode manipulá-lo aqui, se necessário
  }
};

// Manipulação da Saída do Chat
const handleSaidaChat = () => {
  userText = elements.chatInput.value.trim();
  if (!userText) return;

  elements.chatInput.value = '';
  elements.chatInput.style.height = `${initialHeight}px`;
  const html = `<div class="chat-content">
                  <div class="chat-details">
                    <img src="./assets/imgs/user.svg" alt="Foto do usuário" />
                    <p></p>
                 </div>
                </div>`;
  // Cria um div de chat de saída com a mensagem do usuário e anexa ao contêiner de chat
  const saidaChatDiv = createElement(html, 'saida');
  saidaChatDiv.querySelector('.chat-details p').textContent = userText;
  document.querySelector('.default-text')?.remove();
  elements.chatContainer.appendChild(saidaChatDiv);
  elements.chatContainer.scrollTo(0, elements.chatContainer.scrollHeight);

  // Após criar a entrada do usuário, você pode chamar a função para obter a resposta (showTypingAnimation)
  showTypingAnimation();
};

// Função para trocar o ícone do GitHub com base no tema atual
const toggleGithubIcon = () => {
  const isLightMode = document.body.classList.contains('light-mode');
  const iconPath = isLightMode
    ? './assets/imgs/github-dark.svg' // Caminho para o ícone escuro
    : './assets/imgs/github.svg'; // Caminho para o ícone claro
  elements.githubIcon.setAttribute('src', iconPath);
};

// Adiciona um ouvinte de evento para o clique no botão de tema
elements.themeBtn.addEventListener('click', () => {
  // Muda o tema do site
  document.body.classList.toggle('light-mode');
  localStorage.setItem('theme-color', elements.themeBtn.textContent);
  elements.themeBtn.textContent = document.body.classList.contains('light-mode')
    ? 'dark_mode'
    : 'light_mode';

  // Chama a função para trocar o ícone do GitHub
  toggleGithubIcon();
});

// Adiciona um ouvinte de evento para o clique no botão de apagar
elements.deleteBtn.addEventListener('click', () => {
  // Remove todas as conversas do localStorage e chama a função loadDataFromLocalStorage para atualizar o conteúdo do chat
  if (confirm('Deseja apagar todo o histórico da conversa?')) {
    localStorage.removeItem('all-chats');
    elements.chatContainer.innerHTML = '';
    loadDataFromLocalStorage();
  }
});

// Adiciona um ouvinte de evento para o evento de entrada no campo de texto
elements.chatInput.addEventListener('input', () => {
  // Ajusta a altura do input de acordo com o conteúdo
  elements.chatInput.style.height = `${initialHeight}px`;
  elements.chatInput.style.height = `${elements.chatInput.scrollHeight}px`;
});

// Adiciona um ouvinte de evento para o pressionamento de tecla no campo de texto
elements.chatInput.addEventListener('keydown', (e) => {
  // Se o botão Enter for pressionado com shift pressionado e a largura da janela for maior que 768, aciona a manipulação da saída do chat
  if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 768) {
    e.preventDefault();
    handleSaidaChat();
  }
});

// Adiciona um ouvinte de evento para o clique no botão de envio, que aciona a manipulação da saída do chat
elements.sendBtn.addEventListener('click', handleSaidaChat);
