const mongoDB = require('services/mongoDB')

module.exports = (request, response) => {
  mongoDB.getConflictsForDateRange(request.body, response)
}
