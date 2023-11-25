const apiKey = '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';

// Cache DOM elements
const msg = document.getElementById('msg-input');
const statusMsg = document.getElementById('status');
const btnSubmit = document.getElementById('btn-submit');
const historico = document.getElementById('historico');

// Event delegation for submit button
document.addEventListener('click', async (event) => {
  if (event.target.matches('#btn-submit')) {
    event.preventDefault();

    if (!msg.value) {
      msg.style.border = '1px solid red';
      return;
    }
    msg.style.border = 'none';

    statusMsg.style.display = 'block';
    statusMsg.innerHTML = 'Gerando resposta...';
    btnSubmit.disabled = true;
    btnSubmit.style.cursor = 'not-allowed';
    msg.disabled = true;

    try {
      const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo-instruct',
          prompt: msg.value,
          max_tokens: 2048,
          temperature: 0.5
        })
      });

      const data = await response.json();
      const r = data.choices[0].text;

      statusMsg.style.display = 'none';
      showHistorico(msg.value, r);
    } catch (error) {
      console.log(error);
    } finally {
      statusMsg.innerHTML = '';
      btnSubmit.disabled = false;
      btnSubmit.style.cursor = 'pointer';
      msg.disabled = false;
    }
  }
});

function showHistorico(msg, response) {
  // minhas mensagens
  const boxMyMsg = document.createElement('div');
  boxMyMsg.className = 'box-my-msg';

  const myMsg = document.createElement('p');
  myMsg.className = 'my-msg';
  myMsg.innerHTML = msg;

  boxMyMsg.appendChild(myMsg);
  historico.appendChild(boxMyMsg);

  // mensagens de retorno
  const boxResponseMsg = document.createElement('div');
  boxResponseMsg.className = 'box-response-msg';

  const chatResponse = document.createElement('p');
  chatResponse.className = 'chat-msg';
  chatResponse.innerHTML = response;

  boxResponseMsg.appendChild(chatResponse);
  historico.appendChild(boxResponseMsg);

  // Levar scroll para o final
  historico.scrollTop = historico.scrollHeight;
}
