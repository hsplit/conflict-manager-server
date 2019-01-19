const { OUTDATED_TIME } = require('../constants')

const _storage = new Map()

// TODO: remove fake data, turn on _relevantDataObserver
_storage.set('A#23', { paths: ['ForteGroup\\PlanCreator\\src\\services\\formula\\parsers\\helper\\file 1.txt'] })
_storage.set('B#23', { paths: ['ForteGroup\\PlanCreator\\src\\services\\formula\\parsers\\helper\\file 1.txt', 'text2.txt'] })
_storage.set('C#23', { paths: ['text2.txt'] })

const _relevantDataObserver = () => {
  if (!_storage.size) { return }
  let now = Date.now()

  void [..._storage.entries()].forEach(([user, { lastUpdate }]) => {
    (now - lastUpdate > OUTDATED_TIME) && _storage.delete(user)
  })
}

// setInterval(_relevantDataObserver, OUTDATED_TIME)

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
      conflictsWithOther: _getConflictedFiles(paths, arr.slice(0, i).map(el => el[1].paths))
    }
    return [userWithConflicts, ...acc]
  },
  [])

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
