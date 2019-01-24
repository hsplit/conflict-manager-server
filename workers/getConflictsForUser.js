const getConflictsForUser = ({ files, user, filePaths, entries }) => {
  return entries.reduce((acc, [user, { paths }]) => {
    let files = filePaths.filter(path => paths.includes(path))

    if (files.length) {
      const [userName] = user.split('#')
      return [...acc, { userName, files }]
    }

    return acc
  }, [])
}

process.on('message', data => {
  const result = getConflictsForUser(data)
  process.send({ result })
  process.exit(0)
})
