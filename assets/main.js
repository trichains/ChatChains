// Seleção de Elementos do DOM
const elements = {
  chatInput: document.getElementById('chat-input'),
  sendBtn: document.getElementById('send-btn'),
  chatContainer: document.querySelector('.chat-container'),
  themeBtn: document.getElementById('theme-btn'),
  githubIcon: document.querySelector('.rede-social img'),
  deleteBtn: document.getElementById('delete-btn')
};

// Variáveis Globais
let userText = null;
const apiUrl = 'https://botchains.vercel.app/api/openai';
const initialHeight = elements.chatInput.scrollHeight;

const loadDataFromLocalStorage = () => {
  const themeColor = localStorage.getItem('theme-color');
  document.body.classList.toggle('light-mode', themeColor === 'light_mode');
  elements.themeBtn.textContent = document.body.classList.contains('light-mode')
    ? 'dark_mode'
    : 'light_mode';

  const defaultText = `<div class='default-text'>
                          <h1>⛓️ BotChains ⛓️</h1>
                          <p> Comece a conversar e explore o poder da AI.<br> O histórico do seu chat aparecerá aqui.<br>
                          Desenvolvido por <a href='https://github.com/trichains' target='_blank'>trichains</a></p>
                        </div>`;
  elements.chatContainer.innerHTML =
    localStorage.getItem('all-chats') || defaultText;
  elements.chatContainer.scrollTo(0, elements.chatContainer.scrollHeight);
};

loadDataFromLocalStorage();

// Função de Criação de Elemento HTML
const createElement = (html, className) => {
  const chatDiv = document.createElement('div');
  chatDiv.classList.add('chat', className);
  chatDiv.innerHTML = html;
  return chatDiv;
};

// Função para Obter Resposta do Chat
const getChatResponse = (entradaChatDiv, response) => {
  const pElement = document.createElement('p');

  if (
    response &&
    response.choices &&
    response.choices[0] &&
    response.choices[0].message &&
    response.choices[0].message.content !== undefined &&
    response.choices[0].message.content !== null
  ) {
    pElement.textContent = response.choices[0].message.content.trim();
  } else {
    console.error('Resposta da API OpenAI inválida:', response);
    pElement.classList.add('error');
    pElement.textContent = 'Resposta inválida da API';
  }

  entradaChatDiv.querySelector('.typing-animation').remove();
  entradaChatDiv.querySelector('.chat-details').appendChild(pElement);
  elements.chatContainer.scrollTo(0, elements.chatContainer.scrollHeight);
  localStorage.setItem('all-chats', elements.chatContainer.innerHTML);
};

const copyResponse = (copyBtn) => {
  const responseTextElement = copyBtn.parentElement.querySelector('p');
  navigator.clipboard.writeText(responseTextElement.textContent);
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
    getChatResponse(entradaChatDiv, responseData);
  } catch (error) {
    console.error('Erro ao obter resposta da API OpenAI', error);
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
  const saidaChatDiv = createElement(html, 'saida');
  saidaChatDiv.querySelector('.chat-details p').textContent = userText;
  document.querySelector('.default-text')?.remove();
  elements.chatContainer.appendChild(saidaChatDiv);
  elements.chatContainer.scrollTo(0, elements.chatContainer.scrollHeight);
  showTypingAnimation();
};

// Função para trocar o ícone do GitHub com base no tema atual
const toggleGithubIcon = () => {
  const isLightMode = document.body.classList.contains('light-mode');
  const iconPath = isLightMode
    ? './assets/imgs/github-dark.svg'
    : './assets/imgs/github.svg';
  elements.githubIcon.setAttribute('src', iconPath);
};

// Adiciona um ouvinte de evento para o clique no botão de tema
elements.themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  localStorage.setItem('theme-color', elements.themeBtn.textContent);
  elements.themeBtn.textContent = document.body.classList.contains('light-mode')
    ? 'dark_mode'
    : 'light_mode';
  toggleGithubIcon();
});

elements.deleteBtn.addEventListener('click', () => {
  if (confirm('Deseja apagar todo o histórico da conversa?')) {
    localStorage.removeItem('all-chats');
    elements.chatContainer.innerHTML = '';
    loadDataFromLocalStorage();
  }
});

elements.chatInput.addEventListener('input', () => {
  elements.chatInput.style.height = `${initialHeight}px`;
  elements.chatInput.style.height = `${elements.chatInput.scrollHeight}px`;
});

elements.chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 768) {
    e.preventDefault();
    handleSaidaChat();
  }
});

elements.sendBtn.addEventListener('click', handleSaidaChat);
