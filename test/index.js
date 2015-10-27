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
    .reply(
      200, {
        'result': {
          'version': 110000,
          'subversion': '/Satoshi:0.11.0/',
          'protocolversion': 70002,
          'localservices': '0000000000000001',
          'timeoffset': 264,
          'connections': 61,
          'networks': [{
            'name': 'ipv4',
            'limited': false,
            'reachable': true,
            'proxy': '',
            'proxy_randomize_credentials': false
          }, {
            'name': 'ipv6',
            'limited': false,
            'reachable': true,
            'proxy': '',
            'proxy_randomize_credentials': false
          }, {
            'name': 'onion',
            'limited': false,
            'reachable': false,
            'proxy': '',
            'proxy_randomize_credentials': false
          }],
          'relayfee': 0.00010000,
          'localaddresses': [{
            'address': 'fe80::208:74ff:feda:625c%5',
            'port': 8333,
            'score': 1
          }]},
        'error': null,
        'id': '1'
      }
    )
}

describe('connecting to bitcoind', function () {
  it("can't connect", function (done) {
    bitcoin_rpc.connect('localhost', 8332, user, pass, 'getnetworkinfo', [], function (err, res) {
      if (err) {
        assert.equal('401', err)
        done()
      } else {
        assert.fail(res, '401', 'Should have failed')
        done()
      }
    })
  })

  it('can connect', function (done) {
    nock_bitcoind()
    bitcoin_rpc.connect('localhost', 8332, user, pass, 'getnetworkinfo', [], function (res) {
      res = JSON.parse(res)
      assert.equal('110000', res.result.version)
      done()
    })
  })
})
