const JoinLeague = require('../../app/models/joinleague')
const League = require('../../app/models/league')
const { singleLeague, user } = require('./merge')

module.exports = {
  joinLeagues: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated')
    }
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
  addTeam: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated')
    }
    const getLeague = await League.findOne({
      _id: args.leagueId
    })
    const joinLeague = new JoinLeague({
      user: req.userId,
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
  removeTeam: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated')
    }
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
