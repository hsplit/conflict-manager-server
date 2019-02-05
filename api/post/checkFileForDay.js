const mongoDB = srcRequire('services/mongoDB')

module.exports = (request, response) => {
  mongoDB.checkFileForDay(request.body, response)
}
