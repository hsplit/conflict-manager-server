const express = require('express')

const {
  checkFileForDay,
  checkUsersForDay,
  checkUsersForDateRange,
  getConflictsForDay,
  getConflictsForDateRange,
} = require('api').mongodb

const router = express.Router()

router.route('/checkfileforday').post(jsonParser, checkFileForDay)
router.route('/checkusersforday').post(jsonParser, checkUsersForDay)
router.route('/checkusersfordaterange').post(jsonParser, checkUsersForDateRange)
router.route('/getconflictsforday').post(jsonParser, getConflictsForDay)
router.route('/getconflictsfordaterange').post(jsonParser, getConflictsForDateRange)

module.exports = router
