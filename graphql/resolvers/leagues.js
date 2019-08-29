const League = require('../../app/models/league')
// const { user } = require('./merge')
const User = require('../../app/models/user')
const { transformLeague } = require('./merge')

module.exports = {
  leagues: async () => {
    try {
      const leagues = await League.find()
      return leagues.map(league => {
        return transformLeague(league)
      })
    } catch (err) {
      throw err
    }
  },
  createLeague: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated')
    }
    const league = new League({
      name: args.leagueInput.name,
      description: args.leagueInput.description,
      game: args.leagueInput.game,
      maxTeams: args.leagueInput.maxTeams,
      dateStart: new Date(args.leagueInput.dateStart),
      leagueCreator: req.userId
    })
    let createdLeague
    try {
      const result = await league.save()
      createdLeague = transformLeague(result)
      const leagueCreator = await User.findById(req.userId)
      if (!leagueCreator) {
        throw new Error('User not found.')
      }
      leagueCreator.createdLeagues.push(league)
      await leagueCreator.save()
      return createdLeague
    } catch (err) {
      throw err
    }
  }
}
