'use strict'

var http = require('http')
module.exports.BITCOIND_HOSTNAME = 'localhost'
module.exports.BITCOIND_PORT = 8332
module.exports.BITCOIND_USERNAME = 'bitcoinrpc'
module.exports.BITCOIND_PASSWORD = 'foo'

exports.init = function init (hostname, port, user, pass) {
  module.exports.BITCOIND_HOSTNAME = hostname
  module.exports.BITCOIND_PORT = port
  module.exports.BITCOIND_USERNAME = user
  module.exports.BITCOIND_PASSWORD = pass
}

exports.call = function call (method, params, cb) {
  var postData = JSON.stringify({
    method: method,
    params: params,
    id: '1'
  })

  var options = {
    hostname: module.exports.BITCOIND_HOSTNAME,
    port: module.exports.BITCOIND_PORT,
    path: '/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length
    },
    auth: module.exports.BITCOIND_USERNAME + ':' + module.exports.BITCOIND_PASSWORD
  }

  var req = http.request(options, function A (res) {
    cb_handleRequestResponse(res, cb)
  })

  req.on('error', function response (e) {
    cb(e.message)
  })

  req.setTimeout(500, function timeout (e) {
    cb('Timed out')
  })

  // write data to request body
  req.write(postData)
  req.end()
}

function cb_handleRequestResponse (res, cb) {
  var data = ''
  res.setEncoding('utf8')
  res.on('data', function (chunk) {
    data += chunk
  })
  res.on('end', function () {
    if (res.statusCode === 401) {
      cb(res.statusCode)
    } else {
      data = JSON.parse(data)
      cb(null, data)
    }
  })
}
