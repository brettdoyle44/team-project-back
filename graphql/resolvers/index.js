const authResolver = require('./auth')
const leaguesResolver = require('./leagues')
const joinLeaguesResolver = require('./joinleagues')

const rootResolver = {
  ...authResolver,
  ...leaguesResolver,
  ...joinLeaguesResolver
}

module.exports = rootResolver
