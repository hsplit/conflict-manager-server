const _storage = new Map()

const OUTDATED_TIME = 10000

const _relevantDataObserver = () => {
  if (!_storage.size) {
    return
  }
  let now = Date.now();

  [..._storage.entries()].forEach(([user, { lastUpdate }]) => {
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

module.exports = {
  getConflictsForUser,
}
