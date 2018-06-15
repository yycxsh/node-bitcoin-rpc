'use strict'

var http = require('http')
const BITCOIND_HOSTNAME = 'localhost'
const BITCOIND_PORT = 8332
const BITCOIND_USERNAME = 'bitcoinrpc'
const BITCOIND_PASSWORD = 'foo'
const BITCOIND_TIMEOUT = 500

module.exports.init =  function init(hostname = BITCOIND_HOSTNAME, port = BITCOIND_PORT, user = BITCOIND_USERNAME, pass = BITCOIND_PASSWORD) {
  let timeout = BITCOIND_TIMEOUT
  return {
    call(method, params, cb) {
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

      var req = http.request(options, function A(res) {
        cb_handleRequestResponse(res, cb)
      })

      req.on('error', function response(e) {
        cb(e.message)
      })

      req.setTimeout(timeout, function cb_onTimeout(e) {
        cb('Timed out')
        req.abort()
      })

      // write data to request body
      req.write(postData)
      req.end()
    },
    getTimeout() {
      return timeout
    },
    setTimeout(value) {
      timeout = value
    }
  }
}


function cb_handleRequestResponse(res, cb) {
  var data = ''
  res.setEncoding('utf8')
  res.on('data', function (chunk) {
    data += chunk
  })
  res.on('end', function () {
    if (res.statusCode === 401) {
      cb(res.statusCode)
    } else {
      try {
        data = JSON.parse(data)
        cb(null, data)
      } catch (err) {
        cb(err, null)
      }
    }
  })
}