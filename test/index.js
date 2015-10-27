'use strict'

/* global describe it */
var assert = require('assert')
var nock = require('nock')
var bitcoin_rpc = require('../lib/index.js')

var TEST_USER = process.env.TEST_USER || 'bitcoinrpc'
var TEST_PASS = process.env.TEST_PASS || 'moo'

function nock_bitcoind (method) {
  if (method === 'getnetworkinfo') {
    nock('http://localhost:8332')
    .post('/', {'method': 'getnetworkinfo', 'params': [], 'id': '1'})
    .replyWithFile(200, __dirname + '/nocks/getnetworkinfo.json')
  }
  if (method === 'getbalance1') {
    nock('http://localhost:8332')
    .post('/', {'method': 'getbalance', 'params': [], 'id': '1'})
    .replyWithFile(200, __dirname + '/nocks/getbalance1.json')
  }
  if (method === 'getbalance2') {
    nock('http://localhost:8332')
    .post('/', {'method': 'getbalance', 'params': ['p2pool', 6], 'id': '1'})
    .replyWithFile(200, __dirname + '/nocks/getbalance2.json')
  }
}

describe('connecting to bitcoind', function () {
  it("can't connect", function (done) {
    bitcoin_rpc.call('localhost', 8332, TEST_USER, TEST_PASS, 'getnetworkinfo', [], function (err, res) {
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
    nock_bitcoind('getnetworkinfo')
    bitcoin_rpc.call('localhost', 8332, TEST_USER, TEST_PASS, 'getnetworkinfo', [], function (err, res) {
      if (err !== null) {
        assert.fail(err, '200', 'Should have passed')
        done()
      } else {
        assert.equal('110000', res.result.version)
        done()
      }
    })
  })

  it('getbalance as a raw call', function (done) {
    nock_bitcoind('getbalance1')
    bitcoin_rpc.call('localhost', 8332, TEST_USER, TEST_PASS, 'getbalance', [], function (err, res) {
      if (err !== null) {
        assert.fail(err, '200', 'Should have passed')
        done()
      } else {
        assert.equal('0.005', res.result)
        done()
      }
    })
  })

  it('getbalance as a raw call with params', function (done) {
    nock_bitcoind('getbalance2')
    bitcoin_rpc.call('localhost', 8332, TEST_USER, TEST_PASS, 'getbalance', ['p2pool', 6], function (err, res) {
      if (err !== null) {
        assert.fail(err, '200', 'Should have passed')
        done()
      } else {
        assert.equal('0.001', res.result)
        done()
      }
    })
  })
})
