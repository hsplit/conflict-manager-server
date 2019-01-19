const conflictManager = require('../../services/conflictManager')

module.exports = (request, response) => {
  const files = conflictManager.checkFile(request.body)
  response.json(files)
}
