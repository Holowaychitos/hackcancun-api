'use strict'
const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')
const is = require('is_js')

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: is.email
    }
  },
  location: String,
  avatar: String,
  bio: String
})

UserSchema.index({ email: 1, username: 1 }, { unique: true })

UserSchema.pre('save', function (callback) {
  let user = this

  // Break out if the password hasn't changed
  if (!user.isModified('password')) return callback()

  // Password changed so we need to hash it
  bcrypt.genSalt(5, function (error, salt) {
    if (error) return callback(error)

    bcrypt.hash(user.password, salt, null, function (error, hash) {
      if (error) return callback(error)
      user.password = hash
      callback()
    })
  })
})

UserSchema.methods.verifyPassword = function (password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, function (error, isMatch) {
      if (error) return reject(error)
      resolve(isMatch)
    })
  })
}

UserSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret.reference = ret._id
    delete ret.password
    delete ret._id
    delete ret.__v
  }
})

module.exports = mongoose.model('User', UserSchema)
