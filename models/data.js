'use strict'
const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')
const is = require('is_js')

const DataSchema = new mongoose.Schema({
  by: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  data: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Data', DataSchema)
