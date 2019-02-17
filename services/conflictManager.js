const _isEqual = require('lodash/isEqual')
const { OUTDATED_TIME, POOLING_INTERVAL } = require('core/constants')

const getConflictsHelper = require('helpers/getConflicts')
const getCurrentDate = require('helpers/date').getCurrentDate

const mongoDB = require('services/mongoDB')
const master = require('services/master')

const _storage = new Map()

const _relevantDataObserver = () => {
  if (!_storage.size) { return }
  let now = Date.now()

  void [..._storage.entries()].forEach(([user, { lastUpdate }]) => {
    (now - lastUpdate > OUTDATED_TIME) && _storage.delete(user)
  })
}

setInterval(_relevantDataObserver, OUTDATED_TIME)

const getWorkingFiles = search =>
  Object.entries(([..._storage.entries()]).reduce((acc, [user, { paths, lastUpdate }]) => {
    const [userName] = user.split('#')
    paths.forEach(path => {
      if (path.toLowerCase().includes(search.toLocaleString())) {
        if (!acc[path]) { acc[path] = [] }
        acc[path].push(`${userName}[${getCurrentDate(lastUpdate).time}]`)
      }
    })
    return acc
  }, {})).map(([fileName, users]) => ({ fileName, users }))

const getConflictsForUser = ({ files, user }, done) => {
  let filePaths = files.map(({ path }) => path)
  mongoDB.addFiles({ files: filePaths, user })

  _storage.set(user, { lastUpdate: Date.now(), paths: filePaths })

  let entries = [..._storage.entries()].filter(([userKey]) => userKey !== user )
  master.getConflictsForUser({ files, user, filePaths, entries }, done)
}

const _getConflicts = () => getConflictsHelper([..._storage.entries()])

const _longPoll = done => {
  let memo = _getConflicts()
  let started = Date.now()
  const dontLetDieRequestTime = 60000

  const pooling = () => {
    if (!_isEqual(memo, _getConflicts()) || (Date.now() - started > dontLetDieRequestTime)) {
      done(_getConflicts())
    } else {
      setTimeout(pooling, POOLING_INTERVAL)
    }
  }
  setTimeout(pooling, POOLING_INTERVAL)
}

const getConflicts = (isInit, done) => {
  if (isInit === 'true') {
    done(_getConflicts())
  } else {
    _longPoll(done)
  }
}

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
  getWorkingFiles,
}
