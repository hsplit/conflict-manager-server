let ports = [5011, 5111, 5211]
let argv = require('minimist')(process.argv.slice(2))
let port = argv.port || ports[0]

const express = require('express')
// const cors = require('cors')
const bodyParser = require('body-parser')
const opn = require('opn')

const api = require('./api')

const app = express()
const jsonParser = bodyParser.json()

// app.use(cors())
// TODO: mongoDB chat sockets

app.use(express.static(__dirname + '/public'))
app.get('/favicon.ico', (request, response) => response.end(''))

// Get
app.get('/getconflicts', api.get.getConflicts)
app.get('/getusersfiles', api.get.getUsersFiles)

// Post
app.post('/getconflictsforuser', jsonParser, api.post.getConflictsForUser)
app.post('/checkfile', jsonParser, api.post.checkFile)

// Start
const startServer = _port => {
  app.listen(_port, () => console.log(`Start on http://localhost:${_port}/`) || opn(`http://localhost:${_port}/`))
    .on('error', err => {
      console.log(err)
      if (_port) {
        const indexCurrentPort = ports.indexOf(_port)
        if (indexCurrentPort !== ports.length - 1) {
          console.log('Try to change port')
          startServer(ports[indexCurrentPort + 1])
        }
      }
    })
}

startServer(port)
