const mongoose = require('mongoose')

const Schema = mongoose.Schema

const leagueSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  game: {
    type: String,
    required: true
  },
  maxTeams: {
    type: Number,
    required: true
  },
  dateStart: {
    type: Date,
    required: true
  },
  leagueCreator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
})

module.exports = mongoose.model('League', leagueSchema)
