import test from 'ava'
const mockRequest = require('./utils.js').mockRequest
const PL = require('../index')

test('pushbullet error', t => {
  PL._dns = { lookup: (domain, cb) => { cb() } }
  PL._request = mockRequest()
  const p = new PL({
    token: 'test',
    channel: 'test',
    useConsole: false
  })

  t.plan(1)
  const logPromise = p.log('test')
  p.originalConsole.error = err => { t.is(err.message, 'test error') }
  setTimeout(() => {
    PL._request.listeners.error(new Error('test error'))
  }, 10)
  return logPromise
})
