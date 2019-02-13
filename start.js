let ports = [5010, 5110, 5210]
let argv = require('minimist')(process.argv.slice(2))
let port = argv.port || ports[0]

const express = require('express')
// const cors = require('cors')
const bodyParser = require('body-parser')
const opn = require('opn')
require('./config')

require('services/chat')(port + 105)

const api = require('api')

const app = express()
const jsonParser = bodyParser.json()

// app.use(cors())

app.use(express.static(__dirname + '/public'))
app.get('/favicon.ico', (request, response) => response.end(''))

// Get
app.get('/getconflicts', api.get.getConflicts)
app.get('/getusersfiles', api.get.getUsersFiles)

// Post
app.post('/getconflictsforuser', jsonParser, api.post.getConflictsForUser)
app.post('/checkfile', jsonParser, api.post.checkFile)
app.post('/checkfileforday', jsonParser, api.post.checkFileForDay)
app.post('/checkusersforday', jsonParser, api.post.checkUsersForDay)
app.post('/getconflictsforday', jsonParser, api.post.getConflictsForDay)
app.post('/getconflictsfordaterange', jsonParser, api.post.getConflictsForDateRange)

// 404
app.use((request, response) => response.send(
  '404 There may be funny cats, ' +
  'but I\'m tired, I\'m sorry, ' +
  'but you shouldn\'t lose hope, maybe they will appear soon. Have a nice day!'
))

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
