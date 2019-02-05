const getConflictsHelper = srcRequire('helpers/getConflicts')
const getCurrentDate = srcRequire('helpers/date').getCurrentDate
const mongoClient = require('mongodb').MongoClient

const MONGODB_URL = 'mongodb://localhost:27017/'
const DB_NAME = 'ConflictManagerDB'

const addFiles = ({ files, user }) => {
  let [userName] = user.split('#')

  mongoClient.connect(MONGODB_URL, { useNewUrlParser: true }, (err, client) => {
    if (err) {
      console.log('Error on addFiles, connect to mongoClient')
      console.log(err)
      return
    }
    const { date, time } = getCurrentDate()
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
            (err) => {
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
          collection.insertOne({ _id: path, users: { [userName]: { lastUpdate: time } } }, (err) => {
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
      done({ error: 'Error on checkFileForDay, connect to mongoClient' })
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

const checkUsersForDay = ({ date }, response) => {
  const done = data => response.json(data)
  mongoClient.connect(MONGODB_URL, { useNewUrlParser: true }, (err, client) => {
    if (err) {
      console.log('Error on checkUsersForDay, connect to mongoClient')
      console.log(err)
      done({ error: 'Error on checkUsersForDay, connect to mongoClient' })
      return
    }
    const dataBase = client.db(DB_NAME)
    const collection = dataBase.collection(date)

    collection.find().toArray((err, results) => {
      if (err) {
        console.log('Error on checkUsersForDay, find, toArray')
        console.log(err)
        done({ error: 'Error on server, can\'t find.' })
        return
      }

      let usersResult = {}
      results.forEach(({ _id: fileName, users }) => {
        Object.keys(users).forEach(userName => {
          if (usersResult[userName]) {
            usersResult[userName] = [...usersResult[userName], fileName]
          } else {
            usersResult[userName] = [fileName]
          }
        })
      })

      client.close()
      done(Object.entries(usersResult).map(([userName, files ]) => ({ userName, files })))
    })
  })
}

const getConflictsForDay = ({ date }, response) => {
  const done = data => response.json(data)
  mongoClient.connect(MONGODB_URL, { useNewUrlParser: true }, (err, client) => {
    if (err) {
      console.log('Error on getConflictsForDay, connect to mongoClient')
      console.log(err)
      done({ error: 'Error on getConflictsForDay, connect to mongoClient' })
      return
    }
    const dataBase = client.db(DB_NAME)
    const collection = dataBase.collection(date)

    collection.find().toArray((err, results) => {
      if (err) {
        console.log('Error on checkUsersForDay, find, toArray')
        console.log(err)
        done({ error: 'Error on server, can\'t find.' })
        return
      }

      let usersResult = {}
      results.forEach(({ _id: fileName, users }) => {
        Object.keys(users).forEach(userName => {
          if (usersResult[userName]) {
            usersResult[userName] = [...usersResult[userName], fileName]
          } else {
            usersResult[userName] = [fileName]
          }
        })
      })

      let storage = Object.entries(usersResult).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: { paths: value }
      }), {})

      let conflicts = getConflictsHelper(Object.entries(storage))

      client.close()
      done({ conflicts })
    })
  })
}

module.exports = {
  addFiles,
  checkFileForDay,
  checkUsersForDay,
  getConflictsForDay,
}
