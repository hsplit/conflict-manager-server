const getConflictsHelper = require('helpers/getConflicts')
const getCurrentDate = require('helpers/date').getCurrentDate
const getArrayOfDates = require('helpers/date').getArrayOfDates
const mongoClient = require('mongodb').MongoClient

const MONGODB_URL = 'mongodb://localhost:27017/'
const DB_NAME = 'ConflictManagerDB'

const _connectDB = callBack => mongoClient.connect(MONGODB_URL, { useNewUrlParser: true }, callBack)
const _getDB = client => client.db(DB_NAME)
const _getCollectionFromDB = (db, collectionName) => db.collection(collectionName)
const _getCollection = (client, collectionName) => _getCollectionFromDB(_getDB(client), collectionName)

const _errorHandler = ({ message, err, done, doneData }) => {
  message && console.log(message)
  err && console.log(err)
  done && done(doneData || { error: message })
}

const _errorHandlers = {
  connect: ({ method, err, done }) =>
    _errorHandler({ message: `Error on ${method}, connect to mongoClient`, err, done }),
  find: ({ method, err, done }) => _errorHandler({
    message: `Error on ${method}, find, toArray`,
    err,
    done,
    doneData: { error: 'Error on server, can\'t find.' },
  })
}

const _filesToUsers = (usersResult, results) => {
  results.forEach(({ _id: fileName, users }) => {
    Object.keys(users).forEach(userName => {
      if (usersResult[userName]) {
        if (!(usersResult[userName].indexOf(fileName) + 1)) {
          usersResult[userName] = [...usersResult[userName], fileName]
        }
      } else {
        usersResult[userName] = [fileName]
      }
    })
  })
}

const _filesUsersToArray = usersResult =>
  Object.entries(usersResult).map(([userName, files]) => ({ userName, files }))

const addFiles = ({ files, user }) => {
  let [userName] = user.split('#')

  _connectDB((err, client) => {
    if (err) {
      _errorHandlers.connect({ method: 'addFiles', err })
      return
    }

    const { date, time } = getCurrentDate()
    const collection = _getCollection(client, date)

    let doneCount = files.length
    let doneAlready = 0

    const done = () => {
      doneAlready++
      if (doneAlready === doneCount) {
        client.close()
      }
    }
    const endOfOperationCreator = operation => err => {
      // console.log('Updated', { path, userName })
      // console.log('Inserted', result.ops)
      done()
      err && _errorHandler({ message: `Error on addFiles, findOne, ${operation}`, err })
    }

    files.forEach(path => {
      collection.findOne({ _id: path }, (err, file) => {
        if (err) {
          _errorHandler({ message: 'Error on addFiles, findOne', err, done })
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
            endOfOperationCreator('updateOne')
          )
        } else {
          collection.insertOne(
            { _id: path, users: { [userName]: { lastUpdate: time } } },
            endOfOperationCreator('insertOne')
          )
        }
      })
    })
  })
}

