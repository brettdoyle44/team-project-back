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
          date: new Date(league._doc.date).toISOString(),
          creator: user.bind(this, league._doc.creator)
        }
      })
    } catch (err) {
      throw err
    }
  },
  createLeague: async args => {
    const league = new League({
      name: args.leagueInput.name,
      description: args.leagueInput.description,
      game: args.leagueInput.game,
      maxTeams: args.leagueInput.maxTeams,
      dateStart: new Date(args.leagueInput.dateStart),
      leagueCreator: '5d6448116aaa5549f72d44a4'
    })
    let createdLeague
    try {
      const result = await league.save()
      createdLeague = {
        ...result._doc,
        _id: result._doc._id.toString(),
        date: new Date(league._doc.date).toISOString(),
        leagueCreator: user.bind(this, result._doc.creator)
      }
      const singleUser = await User.findById('5d6448116aaa5549f72d44a4')
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
