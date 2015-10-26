'use strict'

var http = require('http')

exports.connect = function (hostname, port, user, pass, method, params, cb) {
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

  var req = http.request(options, function (res) {
    var data = ''
    res.setEncoding('utf8')
    res.on('data', function (chunk) {
      data += chunk
    })
    res.on('end', function () {
      cb(data)
    })
  })

  req.on('error', function (e) {
    console.log('problem with request: ' + e.message)
  })

  // write data to request body
  req.write(postData)
  req.end()
}
