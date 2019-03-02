// initiate main modules
const functions = require('firebase-functions');
const helpers = require('./helpers.js')
const Validator = require('jsonschema').Validator
const _ = require('lodash')

// validation endpoint for deployer data
exports.validate = functions.https.onRequest((request, response) => {
  // handle invalid request method
  if (request.method !== 'POST') {
    return response.status(405).send('Only POST Requests Are Accepted')
  }
  const deployerData = request.body
  const version = deployerData.version
  helpers.getData('schemas').then((schemas) => {
    const schema = _.find(schemas, ['version', version])
    if (schema) {
      const v = new Validator()
      var result = v.validate(deployerData, schema.schema)
      result.valid ? response.status(200).send('Validated!') : response.status(400).send(result.errors)
    } else {
      response.status(400).send(`Can't Find a Deployer Schema With Version ${version}`)
    }
  }).catch((error) => {
    response.status(500).send(`Error Getting Deployer Schemas to Validate With: ${error}`)
  })
})

// github webhook endpoint
exports.github = functions.https.onRequest((request, response) => {
  // handle invalid request method
  if (request.method !== 'POST') {
    return response.status(405).send('Only POST Requests Are Accepted')
  }
  // allow only authorized github webhooks
  const eventHeader = request.get('X-GitHub-Event')
  const approvedHeaders = ["release", "installation_repositories"]
  if (!approvedHeaders.includes(eventHeader)) {
    return response.status(405).send(`Only Accepting GitHub Events: ${approvedHeaders}`)
  }
  // write data from github webhook to database
  const writeData = helpers.pushData(eventHeader)(request.body)
  // return write promise
  return writeData.then(
    result => response.status(200).send(`Successfully Pushed Github Event: ${result}`),
    error => response.status(500).send(`Error in Pushing GitHub Event: ${error}`)
  )
})

// delete the release event, deletion event will trigger client to update live
exports.processReleaseEvent = functions.database.ref('/release/{key}').onCreate(snapshot => {
  return snapshot.ref.remove()
})

// process repository event from github app installation
exports.processRepositoryEvent = functions.database.ref('/installation_repositories/{key}').onCreate(snapshot => {
  const event = snapshot.val()
  const allowedActions = ["added", "removed"]
  const action = event.action
  let promises = []

  if (!allowedActions.includes(action)) {
    return console.error(`Unknown Repository Event Action: ${action}`)
  } else if (action == "added") {
    // add repository to database
    _.forEach(event.repositories_added, (repo) => {
      repo.users = ['user']
      promises.push(helpers.pushData('repositories')(repo))
    })
  } else if (action == "removed") {
    // remove repository from database
    const ids = _.map(event.repositories_removed, 'id')
    helpers.getData("repositories").then((repository) => {
      _.forOwn(repository, (repo, key) => {
        if (ids.includes(repo.id)) {
          promises.push(helpers.deleteData(`repositories/${key}`))
        }
      })
    })
  }
  Promise.all(promises).then(() => {
    return snapshot.ref.remove()
  })
});

// cloud function to create user profile upon signin for the first time
exports.createUser = functions.auth.user().onCreate((user) => {
  return new Promise((resolve, reject) => {
    const payload = {
      name: user.displayName,
      email: user.email,
      role: ['user']
    }
    helpers.pushData("users")(payload).then((snapshot) => {
      resolve(snapshot)
    }).catch((error) => {
      reject(error)
    })
  })
})

// cloud function to delete user metadata on auth delete
exports.deleteUser = functions.auth.user().onDelete((user) => {
  return new Promise((resolve) => {
    helpers.getData("users").then(userData => {
      let userKey = _.findKey(userData, {
        'email': user.email
      })
      helpers.deleteData(`users/${userKey}`).then(() => {
        resolve()
      })
    })
  })
})
