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

    // Configuração da requisição para a API OpenAI
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-1106',
        messages: [{ role: 'user', content: userText }],
        stream: true
      })
    };

// Envia a requisição para a API OpenAI
    const response = await fetch(OPENAI_API_URL, requestOptions); // eslint-disable-line

// Verifica se a requisição é bem-sucedida
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);

    }

// Obtenha os dados da resposta da API
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      result += chunk;

    }

// Retorna os dados da resposta da API
    res.status(200).json({ result });

  } catch (error) {
    res.status(500).json({ error: error.message });

  }

}


