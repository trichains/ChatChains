// Seleção de Elementos do DOM
const chatInput = document.getElementById('chat-input'); // Input de texto do usuário
const sendBtn = document.getElementById('send-btn'); // Botão de envio de mensagem
const chatContainer = document.querySelector('.chat-container'); // Contêiner para exibição das mensagens do chat
const themeBtn = document.getElementById('theme-btn'); // Botão para mudar o tema
const deleteBtn = document.getElementById('delete-btn'); // Botão para apagar o chat

// Variáveis Globais
let userText = null; // Armazena o texto digitado pelo usuário
const apiUrl = 'https://botchains.vercel.app/api/openai'; // Substitua pelo URL da sua função Vercel
const initialHeight = chatInput.scrollHeight;

const loadDataFromLocalStorage = () => {
  // Carrega os dados do localStorage
  const themeColor = localStorage.getItem('theme-color');
  document.body.classList.toggle('light-mode', themeColor === 'light_mode');
  themeBtn.textContent = document.body.classList.contains('light-mode')
    ? 'dark_mode'
    : 'light_mode';

  const defaultText = `<div class='default-text'>
                          <h1>⛓️ BotChains ⛓️</h1>
                          <p> Comece a conversar e explore o poder da AI.<br> O histórico do seu chat aparecerá aqui.<br>
                          Desenvolvido por <a href='https://github.com/trichains' target='_blank'>trichains</a></p>
                        </div>`;
  chatContainer.innerHTML = localStorage.getItem('all-chats') || defaultText;
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

loadDataFromLocalStorage();

// Função de Criação de Elemento HTML
const createElement = (html, className) => {
  // Cria um elemento HTML com base no HTML passado como parâmetro e no nome da classe passado como parâmetro
  const chatDiv = document.createElement('div');
  chatDiv.classList.add('chat', className);
  chatDiv.innerHTML = html;
  return chatDiv; // Retorna o elemento criado
};

// Função para Obter Resposta do Chat
const getChatResponse = (entradaChatDiv, response) => {
  const pElement = document.createElement('p');

  // Verifica se a resposta possui a propriedade 'choices' e '0' e 'message'
  if (
    response &&
    response.choices &&
    response.choices[0] &&
    response.choices[0].message !== undefined &&
    response.choices[0].message !== null
  ) {
    pElement.textContent = response.choices[0].message.trim();
  } else {
    console.error('Resposta da API OpenAI inválida:', response);
    pElement.classList.add('error');
    pElement.textContent = 'Resposta inválida da API';
  }

  // Remove a animação de digitação, adiciona o elemento p e salva o conteúdo do chat no localStorage
  entradaChatDiv.querySelector('.typing-animation').remove();
  entradaChatDiv.querySelector('.chat-details').appendChild(pElement);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  localStorage.setItem('all-chats', chatContainer.innerHTML);
};

const copyResponse = (copyBtn) => {
  // Seleciona o elemento p que contém o texto da resposta e o copia para a área de ação do botão
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
  chatContainer.appendChild(entradaChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);

  // Chama a função para obter a resposta da API OpenAI
  try {
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
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
  userText = chatInput.value.trim(); // Obtém o valor do input e remove espaços em branco
  if (!userText) return; // Se o texto estiver vazio, retorna daqui

  chatInput.value = ''; // Limpa o input
  chatInput.style.height = `${initialHeight}px`;
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
  chatContainer.appendChild(saidaChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);

  // Após criar a entrada do usuário, você pode chamar a função para obter a resposta (showTypingAnimation)
  showTypingAnimation();
};

themeBtn.addEventListener('click', () => {
  // Muda o tema do site
  document.body.classList.toggle('light-mode');
  localStorage.setItem('theme-color', themeBtn.textContent);
  themeBtn.textContent = document.body.classList.contains('light-mode')
    ? 'dark_mode'
    : 'light_mode';
});

deleteBtn.addEventListener('click', () => {
  // Remove todas as conversas do localStorage e chama a função loadDataFromLocalStorage para atualizar o conteúdo do chat
  if (confirm('Deseja apagar todo o histórico da conversa?')) {
    localStorage.removeItem('all-chats');
    chatContainer.innerHTML = '';
    loadDataFromLocalStorage();
  }
});

chatInput.addEventListener('input', () => {
  // Ajusta a altura do input de acordo com o conteúdo
  chatInput.style.height = `${initialHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener('keydown', (e) => {
  // Se o botão Enter for pressionado com shift pressionado e a largura da janela for maior que 768, aciona a manipulação da saída do chat
  if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 768) {
    e.preventDefault();
    handleSaidaChat();
  }
});

// Adiciona um ouvinte de evento para o clique no botão de envio, que aciona a manipulação da saída do chat
sendBtn.addEventListener('click', handleSaidaChat);
