const mongoDB = require('services/mongoDB')

module.exports = (request, response) => {
  const done = data => response.json(data)
  mongoDB.checkUsersForDateRange(request.body, done)
}
