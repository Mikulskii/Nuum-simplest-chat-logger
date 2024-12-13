//Подставьте идентификатор нужного канала
//https://nuum.ru/channel/<идентификатор>
const channel = '';

//Переменная для хранения id-сообщений
let msg_id = null;

console.log("NUUM чат-логгер стартовал..");

//Получение Id-стрима
function grab_id() {
fetch(`https://nuum.ru/api/v2/broadcasts/public?with_extra=true&channel_name=${channel}`)
.then(response=> {
  if (!response.ok) {
console.log(`При получении Id-стрима что-то пошло не так: ${response.status} (${response.statusText})`);
process.exit(1);
  }
return response.json();
  })
.then(data => {

//Если стрим оффлайн, отмена
  if (data.result.channel.channel_is_live === false)
  {
return console.log(`Stream is Offline`);
  }
let stream_id = data.result.media_container.media_container_id;
console.log(`Получен Id-стрима: ${stream_id}`);

//Получение Id-чата
function grab_chat_id() {
fetch(`https://nuum.ru/api/v3/chats?contentType=SINGLE&contentId=${stream_id}`)
.then(response=> {
  if (!response.ok) {
console.log(`При получении Id-чата что-то пошло не так: ${response.status} (${response.statusText})`);
process.exit(1);
  }
return response.json();
  })
.then(data => {
  let chat_id = data.result?.id;
  console.log(`Получен Id-чата: ${chat_id}`);
  console.log(`Подключение к чату ${channel}..`);

//Получение сообщений из чата
function nuum() {
let response =  fetch(`https://nuum.ru/api/v3/events/${chat_id}/events`, {
  method: 'POST',
  headers: {
  'Content-Type': 'application/json;charset=utf-8',
  'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:127.0) Gecko/20100101 Firefox/127.0'
  },
  body: JSON.stringify({"sort":"DESC","eventTypes":["MESSAGE"]})
})
.then(response => {
  if (!response.ok) {
console.log(`При получении сообщения что-то пошло не так: ${response.status} (${response.statusText})`);
  return
  }
return response.json();
  })
.then(data => {

//Если приходит пустой результат опроса, отмена
  if (data?.result[0] === undefined) {return}

//Назначение переменных на пришедший результат  
  const nickname = data.result[0]?.author.login;
  const msg = data.result[0]?.eventData.text;
  const prev_msg = data.result[1]?.eventData.text;

//Если id-сообщения повторяется, отмена
if (msg_id === data.result[0]?.id) {return}

//Вывод в лог сообщений "никнейм - текст сообщения"
console.log(`[NUUM | ${nickname}] ${msg}`);
//Сохраняем id-сообщения в переменную
msg_id = data.result[0]?.id;
})
.catch((error) => {
return  console.log(error);
});
}
nuum()
//Интервал запросов в мс
setInterval(nuum, 10000);
});
}  
grab_chat_id();
});
}
grab_id();
