// Variável para armazenar o histórico da conversa
let conversationHistory = [];
let eventSource; // Adiciona a declaração do eventSource

// Manipulador da função Vercel
export default async function openaiHandler(req, res) {
  try {
    // Obtém a chave da API da OpenAI do ambiente
    const apiKey = process.env.OPENAI_API_KEY;
    // Certifica-se de que a chave da API está presente
    if (!apiKey) {
      throw new Error('Chave de API não fornecida');
    }
    // URL da API OpenAI para completar as interações do chat
    const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
    // Obtenha os dados da requisição do cliente
    const { userText } = req.body;
    // Certifique-se de que o texto do usuário está presente na requisição
    if (!userText) {
      throw new Error('Texto do usuário não fornecido');
    }
    const openaiModel = process.env.OPENAI_MODEL;

    // Adiciona a mensagem do usuário ao histórico
    conversationHistory.push({ role: 'user', content: userText });

    // Configuração da requisição para a API OpenAI
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: openaiModel,
        messages: [
          {
            role: 'system',
            content:
              'Eu sou o ChatChains, um assistente virtual desenvolvido para fornecer informações e assistência e fui desenvolvido por trichains.'
          },
          {
            role: 'user',
            content: 'Posso obter informações em português?'
          }, // Adicione uma mensagem em português
          {
            role: 'assistant',
            content: userText
          },
          ...conversationHistory // Adiciona o histórico da conversa
        ],
        stream: true // Adiciona o sinalizador de streaming
      })
    };
    // Faz a chamada à API OpenAI usando o módulo 'fetch'
    const response = await fetch(OPENAI_API_URL, requestOptions);

    // Check if the response has an 'Event-Stream' content type
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('text/event-stream')) {
      // Start listening for server-sent events
      eventSource = new EventSource(response.url);
      eventSource.onmessage = handleStreamMessage;
    } else {
      // Handle non-streaming response
      const responseData = await response.json();
      const botMessage = responseData.choices[0].message.content;
      appendMessage('assistant', botMessage);
    }

    // Envia a resposta de volta para o cliente
    res.status(200).end(); // Indica que a resposta foi enviada com sucesso
  } catch (error) {
    console.error('Erro ao chamar a API da OpenAI', error);
    // Em caso de erro, envia uma resposta de erro detalhada para o cliente
    res
      .status(500)
      .json({ error: `Erro ao chamar a API da OpenAI: ${error.message}` });
    return;
  }
}

// Função para manipular a resposta de streaming
function handleStreamMessage(event) {
  // Parse the streaming message and handle the data
  const data = JSON.parse(event.data);
  const botMessage = data.choices[0]?.message?.content || '';
  appendMessage('assistant', botMessage);

  // Check if the streaming is complete
  if (data.finish_reason === 'stop') {
    eventSource.close(); // Close the event source when streaming is complete
  }
}

// Função para adicionar mensagem ao histórico da conversa
function appendMessage(role, content) {
  conversationHistory.push({ role, content });
}
