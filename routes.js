'use strict'
const router = require('express').Router()

const authController = require('./controllers/auth')
const userController = require('./controllers/user')
const dataController = require('./controllers/data')

router.route('/state')
  .get((request, response) => response.send('API server OK!'))

router.route('/user')
  .post(userController.postUsers)
  .get(authController.isAuthenticated, userController.getUsers)

router.route('/user/me')
  .get(authController.isAuthenticated, userController.getMe)
  .put(authController.isAuthenticated, userController.updateUser)

router.route('/user/reset-password')
  .post(userController.resetPassword)

router.route('/auth')
  .post(authController.authenticate)

router.route('/auth/forgot')
  .post(authController.forgot)

router.route('/data')
  .post(authController.isAuthenticated, dataController.postData)

router.route('/data/last-week')
  .get(authController.isAuthenticated, dataController.getLastWeek)

router.route('/data/fake-data')
  .get(authController.isAuthenticated, dataController.putFakeData)

module.exports = router
