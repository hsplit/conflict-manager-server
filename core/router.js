const express = require('express')

const routes = require('routes')

const router = express.Router()

router.use('/current', routes.currentRouter)
router.use('/mongodb', routes.mongodbRouter)
router.use('/client', routes.clientRouter)

module.exports = router
