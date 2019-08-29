const League = require('../../app/models/league')
const User = require('../../app/models/user')

const leagues = async leagueIds => {
  try {
    const leagues = await League.find({
      _id: {
        $in: leagueIds
      }
    })
    return leagues.map(league => {
      return transformLeague(league)
    })
  } catch (err) {
    throw err
  }
}
//
// const singleLeague = async leagueId => {
//   try {
//     const league = await League.findById(leagueId)
//     return {
//       ...league._doc,
//       _id: league.id,
//       leagueCreator: user.bind(this, league.leagueCreator)
//     }
//   } catch (err) {
//     throw err
//   }
// }
//
const user = async userId => {
  try {
    const user = await User.findById(userId)
    return {
      ...user._doc,
      _id: user.id,
      createdLeagues: leagues.bind(this, user._doc.createdLeagues)
    }
  } catch (err) {
    throw err
  }
}

const transformLeague = league => {
  return {
    ...league._doc,
    _id: league.id,
    date: new Date(league._doc.date).toISOString,
    leagueCreator: user.bind(this, league.leagueCreator)
  }
}

exports.transformLeague = transformLeague
// exports.user = user
// exports.leagues = leagues
// exports.singleLeague = singleLeague
