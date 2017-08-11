import test from 'ava'
const PL = require('../index')

test('defaults', t => {
  const p = new PL({
    token: 'test',
    channel: 'logChannel'
  })
  t.false(p.prependDate)
  t.is(p.channels.warn, 'logChannel', 'default warn channel is log channel')
  t.is(p.channels.error, 'logChannel', 'default error channel is log channel')
  t.false(p.compact)
  t.true(p.useConsole)
})

test('required options', t => {
  t.notThrows(() => {
    return new PL({ token: 'test' })
  }, 'correct options, multiple channels')

  t.throws(() => {
    return new PL()
  }, Error, 'no options')
})

test('channels', t => {
  let p = new PL({
    token: 'test',
    channels: {
      log: 'logChannel',
      warn: 'warnChannel',
      error: 'errorChannel'
    }
  })
  t.is(p.channels.log, 'logChannel')
  t.is(p.channels.warn, 'warnChannel')
  t.is(p.channels.error, 'errorChannel')
})

test('prependDate', t => {
  t.plan(3)
  const p = new PL({
    token: 'testToken',
    channel: 'testChannel',
    prependDate: true,
    useConsole: false
  })
  t.true(p.prependDate)
  p.makePush = (title, message) => {
    const split = message.split('\n')
    t.is(split[1], 'stuff', 'original message')
    t.is(new Date(split[0]).toString(), split[0], 'date present')
  }
  p.log('test', 'stuff')
})

test('compact', t => {
  t.plan(1)
  const p = new PL({
    token: 'testToken',
    channel: 'testChannel',
    compact: true,
    useConsole: false
  })
  p.makePush = (title, message) => {
    t.is(message, '{"a":"b"}')
  }
  p.log({a: 'b'})
})

test('useConsole', t => {
  t.plan(7)

  const oldLog = console.log
  const oldWarn = console.warn
  const oldError = console.error

  console.log = l => { t.is(l, 'test log') }
  console.warn = w => { t.is(w, 'test warn') }
  console.error = e => { t.is(e, 'test error') }

  const p = new PL({
    token: 'testToken',
    channel: 'testChannel',
    useConsole: true
  })
  p.makePush = () => {}
  t.true(p.useConsole)
  p.log('test log')
  p.warn('test warn')
  p.error('test error')

  t.is(console.log, p.originalConsole.log)
  t.is(console.warn, p.originalConsole.warn)
  t.is(console.error, p.originalConsole.error)

  console.log = oldLog
  console.warn = oldWarn
  console.error = oldError
})

test.todo('label')

test.todo('production only')
