const { LONG_POLL_DELAY } = require('../../constants')

const conflictManager = require('../../services/conflictManager')

let _firstResponse = true

module.exports = (request, response) => {
  const conflicts = conflictManager.getConflicts()
  if (_firstResponse) {
    _firstResponse = false
    response.json({ conflicts })
  } else {
    setTimeout(() => response.json({ conflicts }), LONG_POLL_DELAY)
  }
}
