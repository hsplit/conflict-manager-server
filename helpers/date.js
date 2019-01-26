const getCurrentDate = () => {
  let currentDate = new Date()
  const getTimePart = method => currentDate[method]().toString().padStart(2, '0')
  const getDatePart = (method, i) => (currentDate[method]() + i % 2).toString().padStart(4 - (i ? 2 : 0), '0')
  return {
    date: ['getFullYear', 'getMonth', 'getDate'].map(getDatePart).join('-'),
    time: ['getHours', 'getMinutes', 'getSeconds'].map(getTimePart).join(':'),
  }
}

module.exports = {
  getCurrentDate,
}
