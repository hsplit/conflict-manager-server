const conflictManager = require('services/conflictManager')

module.exports = (request, response) => {
  const done = data => response.json(data)
  conflictManager.getConflicts(request.params.isinit, done)
}
