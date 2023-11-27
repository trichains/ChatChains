// Manipulador da função Vercel
export default async function handler(req, res) {
  try {
    // Obtém a chave da API da OpenAI do ambiente
    const apiKey = process.env.OPENAI_API_KEY;

    // Certifica-se de que a chave da API está presente
    if (!apiKey) {
      throw new Error('API key not provided');
    }

    // URL da API OpenAI para completar as interações do chat
    const API_URL = 'https://api.openai.com/v1/chat/completions';

    // Obtenha os dados da requisição do cliente
    const { userText } = req.body;

    // Certifique-se de que o texto do usuário está presente na requisição
    if (!userText) {
      throw new Error('User text not provided');
    }

    // Defina a configuração da requisição para a API OpenAI
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: userText }]
      })
    };

    // Faça a chamada à API OpenAI usando o módulo 'fetch'
    const response = await fetch(API_URL, requestOptions);

    // Verifica se a chamada à API foi bem-sucedida
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    // Obtém os dados da resposta da API
    const responseData = await response.json();

    // Envie a resposta de volta para o cliente
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Erro ao chamar a API da OpenAI', error);

    // Em caso de erro, envie uma resposta de erro para o cliente
    res.status(500).json({ error: 'Erro no servidor interno' });
  }
}
