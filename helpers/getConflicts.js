const _getConflictedFiles = (ownFiles, arr) => arr.map(paths => paths.filter(path => ownFiles.includes(path)))

const getConflicts = entries => ({ conflicts: entries.reduceRight(
  (acc, [user, { paths }], i, arr) => {
    let userWithConflicts = {
      userName: user.split('#')[0],
      conflictsWithOther: _getConflictedFiles(paths, arr.slice(0, i).map(el => el[1].paths))
    }
    return [userWithConflicts, ...acc]
  },
  []) })

module.exports = getConflicts
