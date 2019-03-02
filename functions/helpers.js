// initiate functions and firebase admin application
const functions = require('firebase-functions');
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)

// push data to a specific database
const pushData = (path) => (payload) => {
  return new Promise((resolve, reject) => {
    admin.database().ref(path).push(payload).then(snapshot => {
      resolve(snapshot)
    }).catch((error) => {
      reject(error)
    })
  })
}

// get data from a specific reference
const getData = (path) => {
  return new Promise((resolve, reject) => {
    admin.database().ref(path).once('value', (snapshot) => {
      resolve(snapshot.val())
    }, (error) => {
      reject(error)
    })
  })
}

// delete data from a specific reference
const deleteData = (path) => {
  return new Promise((resolve, reject) => {
    resolve(admin.database().ref(path).remove())
  })
}

// module.exports.validateToken = validateToken
module.exports.getData = getData
module.exports.pushData = pushData
module.exports.deleteData = deleteData
