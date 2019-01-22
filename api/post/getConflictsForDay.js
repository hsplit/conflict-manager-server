const mongoDB = require('../../services/mongoDB')

module.exports = (request, response) => {
  mongoDB.getConflictsForDay(request.body, response)
}
