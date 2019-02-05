const getCurrentDate = srcRequire('helpers/date').getCurrentDate
const WebSocket = require('ws')

const start = port => {
  const server = new WebSocket.Server({ port })

  server.on('connection', ws => {
    ws.on('message', message => {
      let { text, userName, id } = JSON.parse(message)
      let time = getCurrentDate().time
      ws.send(JSON.stringify({ id, time }))

      server.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            text,
            userName: userName.split('#')[0],
            time,
          }))
        }
      })
    })
  })
}

module.exports = start
