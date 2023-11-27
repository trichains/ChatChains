// Seleção de Elementos do DOM
const chatInput = document.getElementById('chat-input'); // Input de texto do usuário
const sendBtn = document.getElementById('send-btn'); // Botão de envio de mensagem
const chatContainer = document.querySelector('.chat-container'); // Contêiner para exibição das mensagens do chat

// Variáveis Globais
let userText = null; // Armazena o texto digitado pelo usuário
const API_KEY = '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'; // Substitua 'sua-chave-de-api' pela sua chave de API da OpenAI

// Função de Criação de Elemento HTML
const createElement = (html, className) => {
  // Cria um elemento HTML com base no HTML passado como parâmetro e no nome da classe passado como parâmetro
  const chatDiv = document.createElement('div');
  chatDiv.classList.add('chat', className);
  chatDiv.innerHTML = html;
  return chatDiv; // Retorna o elemento criado
};

// Função para Obter Resposta do Chat
const getChatResponse = async (entradaChatDiv) => {
  const API_URL = 'https://api.openai.com/v1/chat/completions';
  const pElement = document.createElement('p');

  // Define a configuração da requisição
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userText }]
    })
  };

  // Envia a requisição para a API e atualiza o elemento p com o resultado da resposta
  try {
    const response = await (await fetch(API_URL, requestOptions)).json();
    console.log(response);
    pElement.textContent = response.choices[0].message.content.trim();
  } catch (err) {
    console.log(err);
  }
  entradaChatDiv.querySelector('.typing-animation').remove();
  entradaChatDiv.querySelector('.chat-details').appendChild(pElement);
};

// Animação de Digitação
const showTypingAnimation = () => {
  const html = `<div class='chat-content'>
                  <div class='chat-details'>
                    <img src='./assets/imgs/botchains.svg' alt='Foto do Chat Bot' />
                    <div class='typing-animation'>
                      <div class='typing-dot' style='--delay: 0.2s'></div>
                      <div class='typing-dot' style='--delay: 0.3s'></div>
                      <div class='typing-dot' style='--delay: 0.4s'></div>
                    </div>
                  </div>
                  <span class='material-symbols-rounded'>content_copy</span>
                </div>`;
  const entradaChatDiv = createElement(html, 'entrada');
  chatContainer.appendChild(entradaChatDiv);
  getChatResponse(entradaChatDiv);
};

// Manipulação da Saída do Chat
const handleSaidaChat = () => {
  userText = chatInput.value.trim(); // Obtém o valor do input e remove espaços em branco
  const html = `<div class="chat-content">
                  <div class="chat-details">
                    <img src="./assets/imgs/user.svg" alt="Foto do usuário" />
                    <p>${userText}</p>
                 </div>
                </div>`;
  // Cria um div de chat de saída com a mensagem do usuário e anexa ao contêiner de chat
  const saidaChatDiv = createElement(html, 'saida');
  chatContainer.appendChild(saidaChatDiv);
  setTimeout(showTypingAnimation, 500);
};

// Adiciona um ouvinte de evento para o clique no botão de envio, que aciona a manipulação da saída do chat
sendBtn.addEventListener('click', handleSaidaChat);
