const mongoDB = srcRequire('services/mongoDB')

module.exports = (request, response) => {
  mongoDB.getConflictsForDay(request.body, response)
}
