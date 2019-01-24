const conflictManager = require('../../services/conflictManager')

module.exports = (request, response) => {
  const done = conflicts => response.json(conflicts)
  conflictManager.getConflictsForUser(request.body, done)
}
