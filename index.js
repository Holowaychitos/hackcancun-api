'use strict'
process.env.NODE_ENV === 'production' && require('newrelic')
require('dotenv').config()
const morgan = require('morgan')
const express = require('express')
const passport = require('passport')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors') // @TODO: remove dependecie for production
const http = require('http')
const socketIO = require('socket.io')

const routes = require('./routes')

function runServer () {
  let app = express()
  let server = http.Server(app)
  let io = socketIO(server)

  app.use(bodyParser.json()) // for parsing application/json
  app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
  app.use(passport.initialize())
  app.use(morgan('dev'))
  app.use(cors())

  app.use(`/api/${process.env.VERSION_API}`, routes)
  server.listen(process.env.PORT, function () {
    console.log(`server running on:
 └─> http://localhost:${process.env.PORT}`)
  })

  io.on('connection', (socket) => {
    console.log(`socket ${socket.id} connected`)
    socket.on('jump', (data) => {
      console.log(data)
      io.emit('jump', data)
    })
    socket.on('hey', (data) => {
      console.log('hey', data)
    })

    socket.on('disconnect', () => console.log(`socket ${socket.id} disconnected`))

    socket.on('error', (error) => console.log(`socket ${socket.id} error: ${error.message}`))

    socket.on('reconnect', () => console.log(`socket ${socket.id} recconected`))
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
