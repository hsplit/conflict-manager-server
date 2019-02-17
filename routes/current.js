const express = require('express')

const {
  getConflicts,
  getUsersFiles,
} = require('api').current

const router = express.Router()

router.route('/getconflicts/:isinit').get(getConflicts)
router.route('/getusersfiles').get(getUsersFiles)

module.exports = router
