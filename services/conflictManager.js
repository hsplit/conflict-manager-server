const { OUTDATED_TIME } = require('../constants')

const _storage = new Map()

const _relevantDataObserver = () => {
  if (!_storage.size) {
    return
  }
  let now = Date.now()

  void [..._storage.entries()].forEach(([user, { lastUpdate }]) => {
    (now - lastUpdate > 10000) && _storage.delete(user)
  })
}

setInterval(_relevantDataObserver, OUTDATED_TIME)

const getConflictsForUser = ({ files, user }) => {
  let filePaths = files.map(({ path }) => path)

  _storage.delete(user)

  let conflicts = [..._storage.entries()].reduce((acc, [user, { paths }]) => {
    let files = filePaths.filter(path => paths.includes(path))

    if (files.length) {
      const [userName] = user.split('#')
      return [...acc, { userName, files }]
    }

    return acc
  }, [])

  _storage.set(user, { lastUpdate: Date.now(), paths: filePaths })

  return conflicts
}

const _getConflictedFiles = (ownFiles, arr) => arr.map(paths => paths.filter(path => ownFiles.includes(path)))

const getConflicts = () => [..._storage.entries()].reduceRight(
  (acc, [user, { paths }], i, arr) => {
    let userWithConflicts = {
      userName: user.split('#')[0],
      conflictsWithOther: _getConflictedFiles(paths, arr.slice(0, arr.length - 1).map(el => el[1].paths))
    }
    return [userWithConflicts, ...arr]
  },
  [])

module.exports = {
  getConflictsForUser,
  getConflicts,
}
