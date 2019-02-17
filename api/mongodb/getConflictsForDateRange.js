const mongoDB = require('services/mongoDB')

module.exports = (request, response) => {
  const done = data => response.json(data)
  mongoDB.getConflictsForDateRange(request.body, done)
}
