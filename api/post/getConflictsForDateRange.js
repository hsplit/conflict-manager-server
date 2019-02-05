const mongoDB = srcRequire('services/mongoDB')

module.exports = (request, response) => {
  mongoDB.getConflictsForDateRange(request.body, response)
}
