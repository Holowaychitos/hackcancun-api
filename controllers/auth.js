'use strict'
const jwt = require('jsonwebtoken')
const passport = require('passport')
// const BasicStrategy = require('passport-http').BasicStrategy
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const User = require('../models/user')
const emailer = require('../lib/emailer')

var opts = {}
opts.secretOrKey = process.env.JWT_SIGNATURE
opts.jwtFromRequest = ExtractJwt.fromAuthHeader()

passport.use(new JwtStrategy(opts, function (jwt_payload, callback) {
  User.findOne({ _id: jwt_payload.reference })
    .then((user) => {
      if (!user) return callback(null, false)
      callback(null, user)
    })
    .catch((error) => callback({error: error.errmsg}))
}))

exports.isAuthenticated = passport.authenticate('jwt', { session: false })

exports.forgot = function (request, response) {
  User.findOne({email: request.body.email})
    .then((user) => {
      if (!user) {
        return response.status(400).send({
          error: 'No account with that email address exists.'
        })
      }

      const token = jwt.sign({
        reference: user._id
      }, process.env.JWT_SIGNATURE, {
        expiresIn: process.env.FORGOT_TOKEN_EXPIRE_TIME
      })

      emailer.forgot(user.email, {
        url: `${request.body.callbackUrl}/${token}`
      })
    })
    .catch(() => response.status(400).send({error: 'No account with that email address exists.'}))
}

exports.authenticate = function (request, response) {
  const filter = { $or: [
    {username: request.body.username},
    {email: request.body.username}
  ]}

  User.findOne(filter)
    .then((user) => {
      if (!user) {
        return response.status(400).send({
          success: false,
          msg: 'Authentication failed. User not found.'
        })
      }

      user.verifyPassword(request.body.password)
        .then((isMatch) => {
          if (!isMatch) {
            return response.status(400).send({
              success: false,
              msg: 'Authentication failed. User not found.'
            })
          }

          let token = jwt.sign({reference: user._id}, process.env.JWT_SIGNATURE)
          response.json({
            success: true,
            token: 'JWT ' + token,
            user: user
          })
        })
        .catch((error) => response.status(400).send({error: error}))
    })
    .catch((error) => response.status(400).send({error: error.errmsg}))
}
