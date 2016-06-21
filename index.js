'use strict'
process.env.NODE_ENV === 'production' && require('newrelic')
require('dotenv').config()
const morgan = require('morgan')
const express = require('express')
const passport = require('passport')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors') // @TODO: remove dependecie for production

const routes = require('./routes')

function runServer () {
  let app = express()

  app.use(bodyParser.json()) // for parsing application/json
  app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
  app.use(passport.initialize())
  app.use(morgan('dev'))
  app.use(cors())

  app.use(`/api/${process.env.VERSION_API}`, routes)
  app.listen(process.env.PORT, function () {
    console.log(`server running on: \n └─> http://localhost:${process.env.PORT}`)
  })

  return app
}

const mongoURL = process.env.NODE_ENV !== 'production'
  ? process.env.MONGO_DB_LOCAL
  : process.env.MONGO_DB

mongoose.connect(mongoURL, function (err, res) {
  if (err) {
    console.log('ERROR connecting to: ' + mongoURL + '. ' + err)
    process.exit(1)
  }
  console.log(`Run in ${process.env.NODE_ENV || 'develepment'} mode`)
  console.log('Succeeded connected to: Mongo DB')
  runServer()
})