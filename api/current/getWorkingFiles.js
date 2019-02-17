const conflictManager = require('services/conflictManager')

module.exports = (request, response) => {
  const files = conflictManager.getWorkingFiles(request.body.search)
  response.json({ files })
}
