import test from 'ava'
import mockRequest from './utils.js'
const PL = require('../index')
PL._dns = { lookup: (domain, cb) => { cb() } }

test('https request', t => {
  PL._request = mockRequest()
  const p = new PL({
    token: 'testToken',
    channel: 'logChannel',
    useConsole: false
  })

  p.log('testTitle', 'testBody')
  t.deepEqual(mockRequest.options, {
    host: 'api.pushbullet.com',
    path: '/v2/pushes',
    port: '443',
    method: 'POST',
    headers: {
      'Access-Token': 'testToken',
      'Content-Type': 'application/json'
    }
  }, 'expected https options')
  t.true(mockRequest.end, 'request was ended')
  t.is(typeof mockRequest.payload, 'string')

  const parsedPayload = JSON.parse(mockRequest.payload)
  t.deepEqual(parsedPayload, {
    body: 'testBody',
    title: 'LOG: testTitle',
    type: 'note',
    channel_tag: 'logChannel'
  })
})

test('awaits completion', t => {
  PL._request = mockRequest()
  const p = new PL({
    token: 'test',
    channel: 'test',
    useConsole: false
  })

  const logPromise = p.log('test')
  t.is(logPromise.toString(), '[object Promise]')
  setTimeout(() => {
    mockRequest.listeners.end()
  }, 10)
  return logPromise
})
