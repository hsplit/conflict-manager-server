const API = window.origin || 'http://localhost:5010'
const API_REQUESTS = {
  checkFileForDay: `${API}/checkfileforday`,
  checkUsersForDay: `${API}/checkusersforday`,
  getConflictsForDay: `${API}/getconflictsforday`,
}

const HTML = {
  chooseFileBtn,
  fileInput,
  fileDate,
  fileAnswer,
  usersForDateBtn,
  usersForDateInput,
  usersForDateAnswer,
  conflictsForDateBtn,
  conflictsForDateInput,
  conflictsForDateAnswer,
}

const getPostData = data => ({
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})

const getCurrentDate = () => {
  let currentDate = new Date()
  const getTimePart = method => currentDate[method]().toString().padStart(2, '0')
  const getDatePart = (method, i) => (currentDate[method]() + i % 2).toString().padStart(4 - (i ? 2 : 0), '0')
  return {
    date: ['getFullYear', 'getMonth', 'getDate'].map(getDatePart).join('-'),
    time: ['getHours', 'getMinutes', 'getSeconds'].map(getTimePart).join(':'),
  }
}

const errorHandler = data => {
  if (data.error) {
    throw new Error(data.error)
  }
  return data
}

const checkFileForDay = () => {
  if (!HTML.fileInput.value || !HTML.fileDate.value) {
    HTML.fileAnswer.innerHTML = 'Path should not be empty and date should be correct.'
    return
  }

  const getFilesHTML = data => data.map(({ fileName, users }) => {
    let fileNameHTML = `<i>${fileName}:</i><br>`
    let usersHTML = `<p>${users.join(', ')}</p>`
    return fileNameHTML + usersHTML
  }).join('')

  let file = HTML.fileInput.value
  let date = HTML.fileDate.value
  let data = getPostData({ file, date })
  HTML.fileAnswer.innerHTML = 'Loading...'
  fetch(API_REQUESTS.checkFileForDay, data).then(response => response.json()).then(errorHandler).then(data => {
    let now = getCurrentDate().time
    let filePath = 'Last update: ' + now + '<br><br>File: \'' + file + '\'.<br>'
    let dateInfo = 'For: ' + date + '.<br><br>'
    if (!data.length) {
      HTML.fileAnswer.innerHTML = filePath + dateInfo + 'Have no matches.'
    } else {
      HTML.fileAnswer.innerHTML = filePath + dateInfo + getFilesHTML(data)
    }
  }).catch(err => HTML.fileAnswer.innerHTML = 'Error: ' + err)
}

const checkUsersForDay = () => {
  if (!HTML.usersForDateInput.value) {
    HTML.usersForDateAnswer.innerHTML = 'Date should be correct.'
    return
  }

  const getFilesHTML = data => data.map(({ userName, files }) => {
    let fileNameHTML = `<i>${userName}:</i><br>`
    let usersHTML = `<p>${files.join('<br>')}</p>`
    return fileNameHTML + usersHTML
  }).join('')

  let date = HTML.usersForDateInput.value
  let data = getPostData({ date })
  HTML.usersForDateAnswer.innerHTML = 'Loading...'
  fetch(API_REQUESTS.checkUsersForDay, data).then(response => response.json()).then(errorHandler).then(data => {
    let now = getCurrentDate().time
    let dateInfo = 'Last update: ' + now + '<br><br>For: ' + date + '.<br><br>'
    if (!data.length) {
      HTML.usersForDateAnswer.innerHTML = dateInfo + 'Have no users\' files.'
    } else {
      HTML.usersForDateAnswer.innerHTML = dateInfo + getFilesHTML(data)
    }
  }).catch(err => HTML.usersForDateAnswer.innerHTML = 'Error: ' + err)
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

const getConflictsForDate = () => {
  if (!HTML.conflictsForDateInput.value) {
    HTML.conflictsForDateAnswer.innerHTML = 'Date should be correct.'
    return
  }

  let date = HTML.conflictsForDateInput.value
  let data = getPostData({ date })
  HTML.conflictsForDateAnswer.innerHTML = 'Loading...'
  fetch(API_REQUESTS.getConflictsForDay, data).then(response => response.json()).then(errorHandler).then(data => {
    let now = getCurrentDate().time
    let dateInfo = 'Last update: ' + now + '<br><br>For: ' + date + '.<br>'
    const { conflicts } = data

    HTML.conflictsForDateAnswer.innerHTML = dateInfo + (conflicts.length < 2
      ? `<p>Have no found conflicts</p>`
      : '<br>' + getTableConflictsHTML(conflicts))
  }).catch(err => HTML.conflictsForDateAnswer.innerHTML = 'Error: ' + err)
}

HTML.chooseFileBtn.addEventListener('click', checkFileForDay)
HTML.fileInput.addEventListener('keydown', e => e.key === 'Enter' && checkFileForDay())

HTML.usersForDateBtn.addEventListener('click', checkUsersForDay)
HTML.conflictsForDateBtn.addEventListener('click', getConflictsForDate)

let currentDate = getCurrentDate().date
HTML.fileDate.value = currentDate
HTML.usersForDateInput.value = currentDate
HTML.conflictsForDateInput.value = currentDate
