const mongoClient = require('mongodb').MongoClient

const MONGODB_URL = 'mongodb://localhost:27017/'
const DB_NAME = 'ConflictManagerDB'

const _getCurrentDate = () => {
  let currentDate = new Date()
  const getTimePart = method => currentDate[method]().toString().padStart(2, '0')
  const getDatePart = (method, i) => (currentDate[method]() + i % 2).toString().padStart(4 - (i ? 2 : 0), '0')
  return {
    date: ['getFullYear', 'getMonth', 'getDate'].map(getDatePart).join('-'),
    time: ['getHours', 'getMinutes', 'getSeconds'].map(getTimePart).join(':'),
  }
}

const addFiles = ({ files, user }) => {
  let [userName] = user.split('#')

  mongoClient.connect(MONGODB_URL, { useNewUrlParser: true }, (err, client) => {
    if (err) {
      console.log('Error on addFiles, connect to mongoClient')
      console.log(err)
      return
    }
    const { date, time } = _getCurrentDate()
    const dataBase = client.db(DB_NAME)
    const collection = dataBase.collection(date)

    let doneCount = files.length
    let doneAlready = 0
    const done = () => {
      doneAlready++
      if (doneAlready === doneCount) {
        client.close()
      }
    }

    files.forEach(path => {
      collection.findOne({ _id: path }, (err, file) => {
        if (err) {
          console.log('Error on addFiles, findOne')
          console.log(err)
          done()
        } else if (file) {
          if (file.users) {
            file.users[userName] = { lastUpdate: time }
          } else {
            file.users = {
              [userName]: { lastUpdate: time },
            }
          }

          collection.updateOne(
            { _id: file._id },
            { $set: { users: file.users } },
            (err, result) => {
              if (err) {
                console.log('Error on addFiles, findOne, updateOne')
                console.log(err)
                done()
              } else {
                // console.log('Updated', { path, userName })
                done()
              }
            })
        } else {
          collection.insertOne({ _id: path, users: { [userName]: { lastUpdate: time } } }, (err, result) => {
            if (err) {
              console.log('Error on addFiles, findOne, insertOne')
              console.log(err)
              done()
            } else {
              // console.log('Inserted', result.ops)
              done()
            }
          })
        }
      })
    })
  })
}

const checkFileForDay = ({ file: endOfPath, date }, response) => {
  const done = data => response.json(data)
  mongoClient.connect(MONGODB_URL, { useNewUrlParser: true }, (err, client) => {
    if (err) {
      console.log('Error on checkFileForDay, connect to mongoClient')
      console.log(err)
      return
    }
    const dataBase = client.db(DB_NAME)
    const collection = dataBase.collection(date)

    let regex = new RegExp(`${endOfPath}$`)
    collection.find({ _id: regex }).toArray((err, results) => {
      if (err) {
        console.log('Error on checkFileForDay, find, toArray')
        console.log(err)
        done({ error: 'Error on server, can\'t find.' })
        return
      }
      let files = results.map(({ _id: fileName, users }) => {
        let sortedUsers = Object.entries(users).map(([userName, { lastUpdate }]) => ({ userName, lastUpdate }))
          .sort((a, b) => a.lastUpdate > b.lastUpdate ? -1 : 1)
        return {
          fileName,
          users: sortedUsers.map(({ userName, lastUpdate }) => `${userName}(${lastUpdate})`),
        }
      })
      client.close()
      done(files)
    })
  })
}

module.exports = {
  addFiles,
  checkFileForDay,
}
