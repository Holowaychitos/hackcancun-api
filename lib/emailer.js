'use strict'
const sendgrid = require('sendgrid')(process.env.SENDGRING_KEY)

exports.forgot = function (email, data) {
  sendgrid.send({
    to: email,
    from: 'robot@dbug.mx',
    subject: 'Rest password',
    text: `Clic for reset password ${data.url}`
  }, function (err, json) {
    if (err) return console.error(err)
    console.log(json)
  })
}
