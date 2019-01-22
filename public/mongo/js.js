const API = window.origin || 'http://localhost:5010'
const API_REQUESTS = {
  checkFileForDay: `${API}/checkfileforday`,
}

const HTML = {
  chooseFileBtn,
  fileInput,
  fileDate,
  fileAnswer,
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

const checkFileForDay = () => {
  if (!HTML.fileInput.value || !HTML.fileDate.value) {
    HTML.fileAnswer.innerHTML = 'Path should not be empty and date should be correct.'
    return
  }

  const getFilesHTML = data => data.map(({ fileName, users }) => {
    let fileNameHTML = `<i>${fileName}:</i><br>`
    let usersHTML = `<p>${users.join(', ')}</p><br>`
    return fileNameHTML + usersHTML
  }).join('')

  const errorHanlder = data => {
    if (data.error) {
      throw new Error(data.error)
    }
    return data
  }

  let file = HTML.fileInput.value
  let date = HTML.fileDate.value
  let data = getPostData({ file, date })
  HTML.fileAnswer.innerHTML = 'Loading...'
  fetch(API_REQUESTS.checkFileForDay, data).then(response => response.json()).then(errorHanlder).then(data => {
    let filePath = 'File: \'' + file + '\'.<br>'
    let dateInfo = 'For: ' + date + '.<br><br>'
    if (!data.length) {
      HTML.fileAnswer.innerHTML = filePath + dateInfo + 'Have no matches.'
    } else {
      HTML.fileAnswer.innerHTML = filePath + dateInfo + getFilesHTML(data)
    }
  }).catch(err => HTML.fileAnswer.innerHTML = 'Error: ' + err)
}

HTML.chooseFileBtn.addEventListener('click', checkFileForDay)
HTML.fileInput.addEventListener('keydown', e => e.key === 'Enter' && checkFileForDay())

HTML.fileDate.value = getCurrentDate().date
