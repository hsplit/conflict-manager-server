const DAY = 86400000

const getCurrentDate = date => {
  let currentDate = date ? new Date(date) : new Date()
  const getTimePart = method => currentDate[method]().toString().padStart(2, '0')
  const getDatePart = (method, i) => (currentDate[method]() + i % 2).toString().padStart(4 - (i ? 2 : 0), '0')
  return {
    date: ['getFullYear', 'getMonth', 'getDate'].map(getDatePart).join('-'),
    time: ['getHours', 'getMinutes', 'getSeconds'].map(getTimePart).join(':'),
  }
}

const getArrayOfDates = ({ from, to }) => {
  let days = (to - from) / DAY
  let dates = []
  for(let i = 0; i <= days; i++) {
    dates.push(getCurrentDate(from + i * DAY).date)
  }
  return dates
}

module.exports = {
  getCurrentDate,
  getArrayOfDates,
}
