const JoinLeague = require('../../app/models/joinleague')
const League = require('../../app/models/league')
const { singleLeague, user } = require('./merge')

module.exports = {
  joinLeagues: async () => {
    try {
      const joinLeagues = await JoinLeague.find()
      return joinLeagues.map(joinLeague => {
        return {
          ...joinLeague._doc,
          _id: joinLeague.id,
          user: user.bind(this, joinLeague._doc.user),
          league: singleLeague.bind(this, joinLeague._doc.league),
          createdAt: new Date(joinLeague._doc.createdAt.toISOString()),
          updatedAt: new Date(joinLeague._doc.createdAt.toISOString())
        }
      })
    } catch (err) {
      throw err
    }
  },
  addTeam: async args => {
    const getLeague = await League.findOne({
      _id: args.leagueId
    })
    const joinLeague = new JoinLeague({
      user: '5d6448116aaa5549f72d44a4',
      league: getLeague
    })
    const result = await joinLeague.save()
    return {
      ...result._doc,
      _id: result.id,
      user: user.bind(this, joinLeague._doc.user),
      league: singleLeague.bind(this, joinLeague._doc.league),
      createdAt: new Date(result._doc.createdAt.toISOString()),
      updatedAt: new Date(result._doc.createdAt.toISOString())
    }
  },
  removeTeam: async args => {
    try {
      const getJoinedLeague = await JoinLeague.findById(args.joinLeagueId).populate('league')
      const league = {
        ...getJoinedLeague.league._doc,
        _id: getJoinedLeague.league.id,
        leagueCreator: user.bind(this, getJoinedLeague.league._doc.leagueCreator)
      }
      await JoinLeague.deleteOne({
        _id: args.joinLeagueId
      })
      return league
    } catch (err) {
      throw err
    }
  }
}
