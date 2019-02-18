const express = require('express')

require('./config')

const constants = require('core/constants')
const router = require('core/router')
const startServer = require('core/startServer')

const app = express()

app.use(express.static(__dirname + '/public'))
app.use('/', router)

// 404
app.use((request, response) => response.send(constants.MESSAGE_404))

// Start
startServer(app)
