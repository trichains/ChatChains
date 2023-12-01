document.addEventListener('DOMContentLoaded', function () {
  // Substitua 'sua_chave_da_api_aqui' pela sua chave de API
  const apiKey = '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';
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  const chatLog = document.getElementById('chat-log');
  const userInput = document.getElementById('user-input');

  function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = role;
    messageDiv.textContent = content;
    chatLog.appendChild(messageDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function sendMessage() {
    const userMessage = userInput.value;
    addMessage('user', userMessage);

    // Chame a API da OpenAI para obter a resposta
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-1106',
        messages: [{ role: 'user', content: userMessage }]
      })
    })
    .then(response => response.json())
    .then(data => {
      const assistantMessage = data.choices[0].message.content;
    
      // Crie um novo elemento div para a resposta do assistente
      const newAssistantDiv = document.createElement('div');
      newAssistantDiv.className = 'assistant';

      // Adicione a nova div ao chatLog
      chatLog.appendChild(newAssistantDiv);

      // Use o ID correto para obter o elemento
      let index = 0;
      const speed = 15; // velocidade da digitação em milissegundos
    
      function typeWriter() {
        if (index < assistantMessage.length) {
          newAssistantDiv.innerHTML += assistantMessage.charAt(index);
          index++;
          setTimeout(typeWriter, speed);
        }
      }

      typeWriter();
    })
    .catch(error => {
      console.error('Erro ao chamar a API da OpenAI:', error);
    });

    // Limpe o campo de entrada
    userInput.value = '';
  }

  // Pressione Enter para enviar a mensagem
  userInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
      sendMessage();
    }
  });

  // Defina a função sendMessage globalmente para ser acessível no clique do botão
  window.sendMessage = sendMessage;

  // Iniciar a animação quando a página carrega
});
