'use strict'
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const sendFields = 'username email' // separate with space
const limitItems = 10

exports.postUsers = function (request, response) {
  const user = new User({
    username: request.body.username,
    password: request.body.password,
    email: request.body.email
  })

  user.save()
    .then(() => {
      // @TODO add async generate jwt
      let token = jwt.sign({reference: user._id}, process.env.JWT_SIGNATURE)
      response.json({
        success: true,
        token: 'JWT ' + token,
        user: user
      })
    })
    .catch((error) => response.status(400).json({error: error}))
}

exports.getUsers = function (request, response) {
  // @TODO Create isAdmin meddleware
  // if (!request.user.isAdmin) return response.status(400).send({error: 'invalid path'})

  User.find({}, sendFields, {limit: limitItems})
    .then((users) => response.json(users))
    .catch((error) => response.status(400).json({error: error}))
}

exports.getMe = function (request, response) {
  response.json(request.user)
}

exports.resetPassword = function (request, response) {
  if (!request.body.token) return response.status(400).send({error: 'not included token'})
  if (!request.body.password) return response.status(400).send({error: 'not included password'})

  jwt.verify(request.body.token, process.env.JWT_SIGNATURE, function (error, data) {
    if (error) return response.status(400).send({error: 'invalid token'})

    User.findOne({_id: data.reference})
      .then((user) => {
        user.password = request.body.password
        user.save(function (error, updateUser) {
          if (error) return response.status(400).send({error: error})
          response.json({message: 'user updating'})
        })
      })
      .catch((error) => response.status(400).json({error: error}))
  })
}

exports.updateUser = function (request, response) {
  const update = request.body
  const filter = {'_id': request.user._id}

  User.update(filter, {$set: update})
    .then(() => {
      return User.findOne(filter, {polls: {$slice: 10}})
    })
    .then((poll) => response.json({success: true, user: poll}))
    .catch((error) => response.status(400).json({error: error}))
}
