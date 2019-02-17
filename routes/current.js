const express = require('express')

const {
  getConflicts,
  getUsersFiles,
  getWorkingFiles,
} = require('api').current

const router = express.Router()

router.route('/getconflicts/:isinit').get(getConflicts)
router.route('/getusersfiles').get(getUsersFiles)
router.route('/getworkingfiles').post(jsonParser, getWorkingFiles)

module.exports = router
