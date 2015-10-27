'use strict'

var http = require('http')

exports.connect = function connect (hostname, port, user, pass, method, params, cb) {
  var postData = JSON.stringify({
    method: method,
    params: params,
    id: '1'
  })

  var options = {
    hostname: hostname,
    port: port,
    path: '/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length
    },
    auth: user + ':' + pass
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
  if (res.statusCode !== 200) {
    cb(res.statusCode, null)
  } else {
    res.setEncoding('utf8')
    res.on('data', function (chunk) {
      data += chunk
    })
    res.on('end', function () {
      data = JSON.parse(data)
      cb(null, data)
    })
  }
}
