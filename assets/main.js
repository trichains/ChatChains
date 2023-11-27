const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatContainer = document.querySelector('.chat-container');

let userText = null;

const createElement = (html, className) => {
  // Cria um elemento HTML com base no HTML passado como parâmetro e o nome da classe passado como parâmetro
  const chatDiv = document.createElement('div');
  chatDiv.classList.add('chat', className);
  chatDiv.innerHTML = html;
  return chatDiv; // retorna o elemento
};

const handleSaidaChat = () => {
  userText = chatInput.value.trim(); // retorna o valor e remove espaços em branco
  const html = `<div class="chat content">
                  <div class="chat-details">
                    <img src="./assets/imgs/user.svg" alt="Foto do usuário" />
                    <p>${userText}</p>
                 </div>
                </div>`;
  // crie um div de chat de saída com a mensagem do usuário e anexe-o ao contêiner de chat
  const saidaChatDiv = createElement(html, 'saida');
  chatContainer.appendChild(saidaChatDiv);
};

sendBtn.addEventListener('click', handleSaidaChat);

// fetch('https://api.openai.com/v1/chat/completions', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${apiKey}`
//     },
//     body: JSON.stringify({
//       model: 'gpt-3.5-turbo',
//       messages: [
//         { role: 'system', content: 'You are a helpful assistant.' },
//         { role: 'user', content: msg.value }
//       ]
//     })
//   })
