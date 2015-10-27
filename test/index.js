'use strict'

/* global describe it */
var assert = require('assert')
var nock = require('nock')
var bitcoin_rpc = require('../lib/index.js')

var user = 'bitcoinrpc'
var pass = 'moo'

function nock_bitcoind () {
  nock('http://localhost:8332')
  .post('/', {'method': 'getnetworkinfo', 'params': [], 'id': '1'})
  .replyWithFile(200, __dirname + '/nocks/getnetworkinfo.json')
}

describe('connecting to bitcoind', function () {
  it("can't connect", function (done) {
    bitcoin_rpc.connect('localhost', 8332, user, pass, 'getnetworkinfo', [], function (err, res) {
      if (err !== null) {
        assert.doesNotThrow(function err_cantConnect (err) {
          if (err === 401 || err === 'ECONNREFUSED') {
            return true
          }
        },
        'What?'
      )
        done()
      } else {
        assert.fail(res, '401', 'Should have failed')
        done()
      }
    })
  })

  it('can connect', function (done) {
    nock_bitcoind()
    bitcoin_rpc.connect('localhost', 8332, user, pass, 'getnetworkinfo', [], function (err, res) {
      if (err !== null) {
        assert.fail(err, '200', 'Should have passed')
        done()
      } else {
        assert.equal('110000', res.result.version)
        done()
      }
    })
  })
})
