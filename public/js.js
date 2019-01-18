const API = window.origin || 'http://localhost:5010'
const API_REQUESTS = {
  getConflicts: `${API}/getconflicts`,
}

const HTML = {
  longPollStatus,
  conflictsTable,
  getUsersFiles,
  usersFilesTime,
  usersFiles,
}

const showError = message => {
  HTML.conflictsTable.innerHTML = 'Disconnected'
  HTML.longPollStatus.innerHTML = message
}

const errorHanlder = data => {
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
    return '<div class="table-row">' + getEmptyCell() + names.map(getNameCell).join('') + '</div>'
  }

  const getConflictCell = paths => {
    if (!paths) {
      return getEmptyCell()
    }
    const gitFileName = path => path.split('\\').reverse()[0]
    return '<div class="table-cell conflict-cell">' + paths.map(gitFileName).join('<br><br>') + '</div>'
  }

  const getRow = n => {
    let nameCell = getNameCell(conflicts[n].userName)
    let cells = ''
    for (let i = 0; i < conflicts.length; i++) {
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

const getCurrentConflicts = initialMessage => {
  fetch(API_REQUESTS.getConflicts).then(response => response.json()).then(errorHanlder).then(data => {
    if (initialMessage) { HTML.longPollStatus.innerText = initialMessage }
    const { conflicts } = data

    let timeInfo = 'Last update: ' + getCurrentTime() + '<br><br>'
    HTML.conflictsTable.innerHTML = timeInfo + (conflicts.length < 2
      ? `<p>Users have no conflicts</p>`
      : getTableConflictsHTML(conflicts))

    getCurrentConflicts()
  }).catch(err => console.warn('getCurrentConflicts', err) || showError('Lost connection'))
}

const connectToServer = () => {
  HTML.longPollStatus.innerText = 'Connecting...'
  getCurrentConflicts('Connected')
}

const getUsersFiles = () => {
  HTML.usersFilesTime.innerText = 'Last update: ' + getCurrentTime()
}

HTML.getUsersFiles.addEventListener('click', getUsersFiles)
connectToServer()
