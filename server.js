// require necessary NPM packages
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const graphqlHttp = require('express-graphql')
const { buildSchema } = require('graphql')
const League = require('./app/models/league')
const User = require('./app/models/user')
const bcrypt = require('bcrypt')

// require route files
const exampleRoutes = require('./app/routes/example_routes')
const userRoutes = require('./app/routes/user_routes')

// require error handling middleware
const errorHandler = require('./lib/error_handler')

// require database configuration logic
// `db` will be the actual Mongo URI as a string
const db = require('./config/db')

// require configured passport authentication middleware
const auth = require('./lib/auth')

// establish database connection
mongoose.Promise = global.Promise
mongoose.connect(db, {
  useMongoClient: true
})

// instantiate express application object
const app = express()

// set CORS headers on response from this API using the `cors` NPM package
// `CLIENT_ORIGIN` is an environment variable that will be set on Heroku
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:7165' }))

// define port for API to run on
const port = process.env.PORT || 4741

app.use('/graphql', graphqlHttp({
  schema: buildSchema(`
    type League {
      _id: ID!
      name: String!
      description: String!
      game: String!
      maxTeams: Int!
      dateStart: String!
    }

    type User {
      _id: ID!
      email: String!
      password: String
    }

    input LeagueInput {
      name: String!
      description: String!
      game: String!
      maxTeams: Int!
      dateStart: String!
    }

    input UserInput {
      email: String!
      password: String!
    }

    type RootQuery {
      leagues: [League!]!

    }

    type RootMutation {
      createLeague(leagueInput: LeagueInput): League
      createUser(userInput: UserInput): User
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
    `),
  rootValue: {
    leagues: () => {
      return League.find()
        .then(leagues => {
          return leagues.map(league => {
            return { ...league._doc, _id: league.id }
          })
        })
        .catch(err => {
          throw err
        })
    },
    createLeague: args => {
      const league = new League({
        name: args.leagueInput.name,
        description: args.leagueInput.description,
        game: args.leagueInput.game,
        maxTeams: args.leagueInput.maxTeams,
        dateStart: new Date(args.leagueInput.dateStart),
        leagueCreator: '5d6448116aaa5549f72d44a4'
      })
      let createdLeague
      return league
        .save()
        .then(result => {
          createdLeague = { ...result._doc, _id: result._doc._id.toString() }
          return User.findById('5d6448116aaa5549f72d44a4')
        })
        .then(user => {
          if (!user) {
            throw new Error('User not found.')
          }
          user.createdLeagues.push(league)
          return user.save()
        })
        .then(result => {
          return createdLeague
        })
        .catch(err => {
          console.log(err)
          throw err
        })
    },
    createUser: args => {
      return User.findOne({email: args.userInput.email})
        .then(user => {
          if (user) {
            throw new Error('User exists already.')
          }
          return bcrypt
            .hash(args.userInput.password, 12)
        })
        .then(hashedPassword => {
          const user = new User({
            email: args.userInput.email,
            password: hashedPassword
          })
          return user.save()
        })
        .then(result => {
          return { ...result._doc, password: null, _id: result.id }
        })
        .catch(err => {
          throw err
        })
    }
  },
  graphiql: true
}))

// this middleware makes it so the client can use the Rails convention
// of `Authorization: Token token=<token>` OR the Express convention of
// `Authorization: Bearer <token>`
app.use((req, res, next) => {
  if (req.headers.authorization) {
    const auth = req.headers.authorization
    // if we find the Rails pattern in the header, replace it with the Express
    // one before `passport` gets a look at the headers
    req.headers.authorization = auth.replace('Token token=', 'Bearer ')
  }
  next()
})

// register passport authentication middleware
app.use(auth)

// add `bodyParser` middleware which will parse JSON requests into
// JS objects before they reach the route files.
// The method `.use` sets up middleware for the Express application
app.use(bodyParser.json())
// this parses requests sent by `$.ajax`, which use a different content type
app.use(bodyParser.urlencoded({ extended: true }))

// register route files
app.use(exampleRoutes)
app.use(userRoutes)

// register error handling middleware
// note that this comes after the route middlewares, because it needs to be
// passed any error messages from them
app.use(errorHandler)

// run API on designated port (4741 in this case)
app.listen(port, () => {
  console.log('listening on port ' + port)
})

// needed for testing
module.exports = app
