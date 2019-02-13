const mongoDB = require('services/mongoDB')

module.exports = (request, response) => {
  mongoDB.checkUsersForDay(request.body, response)
}
