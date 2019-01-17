const { LONG_POLL_DELAY } = require('../../constants')

const conflictManager = require('../../services/conflictManager')

module.exports = (request, response) => {
  const conflicts = conflictManager.getConflicts()
  setTimeout(() => response.json({ conflicts }), LONG_POLL_DELAY)
}
