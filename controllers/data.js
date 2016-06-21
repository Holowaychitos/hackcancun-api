'use strict'
const jwt = require('jsonwebtoken')
const Data = require('../models/data')

const sendFields = 'username email' // separate with space
const limitItems = 10

exports.postData = function (request, response) {
  const data = new Data({
    by: request.user.id,
    data: request.body.data,
    type: request.body.type
  })

  data.save()
    .then(() => {
      response.json({
        success: true,
        id: data._id
      })
    })
    .catch((error) => response.status(400).json({error: error}))
}
