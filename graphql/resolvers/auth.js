const User = require('../../app/models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

module.exports = {
  createUser: async args => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email })
      if (existingUser) {
        throw new Error('User exists already.')
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12)

      const user = new User({
        email: args.userInput.email,
        password: hashedPassword
      })

      const result = await user.save()

      return { ...result._doc, password: null, _id: result.id }
    } catch (err) {
      throw err
    }
  },
  login: async ({
    email,
    password
  }) => {
    const user = await User.findOne({
      email: email
    })
    if (!user) {
      throw new Error('Invalid credentials')
    }
    const isEqual = await bcrypt.compare(password, user.password)
    if (!isEqual) {
      throw new Error('Invalid credentials')
    }
    const token = jwt.sign({
      userId: user.id,
      email: user.email
    }, 'somereallysupersecretkey', {
      expiresIn: '1hr'
    })
    return { userId: user.id, token: token, tokenExpiration: 1 }
  }
}
