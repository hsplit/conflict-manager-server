const API = window.origin || 'http://localhost:5010'
const API_REQUESTS = {
  getConflicts: `${API}/getconflicts`,
}

const HTML = {
  longPollStatus,
  conflictsTable,
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

}

const getCurrentConflicts = initialMessage => {
  fetch(API_REQUESTS.getConflicts).then(response => response.json()).then(errorHanlder).then(data => {
    if (initialMessage) { HTML.longPollStatus.innerText = initialMessage }
    const { conflicts } = data

    console.log({ conflicts })
    let timeInfo = 'Last update: ' + getCurrentTime() + '<br>'
    HTML.conflictsTable.innerHTML = timeInfo + (conflicts.length < 2
      ? `<p>Users have no conflicts</p>`
      : getTableConflictsHTML(conflicts))

    getCurrentConflicts()
  }).catch(err => console.warn('getCurrentConflicts', err))
}

const connectToServer = () => {
  HTML.longPollStatus.innerText = 'Connecting...'
  getCurrentConflicts('Connected')
}

// TODO: button with current working files for each users
connectToServer()