const checkFileForDay = ({ file: endOfPath, date }, done) => {
  _connectDB((err, client) => {
    if (err) {
      _errorHandlers.connect({ method: 'checkFileForDay', err, done })
      return
    }

    const collection = _getCollection(client, date)

    let regex = new RegExp(`${endOfPath}$`)
    collection.find({ _id: regex }).toArray((err, results) => {
      if (err) {
        _errorHandlers.find({ method: 'checkFileForDay', err, done })
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

const checkUsersForDay = ({ date }, done) => {
  _connectDB((err, client) => {
    if (err) {
      _errorHandlers.connect({ method: 'checkUsersForDay', err, done })
      return
    }

    const collection = _getCollection(client, date)

    collection.find().toArray((err, results) => {
      if (err) {
        _errorHandlers.find({ method: 'checkUsersForDay', err, done })
        return
      }

      let usersResult = {}
      _filesToUsers(usersResult, results)

      client.close()
      done(_filesUsersToArray(usersResult))
    })
  })
}

const checkUsersForDateRange = ({ from, to }, done) => {
  if (from === to) {
    checkUsersForDay({ date:  getCurrentDate(from).date }, done)
    return
  }

  let collections = getArrayOfDates({ from, to })

  let usersResult = {}

  let doneCount = collections.length
  let doneAlready = 0
  const doneStep = ({ error, client }) => {
    if (error) {
      client.close()
      done({ error })
      return
    }
    doneAlready++
    if (doneAlready === doneCount) {
      client.close()
      done(_filesUsersToArray(usersResult))
    }
  }

  _connectDB((err, client) => {
    if (err) {
      _errorHandlers.connect({ method: 'checkUsersForDateRange', err })
      doneStep({ error: 'Error on checkUsersForDateRange, connect to mongoClient', client })
      return
    }
    const dataBase = _getDB(client)

    collections.forEach(date => {
      const collection = _getCollectionFromDB(dataBase, date)

      collection.find().toArray((err, results) => {
        if (err) {
          _errorHandlers.find({ method: 'checkUsersForDateRange', err })
          doneStep({ error: 'Error on server, can\'t find.', client })
          return
        }

        _filesToUsers(usersResult, results)
        doneStep({ client })
      })
    })
  })
}

const getConflictsForDay = ({ date }, done) => {
  _connectDB((err, client) => {
    if (err) {
      _errorHandlers.connect({ method: 'getConflictsForDay', err, done })
      return
    }

    const collection = _getCollection(client, date)

    collection.find().toArray((err, results) => {
      if (err) {
        _errorHandlers.find({ method: 'getConflictsForDay', err, done })
        return
      }

      let usersResult = {}
      _filesToUsers(usersResult, results)

      let storage = Object.entries(usersResult).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: { paths: value }
      }), {})

      let conflicts = getConflictsHelper(Object.entries(storage))

      client.close()
      done(conflicts)
    })
  })
}

const getConflictsForDateRange = ({ from, to }, done) => {
  if (from === to) {
    getConflictsForDay({ date:  getCurrentDate(from).date }, done)
    return
  }

  let collections = getArrayOfDates({ from, to })

  let usersResult = {}

  let doneCount = collections.length
  let doneAlready = 0
  const doneStep = ({ error, client }) => {
    if (error) {
      client.close()
      done({ error })
      return
    }
    doneAlready++
    if (doneAlready === doneCount) {
      let storage = Object.entries(usersResult).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: { paths: value }
      }), {})

      let conflicts = getConflictsHelper(Object.entries(storage))

      client.close()
      done(conflicts)
    }
  }

  _connectDB((err, client) => {
    if (err) {
      _errorHandlers.connect({ method: 'getConflictsForDateRange', err })
      doneStep({ error: 'Error on getConflictsForDateRange, connect to mongoClient', client })
      return
    }
    const dataBase = _getDB(client)

    collections.forEach(date => {
      const collection = _getCollectionFromDB(dataBase, date)

      collection.find().toArray((err, results) => {
        if (err) {
          _errorHandlers.find({ method: 'getConflictsForDateRange', err })
          doneStep({ error: 'Error on server, can\'t find.', client })
          return
        }

        _filesToUsers(usersResult, results)
        doneStep({ client })
      })
    })
  })
}

const getFilesForDateRange = ({ from, to, search }, done) => {
  let collections = getArrayOfDates({ from, to })

  let files = {}

  let doneCount = collections.length
  let doneAlready = 0
  const doneStep = ({ error, client }) => {
    if (error) {
      client.close()
      done({ error })
      return
    }
    doneAlready++
    if (doneAlready === doneCount) {
      client.close()
      const result = Object.entries(files).map(([fileName, users]) => ({
        fileName,
        users: Object.entries(users).map(([userName, date]) => userName + date)
      }))
      done({ files: result })
    }
  }

  _connectDB((err, client) => {
    if (err) {
      _errorHandlers.connect({ method: 'getFilesForDateRange', err })
      doneStep({ error: 'Error on getFilesForDateRange, connect to mongoClient', client })
      return
    }
    const dataBase = _getDB(client)
    let regex = new RegExp(`.*${search}.*`)

    collections.forEach((date, i) => {
      const collection = _getCollectionFromDB(dataBase, date)

      collection.find({ _id:  regex }).toArray((err, results) => {
        if (err) {
          _errorHandlers.find({ method: 'getFilesForDateRange', err })
          doneStep({ error: 'Error on server, can\'t find.', client })
          return
        }

        results.forEach(({ _id: fileName, users }) => {
          let usersWithDates = {}
          Object.keys(users).forEach(key => {
            usersWithDates[key] = `[${collections[i]} ${users[key].lastUpdate}]`
          })

          if (files[fileName]) {
            files[fileName] = {
              ...files[fileName],
              ...usersWithDates,
            }
          } else {
            files[fileName] = usersWithDates
          }
        })

        doneStep({ client })
      })
    })
  })
}

module.exports = {
  addFiles,
  checkFileForDay,
  checkUsersForDay,
  checkUsersForDateRange,
  getConflictsForDay,
  getConflictsForDateRange,
  getFilesForDateRange,
}
