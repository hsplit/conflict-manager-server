let ports = [5010, 5110, 5210]
let argv = require('minimist')(process.argv.slice(2))
let port = argv.port || ports[0]

const opn = require('opn')

require('services/chat')(port + 105)

const startServer = (_port, app) => {
  app.listen(_port, () => console.log(`Start on http://localhost:${_port}/`) || opn(`http://localhost:${_port}/`))
    .on('error', err => {
      console.log(err)

      const indexCurrentPort = ports.indexOf(_port)
      const isLastPort = indexCurrentPort === ports.length - 1
      if (!isLastPort ) {
        console.log('Try to change port')
        startServer(ports[indexCurrentPort + 1], app)
      }
    })
}

module.exports = app => startServer(port, app)
