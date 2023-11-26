function sendMsg() {
  var msg = document.getElementById('msg-input');
  if (!msg.value) {
    msg.style.border = '1px solid red';
    return;
  }
  msg.style.border = 'none';

  var status = document.getElementById('status');
  var btnSubmit = document.getElementById('btn-submit');

  status.style.display = 'block';
  status.innerHTML = 'Gerando resposta...';
  btnSubmit.disabled = true;
  btnSubmit.style.cursor = 'not-allowed';
  msg.disabled = true;

  fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo-instruct',
      prompt: msg.value,
      max_tokens: 4000,
      temperature: 0.5
    })
  })
    .then((response) => response.json())
    .then((response) => {
      console.log(response);
      // let r =
      //   response.choices && response.choices.length > 0
      //     ? response.choices[0].text
      //     : 'No response';
      status.style.display = 'none';
      showHistorico(msg.value, r);
    })

    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      status.innerHTML = '';
      btnSubmit.disabled = false;
      btnSubmit.style.cursor = 'pointer';
      msg.disabled = false;
    });
}

function showHistorico(msg, response) {
  var historico = document.getElementById('historico');

  // minhas mensagens
  var boxMyMsg = document.createElement('div');
  boxMyMsg.className = 'box-my-msg';

  var myMsg = document.createElement('p');
  myMsg.className = 'my-msg';
  myMsg.innerHTML = msg;

  boxMyMsg.appendChild(myMsg);
  historico.appendChild(boxMyMsg);

  // mensagens de retorno
  var boxResponseMsg = document.createElement('div');
  boxResponseMsg.className = 'box-response-msg';

  var chatResponse = document.createElement('p');
  chatResponse.className = 'chat-msg';
  chatResponse.innerHTML = response;

  boxResponseMsg.appendChild(chatResponse);
  historico.appendChild(boxResponseMsg);

  // Levar scroll para o final
  historico.scrollTop = historico.scrollHeight;
}
