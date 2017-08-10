import test from 'ava'
const PL = require('../index')
const testOpts = {
  token: 'test',
  channel: 'test',
  useConsole: false
}

test('does nothing when nothing is logged', t => {
  const pl = new PL(testOpts)
  pl.makePush = () => { t.fail('should not have acted') }
  pl.log()
  pl.warn()
  pl.error()
  t.pass()
})

test('severity is set', t => {
  t.plan(3)
  const pblog = new PL(testOpts)

  pblog.makePush = (l, m, s) => { t.is(s, 'LOG') }
  pblog.log('test')

  pblog.makePush = (l, m, s) => { t.is(s, 'WARN') }
  pblog.warn('test')

  pblog.makePush = (l, m, s) => { t.is(s, 'ERROR') }
  pblog.error('test')
})

test('usage forms', t => {
  t.plan(8)
  let pl = new PL(testOpts)

  pl.makePush = (title, message) => {
    t.is(title, 'LOG: ')
    t.is(message.replace(/\s/mgi, ''), '{"a":"b"}')
  }
  pl.log({a: 'b'}) // LOG, {"a":"b"}

  pl.makePush = (title, message) => {
    t.is(title, 'LOG: test')
    t.is(message, '')
  }
  pl.log('test') // LOG: test, ''

  pl.makePush = (title, message) => {
    t.is(title, 'LOG: test')
    t.is(message, '5')
  }
  pl.log('test', 5) // LOG: test, '5'

  pl.makePush = (title, message) => {
    t.is(title, 'LOG: test')
    t.is(message, '5, 5')
  }
  pl.log('test', 5, 5) // LOG: test, '5, 5'
})

test('overrideConsole', t => {
  const oldLog = console.log
  const oldWarn = console.warn
  const oldError = console.error

  const p = new PL({
    token: 'test',
    channel: 'test'
  })

  t.plan(5)

  p.overrideConsole()

  t.not(console.log, oldLog, 'console was overridden')
  t.is(p.originalConsole.log, oldLog, 'original console intact')

  p.originalConsole.log = item => { t.is(item, 'test log') }
  p.originalConsole.warn = item => { t.is(item, 'test warn') }
  p.originalConsole.error = item => { t.is(item, 'test error') }

  console.log('test log')
  console.warn('test warn')
  console.error('test error')

  console.log = oldLog
  console.warn = oldWarn
  console.error = oldError
})
