import test from 'ava'
import { mockRequest, freshlyRequire } from './utils.js'

test('pushbullet error', t => {
  freshlyRequire('https').request = mockRequest
  const PL = freshlyRequire('../index')
  PL._dns = { lookup: (domain, cb) => { cb() } }
  const p = new PL({
    token: 'test',
    channel: 'test',
    useConsole: false
  })

  t.plan(1)
  const logPromise = p.log('test')
  p.originalConsole.error = err => { t.is(err.message, 'test error') }
  setTimeout(() => {
    mockRequest.listeners.error(new Error('test error'))
  }, 10)
  return logPromise
})
