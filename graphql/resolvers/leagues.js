const League = require('../../app/models/league')
const { user } = require('./merge')
const User = require('../../app/models/user')

module.exports = {
  leagues: async () => {
    try {
      const leagues = await League.find()
        .populate('leagueCreator')
      return leagues.map(league => {
        return {
          ...league._doc,
          _id: league.id,
          dateStart: new Date(league._doc.dateStart).toISOString(),
          creator: user.bind(this, league._doc.creator)
        }
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
      createdLeague = {
        ...result._doc,
        _id: result._doc._id.toString(),
        dateStart: new Date(league._doc.dateStart).toISOString(),
        leagueCreator: user.bind(this, result._doc.creator)
      }
      const singleUser = await User.findById(req.userId)
      if (!singleUser) {
        throw new Error('User not found.')
      }
      singleUser.createdLeagues.push(league)
      return createdLeague
    } catch (err) {
      throw err
    }
  }
}
