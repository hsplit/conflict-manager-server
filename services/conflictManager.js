const mongoDB = require('./mongoDB')

const getConflictsHelper = require('../helpers/getConflicts')
const master = require('./master')

const { OUTDATED_TIME } = require('../constants')

const _storage = new Map()

const _relevantDataObserver = () => {
  if (!_storage.size) { return }
  let now = Date.now()

  void [..._storage.entries()].forEach(([user, { lastUpdate }]) => {
    (now - lastUpdate > OUTDATED_TIME) && _storage.delete(user)
  })
}

setInterval(_relevantDataObserver, OUTDATED_TIME)

const getConflictsForUser = ({ files, user }, done) => {
  let filePaths = files.map(({ path }) => path)
  mongoDB.addFiles({ files: filePaths, user })

  _storage.delete(user)

  master.getConflictsForUser({ files, user, filePaths, entries: [..._storage.entries()] }, done)

  _storage.set(user, { lastUpdate: Date.now(), paths: filePaths })
}

const getConflicts = () => getConflictsHelper([..._storage.entries()])

const getUsersFiles = () => [..._storage.entries()].map(([user, { paths }]) => {
  const [userName] = user.split('#')
  return { userName, files: paths }
})

const checkFile = ({ fileName }) => ({
  fileName,
  usersFiles: [..._storage.entries()].reduce((acc, [user, { paths }]) => {
    let userFiles = paths.filter(path => path.split('\\').reverse()[0] === fileName)
    if (userFiles.length) {
      const [userName] = user.split('#')
      return [...acc, { userName, files: userFiles }]
    }
    return acc
    },
    []),
})

module.exports = {
  getConflictsForUser,
  getConflicts,
  getUsersFiles,
  checkFile,
}
