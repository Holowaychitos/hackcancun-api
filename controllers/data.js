'use strict'
const Data = require('../models/data')
const https = require('https')
const url = require('url')
const path = require('path')
const querystring = require('querystring')

exports.postData = function (request, response) {
  const data = new Data({
    by: request.user.id,
    data: request.body.data,
    type: request.body.type
  })
  // curl -i -X PUT https://api-m2x.att.com/v2/devices/185321322901cff675347d54ffb37f59/streams/average-steps/value -H "X-M2X-KEY: 13ef514ad4d0fa5ed0c90180f607e251" -H "Content-Type: application/json" -d "{ \"value\": \"40\" }"
  var pathname = url.parse(process.env.M2X_STEPS_VIRTUAL_SENSOR)
  let m2x = new Promise(function (resolve, reject) {
    let options = {
      hostname: pathname.hostname,
      path: path.resolve(pathname.path, `../../kid-${request.user.id}/value`),
      method: 'PUT',
      headers: {
        'X-M2X-KEY': process.env.X_M2X_KEY,
        'Content-Type': 'application/json'
      }
    }
    let body = JSON.stringify({'value': request.body.data})
    console.log(options, body)
    let data
    let req = https.request(options, function (res) {
      res.on('data', function (chunk) {
        if (data) { return (data = Buffer.concat([data, chunk])) }
        data = chunk
      })
      res.on('end', () => resolve(JSON.parse(data.toString('utf-8'))))
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
  let m2xStats = function (days = 7) {
    return new Promise(function (resolve, reject) {
      let query = querystring.stringify({start: new Date(Date.now() - 1000 * days * 24 * 60 * 60).toISOString()})
      let options = {
        hostname: pathname.hostname,
        path: path.resolve(pathname.path, `../../kid-${request.user.id}/stats`) + '?' + query,
        headers: {
          'X-M2X-KEY': process.env.X_M2X_KEY,
          'Content-Type': 'application/json'
        }
      }
      let data
      let req = https.request(options, function (res) {
        res.on('data', (chunk) => {
          if (data) { return (data = Buffer.concat([data, chunk])) }
          data = chunk
        })
        res.on('end', () => resolve(JSON.parse(data.toString('utf-8'))))
      })
      req.on('error', reject)
      setTimeout(function () {
        req.end()
      }, 2000)
    })
  }
  data.save()
    .then((res) => console.log(res))
    .then(() => m2x)
    .then((res) => console.log(res))
    .then(() => m2xStats())
    .then((res) => {
      console.log(res)
      response.json({
        success: true,
        id: data._id,
        stats: res.stats
      })
    })
    .catch((error) => response.status(400).json({error: error.message}))
}

exports.getLastWeek = function (request, response) {
  let date = new Date()
  date.setDate(date.getDate() - date.getDay() - 7)
  date.setHours(0, 0, 0, 0)
  let fin = new Date(date)
  fin.setDate(fin.getDate() + 6)
  // curl -i -X PUT https://api-m2x.att.com/v2/devices/185321322901cff675347d54ffb37f59/streams/average-steps/value -H "X-M2X-KEY: 13ef514ad4d0fa5ed0c90180f607e251" -H "Content-Type: application/json" -d "{ \"value\": \"40\" }"
  let pathname = url.parse(process.env.M2X_STEPS_VIRTUAL_SENSOR)
  let m2x = new Promise(function (resolve, reject) {
    let query = querystring.stringify({start: date.toISOString(), end: (new Date()).toISOString(), type: 'sum', interval: 60 * 60 * 24})
    let options = {
      hostname: pathname.hostname,
      path: `${path.resolve(pathname.path, `../../kid-${request.user.id}/sampling`)}?${query}`,
      headers: {
        'X-M2X-KEY': process.env.X_M2X_KEY,
        'Content-Type': 'application/json'
      }
    }
    let data
    let req = https.request(options, function (res) {
      res.on('data', function (chunk) {
        if (data) { return (data = Buffer.concat([data, chunk])) }
        data = chunk
      })
      res.on('end', () => resolve(JSON.parse(data.toString('utf-8'))))
    })
    req.on('error', reject)
    req.end()
  })
  m2x.then((res) => {
    console.log(res)
    let lastWeekSum = res.values.reduce(function (prev, act) {
      if (new Date(act.timestamp) < fin)
        return prev + act.value
      return prev
    }, 0)
    let thisWeekSum = res.values.reduce(function (prev, act) {
      if (new Date(act.timestamp) > fin)
        return prev + act.value
      return prev
    }, 0)
    res.values = res.values.filter(function (element) {
      return (new Date(element.timestamp) < fin)
    }, 0)
    res.lastWeekSum = lastWeekSum
    res.thisWeekSum = thisWeekSum
    request.user.lastWeekSum = lastWeekSum
    request.user.thisWeekSum = thisWeekSum
    return request.user.save().then(() => response.json(res))
  }).catch((error) => response.status(400).json({error: error.message}))
}

exports.putFakeData = function (request, response) {
  let date = new Date()
  date.setDate(date.getDate() - date.getDay() - 7)
  date.setHours(0, (Math.random() * 60) | 0, (Math.random() * 60) | 0, 0)
  let inicio = new Date(date)
  let fin = new Date()
  // curl -i -X PUT https://api-m2x.att.com/v2/devices/185321322901cff675347d54ffb37f59/streams/average-steps/value -H "X-M2X-KEY: 13ef514ad4d0fa5ed0c90180f607e251" -H "Content-Type: application/json" -d "{ \"value\": \"40\" }"
  let pathname = url.parse(process.env.M2X_STEPS_VIRTUAL_SENSOR)
  let body = {values: []}
  while(date < fin) {
    body.values.push({timestamp: date.toISOString(), value: Math.random() * (35 - Math.log2(fin.valueOf() - date.valueOf())) | 0})
    date.setTime(date.getTime() + 1000 * 60 * 60)
  }
  console.log(body)
  let m2x = new Promise(function (resolve, reject) {
    let query = querystring.stringify({start: inicio.toISOString(), end: (new Date()).toISOString(), type: 'sum', interval: 60 * 60 * 24})
    let options = {
      hostname: pathname.hostname,
      path: path.resolve(pathname.path, `../../kid-${request.user.id}/values`),
      method: 'POST',
      headers: {
        'X-M2X-KEY': process.env.X_M2X_KEY,
        'Content-Type': 'application/json'
      }
    }
    let data
    let req = https.request(options, function (res) {
      res.on('data', function (chunk) {
        if (data) { return (data = Buffer.concat([data, chunk])) }
        data = chunk
      })
      res.on('end', () => resolve(JSON.parse(data.toString('utf-8'))))
    })
    req.on('error', reject)
    req.write(JSON.stringify(body))
    req.end()
  })
  m2x.then((res) => {
    console.log(res)
    response.json(res)
  }).catch((error) => response.status(400).json({error: error.message}))
}
