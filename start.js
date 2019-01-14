let port = !isNaN(+process.argv[2]) ? +process.argv[2] : 5010

const express = require('express')
// const cors = require('cors')
const bodyParser = require('body-parser')
const opn = require('opn')

const api = require('./api')

const app = express()
const jsonParser = bodyParser.json()

// app.use(cors())

// Post
app.post('/getconflicts', jsonParser, api.post.getConflicts)

// Start
app.listen(port, () => console.log(`start on http://localhost:${port}/`) && opn(`http://localhost:${port}/`))
