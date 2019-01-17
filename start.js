let port = !isNaN(+process.argv[2]) ? +process.argv[2] : 5010

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

// Post
app.post('/getconflictsforuser', jsonParser, api.post.getConflictsForUser)

// Start
app.listen(port, () => console.log(`start on http://localhost:${port}/`) || opn(`http://localhost:${port}/`))
