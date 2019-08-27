const mongoose = require('mongoose')

const Schema = mongoose.Schema

const joinLeagueSchema = new Schema({
  league: {
    type: Schema.Types.ObjectId,
    ref: 'League'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true })

module.exports = mongoose.model('JoinLeague', joinLeagueSchema)
