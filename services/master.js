const cp = require('child_process')

const getConflictsForUser = (data, done) => {
  const worker = cp.fork('./workers/getConflictsForUser.js')
  worker.send(data)

  worker.on('message', message => {
    done(message.result)
  })
}

module.exports = {
  getConflictsForUser,
}
