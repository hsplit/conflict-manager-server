const mongoDB = require('services/mongoDB')

module.exports = (request, response) => {
  const done = data => response.json(data)
  mongoDB.checkFileForDay(request.body, done)
}
