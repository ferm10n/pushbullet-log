import test from 'ava'
const mockRequest = require('./utils.js').mockRequest
const PL = require('../index')

test.serial('pushbullet error', t => {
  PL._dns = { lookup: (domain, cb) => { cb() } }
  PL._request = mockRequest()
  const p = new PL({
    token: 'test',
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

test.serial('connection error', t => {
  PL._request = mockRequest()
  PL._dns = {
    lookup: (domain, cb) => { cb(new Error('dns error')) }
  }
  const p = new PL({
    token: 'test',
    useConsole: false
  })

  t.plan(1)
  p.originalConsole.error = (msg, err) => { t.is(err.message, 'dns error') }
  const logPromise = p.log('fail log')
  return logPromise
})
