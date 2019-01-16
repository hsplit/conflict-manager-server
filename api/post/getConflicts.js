const conflictManaget = require('../../services/conflictManager')

module.exports = (request, response) => {
  const conflicts = conflictManaget.getConflictsForUser(request.body)
  response.json(conflicts)
}
