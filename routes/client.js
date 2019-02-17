const express = require('express')

const {
  getConflictsForUser,
  checkFile,
} = require('api').client

const router = express.Router()

router.route('/getconflictsforuser').post(jsonParser, getConflictsForUser)
router.route('/checkfile').post(jsonParser, checkFile)

module.exports = router
