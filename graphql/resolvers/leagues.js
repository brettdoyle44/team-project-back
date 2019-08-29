const League = require('../../app/models/league')
// const { user } = require('./merge')
const User = require('../../app/models/user')
const { transformLeague, user } = require('./merge')

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
  },
  creator: async ({
    _id
  }) => {
    const user = await User.findOne({
      _id: _id
    })
    if (!user) {
      throw new Error('User does not exist')
    }
    return { createdLeagues: user.createdLeagues, email: user.email }
  },
  removeLeague: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated')
    }
    try {
      const getLeague = await League.findById(args.leagueId).populate('league')
      const league = {
        ...getLeague.league._doc,
        _id: getLeague.league.id,
        leagueCreator: user.bind(this, getLeague.league._doc.leagueCreator)
      }
      await League.deleteOne({
        _id: args.leagueId
      })
      return league
    } catch (err) {
      throw err
    }
  },
  league: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated')
    }
    try {
      const getLeague = await League.findById(args.leagueId).populate('league')
      const league = {
        ...getLeague.league._doc,
        _id: getLeague.league._id,
        leagueCreator: user.bind(this, getLeague.league._doc.leagueCreator)
      }
      return league
    } catch (err) {
      throw err
    }
  }
}
