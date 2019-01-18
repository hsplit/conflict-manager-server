const conflictManager = require('../../services/conflictManager')

module.exports = (request, response) => {
  const usersFiles = conflictManager.getUsersFiles()
  response.json({ usersFiles })
}
