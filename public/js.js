const API = window.origin || 'http://localhost:5010'
const API_REQUESTS = {
  getConflicts: `${API}/current/getconflicts`,
  getUsersFiles: `${API}/current/getusersfiles`,
  // TODO: all files with filter
}

const HTML = [
  'connectionStatus',
  'conflictsTable',
  'getUsersFilesBtn',
  'usersFilesTime',
  'usersFiles',
].reduce((acc, id) => (acc[id] = document.querySelector(`#${id}`)) && acc, {})

const showError = message => {
  HTML.conflictsTable.innerHTML = 'Disconnected'
  HTML.connectionStatus.innerHTML = message
}

const errorHandler = data => {
  if (data.error) {
    showError(data.error)
    throw new Error(data.error)
  }
  return data
}

const getCurrentTime = () => {
  let currentDate = new Date()
  const getTimePart = method => currentDate[method]().toString().padStart(2, '0')
  return ['getHours', 'getMinutes', 'getSeconds'].map(getTimePart).join(':')
}

const getTableConflictsHTML = conflicts => {
  const getEmptyCell = () => {
    return '<div class="table-cell empty-cell"></div>'
  }
  const getNameCell = userName => {
    return `<div class="table-cell name-cell">${userName}</div>`
  }

  const getFirstRow = () => {
    let names = conflicts.map(({ userName }) => userName )
    names.pop()
    return '<div class="table-row">' + getEmptyCell() + names.map(getNameCell).join('') + '</div>'
  }

  const getConflictCell = paths => {
    if (!paths) {
      return getEmptyCell()
    }
    if (!paths.length) {
      return '<div class="table-cell cell-no-conflicts"></div>'
    }
    const gitFileName = path => path.split('\\').reverse()[0]
    return '<div class="table-cell conflict-cell">' + paths.map(gitFileName).join('<br><br>') + '</div>'
  }

  const getRow = n => {
    let nameCell = getNameCell(conflicts[n].userName)
    let cells = ''
    for (let i = 0; i < conflicts.length - 1; i++) {
      cells += getConflictCell(conflicts[n].conflictsWithOther[i])
    }
    return '<div class="table-row">' + nameCell + cells + '</div>'
  }

  const getConflictsRows = () => {
    let rows = ''
    for (let i = 1; i < conflicts.length; i++) {
      rows += getRow(i)
    }
    return rows
  }

  return `
    <div class="table-wrapper">
        ${getFirstRow()}
        ${getConflictsRows()}
    </div>
  `
}

const getCurrentConflicts = isInit => {
  fetch(`${API_REQUESTS.getConflicts}/${isInit}`).then(response => response.json()).then(errorHandler).then(data => {
    if (isInit) { HTML.connectionStatus.innerText = 'Connected' }
    const { conflicts } = data

    let timeInfo = 'Last update: ' + getCurrentTime() + '<br>'
    HTML.conflictsTable.innerHTML = timeInfo + (conflicts.length < 2
      ? `<p>Users have no conflicts</p>`
      : '<br>' + getTableConflictsHTML(conflicts))

    getCurrentConflicts()
  }).catch(err => {
    console.warn('getCurrentConflicts', err)
    showError('Lost connection (reconnect after 5s)')
    setTimeout(() => getCurrentConflicts(isInit), 5000)
  })
}

const getUsersFiles = () => {
  const errorFiles = () => {
    HTML.usersFilesTime.innerText = 'Lost connection'
    HTML.usersFiles.innerHTML = ''
  }

  fetch(API_REQUESTS.getUsersFiles).then(response => response.json()).then(errorHandler).then(data => {
    const { usersFiles } = data
    const getHTMLString = ({ userName, files }) => `<div><b>${userName}:</b><p>` + files.join('<br>') + '</p></div>'

    HTML.usersFilesTime.innerText = 'Last update: ' + getCurrentTime()
    HTML.usersFiles.innerHTML = '<br>' + (usersFiles.length
      ? usersFiles.map(getHTMLString).join('')
      : 'Have no users files')
  }).catch(err => console.warn('getCurrentConflicts', err) || errorFiles(err))
}

const connectToServer = () => {
  HTML.connectionStatus.innerText = 'Connecting...'
  getCurrentConflicts(true)
}

HTML.getUsersFilesBtn.addEventListener('click', getUsersFiles)

connectToServer()
