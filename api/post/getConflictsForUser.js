const conflictManager = require('../../services/conflictManager')

module.exports = (request, response) => {
  const conflicts = conflictManager.getConflictsForUser(request.body)
  response.json(conflicts)
}
