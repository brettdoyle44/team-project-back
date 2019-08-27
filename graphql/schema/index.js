const { buildSchema } = require('graphql')

module.exports = buildSchema(`
  type JoinLeague {
    league: League!
    user: User!
    createdAt: String!
    updateAt: String!
  }

  type League {
    _id: ID!
    name: String!
    description: String!
    game: String!
    maxTeams: Int!
    dateStart: String!
    leagueCreator: User!
  }

  type User {
    _id: ID!
    email: String!
    password: String
    createdLeagues: [League!]!
  }

  type UserAuth {
    userId: ID!
    token: String!
    tokenExpiration: Int!
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
    joinLeagues: [JoinLeague!]!
    login(email: String!, password: String!): UserAuth!

  }

  type RootMutation {
    createLeague(leagueInput: LeagueInput): League
    createUser(userInput: UserInput): User
    addTeam(leagueId: ID!): JoinLeague!
    removeTeam(joinLeagueId: ID!): League!
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
  `)
