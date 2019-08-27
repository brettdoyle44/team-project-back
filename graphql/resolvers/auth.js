const User = require('../../app/models/user')
const bcrypt = require('bcrypt')

module.exports = {
  createUser: async args => {
    try {
      const user = await User.findOne({
        email: args.userInput.email
      })
      if (user) {
        throw new Error('User exists already.')
      }
      const hashedPassword = bcrypt.hash(args.userInput.password, 12)
      const newUser = new User({
        email: args.userInput.email,
        password: hashedPassword
      })
      const result = await newUser.save()
      return {
        ...result._doc,
        password: null,
        _id: result.id
      }
    } catch (err) {
      throw err
    }
  },
  login: async ({ email, password }) => {
    const user = User.findOne({ email: email })
    if (!user) {
      throw new Error('Invalid credentials')
    }
    const isEqual = await bcrypt.compare(password, user.password)
    if (!isEqual) {
      throw new Error('Invalid credentials')
    }
  }
}
